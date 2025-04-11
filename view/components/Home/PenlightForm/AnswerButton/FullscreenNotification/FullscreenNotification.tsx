import { useState } from 'react';
import { Overlay, Text, Transition, Portal } from '@mantine/core';
import classes from './FullscreenNotification.module.css';

export type FullscreenNotificationProps = {
  visible: boolean;
  message: string;
};

export function FullscreenNotification({ visible, message }: FullscreenNotificationProps) {
  return (
    <Portal> {/* 👈 Portal を使うことで body 直下に描画される */}
      <Transition mounted={visible} transition="fade" duration={500} timingFunction="ease">
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
            <Text c="white" size="xl" ta="center" mt="40vh" className={classes.text}>
              {message}
            </Text>
          </Overlay>
        )}
      </Transition>
    </Portal>
  );
}
