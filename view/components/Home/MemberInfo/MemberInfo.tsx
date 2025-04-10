import { MemberImage } from "../MemberImage/MemberImage";
import { MemberInfoHeader } from "../MemberInfoHeader/MemberInfoHeader";
import { HinatazakaMembers } from "@/consts/hinatazakaMembers";

import { useEffect } from "react";

export function MemberInfo() {
  return (
    <>
      <MemberInfoHeader />
      <MemberImage />
    </>
  );
}
