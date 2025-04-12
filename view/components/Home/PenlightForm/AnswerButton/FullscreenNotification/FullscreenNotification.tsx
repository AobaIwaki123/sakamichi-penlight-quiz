import { useAnswerTriggerStore } from '@/stores/useAnswerTriggerStore'
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { Overlay, Portal, Text, Transition } from '@mantine/core';
import { useEffect, useState } from 'react';
import classes from './FullscreenNotification.module.css';

export type FullscreenNotificationProps = {
  message: string;
};

export function FullscreenNotification({ message }: FullscreenNotificationProps) {
  const [visible, setVisible] = useState(false);

  const triggerCount = useAnswerTriggerStore((state) => state.triggerCount);
  const selectedMember = useSelectedMemberStore((state) => state.selectedMember);

  useEffect(() => {
    if (triggerCount > 0) {
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
      }, 500);
    }
  }, [triggerCount]);

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
            <Text c="white" size="xl" ta="center" mt="30vh" className={classes.text}>
              {message}
            </Text>
          </Overlay>
        )}
      </Transition>
    </Portal>
  );
}
