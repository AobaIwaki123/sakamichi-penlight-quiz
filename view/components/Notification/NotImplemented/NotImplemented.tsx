import { useLogoStore } from '@/stores/useLogoStore';
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { Notification, Overlay, Text, Transition } from '@mantine/core';

import { useEffect, useState } from 'react';

import classes from './NotImplemented.module.css';

export function NotImplemented() {
  const [opened, setOpened] = useState(false);

  const current = useLogoStore((state) => state.current);
  const isLoading = useSelectedMemberStore((state) => state.isLoading);
  const allMembers = useSelectedMemberStore((state) => state.allMembers);

  useEffect(() => {
    // 初期読み込み中または最初のデータ読み込み前は通知を表示しない
    if (isLoading || allMembers.length === 0) {
      setOpened(false);
      return;
    }

    if (current.name === 'nogizaka') {
      setOpened(true);
    } else if (current.name === 'hinatazaka' || current.name === 'sakurazaka') {
      setOpened(false);
    }
  }, [current, isLoading, allMembers.length]);

  const onClose = () => {
    setOpened(false);
  }

  return (
    <Transition mounted={opened} transition="fade-left">
      {(styles) => (
        <Overlay mt="10vh" backgroundOpacity={0}>
          <Notification style={styles}
            title={<Text className={classes.title}>未実装のグループです</Text>}
            onClose={onClose} className={classes.base}
            withCloseButton={false}>
            <Text className={classes.content}>今後のアップデートで追加されます</Text>
          </Notification>
        </Overlay>
      )}
    </Transition>
  );
}
