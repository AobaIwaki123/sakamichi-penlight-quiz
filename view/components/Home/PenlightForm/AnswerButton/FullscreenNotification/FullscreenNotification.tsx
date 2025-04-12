import { hinatazakaPenlightColors } from '@/consts/colors';
import { useAnswerTriggerStore } from '@/stores/useAnswerTriggerStore'
import { useColorStore } from '@/stores/useColorStore';
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { Group, Overlay, Portal, Text, Transition } from '@mantine/core';
import { useEffect, useState } from 'react';
import classes from './FullscreenNotification.module.css';

export type FullscreenNotificationProps = {
  message: string;
};

export function FullscreenNotification({ message }: FullscreenNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [penlight1, setPenlight1] = useState<string | null>(null);
  const [penlight2, setPenlight2] = useState<string | null>(null);

  const triggerCount = useAnswerTriggerStore((state) => state.triggerCount);
  const selectedMember = useSelectedMemberStore((state) => state.selectedMember);

  useEffect(() => {
    if (triggerCount > 0) {
      setVisible(true);
      // setTimeout(() => {
      //   setVisible(false);
      // }, 500);
    }
  }, [triggerCount]);

  useEffect(() => {
    if (selectedMember) {
      const penlight1Index = selectedMember.penlight1_id;
      const penlight2Index = selectedMember.penlight2_id;
      const penlight1Info = hinatazakaPenlightColors[penlight1Index] ?? "null";
      const penlight2Info = hinatazakaPenlightColors[penlight2Index] ?? "null";
      setPenlight1(penlight1Info.name_ja);
      setPenlight2(penlight2Info.name_ja);
    }
  }, [selectedMember]);

  return (
    <Portal> {/* 👈 Portal を使うことで body 直下に描画される */}
      <Transition mounted={visible} transition="fade" duration={0} timingFunction="ease">
        {(styles) => (
          <Overlay
            onClick={() => { setVisible(false) }}
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
