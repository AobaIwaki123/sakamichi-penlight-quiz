// types/member.ts
import type { Generation as HinatazakaGeneration } from "@/consts/hinatazakaFilters";
import type { Generation as NogizakaGeneration } from "@/consts/nogizakaFilters";

export type Generation = HinatazakaGeneration | NogizakaGeneration;

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
