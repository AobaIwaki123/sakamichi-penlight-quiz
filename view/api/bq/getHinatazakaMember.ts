 "use server";

import type { Member } from '@/types/Member';
import { getMemberData } from './getMemberData';

/**
 * 日向坂46のメンバー情報を取得する関数
 * @deprecated 新しいコードでは getMemberData('hinatazaka') を使用してください
 * @returns Promise<Member[]> メンバー情報の配列
 */
export async function getHinatazakaMember(): Promise<Member[]> {
  return getMemberData('hinatazaka');
}
