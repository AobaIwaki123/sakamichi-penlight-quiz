"use client";

import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { Notification, Overlay, Transition } from '@mantine/core';
import { useEffect, useState } from 'react';

import classes from './EmptyFilteredMember.module.css';

export function EmptyFilteredMember() {
  const [opened, setOpened] = useState(false);
  const hasInvalidFilter = useSelectedMemberStore((state) => state.hasInvalidFilter);
  const isLoading = useSelectedMemberStore((state) => state.isLoading);
  const allMembers = useSelectedMemberStore((state) => state.allMembers);

  useEffect(() => {
    // ローディング中またはデータ未取得時はエラー表示しない
    if (isLoading || allMembers.length === 0) {
      setOpened(false);
      return;
    }

    if (hasInvalidFilter) {
      setOpened(true);
      console.log("フィルターが無効です");
    } else {
      setOpened(false);
    }
  }, [hasInvalidFilter, isLoading, allMembers.length]);

  return (
    <Transition mounted={opened} transition="fade-left">
      {(styles) => (
        <Overlay mt="90vh" backgroundOpacity={0}>
          <Notification style={styles}
            title="フィルターが無効です"
            onClose={() => setOpened(false)}
            className={classes.base}
            withCloseButton={false}
          >
            <span>フィルターを変更してください</span>
          </Notification>
        </Overlay>
      )}
    </Transition>
  );
}
