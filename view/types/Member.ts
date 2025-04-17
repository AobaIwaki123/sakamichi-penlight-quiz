// types/member.ts
import type { Generation } from "@/consts/hinatazakaFilters";

export interface Member {
  id: number;
  name: string;
  nickname: string;
  emoji: string;
  gen: Generation;
  graduated: boolean;
  penlight1_id: number;
  penlight2_id: number;
  type: string;
  url: string;
}
