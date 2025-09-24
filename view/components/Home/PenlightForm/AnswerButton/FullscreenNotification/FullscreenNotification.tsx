import { Overlay, Portal, Text, Transition } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useAnswerCloseTriggerStore } from "@/stores/useAnswerCloseTriggerStore";
import { useAnswerTriggerStore } from "@/stores/useAnswerTriggerStore";
import { usePenlightStore } from "@/stores/usePenlightStore";
import { useSelectedMemberStore } from "@/stores/useSelectedMemberStore";
import classes from "./FullscreenNotification.module.css";

export type FullscreenNotificationProps = {
  message: string;
};

export function FullscreenNotification({
  message,
}: FullscreenNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [penlight1, setPenlight1] = useState<string | null>(null);
  const [penlight2, setPenlight2] = useState<string | null>(null);

  const answerTriggerCount = useAnswerTriggerStore(
    (state) => state.triggerCount
  );
  const answerCloseTrigger = useAnswerCloseTriggerStore(
    (state) => state.trigger
  );
  const selectedMember = useSelectedMemberStore(
    (state) => state.selectedMember
  );
  const getPenlightById = usePenlightStore((state) => state.getPenlightById);
  const selectedMemberRef = useRef<typeof selectedMember>(null);

  useEffect(() => {
    selectedMemberRef.current = selectedMember;
  }, [selectedMember]);

  useEffect(() => {
    if (answerTriggerCount > 0) {
      setVisible(true);

      const current = selectedMemberRef.current;
      if (current) {
        const penlight1Index = current.penlight1_id;
        const penlight2Index = current.penlight2_id;
        const penlight1Info = getPenlightById(penlight1Index);
        const penlight2Info = getPenlightById(penlight2Index);
        setPenlight1(penlight1Info?.name_ja || "未取得");
        setPenlight2(penlight2Info?.name_ja || "未取得");
      }
    }
  }, [answerTriggerCount]); // ✅ これでselectedMemberは依存に含めなくてOK＆警告なし

  const onClose = () => {
    setVisible(false);
    answerCloseTrigger();
  };

  return (
    <Portal>
      {" "}
      {/* 👈 Portal を使うことで body 直下に描画される */}
      <Transition
        duration={0}
        mounted={visible}
        timingFunction="ease"
        transition="fade"
      >
        {(styles) => (
          <Overlay
            blur={2}
            color="#000"
            onClick={onClose}
            opacity={0.8}
            style={{
              ...styles,
              position: "fixed", // 👈 スクロールに追従しないように固定
              inset: 0,
            }}
            zIndex={1000}
          >
            <Text
              c="white"
              className={classes.message}
              mt="30vh"
              size="xl"
              ta="center"
            >
              {message}
            </Text>
            <Text c="white" className={classes.penlight} size="xl" ta="center">
              {penlight1}
            </Text>
            <Text c="white" className={classes.penlight} size="xl" ta="center">
              {penlight2}
            </Text>
          </Overlay>
        )}
      </Transition>
    </Portal>
  );
}
