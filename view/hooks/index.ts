/**
 * 坂道ペンライトクイズアプリケーションのカスタムhook集
 * 全てのカスタムhookを統合管理する
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { 
  UseColorControllerReturn, 
  PenlightColor, 
  Member, 
  MemberFilters, 
  Generation,
  Group 
} from '@/types';
import { 
  HINATAZAKA_PENLIGHT_COLORS, 
  GENERATION_MAP, 
  ERROR_MESSAGES,
  DEBUG_ENABLED 
} from '@/constants';
import { useColorStore } from '@/stores/useColorStore';
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { useFilterStore } from '@/stores/useFilterStore';

// ===== ペンライト色制御hook =====

/**
 * ペンライト色の制御を行うhook
 * 指定されたIDに対する色の選択・変更を管理する
 * 
 * @param id - 色制御の識別子
 * @returns 色制御のためのプロパティと関数
 */
export function useColorController(id: string): UseColorControllerReturn {
  const index = useColorStore((state) => state.colorMap[id]?.index ?? 0);
  const setIndex = useColorStore((state) => state.setIndex);

  const penlightColors = HINATAZAKA_PENLIGHT_COLORS;

  // 次の色に進む
  const next = useCallback(() => {
    setIndex(id, (prev) => (prev + 1) % penlightColors.length);
  }, [id, setIndex, penlightColors.length]);

  // 前の色に戻る
  const prev = useCallback(() => {
    setIndex(id, (prev) => (prev - 1 + penlightColors.length) % penlightColors.length);
  }, [id, setIndex, penlightColors.length]);

  // 現在の色情報
  const current = useMemo(() => penlightColors[index], [penlightColors, index]);

  // 指定インデックスの色に設定
  const setColor = useCallback((colorIndex: number) => {
    if (colorIndex >= 0 && colorIndex < penlightColors.length) {
      setIndex(id, () => colorIndex);
    }
  }, [id, setIndex, penlightColors.length]);

  // 色名から色を設定
  const setColorByName = useCallback((nameJa: string) => {
    const colorIndex = penlightColors.findIndex(color => color.name_ja === nameJa);
    if (colorIndex !== -1) {
      setColor(colorIndex);
    }
  }, [penlightColors, setColor]);

  return {
    index,
    color: current.color,
    nameJa: current.name_ja,
    nameEn: current.name_en,
    next,
    prev,
    setColor,
    setColorByName,
    allColors: penlightColors,
  };
}

// ===== メンバー管理hook =====

/**
 * メンバー情報の取得と管理を行うhook
 * 
 * @param group - 対象グループ
 * @returns メンバー情報と制御関数
 */
export function useMembers(group?: Group) {
  const {
    selectedGroup,
    allMembers,
    filteredMembers,
    selectedMember,
    isLoading,
    hasInvalidFilter,
    setGroup,
    pickRandomMember,
  } = useSelectedMemberStore();

  // グループ変更
  const changeGroup = useCallback((newGroup: Group) => {
    if (newGroup !== selectedGroup) {
      setGroup(newGroup);
    }
  }, [selectedGroup, setGroup]);

  // ランダムメンバー選択
  const selectRandomMember = useCallback(() => {
    return pickRandomMember();
  }, [pickRandomMember]);

  // 初期化時にグループを設定
  useEffect(() => {
    if (group && group !== selectedGroup) {
      setGroup(group);
    }
  }, [group, selectedGroup, setGroup]);

  return {
    selectedGroup,
    allMembers,
    filteredMembers,
    selectedMember,
    isLoading,
    hasInvalidFilter,
    changeGroup,
    selectRandomMember,
  };
}

// ===== フィルター管理hook =====

/**
 * メンバーフィルターの管理を行うhook
 * 
 * @returns フィルター状態と制御関数
 */
export function useMemberFilters() {
  const { checkedFilters, setFilter } = useFilterStore();
  const { filters, setFilters } = useSelectedMemberStore();

  // フィルター状態の変換
  const convertFiltersToMemberFilters = useCallback((filterMap: Record<string, boolean>): MemberFilters => {
    const genFilters: Generation[] = [];
    let graduatedFilter: boolean | undefined;

    Object.entries(filterMap).forEach(([type, checked]) => {
      if (checked) {
        const generation = GENERATION_MAP[type];
        if (generation) {
          if (generation === 'graduated') {
            graduatedFilter = true;
          } else {
            genFilters.push(generation);
          }
        }
      }
    });

    return {
      gen: genFilters.length > 0 ? genFilters : undefined,
      graduated: graduatedFilter,
    };
  }, []);

  // フィルター適用
  const applyFilters = useCallback(() => {
    const memberFilters = convertFiltersToMemberFilters(checkedFilters);
    setFilters(memberFilters);
    
    if (DEBUG_ENABLED) {
      console.log('フィルター適用:', memberFilters);
    }
  }, [checkedFilters, convertFiltersToMemberFilters, setFilters]);

  // 個別フィルター設定
  const toggleFilter = useCallback((type: string, checked: boolean) => {
    setFilter(type, checked);
  }, [setFilter]);

  // 全フィルタークリア
  const clearAllFilters = useCallback(() => {
    Object.keys(checkedFilters).forEach(type => {
      setFilter(type, false);
    });
  }, [checkedFilters, setFilter]);

  // 全フィルター選択
  const selectAllFilters = useCallback(() => {
    Object.keys(GENERATION_MAP).forEach(type => {
      setFilter(type, true);
    });
  }, [setFilter]);

  // フィルター適用の自動実行
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    checkedFilters,
    currentFilters: filters,
    toggleFilter,
    applyFilters,
    clearAllFilters,
    selectAllFilters,
  };
}

// ===== ローカルストレージhook =====

/**
 * ローカルストレージとの同期を行うhook
 * 
 * @param key - ストレージキー
 * @param defaultValue - デフォルト値
 * @returns 値と設定関数
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`ローカルストレージからの読み込みに失敗: ${key}`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T) => {
    try {
      setValue(newValue);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error(`ローカルストレージへの保存に失敗: ${key}`, error);
    }
  }, [key]);

  return [value, setStoredValue];
}

// ===== デバッグhook =====

/**
 * デバッグ情報の表示を行うhook（開発環境のみ）
 * 
 * @param label - デバッグラベル
 * @param data - デバッグ対象のデータ
 */
export function useDebugLog(label: string, data: any) {
  useEffect(() => {
    if (DEBUG_ENABLED) {
      console.log(`[DEBUG] ${label}:`, data);
    }
  }, [label, data]);
}

// ===== エラーハンドリングhook =====

/**
 * エラー状態の管理を行うhook
 * 
 * @returns エラー状態と制御関数
 */
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // エラー設定
  const handleError = useCallback((error: Error | string) => {
    const message = typeof error === 'string' ? error : error.message;
    setError(message);
    setIsError(true);
    
    if (DEBUG_ENABLED) {
      console.error('[エラー]', error);
    }
  }, []);

  // エラークリア
  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  // 一般的なエラーハンドラー
  const handleNetworkError = useCallback(() => {
    handleError(ERROR_MESSAGES.NETWORK_ERROR);
  }, [handleError]);

  const handleDataFetchError = useCallback(() => {
    handleError(ERROR_MESSAGES.DATA_FETCH_ERROR);
  }, [handleError]);

  return {
    error,
    isError,
    handleError,
    clearError,
    handleNetworkError,
    handleDataFetchError,
  };
}

// ===== パフォーマンス監視hook =====

/**
 * レンダリングパフォーマンスの監視を行うhook（開発環境のみ）
 * 
 * @param componentName - コンポーネント名
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useState(0)[0];
  
  useEffect(() => {
    if (DEBUG_ENABLED) {
      console.log(`[PERF] ${componentName} rendered ${renderCount + 1} times`);
    }
  });
}

// ===== 型定義の拡張 =====

// useColorControllerの戻り値型を拡張
declare module '@/types' {
  interface UseColorControllerReturn {
    /** 指定インデックスの色に設定する関数 */
    setColor: (colorIndex: number) => void;
    /** 色名から色を設定する関数 */
    setColorByName: (nameJa: string) => void;
  }
}