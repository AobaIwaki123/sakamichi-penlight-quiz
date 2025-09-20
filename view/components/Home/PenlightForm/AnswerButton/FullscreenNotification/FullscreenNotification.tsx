import { useAnswerCloseTriggerStore } from '@/stores/useAnswerCloseTriggerStore';
import { useAnswerTriggerStore } from '@/stores/useAnswerTriggerStore'
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { usePenlightStore } from '@/stores/usePenlightStore';
import { Overlay, Portal, Text, Transition, Button, Group, Stack } from '@mantine/core';
import { IconRefresh, IconArrowRight } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import classes from './FullscreenNotification.module.css';

export type FullscreenNotificationProps = {
  message: string;
};

export function FullscreenNotification({ message }: FullscreenNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [penlight1, setPenlight1] = useState<string | null>(null);
  const [penlight2, setPenlight2] = useState<string | null>(null);

  const answerTriggerCount = useAnswerTriggerStore((state) => state.triggerCount);
  const answerCloseTrigger = useAnswerCloseTriggerStore((state) => state.trigger);
  const selectedMember = useSelectedMemberStore((state) => state.selectedMember);
  const pickRandomMember = useSelectedMemberStore((state) => state.pickRandomMember);
  const getPenlightById = usePenlightStore((state) => state.getPenlightById);
  const selectedMemberRef = useRef<typeof selectedMember>(null);

  useEffect(() => {
    selectedMemberRef.current = selectedMember;
  }, [selectedMember]);

  useEffect(() => {
    if (answerTriggerCount > 0) {
      setVisible(true);

      const current = selectedMemberRef.current;
      if (current) {
        const penlight1Index = current.penlight1_id;
        const penlight2Index = current.penlight2_id;
        const penlight1Info = getPenlightById(penlight1Index);
        const penlight2Info = getPenlightById(penlight2Index);
        setPenlight1(penlight1Info?.name_ja || '未取得');
        setPenlight2(penlight2Info?.name_ja || '未取得');
      }
    }
  }, [answerTriggerCount]); // ✅ これでselectedMemberは依存に含めなくてOK＆警告なし

  const onClose = () => {
    setVisible(false);
    answerCloseTrigger();
  };

  // リトライボタンのハンドラー（同じ問題を再度出題）
  const onRetry = () => {
    setVisible(false);
    answerCloseTrigger();
    // 現在のメンバーを維持するため、何もしない
    // ペンライト選択がリセットされるだけで、同じメンバーで再挑戦可能
  };

  // 次へボタンのハンドラー（新しいメンバーを選択）
  const onNext = () => {
    setVisible(false);
    answerCloseTrigger();
    // 新しいメンバーを選択
    pickRandomMember();
  };

  return (
    <Portal> {/* 👈 Portal を使うことで body 直下に描画される */}
      <Transition mounted={visible} transition="fade" duration={0} timingFunction="ease">
        {(styles) => (
          <Overlay
            style={{
              ...styles,
              position: 'fixed', // 👈 スクロールに追従しないように固定
              inset: 0,
            }}
            zIndex={1000}
            opacity={0.8}
            blur={2}
            color="#000"
          >
            <Stack
              align="center"
              justify="center"
              style={{
                height: '100vh',
                padding: '2rem',
                position: 'relative'
              }}
            >
              {/* 正解・不正解メッセージ */}
              <Text c="white" size="xl" ta="center" className={classes.message}>
                {message}
              </Text>
              
              {/* ペンライト色表示 */}
              <Stack align="center" gap="xs">
                <Text c="white" size="lg" ta="center" className={classes.penlight}>
                  {penlight1}
                </Text>
                <Text c="white" size="lg" ta="center" className={classes.penlight}>
                  {penlight2}
                </Text>
              </Stack>

              {/* ボタン群 - 画面下部に配置 */}
              <Group
                justify="space-between"
                className={classes.buttonContainer}
                style={{
                  position: 'absolute',
                  bottom: '2rem',
                  left: '2rem',
                  right: '2rem',
                  width: 'calc(100% - 4rem)'
                }}
              >
                {/* 左下: リトライボタン */}
                <Button
                  variant="filled"
                  color="orange"
                  size="lg"
                  radius="xl"
                  leftSection={<IconRefresh size={20} />}
                  onClick={onRetry}
                  className={classes.retryButton}
                  style={{
                    minWidth: '140px',
                    minHeight: '50px',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  リトライ
                </Button>

                {/* 右下: 次へボタン */}
                <Button
                  variant="filled"
                  color="blue"
                  size="lg"
                  radius="xl"
                  rightSection={<IconArrowRight size={20} />}
                  onClick={onNext}
                  className={classes.nextButton}
                  style={{
                    minWidth: '140px',
                    minHeight: '50px',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  次へ
                </Button>
              </Group>
            </Stack>
          </Overlay>
        )}
      </Transition>
    </Portal>
  );
}
