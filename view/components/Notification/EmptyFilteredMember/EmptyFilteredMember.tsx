"use client";

import { Notification, Overlay, Transition } from "@mantine/core";
import { useEffect, useState } from "react";
import { useSelectedMemberStore } from "@/stores/useSelectedMemberStore";

import classes from "./EmptyFilteredMember.module.css";

export function EmptyFilteredMember() {
  const [opened, setOpened] = useState(false);
  const hasInvalidFilter = useSelectedMemberStore(
    (state) => state.hasInvalidFilter
  );

  useEffect(() => {
    if (hasInvalidFilter) {
      setOpened(true);
      console.log("フィルターが無効です");
    } else {
      setOpened(false);
    }
  }, [hasInvalidFilter]);

  return (
    <Transition mounted={opened} transition="fade-left">
      {(styles) => (
        <Overlay backgroundOpacity={0} mt="90vh">
          <Notification
            className={classes.base}
            onClose={() => setOpened(false)}
            style={styles}
            title="フィルターが無効です"
            withCloseButton={false}
          >
            <span>フィルターを変更してください</span>
          </Notification>
        </Overlay>
      )}
    </Transition>
  );
}
