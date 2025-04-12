import { Overlay, Portal, Text, Transition } from '@mantine/core';
import classes from './FullscreenNotification.module.css';

export type FullscreenNotificationProps = {
  visible: boolean;
  message: string;
  onClose?: () => void; // 閉じるためのコールバック関数
};

export function FullscreenNotification({ visible, message, onClose }: FullscreenNotificationProps) {
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
            <Text c="white" size="xl" ta="center" mt="30vh" className={classes.text}>
              {message}
            </Text>
          </Overlay>
        )}
      </Transition>
    </Portal>
  );
}
