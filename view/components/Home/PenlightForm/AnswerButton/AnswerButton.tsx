"use client";

import { Button, Text } from "@mantine/core";
import { useState } from "react";
import { useColorController } from "@/hooks/useColorController";
import { useAnswerTriggerStore } from "@/stores/useAnswerTriggerStore";
import { useSelectedMemberStore } from "@/stores/useSelectedMemberStore";
import type { Member } from "@/types/Member";
import { FullscreenNotification } from "./FullscreenNotification/FullscreenNotification";

export function AnswerButton() {
  const [message, setMessage] = useState(""); // メッセージを管理するステート

  const trigger = useAnswerTriggerStore((state) => state.trigger);

  const selectedMember = useSelectedMemberStore(
    (state) => state.selectedMember
  );
  const isLoading = useSelectedMemberStore((state) => state.isLoading);

  const { index: leftIndex, nameJa: leftNameJa } = useColorController("left");
  const { index: rightIndex, nameJa: rightNameJa } =
    useColorController("right");

  const handleClick = () => {
    if (isLoading) {
      console.log("データ読み込み中のため回答をスキップ");
      return;
    }

    if (!selectedMember) {
      console.error("メンバーが選択されていません");
      return;
    }

    const selectedPenlightSet = getSelectedMemberSet();
    const answerPenlightSet = getAnswerPenlightSet(selectedMember);
    const isMatch = isPenlightMatch(selectedPenlightSet, answerPenlightSet);

    if (isMatch) {
      console.log("一致：正解の組み合わせです");
      setMessage("正解");
    } else {
      console.log("不一致：この組み合わせは正解ではありません");
      setMessage("不正解");
    }

    trigger();
  };

  const getSelectedMemberSet = () => {
    console.log(
      "Button clicked",
      leftIndex,
      leftNameJa,
      rightIndex,
      rightNameJa
    );

    return new Set([leftIndex, rightIndex]);
  };

  const getAnswerPenlightSet = (selectedMember: Member) =>
    new Set([selectedMember.penlight1_id, selectedMember.penlight2_id]);

  const isPenlightMatch = (
    selectedPenlightSet: Set<number>,
    answerPenlightSet: Set<number>
  ): boolean =>
    selectedPenlightSet.size === answerPenlightSet.size &&
    Array.from(selectedPenlightSet).every((val) => answerPenlightSet.has(val));

  return (
    <>
      <Button
        disabled={isLoading || !selectedMember}
        loading={isLoading}
        onClick={handleClick}
        radius="xl"
        variant="outline"
      >
        <Text fw={700} size="lg">
          {isLoading ? "ローディング中..." : "回答"}
        </Text>
      </Button>
      <FullscreenNotification message={message} />
    </>
  );
}
