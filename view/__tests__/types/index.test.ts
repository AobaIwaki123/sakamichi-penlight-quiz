/**
 * 型定義のテスト
 * TypeScriptの型安全性とインターフェースの整合性を検証
 */

import type {
  Group,
  Generation,
  Member,
  PenlightColor,
  ColorInfo,
  ColorData,
  Filter,
  MemberFilters,
  ColorState,
  FilterState,
  SelectedMemberState,
  UseColorControllerReturn,
  GenerationMap,
  ApiError,
  ApiResponse,
} from '@/types';

describe('型定義テスト', () => {
  describe('基本型定義', () => {
    test('Group型が正しく定義されている', () => {
      const groups: Group[] = ['nogizaka', 'sakurazaka', 'hinatazaka'];
      expect(groups).toHaveLength(3);
      
      // 型安全性のテスト
      const hinatazaka: Group = 'hinatazaka';
      expect(hinatazaka).toBe('hinatazaka');
    });

    test('Generation型が正しく定義されている', () => {
      const generations: Generation[] = ['1st', '2nd', '3rd', '4th', '5th', 'graduated'];
      expect(generations).toHaveLength(6);
      
      // 型安全性のテスト
      const firstGen: Generation = '1st';
      expect(firstGen).toBe('1st');
    });
  });

  describe('メンバー関連型', () => {
    test('Member型が正しく定義されている', () => {
      const mockMember: Member = {
        id: 1,
        name: '加藤史帆',
        nickname: 'しほちゃん',
        emoji: '🐨',
        gen: '1st',
        graduated: false,
        penlight1_id: 5,
        penlight2_id: 14,
        type: 'normal',
        url: 'https://example.com/image.jpg'
      };

      expect(mockMember.id).toBe(1);
      expect(mockMember.gen).toBe('1st');
      expect(mockMember.graduated).toBe(false);
      expect(typeof mockMember.name).toBe('string');
      expect(typeof mockMember.penlight1_id).toBe('number');
    });

    test('MemberFiltersが正しく動作する', () => {
      const filters: MemberFilters = {
        gen: ['1st', '2nd'],
        graduated: false
      };

      expect(filters.gen).toEqual(['1st', '2nd']);
      expect(filters.graduated).toBe(false);

      // オプショナルプロパティのテスト
      const emptyFilters: MemberFilters = {};
      expect(emptyFilters.gen).toBeUndefined();
      expect(emptyFilters.graduated).toBeUndefined();
    });
  });

  describe('ペンライト関連型', () => {
    test('PenlightColor型が正しく定義されている', () => {
      const color: PenlightColor = {
        id: 0,
        name_ja: 'パステルブルー',
        name_en: 'pastel_blue',
        color: '#09b8ff'
      };

      expect(color.id).toBe(0);
      expect(color.name_ja).toBe('パステルブルー');
      expect(color.name_en).toBe('pastel_blue');
      expect(color.color).toBe('#09b8ff');
    });

    test('ColorInfo型が正しく定義されている', () => {
      const colorInfo: ColorInfo = {
        index: 5
      };

      expect(colorInfo.index).toBe(5);
      expect(typeof colorInfo.index).toBe('number');
    });

    test('ColorData型が正しく定義されている', () => {
      const colorData: ColorData = {
        index: 0,
        nameJa: 'パステルブルー',
        nameEn: 'pastel_blue',
        color: '#09b8ff'
      };

      expect(colorData.index).toBe(0);
      expect(colorData.nameJa).toBe('パステルブルー');
      expect(colorData.nameEn).toBe('pastel_blue');
      expect(colorData.color).toBe('#09b8ff');
    });
  });

  describe('フィルター関連型', () => {
    test('Filter型が正しく定義されている', () => {
      const filter: Filter = {
        type: '1期生',
        defaultChecked: true
      };

      expect(filter.type).toBe('1期生');
      expect(filter.defaultChecked).toBe(true);
    });
  });

  describe('ストア関連型', () => {
    test('ColorState型のメソッドシグネチャが正しい', () => {
      // 型定義のテスト（実際の実装はストアのテストで行う）
      const mockColorState: Partial<ColorState> = {
        colorMap: {
          'test-id': { index: 0 }
        }
      };

      expect(mockColorState.colorMap).toBeDefined();
      expect(mockColorState.colorMap!['test-id'].index).toBe(0);
    });

    test('FilterState型のメソッドシグネチャが正しい', () => {
      const mockFilterState: Partial<FilterState> = {
        checkedFilters: {
          '1期生': true,
          '2期生': false
        }
      };

      expect(mockFilterState.checkedFilters).toBeDefined();
      expect(mockFilterState.checkedFilters!['1期生']).toBe(true);
      expect(mockFilterState.checkedFilters!['2期生']).toBe(false);
    });

    test('SelectedMemberState型が正しく定義されている', () => {
      const mockState: Partial<SelectedMemberState> = {
        selectedGroup: 'hinatazaka',
        hasInvalidFilter: false,
        allMembers: [],
        filteredMembers: [],
        shuffledMembers: [],
        currentShuffleIndex: 0,
        isLoading: false
      };

      expect(mockState.selectedGroup).toBe('hinatazaka');
      expect(mockState.hasInvalidFilter).toBe(false);
      expect(mockState.isLoading).toBe(false);
      expect(Array.isArray(mockState.allMembers)).toBe(true);
    });
  });

  describe('Hook関連型', () => {
    test('UseColorControllerReturn型が正しく定義されている', () => {
      const mockReturn: UseColorControllerReturn = {
        index: 0,
        color: '#09b8ff',
        nameJa: 'パステルブルー',
        nameEn: 'pastel_blue',
        next: jest.fn(),
        prev: jest.fn(),
        setColor: jest.fn(),
        setColorByName: jest.fn(),
        allColors: []
      };

      expect(mockReturn.index).toBe(0);
      expect(mockReturn.color).toBe('#09b8ff');
      expect(typeof mockReturn.next).toBe('function');
      expect(typeof mockReturn.prev).toBe('function');
      expect(typeof mockReturn.setColor).toBe('function');
      expect(typeof mockReturn.setColorByName).toBe('function');
      expect(Array.isArray(mockReturn.allColors)).toBe(true);
    });
  });

  describe('ユーティリティ型', () => {
    test('GenerationMap型が正しく定義されている', () => {
      const generationMap: GenerationMap = {
        '1期生': '1st',
        '2期生': '2nd',
        '卒業生': 'graduated'
      };

      expect(generationMap['1期生']).toBe('1st');
      expect(generationMap['2期生']).toBe('2nd');
      expect(generationMap['卒業生']).toBe('graduated');
    });

    test('ApiError型が正しく定義されている', () => {
      const error: ApiError = {
        message: 'エラーが発生しました',
        code: 'NETWORK_ERROR',
        details: { statusCode: 500 }
      };

      expect(error.message).toBe('エラーが発生しました');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.details).toEqual({ statusCode: 500 });

      // オプショナルプロパティのテスト
      const simpleError: ApiError = {
        message: 'シンプルなエラー'
      };
      expect(simpleError.code).toBeUndefined();
      expect(simpleError.details).toBeUndefined();
    });

    test('ApiResponse型が正しく定義されている', () => {
      const response: ApiResponse<string[]> = {
        data: ['item1', 'item2'],
        success: true,
        message: '成功しました'
      };

      expect(response.data).toEqual(['item1', 'item2']);
      expect(response.success).toBe(true);
      expect(response.message).toBe('成功しました');

      // ジェネリック型のテスト
      const numberResponse: ApiResponse<number> = {
        data: 42,
        success: true
      };
      expect(numberResponse.data).toBe(42);
      expect(numberResponse.message).toBeUndefined();
    });
  });

  describe('型の互換性テスト', () => {
    test('Member型とMemberFiltersの互換性', () => {
      const member: Member = {
        id: 1,
        name: 'テストメンバー',
        nickname: 'テスト',
        emoji: '🎌',
        gen: '1st',
        graduated: false,
        penlight1_id: 0,
        penlight2_id: 1,
        type: 'test',
        url: 'https://example.com'
      };

      const filters: MemberFilters = {
        gen: ['1st'],
        graduated: false
      };

      // フィルターロジックのテスト
      const matchesGeneration = filters.gen ? filters.gen.includes(member.gen) : true;
      const matchesGraduation = filters.graduated !== undefined ? member.graduated === filters.graduated : true;

      expect(matchesGeneration).toBe(true);
      expect(matchesGraduation).toBe(true);
    });

    test('PenlightColor型とColorData型の互換性', () => {
      const penlightColor: PenlightColor = {
        id: 0,
        name_ja: 'テスト色',
        name_en: 'test_color',
        color: '#000000'
      };

      const colorData: ColorData = {
        index: 0,
        nameJa: penlightColor.name_ja,
        nameEn: penlightColor.name_en,
        color: penlightColor.color
      };

      expect(colorData.nameJa).toBe(penlightColor.name_ja);
      expect(colorData.nameEn).toBe(penlightColor.name_en);
      expect(colorData.color).toBe(penlightColor.color);
    });
  });
});