import { useCallback } from 'react';
import { useColorStore } from '@/stores/useColorStore';
import { usePenlightStore } from '@/stores/usePenlightStore';
import type { PenlightColor } from '@/types/PenlightColor';

/**
 * ペンライトカラーコントローラーの戻り値型定義
 */
interface ColorControllerReturn {
  /** 現在選択されているペンライト色のインデックス */
  index: number;
  /** 現在選択されているペンライト色のHEXカラーコード */
  color: string;
  /** 現在選択されているペンライト色の日本語名 */
  nameJa: string;
  /** 現在選択されているペンライト色の英語名 */
  nameEn: string;
  /** 次のペンライト色に切り替える関数 */
  next: () => void;
  /** 前のペンライト色に切り替える関数 */
  prev: () => void;
  /** 利用可能な全ペンライトカラーの配列 */
  allColors: PenlightColor[];
}

/**
 * ペンライトカラーコントローラーフック
 * 指定されたIDに対応するペンライト色の状態管理と操作を提供
 * 
 * @param id - ペンライトコントローラーの一意識別子（例: "penlight1", "penlight2"）
 * @returns ペンライト色の現在状態と操作関数
 * 
 * @example
 * ```tsx
 * const {
 *   color,
 *   nameJa,
 *   next,
 *   prev
 * } = useColorController('penlight1');
 * 
 * return (
 *   <div style={{ backgroundColor: color }}>
 *     <span>{nameJa}</span>
 *     <button onClick={prev}>前へ</button>
 *     <button onClick={next}>次へ</button>
 *   </div>
 * );
 * ```
 */
export function useColorController(id: string): ColorControllerReturn {
  // Zustandストアから必要な状態と関数を取得
  const index = useColorStore((state) => state.colorMap[id]?.index ?? 0);
  const setIndex = useColorStore((state) => state.setIndex);
  const penlightColors = usePenlightStore((state) => state.penlightColors);

  // 次のペンライト色に切り替える関数（循環）
  const next = useCallback(() => {
    if (penlightColors.length === 0) {
      console.warn('ペンライトカラーデータが読み込まれていません');
      return;
    }
    setIndex(id, (prevIndex) => (prevIndex + 1) % penlightColors.length);
  }, [id, setIndex, penlightColors.length]);

  // 前のペンライト色に切り替える関数（循環）
  const prev = useCallback(() => {
    if (penlightColors.length === 0) {
      console.warn('ペンライトカラーデータが読み込まれていません');
      return;
    }
    setIndex(id, (prevIndex) =>
      (prevIndex - 1 + penlightColors.length) % penlightColors.length
    );
  }, [id, setIndex, penlightColors.length]);

  // 現在選択されているペンライト色
  const currentColor = penlightColors[index];

  // ペンライト色データが未取得の場合はデフォルト値を返す
  if (!currentColor || penlightColors.length === 0) {
    return {
      index: 0,
      color: '#cccccc',
      nameJa: '未取得',
      nameEn: 'not_loaded',
      next: () => {
        console.warn('ペンライトカラーデータが読み込まれていないため、操作をスキップします');
      },
      prev: () => {
        console.warn('ペンライトカラーデータが読み込まれていないため、操作をスキップします');
      },
      allColors: [],
    };
  }

  return {
    index,
    color: currentColor.color,
    nameJa: currentColor.name_ja,
    nameEn: currentColor.name_en,
    next,
    prev,
    allColors: penlightColors,
  };
}
