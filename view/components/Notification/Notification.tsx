import { NotImplemented } from '@/components/Notification/NotImplemented/NotImplemented';
import { EmptyFilteredMember } from '@/components/Notification/EmptyFilteredMember/EmptyFilteredMember';

export function Notification() {
  return (
    <>
      <NotImplemented />
      <EmptyFilteredMember />
    </>
  )
}
