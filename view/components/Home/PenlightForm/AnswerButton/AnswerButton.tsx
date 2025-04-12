"use client";

import { hinatazakaPenlightColors } from '@/consts/colors';
import type { Member } from '@/consts/hinatazakaMembers';
import { useColorStore } from '@/stores/colorStore';
import { useAnswerTriggerStore } from '@/stores/useAnswerTriggerStore'
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { Button, Text } from '@mantine/core';
import { useState } from 'react';
import { FullscreenNotification } from './FullscreenNotification/FullscreenNotification';

export function AnswerButton() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(''); // メッセージを管理するステート

  const trigger = useAnswerTriggerStore((state) => state.trigger)

  const selectedMember = useSelectedMemberStore((state) => state.selectedMember);

  const penlightColors = hinatazakaPenlightColors;

  const handleClick = () => {
    if (!selectedMember) {
      console.error('メンバーが選択されていません');
      return;
    }

    const selectedPenlightSet = getSelectedMemberSet();
    const answerPenlightSet = getAnswerPenlightSet(selectedMember);

    const isMatch = isPenlightMatch(selectedPenlightSet, answerPenlightSet);

    if (isMatch) {
      console.log('一致：正解の組み合わせです');
      setMessage('正解');
    } else {
      console.log('不一致：この組み合わせは正解ではありません');
      setMessage('不正解');
    }

    trigger();
  }

  const getSelectedMemberSet = () => {
    const state = useColorStore.getState();

    const leftIndex = state.colorMap.left?.index ?? 0;
    const rightIndex = state.colorMap.right?.index ?? 0;

    const leftNameJa = penlightColors[leftIndex]?.name_ja ?? '不明';
    const rightNameJaB = penlightColors[rightIndex]?.name_ja ?? '不明';

    console.log('Button clicked', leftIndex, leftNameJa, rightIndex, rightNameJaB);

    return new Set([leftIndex, rightIndex]);
  }

  const getAnswerPenlightSet = (selectedMember: Member) => {
    return new Set([selectedMember.penlight1_id, selectedMember.penlight2_id]);
  }

  const isPenlightMatch = (
    selectedPenlightSet: Set<number>,
    answerPenlightSet: Set<number>
  ): boolean => {
    return (
      selectedPenlightSet.size === answerPenlightSet.size &&
      Array.from(selectedPenlightSet).every((val) => answerPenlightSet.has(val))
    );
  }

      return (
    <>
      <Button variant="outline" radius="xl" onClick={handleClick}>
        <Text size="lg" fw={700}>
          回答
        </Text>
      </Button>
      <FullscreenNotification message={message} />
    </>
  );
}
