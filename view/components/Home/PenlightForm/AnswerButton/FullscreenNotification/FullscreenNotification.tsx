import { hinatazakaPenlightColors } from '@/consts/hinatazakaColors';
import { useAnswerCloseTriggerStore } from '@/stores/useAnswerCloseTriggerStore';
import { useAnswerTriggerStore } from '@/stores/useAnswerTriggerStore'
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { Overlay, Portal, Text, Transition } from '@mantine/core';
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
        const penlight1Info = hinatazakaPenlightColors[penlight1Index];
        const penlight2Info = hinatazakaPenlightColors[penlight2Index];
        setPenlight1(penlight1Info.name_ja);
        setPenlight2(penlight2Info.name_ja);
      }
    }
  }, [answerTriggerCount]); // ✅ これでselectedMemberは依存に含めなくてOK＆警告なし

  const onClose = () => {
    setVisible(false);
    answerCloseTrigger();
  };

  return (
    <Portal> {/* 👈 Portal を使うことで body 直下に描画される */}
      <Transition mounted={visible} transition="fade" duration={0} timingFunction="ease">
        {(styles) => (
          <Overlay
            onClick={onClose}
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
            <Text c="white" size="xl" ta="center" mt="30vh" className={classes.message}>
              {message}
            </Text>
            <Text c="white" size="xl" ta="center" className={classes.penlight}>
              {penlight1}
            </Text>
            <Text c="white" size="xl" ta="center" className={classes.penlight}>
              {penlight2}
            </Text>
          </Overlay>
        )}
      </Transition>
    </Portal>
  );
}
