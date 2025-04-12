import { useAnswerTriggerStore } from '@/stores/useAnswerTriggerStore'
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { Center, Group, Overlay, Portal, Text, Transition } from '@mantine/core';
import { useEffect, useState } from 'react';
import classes from './FullscreenNotification.module.css';

export type FullscreenNotificationProps = {
  message: string;
};

export function FullscreenNotification({ message }: FullscreenNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [penlight1ID, setPenlight1ID] = useState<number | null>(null);
  const [penlight2ID, setPenlight2ID] = useState<number | null>(null);

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
      setPenlight1ID(selectedMember.penlight1_id);
      setPenlight2ID(selectedMember.penlight2_id);
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
            <Group justify="center">
              <Text c="white" size="xl" ta="center" className={classes.message}>
                {penlight1ID}
              </Text>
              <Text c="white" size="xl" ta="center" className={classes.message}>
                {penlight2ID}
              </Text>
            </Group>
          </Overlay>
        )}
      </Transition>
    </Portal>
  );
}
