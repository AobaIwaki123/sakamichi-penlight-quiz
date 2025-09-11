import { getHinatazakaMember } from "@/api/bq/getHinatazakaMember";
import { getSakurazakaMember } from "@/api/bq/getSakurazakaMember";
import { create } from 'zustand'

import type { Generation } from "@/consts/hinatazakaFilters";
import type { Group } from "@/types/Group";
import type { Member } from "@/types/Member";
import { usePenlightStore } from "./usePenlightStore";

// フィルター条件の型定義
interface MemberFilters {
  gen?: Generation[]
  graduated?: boolean
}

// メンバー選択ストアの状態定義
interface MemberSelectionState {
  // 基本状態
  selectedGroup: Group
  isLoading: boolean
  
  // メンバーデータ
  allMembers: Member[]
  filteredMembers: Member[]
  
  // シャッフル・選択状態
  shuffledMembers: Member[]
  currentShuffleIndex: number
  selectedMember?: Member
  
  // フィルター状態
  filters: MemberFilters
  hasInvalidFilter: boolean
}

// アクション定義
interface MemberSelectionActions {
  // グループ設定
  setGroup: (group: Group) => Promise<void>
  
  // フィルター操作
  setFilters: (filters: MemberFilters) => void
  applyFilters: () => void
  
  // メンバー選択操作
  shuffleMembers: () => void
  pickRandomMember: () => Member | undefined
}

// 完全な型定義
type SelectedMemberStore = MemberSelectionState & MemberSelectionActions

export const useSelectedMemberStore = create<SelectedMemberStore>((set, get) => ({
  selectedGroup: 'hinatazaka',
  allMembers: [],
  filters: {},
  filteredMembers: [],
  shuffledMembers: [],
  currentShuffleIndex: 0,
  selectedMember: undefined,
  isLoading: false,
  hasInvalidFilter: false,

  setGroup: async (group) => {
    set({ isLoading: true, selectedGroup: group })
    
    try {
      // メンバーデータとペンライト色データを並行して取得
      const [members] = await Promise.all([
        getGroupMembers(group),
        usePenlightStore.getState().fetchPenlightColors(group)
      ]);
      
      console.log(`${group}のメンバーデータを取得:`, members.length, '件')
      
      // メンバーデータを設定し、フィルターを適用
      set({ allMembers: members })
      get().applyFilters()
      
      // 初回のランダムメンバー選択
      get().pickRandomMember()
      
      console.log(`${group}のデータ読み込み完了: ${members.length}件`)
    } catch (error) {
      console.error(`${group}のデータ取得に失敗:`, error)
      // エラー時は空の状態にリセット
      set({ allMembers: [], filteredMembers: [], shuffledMembers: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  setFilters: (filters) => {
    set({ filters })
    get().applyFilters()
  },

  applyFilters: () => {
    const { allMembers, filters } = get();

    // フィルター条件の妥当性チェック
    const hasValidFilter = (filters.gen?.length ?? 0) > 0 || filters.graduated !== undefined;

    // メンバーのフィルタリング実行
    const filteredMembers = allMembers.filter((member) => {
      // 期生フィルター: 指定がない場合は全て通す
      const matchesGeneration = filters.gen ? filters.gen.includes(member.gen) : true;
      
      // 卒業状態フィルター: 指定がない場合は全て通す
      const matchesGraduationStatus = filters.graduated !== undefined
        ? member.graduated === filters.graduated
        : true;
      
      return matchesGeneration && matchesGraduationStatus;
    });

    // フィルター無効状態の判定（有効なフィルターがあるのに結果が0件）
    const hasInvalidFilter = hasValidFilter && filteredMembers.length === 0;

    set({
      filteredMembers,
      hasInvalidFilter
    });
    
    // フィルター適用後はシャッフルを再実行
    get().shuffleMembers();
  },
  
  shuffleMembers: () => {
    const { filteredMembers } = get();
    
    // フィルタリング済みメンバーが存在しない場合は何もしない
    if (filteredMembers.length === 0) {
      set({ shuffledMembers: [], currentShuffleIndex: 0 });
      return;
    }
    
    // Fisher-Yatesアルゴリズムでシャッフル実行
    const shuffledMembers = fisherYatesShuffle([...filteredMembers]);
    
    set({ 
      shuffledMembers, 
      currentShuffleIndex: 0 
    });
  },


  pickRandomMember: () => {
    const {
      filteredMembers,
      shuffledMembers,
      currentShuffleIndex
    } = get()

    // フィルタリング済みメンバーが存在しない場合
    if (filteredMembers.length === 0) return undefined

    // 再シャッフルが必要な条件をチェック
    const needsReshuffle = shouldReshuffle(
      shuffledMembers, 
      filteredMembers, 
      currentShuffleIndex
    );

    if (needsReshuffle) {
      get().shuffleMembers()
    }

    // 更新された状態を取得して次のメンバーを選択
    const { shuffledMembers: currentShuffled, currentShuffleIndex: currentIndex } = get()
    const selectedMember = currentShuffled[currentIndex]

    // 選択したメンバーを状態に保存し、インデックスを進める
    set({
      selectedMember,
      currentShuffleIndex: currentIndex + 1
    })

    return selectedMember
  }
}))

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * 指定されたグループのメンバー情報を取得する
 * @param group 取得するグループ名
 * @returns メンバー情報の配列
 * @throws 未対応のグループが指定された場合エラー
 */
async function getGroupMembers(group: Group): Promise<Member[]> {
  switch (group) {
    case 'hinatazaka':
      return getHinatazakaMember()
    case 'sakurazaka':
      return getSakurazakaMember()
    default:
      throw new Error(`未対応のグループ: ${group}`)
  }
}

/**
 * Fisher-Yatesアルゴリズムを使用して配列をシャッフルする
 * @param array シャッフルする配列（元の配列は変更されない）
 * @returns シャッフルされた新しい配列
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * シャッフルが必要かどうかを判定する
 * @param shuffledMembers 現在のシャッフル済みメンバー配列
 * @param filteredMembers フィルタリング済みメンバー配列
 * @param currentIndex 現在のインデックス
 * @returns シャッフルが必要な場合true
 */
function shouldReshuffle(
  shuffledMembers: Member[], 
  filteredMembers: Member[], 
  currentIndex: number
): boolean {
  return (
    shuffledMembers.length === 0 ||                      // シャッフル済み配列が空
    shuffledMembers.length !== filteredMembers.length || // フィルター結果とサイズが異なる
    currentIndex >= shuffledMembers.length               // インデックスが範囲外
  );
}
