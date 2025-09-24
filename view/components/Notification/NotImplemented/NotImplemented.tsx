import { Notification, Overlay, Text, Transition } from "@mantine/core";
import { useEffect, useState } from "react";
import { useLogoStore } from "@/stores/useLogoStore";

import classes from "./NotImplemented.module.css";

export function NotImplemented() {
  const [opened, setOpened] = useState(false);

  const current = useLogoStore((state) => state.current);

  useEffect(() => {
    if (current.name === "nogizaka") {
      setOpened(true);
    } else if (current.name === "hinatazaka" || current.name === "sakurazaka") {
      setOpened(false);
    }
  }, [current]);

  const onClose = () => {
    setOpened(false);
  };

  return (
    <Transition mounted={opened} transition="fade-left">
      {(styles) => (
        <Overlay backgroundOpacity={0} mt="10vh">
          <Notification
            className={classes.base}
            onClose={onClose}
            style={styles}
            title={<Text className={classes.title}>未実装のグループです</Text>}
            withCloseButton={false}
          >
            <Text className={classes.content}>
              今後のアップデートで追加されます
            </Text>
          </Notification>
        </Overlay>
      )}
    </Transition>
  );
}
