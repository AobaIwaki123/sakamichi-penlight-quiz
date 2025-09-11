"use client";

import { useStreakStore } from '@/stores/useStreakStore';
import { Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconFire } from '@tabler/icons-react';

/**
 * 連続正解数を表示するコンポーネント
 * ヘッダー部分で現在の連続正解数と最高記録を表示する
 */
export function StreakDisplay() {
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const bestStreak = useStreakStore((state) => state.bestStreak);
  const totalCorrect = useStreakStore((state) => state.totalCorrect);
  const totalAnswers = useStreakStore((state) => state.totalAnswers);
  const getAccuracy = useStreakStore((state) => state.getAccuracy);

  // 正解率を取得
  const accuracy = getAccuracy();

  return (
    <Group gap="xs" align="center">
      {/* 現在の連続正解数 */}
      <Tooltip
        label={`現在の連続正解数: ${currentStreak}回`}
        position="bottom"
        withArrow
      >
        <Badge
          variant={currentStreak > 0 ? "filled" : "light"}
          color={currentStreak > 0 ? "orange" : "gray"}
          size="md"
          leftSection={<IconFire size={12} />}
        >
          {currentStreak}
        </Badge>
      </Tooltip>

      {/* 最高記録（記録がある場合のみ表示） */}
      {bestStreak > 0 && (
        <Tooltip
          label={`最高記録: ${bestStreak}連続正解`}
          position="bottom"
          withArrow
        >
          <Text size="xs" c="dimmed">
            最高 {bestStreak}
          </Text>
        </Tooltip>
      )}

      {/* 統計情報（回答数がある場合のみ表示） */}
      {totalAnswers > 0 && (
        <Tooltip
          label={
            <div>
              <div>正解数: {totalCorrect}回</div>
              <div>全回答数: {totalAnswers}回</div>
              <div>正解率: {(accuracy * 100).toFixed(1)}%</div>
            </div>
          }
          position="bottom"
          withArrow
        >
          <Text size="xs" c="dimmed">
            {(accuracy * 100).toFixed(0)}%
          </Text>
        </Tooltip>
      )}
    </Group>
  );
}