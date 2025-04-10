import { useState } from 'react';
import { Overlay, Text, Transition, Portal } from '@mantine/core';

export function FullscreenNotification({ visible }: { visible: boolean }) {
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
            <Text c="white" size="xl" ta="center" mt="40vh">
              スクロールしても消えない通知！
            </Text>
          </Overlay>
        )}
      </Transition>
    </Portal>
  );
}

export default function Demo() {
  const [visible, setVisible] = useState(false);

  const triggerEvent = () => {
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  };

  return (
    <div style={{ height: '200vh' }}> {/* スクロールできるように高さを確保 */}
      <button type="button" onClick={triggerEvent}>表示トリガー</button>
      <FullscreenNotification visible={visible} />
    </div>
  );
}
