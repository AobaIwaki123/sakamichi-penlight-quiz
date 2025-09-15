"use client";

import { useEffect } from "react";

import { useAnswerCloseTriggerStore } from '@/stores/useAnswerCloseTriggerStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import type { Member } from "@/types/Member";

import { MemberImage } from "./MemberImage/MemberImage";
import { MemberInfoHeader } from "./MemberInfoHeader/MemberInfoHeader";

/**
 * メンバー情報を表示するコンポーネント
 * フィルター変更やクイズ回答後のトリガーに応じてランダムにメンバーを選択し、
 * そのメンバーの画像とヘッダー情報を表示する
 */
export function MemberInfo() {
  // フィルターストアから現在選択されているフィルター状態を取得
  const checkedFilters = useFilterStore((state) => state.checkedFilters);

  // 回答終了トリガーのカウントを監視（新しいメンバー選択のトリガー）
  const triggerCount = useAnswerCloseTriggerStore((state) => state.triggerCount);

  // ランダムメンバー選択機能を取得
  const pickRandomMember = useSelectedMemberStore((state) => state.pickRandomMember) as () => Member | undefined;

  useEffect(() => {
    // triggerCountの変更を検知（unused変数の意図的な使用）
    const _ = triggerCount;

    // 現在有効になっているフィルターの種類を抽出
    const selectedFilterTypes = Object.entries(checkedFilters)
      .filter(([, isChecked]) => isChecked)
      .map(([filterType]) => filterType);

    // フィルターが選択されている場合、または初期状態（フィルターが未設定）の場合にメンバーを選択
    const shouldPickMember = selectedFilterTypes.length > 0 || Object.keys(checkedFilters).length === 0;

    if (shouldPickMember) {
      const randomMember = pickRandomMember();

      if (randomMember) {
        console.log("選ばれたメンバー:", randomMember.name, randomMember.nickname);
      } else {
        console.log("選択可能なメンバーが見つかりませんでした");
      }
    }
  }, [triggerCount, checkedFilters, pickRandomMember]);

  return (
    <>
      {/* メンバー情報のヘッダー部分（名前、絵文字等） */}
      <MemberInfoHeader />

      {/* メンバーの画像表示部分 */}
      <MemberImage />
    </>
  );
}
