import { useState, useEffect } from 'react';
import { Overlay, Text, Transition } from '@mantine/core';

export function FullscreenNotification({ visible }: { visible: boolean }) {
  return (
    <Transition mounted={visible} transition="fade" duration={500} timingFunction="ease">
      {(styles) => (
        <Overlay
          style={{ ...styles }}
          zIndex={1000}
          opacity={0.8}
          blur={2}
          color="#000"
        >
          <Text c="white" size="xl" ta="center" mt="40vh">
            画面全体に表示された通知です！
          </Text>
        </Overlay>
      )}
    </Transition>
  );
}

export default function Demo() {
  const [visible, setVisible] = useState(false);

  const triggerEvent = () => {
    setVisible(true);
    setTimeout(() => setVisible(false), 3000); // 3秒で自動非表示
  };

  return (
    <>
      <button onClick={triggerEvent}>表示トリガー</button>
      <FullscreenNotification visible={visible} />
    </>
  );
}
