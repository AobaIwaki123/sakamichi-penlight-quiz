import { useLogoStore } from '@/stores/useLogoStore';
import { Notification, Overlay, Text, Transition } from '@mantine/core';

import { useEffect, useState } from 'react';

import classes from './NotImplemented.module.css';

export function NotImplemented() {
  const [opened, setOpened] = useState(false);

  const current = useLogoStore((state) => state.current);


  useEffect(() => {
    if (current.name === 'sakurazaka' || current.name === 'nogizaka') {
      setOpened(true);
    } else if (current.name === 'hinatazaka') {
      setOpened(false);
    }
  }, [current]);

  const onClose = () => {
    setOpened(false);
  }

  return (
    <Transition mounted={opened} transition="fade-left">
      {(styles) => (
        <Overlay mt="10vh" backgroundOpacity={0}>
          <Notification style={styles}
            title={<Text className={classes.title}>未実装のグループです</Text>}
            onClose={onClose} className={classes.base}>
            <Text className={classes.content}>今後のアップデートで追加されます</Text>
          </Notification>
        </Overlay>
      )}
    </Transition>
  );
}
