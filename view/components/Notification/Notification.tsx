import { EmptyFilteredMember } from "@/components/Notification/EmptyFilteredMember/EmptyFilteredMember";
import { NotImplemented } from "@/components/Notification/NotImplemented/NotImplemented";

export function Notification() {
  return (
    <>
      <NotImplemented />
      <EmptyFilteredMember />
    </>
  );
}
