/**
 * カスタムhookのテスト
 * React hooksの動作と状態管理を検証
 */

import { renderHook, act } from '@testing-library/react';
import { 
  useColorController,
  useMembers,
  useMemberFilters,
  useLocalStorage,
  useErrorHandler,
} from '@/hooks';
import { useColorStore } from '@/stores/useColorStore';
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { useFilterStore } from '@/stores/useFilterStore';

// モックの設定
jest.mock('@/stores/useColorStore');
jest.mock('@/stores/useSelectedMemberStore');
jest.mock('@/stores/useFilterStore');
jest.mock('@/api/bq/getHinatazakaMember');

const mockUseColorStore = useColorStore as jest.MockedFunction<typeof useColorStore>;
const mockUseSelectedMemberStore = useSelectedMemberStore as jest.MockedFunction<typeof useSelectedMemberStore>;
const mockUseFilterStore = useFilterStore as jest.MockedFunction<typeof useFilterStore>;

describe('カスタムhookテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useColorController', () => {
    const mockSetIndex = jest.fn();
    
    beforeEach(() => {
      mockUseColorStore.mockImplementation((selector) => {
        const state = {
          colorMap: { 'test-id': { index: 0 } },
          setIndex: mockSetIndex,
        };
        return selector(state);
      });
    });

    test('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useColorController('test-id'));
      
      expect(result.current.index).toBe(0);
      expect(result.current.nameJa).toBe('パステルブルー');
      expect(result.current.nameEn).toBe('pastel_blue');
      expect(result.current.color).toBe('#09b8ff');
      expect(result.current.allColors).toHaveLength(15);
    });

    test('next関数が正しく動作する', () => {
      const { result } = renderHook(() => useColorController('test-id'));
      
      act(() => {
        result.current.next();
      });

      expect(mockSetIndex).toHaveBeenCalledWith('test-id', expect.any(Function));
      
      // updater関数のテスト
      const updaterFunction = mockSetIndex.mock.calls[0][1];
      expect(updaterFunction(0)).toBe(1); // 0から1へ
      expect(updaterFunction(14)).toBe(0); // 14から0へ（循環）
    });

    test('prev関数が正しく動作する', () => {
      const { result } = renderHook(() => useColorController('test-id'));
      
      act(() => {
        result.current.prev();
      });

      expect(mockSetIndex).toHaveBeenCalledWith('test-id', expect.any(Function));
      
      // updater関数のテスト
      const updaterFunction = mockSetIndex.mock.calls[0][1];
      expect(updaterFunction(1)).toBe(0); // 1から0へ
      expect(updaterFunction(0)).toBe(14); // 0から14へ（循環）
    });

    test('setColor関数が正しく動作する', () => {
      const { result } = renderHook(() => useColorController('test-id'));
      
      act(() => {
        result.current.setColor(5);
      });

      expect(mockSetIndex).toHaveBeenCalledWith('test-id', expect.any(Function));
      
      // updater関数のテスト
      const updaterFunction = mockSetIndex.mock.calls[0][1];
      expect(updaterFunction(0)).toBe(5);
    });

    test('setColorByName関数が正しく動作する', () => {
      const { result } = renderHook(() => useColorController('test-id'));
      
      act(() => {
        result.current.setColorByName('イエロー');
      });

      expect(mockSetIndex).toHaveBeenCalledWith('test-id', expect.any(Function));
      
      // updater関数のテスト
      const updaterFunction = mockSetIndex.mock.calls[0][1];
      expect(updaterFunction(0)).toBe(5); // イエローのインデックス
    });

    test('存在しない色名でsetColorByNameを呼んでも何も起こらない', () => {
      const { result } = renderHook(() => useColorController('test-id'));
      
      act(() => {
        result.current.setColorByName('存在しない色');
      });

      expect(mockSetIndex).not.toHaveBeenCalled();
    });

    test('範囲外のインデックスでsetColorを呼んでも何も起こらない', () => {
      const { result } = renderHook(() => useColorController('test-id'));
      
      act(() => {
        result.current.setColor(-1);
      });

      expect(mockSetIndex).not.toHaveBeenCalled();

      act(() => {
        result.current.setColor(15);
      });

      expect(mockSetIndex).not.toHaveBeenCalled();
    });
  });

  describe('useMembers', () => {
    const mockSetGroup = jest.fn();
    const mockPickRandomMember = jest.fn();

    beforeEach(() => {
      mockUseSelectedMemberStore.mockImplementation((selector) => {
        const state = {
          selectedGroup: 'hinatazaka',
          allMembers: [],
          filteredMembers: [],
          selectedMember: undefined,
          isLoading: false,
          hasInvalidFilter: false,
          setGroup: mockSetGroup,
          pickRandomMember: mockPickRandomMember,
        };
        return selector(state);
      });
    });

    test('初期状態が正しく取得される', () => {
      const { result } = renderHook(() => useMembers());
      
      expect(result.current.selectedGroup).toBe('hinatazaka');
      expect(result.current.allMembers).toEqual([]);
      expect(result.current.filteredMembers).toEqual([]);
      expect(result.current.selectedMember).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasInvalidFilter).toBe(false);
    });

    test('changeGroup関数が正しく動作する', () => {
      const { result } = renderHook(() => useMembers());
      
      act(() => {
        result.current.changeGroup('sakurazaka');
      });

      expect(mockSetGroup).toHaveBeenCalledWith('sakurazaka');
    });

    test('同じグループに変更しようとした場合は何も起こらない', () => {
      const { result } = renderHook(() => useMembers());
      
      act(() => {
        result.current.changeGroup('hinatazaka');
      });

      expect(mockSetGroup).not.toHaveBeenCalled();
    });

    test('selectRandomMember関数が正しく動作する', () => {
      mockPickRandomMember.mockReturnValue({ id: 1, name: 'テストメンバー' });
      
      const { result } = renderHook(() => useMembers());
      
      const member = result.current.selectRandomMember();
      
      expect(mockPickRandomMember).toHaveBeenCalled();
      expect(member).toEqual({ id: 1, name: 'テストメンバー' });
    });
  });

  describe('useMemberFilters', () => {
    const mockSetFilter = jest.fn();
    const mockSetFilters = jest.fn();

    beforeEach(() => {
      mockUseFilterStore.mockImplementation((selector) => {
        const state = {
          checkedFilters: { '1期生': true, '2期生': false },
          setFilter: mockSetFilter,
        };
        return selector(state);
      });

      mockUseSelectedMemberStore.mockImplementation((selector) => {
        const state = {
          filters: { gen: ['1st'] },
          setFilters: mockSetFilters,
        };
        return selector(state);
      });
    });

    test('初期状態が正しく取得される', () => {
      const { result } = renderHook(() => useMemberFilters());
      
      expect(result.current.checkedFilters).toEqual({ '1期生': true, '2期生': false });
      expect(result.current.currentFilters).toEqual({ gen: ['1st'] });
    });

    test('toggleFilter関数が正しく動作する', () => {
      const { result } = renderHook(() => useMemberFilters());
      
      act(() => {
        result.current.toggleFilter('3期生', true);
      });

      expect(mockSetFilter).toHaveBeenCalledWith('3期生', true);
    });

    test('clearAllFilters関数が正しく動作する', () => {
      const { result } = renderHook(() => useMemberFilters());
      
      act(() => {
        result.current.clearAllFilters();
      });

      expect(mockSetFilter).toHaveBeenCalledWith('1期生', false);
      expect(mockSetFilter).toHaveBeenCalledWith('2期生', false);
    });

    test('selectAllFilters関数が正しく動作する', () => {
      const { result } = renderHook(() => useMemberFilters());
      
      act(() => {
        result.current.selectAllFilters();
      });

      expect(mockSetFilter).toHaveBeenCalledWith('1期生', true);
      expect(mockSetFilter).toHaveBeenCalledWith('2期生', true);
      expect(mockSetFilter).toHaveBeenCalledWith('3期生', true);
      expect(mockSetFilter).toHaveBeenCalledWith('4期生', true);
      expect(mockSetFilter).toHaveBeenCalledWith('5期生', true);
      expect(mockSetFilter).toHaveBeenCalledWith('卒業生', true);
    });
  });

  describe('useLocalStorage', () => {
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });
      mockLocalStorage.getItem.mockClear();
      mockLocalStorage.setItem.mockClear();
    });

    test('デフォルト値が正しく設定される', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      expect(result.current[0]).toBe('default-value');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    test('ローカルストレージから値を読み込む', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('stored-value'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      expect(result.current[0]).toBe('stored-value');
    });

    test('値の設定が正しく動作する', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
    });

    test('JSONパースエラーの処理', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      expect(result.current[0]).toBe('default-value');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('ローカルストレージ保存エラーの処理', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      act(() => {
        result.current[1]('new-value');
      });

      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('useErrorHandler', () => {
    test('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      expect(result.current.error).toBeNull();
      expect(result.current.isError).toBe(false);
    });

    test('エラー処理が正しく動作する', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        result.current.handleError('テストエラー');
      });

      expect(result.current.error).toBe('テストエラー');
      expect(result.current.isError).toBe(true);
    });

    test('Errorオブジェクトの処理が正しく動作する', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        result.current.handleError(new Error('テストエラーオブジェクト'));
      });

      expect(result.current.error).toBe('テストエラーオブジェクト');
      expect(result.current.isError).toBe(true);
    });

    test('エラークリアが正しく動作する', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        result.current.handleError('テストエラー');
      });

      expect(result.current.isError).toBe(true);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isError).toBe(false);
    });

    test('ネットワークエラーハンドラーが正しく動作する', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        result.current.handleNetworkError();
      });

      expect(result.current.error).toContain('ネットワークエラー');
      expect(result.current.isError).toBe(true);
    });

    test('データ取得エラーハンドラーが正しく動作する', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        result.current.handleDataFetchError();
      });

      expect(result.current.error).toContain('データの取得に失敗');
      expect(result.current.isError).toBe(true);
    });
  });

  describe('hookの統合テスト', () => {
    test('useColorControllerとuseLocalStorageの連携', () => {
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue(JSON.stringify(3)),
        setItem: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      mockUseColorStore.mockImplementation((selector) => {
        const state = {
          colorMap: { 'test-id': { index: 3 } },
          setIndex: jest.fn(),
        };
        return selector(state);
      });

      const { result: colorResult } = renderHook(() => useColorController('test-id'));
      const { result: storageResult } = renderHook(() => useLocalStorage('color-index', 0));

      expect(colorResult.current.index).toBe(3);
      expect(storageResult.current[0]).toBe(3);
    });

    test('useMembersとuseErrorHandlerの連携', () => {
      const mockSetGroup = jest.fn();
      
      mockUseSelectedMemberStore.mockImplementation((selector) => {
        const state = {
          selectedGroup: 'hinatazaka',
          allMembers: [],
          filteredMembers: [],
          selectedMember: undefined,
          isLoading: false,
          hasInvalidFilter: false,
          setGroup: mockSetGroup,
          pickRandomMember: jest.fn(),
        };
        return selector(state);
      });

      const { result: membersResult } = renderHook(() => useMembers());
      const { result: errorResult } = renderHook(() => useErrorHandler());

      // エラーが発生していない初期状態
      expect(membersResult.current.isLoading).toBe(false);
      expect(errorResult.current.isError).toBe(false);

      // グループ変更の実行
      act(() => {
        membersResult.current.changeGroup('sakurazaka');
      });

      expect(mockSetGroup).toHaveBeenCalledWith('sakurazaka');
    });
  });
});