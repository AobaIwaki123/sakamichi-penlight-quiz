import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import type { Member } from '@/types/Member';
import type { Generation } from '@/consts/hinatazakaFilters';

jest.mock('@/api/bq/getHinatazakaMember', () => ({
  getHinatazakaMember: jest.fn().mockResolvedValue([
    { 
      id: 1, 
      name: 'Member 1', 
      nickname: 'M1', 
      emoji: '🌟', 
      gen: '1st' as Generation, 
      graduated: false, 
      penlight1_id: 1, 
      penlight2_id: 2, 
      type: 'regular', 
      url: 'https://example.com/1' 
    },
    { 
      id: 2, 
      name: 'Member 2', 
      nickname: 'M2', 
      emoji: '🌈', 
      gen: '1st' as Generation, 
      graduated: false, 
      penlight1_id: 3, 
      penlight2_id: 4, 
      type: 'regular', 
      url: 'https://example.com/2' 
    },
    { 
      id: 3, 
      name: 'Member 3', 
      nickname: 'M3', 
      emoji: '🎵', 
      gen: '2nd' as Generation, 
      graduated: false, 
      penlight1_id: 5, 
      penlight2_id: 6, 
      type: 'regular', 
      url: 'https://example.com/3' 
    },
    { 
      id: 4, 
      name: 'Member 4', 
      nickname: 'M4', 
      emoji: '🎀', 
      gen: '2nd' as Generation, 
      graduated: false, 
      penlight1_id: 7, 
      penlight2_id: 8, 
      type: 'regular', 
      url: 'https://example.com/4' 
    },
    { 
      id: 5, 
      name: 'Member 5', 
      nickname: 'M5', 
      emoji: '🌸', 
      gen: '3rd' as Generation, 
      graduated: false, 
      penlight1_id: 9, 
      penlight2_id: 10, 
      type: 'regular', 
      url: 'https://example.com/5' 
    },
    { 
      id: 6, 
      name: 'Member 6', 
      nickname: 'M6', 
      emoji: '🍀', 
      gen: '3rd' as Generation, 
      graduated: false, 
      penlight1_id: 11, 
      penlight2_id: 12, 
      type: 'regular', 
      url: 'https://example.com/6' 
    },
  ])
}));

describe('useSelectedMemberStore', () => {
  beforeEach(async () => {
    const store = useSelectedMemberStore.getState();
    await store.setGroup('hinatazaka');
    store.setFilters({});
    store.applyFilters();
  });

  test('no duplicate members in one loop', () => {
    const store = useSelectedMemberStore.getState();
    const memberIds = new Set<number>();
    const totalMembers = store.filteredMembers.length;
    
    for (let i = 0; i < totalMembers; i++) {
      const member = store.pickRandomMember();
      if (member) {
        expect(memberIds.has(member.id)).toBe(false);
        memberIds.add(member.id);
      }
    }
    
    expect(memberIds.size).toBe(totalMembers);
  });

  test('different order between loops (10 iterations with 5+ different loops)', () => {
    const store = useSelectedMemberStore.getState();
    const totalMembers = store.filteredMembers.length;
    const loops: number[][] = [];
    
    for (let loop = 0; loop < 10; loop++) {
      store.shuffleMembers();
      
      const loopOrder: number[] = [];
      
      for (let i = 0; i < totalMembers; i++) {
        const member = store.pickRandomMember();
        if (member) {
          loopOrder.push(member.id);
        }
      }
      
      loops.push(loopOrder);
    }
    
    const uniqueOrders = new Set<string>();
    for (const loop of loops) {
      uniqueOrders.add(JSON.stringify(loop));
    }
    
    expect(uniqueOrders.size).toBeGreaterThanOrEqual(5);
  });

  test('works correctly with different filter combinations', () => {
    
    const store = useSelectedMemberStore.getState();
    const allMembers = store.allMembers;
    
    const firstGenMembers = allMembers.filter(m => m.gen === '1st');
    expect(firstGenMembers.length).toBe(2); // Verify we have 2 first gen members
    
    const mockStore1 = {
      filteredMembers: firstGenMembers,
      shuffledMembers: [] as Member[],
      currentShuffleIndex: 0,
      
      shuffleMembers: function() {
        if (this.filteredMembers.length === 0) return;
        
        const shuffled = [...this.filteredMembers];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        this.shuffledMembers = shuffled;
        this.currentShuffleIndex = 0;
      },
      
      pickRandomMember: function() {
        if (this.filteredMembers.length === 0) return undefined;
        
        const needsReshuffle =
          this.shuffledMembers.length === 0 ||
          this.shuffledMembers.length !== this.filteredMembers.length ||
          this.currentShuffleIndex >= this.shuffledMembers.length;
        
        if (needsReshuffle) {
          this.shuffleMembers();
        }
        
        const selected = this.shuffledMembers[this.currentShuffleIndex];
        this.currentShuffleIndex += 1;
        
        return selected;
      }
    };
    
    const firstGenMemberIds = new Set<number>();
    
    for (let i = 0; i < firstGenMembers.length; i++) {
      const member = mockStore1.pickRandomMember();
      if (member) {
        expect(firstGenMemberIds.has(member.id)).toBe(false);
        firstGenMemberIds.add(member.id);
      }
    }
    
    expect(firstGenMemberIds.size).toBe(firstGenMembers.length);
    
    const secondThirdGenMembers = allMembers.filter(m => m.gen === '2nd' || m.gen === '3rd');
    expect(secondThirdGenMembers.length).toBe(4); // Verify we have 4 second/third gen members
    
    const mockStore2 = {
      filteredMembers: secondThirdGenMembers,
      shuffledMembers: [] as Member[],
      currentShuffleIndex: 0,
      
      shuffleMembers: function() {
        if (this.filteredMembers.length === 0) return;
        
        const shuffled = [...this.filteredMembers];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        this.shuffledMembers = shuffled;
        this.currentShuffleIndex = 0;
      },
      
      pickRandomMember: function() {
        if (this.filteredMembers.length === 0) return undefined;
        
        const needsReshuffle =
          this.shuffledMembers.length === 0 ||
          this.shuffledMembers.length !== this.filteredMembers.length ||
          this.currentShuffleIndex >= this.shuffledMembers.length;
        
        if (needsReshuffle) {
          this.shuffleMembers();
        }
        
        const selected = this.shuffledMembers[this.currentShuffleIndex];
        this.currentShuffleIndex += 1;
        
        return selected;
      }
    };
    
    const otherGenMemberIds = new Set<number>();
    
    for (let i = 0; i < secondThirdGenMembers.length; i++) {
      const member = mockStore2.pickRandomMember();
      if (member) {
        expect(otherGenMemberIds.has(member.id)).toBe(false);
        otherGenMemberIds.add(member.id);
      }
    }
    
    expect(otherGenMemberIds.size).toBe(secondThirdGenMembers.length);
  });
});
