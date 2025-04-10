"use client";

import { penlightColors } from '@/consts/colors';
import { hinatazakaPenlightColors } from '@/consts/hinatazakaPenlightColors';
import { useColorStore } from '@/stores/colorStore';
import { useAnswerTriggerStore } from '@/stores/useAnswerTriggerStore'
import { Button, Overlay, Text } from '@mantine/core';
import { FullscreenNotification } from './FullscreenNotification/FullscreenNotification';

import { useState } from 'react';

export function AnswerButton() {
  const trigger = useAnswerTriggerStore((state) => state.trigger)

  const handleClick = () => {
    const state = useColorStore.getState();

    const leftIndex = state.colorMap.left?.index ?? 0;
    const rightIndex = state.colorMap.right?.index ?? 0;

    const leftNameJa = penlightColors[leftIndex]?.name_ja ?? '不明';
    const rightNameJaB = penlightColors[rightIndex]?.name_ja ?? '不明';

    console.log('Button clicked', leftIndex, leftNameJa, rightIndex, rightNameJaB);

    // 比較対象のメンバーID
    const targetMember = hinatazakaPenlightColors.find((m) => m.member_id === '22');
    if (!targetMember) {
      console.log('指定されたメンバーが見つかりません');
      return;
    }

    const selectedSet = new Set([leftIndex.toString(), rightIndex.toString()]);
    const memberSet = new Set([targetMember.color_id1, targetMember.color_id2]);

    const isMatch =
      selectedSet.size === memberSet.size &&
      Array.from(selectedSet).every((val) => memberSet.has(val));

    console.log('Selected Set:', selectedSet);
    console.log('Member Set:', memberSet);

    if (isMatch) {
      console.log('一致：正解の組み合わせです');
    } else {
      console.log('不一致：この組み合わせは正解ではありません');
    }

    trigger();
    triggerEvent();
  }

  const [visible, setVisible] = useState(false);

  const triggerEvent = () => {
    setVisible(true);
    setTimeout(() => setVisible(false), 1000); // 3秒で自動非表示
  };

  return (
    <>
      <Button variant="outline" radius="xl" onClick={handleClick}>
        <Text size="lg" fw={700}>
          回答
        </Text>
      </Button>
      <FullscreenNotification visible={visible} />
    </>
  );
}
