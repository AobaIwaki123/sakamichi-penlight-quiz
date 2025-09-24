/**
 * BigQuery API統合関数のテスト
 */

import {
  getCompleteDataByGroup,
  getMembersByGroup,
  getPenlightByGroup,
} from "@/api/bq";

// API関数をモック化
jest.mock("@/api/bq/getHinatazakaMember", () => ({
  getHinatazakaMember: jest.fn(),
}));

jest.mock("@/api/bq/getSakurazakaMember", () => ({
  getSakurazakaMember: jest.fn(),
}));

jest.mock("@/api/bq/getHinatazakaPenlight", () => ({
  getHinatazakaPenlight: jest.fn(),
}));

jest.mock("@/api/bq/getSakurazakaPenlight", () => ({
  getSakurazakaPenlight: jest.fn(),
}));

import { getHinatazakaMember } from "@/api/bq/getHinatazakaMember";
import { getHinatazakaPenlight } from "@/api/bq/getHinatazakaPenlight";
import { getSakurazakaMember } from "@/api/bq/getSakurazakaMember";
import { getSakurazakaPenlight } from "@/api/bq/getSakurazakaPenlight";

const mockGetHinatazakaMember = getHinatazakaMember as jest.MockedFunction<
  typeof getHinatazakaMember
>;
const mockGetSakurazakaMember = getSakurazakaMember as jest.MockedFunction<
  typeof getSakurazakaMember
>;
const mockGetHinatazakaPenlight = getHinatazakaPenlight as jest.MockedFunction<
  typeof getHinatazakaPenlight
>;
const mockGetSakurazakaPenlight = getSakurazakaPenlight as jest.MockedFunction<
  typeof getSakurazakaPenlight
>;

describe("BigQuery API統合関数", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMembersByGroup", () => {
    test("日向坂46のメンバー情報を取得する", async () => {
      const mockMembers = [
        {
          id: 1,
          name: "テストメンバー1",
          nickname: "テスト1",
          emoji: "🌟",
          gen: "1期生",
          graduated: false,
          penlight1_id: 1,
          penlight2_id: 2,
          type: "test",
          url: "https://example.com/test1.jpg",
        },
      ];

      mockGetHinatazakaMember.mockResolvedValue(mockMembers);

      const result = await getMembersByGroup("hinatazaka");

      expect(mockGetHinatazakaMember).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMembers);
    });

    test("櫻坂46のメンバー情報を取得する", async () => {
      const mockMembers = [
        {
          id: 1,
          name: "テストメンバー2",
          nickname: "テスト2",
          emoji: "🌸",
          gen: "1期生",
          graduated: false,
          penlight1_id: 3,
          penlight2_id: 4,
          type: "test",
          url: "https://example.com/test2.jpg",
        },
      ];

      mockGetSakurazakaMember.mockResolvedValue(mockMembers);

      const result = await getMembersByGroup("sakurazaka");

      expect(mockGetSakurazakaMember).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMembers);
    });

    test("無効なグループ名でエラーをスローする", async () => {
      await expect(getMembersByGroup("invalid" as any)).rejects.toThrow();
    });
  });

  describe("getPenlightByGroup", () => {
    test("日向坂46のペンライト色情報を取得する", async () => {
      const mockColors = [
        {
          id: 1,
          name_ja: "青",
          name_en: "Blue",
          color: "#0000ff",
        },
        {
          id: 2,
          name_ja: "赤",
          name_en: "Red",
          color: "#ff0000",
        },
      ];

      mockGetHinatazakaPenlight.mockResolvedValue(mockColors);

      const result = await getPenlightByGroup("hinatazaka");

      expect(mockGetHinatazakaPenlight).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockColors);
    });

    test("櫻坂46のペンライト色情報を取得する", async () => {
      const mockColors = [
        {
          id: 3,
          name_ja: "緑",
          name_en: "Green",
          color: "#00ff00",
        },
        {
          id: 4,
          name_ja: "黄",
          name_en: "Yellow",
          color: "#ffff00",
        },
      ];

      mockGetSakurazakaPenlight.mockResolvedValue(mockColors);

      const result = await getPenlightByGroup("sakurazaka");

      expect(mockGetSakurazakaPenlight).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockColors);
    });

    test("無効なグループ名でエラーをスローする", async () => {
      await expect(getPenlightByGroup("invalid" as any)).rejects.toThrow();
    });
  });

  describe("getCompleteDataByGroup", () => {
    test("日向坂46の完全なデータセットを取得する", async () => {
      const mockMembers = [
        {
          id: 1,
          name: "テストメンバー1",
          nickname: "テスト1",
          emoji: "🌟",
          gen: "1期生",
          graduated: false,
          penlight1_id: 1,
          penlight2_id: 2,
          type: "test",
          url: "https://example.com/test1.jpg",
        },
      ];

      const mockColors = [
        {
          id: 1,
          name_ja: "青",
          name_en: "Blue",
          color: "#0000ff",
        },
        {
          id: 2,
          name_ja: "赤",
          name_en: "Red",
          color: "#ff0000",
        },
      ];

      mockGetHinatazakaMember.mockResolvedValue(mockMembers);
      mockGetHinatazakaPenlight.mockResolvedValue(mockColors);

      const result = await getCompleteDataByGroup("hinatazaka");

      expect(mockGetHinatazakaMember).toHaveBeenCalledTimes(1);
      expect(mockGetHinatazakaPenlight).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        members: mockMembers,
        colors: mockColors,
      });
    });

    test("櫻坂46の完全なデータセットを取得する", async () => {
      const mockMembers = [
        {
          id: 1,
          name: "テストメンバー2",
          nickname: "テスト2",
          emoji: "🌸",
          gen: "1期生",
          graduated: false,
          penlight1_id: 3,
          penlight2_id: 4,
          type: "test",
          url: "https://example.com/test2.jpg",
        },
      ];

      const mockColors = [
        {
          id: 3,
          name_ja: "緑",
          name_en: "Green",
          color: "#00ff00",
        },
        {
          id: 4,
          name_ja: "黄",
          name_en: "Yellow",
          color: "#ffff00",
        },
      ];

      mockGetSakurazakaMember.mockResolvedValue(mockMembers);
      mockGetSakurazakaPenlight.mockResolvedValue(mockColors);

      const result = await getCompleteDataByGroup("sakurazaka");

      expect(mockGetSakurazakaMember).toHaveBeenCalledTimes(1);
      expect(mockGetSakurazakaPenlight).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        members: mockMembers,
        colors: mockColors,
      });
    });

    test("並列処理でメンバーとペンライト情報を同時取得する", async () => {
      const mockMembers = [{ id: 1, name: "Test" } as any];
      const mockColors = [{ id: 1, name_ja: "Test" } as any];

      mockGetHinatazakaMember.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockMembers), 100))
      );
      mockGetHinatazakaPenlight.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockColors), 100))
      );

      const startTime = Date.now();
      const result = await getCompleteDataByGroup("hinatazaka");
      const endTime = Date.now();

      // 並列処理により、実行時間が200ms未満であることを確認
      expect(endTime - startTime).toBeLessThan(200);
      expect(result.members).toEqual(mockMembers);
      expect(result.colors).toEqual(mockColors);
    });

    test("API呼び出しエラー時も適切にエラーが伝播される", async () => {
      const error = new Error("API呼び出しエラー");
      mockGetHinatazakaMember.mockRejectedValue(error);
      mockGetHinatazakaPenlight.mockResolvedValue([]);

      await expect(getCompleteDataByGroup("hinatazaka")).rejects.toThrow(
        "API呼び出しエラー"
      );
    });
  });

  describe("エラーハンドリング", () => {
    test("メンバーAPI呼び出し時のエラーが適切に処理される", async () => {
      const error = new Error("BigQuery接続エラー");
      mockGetHinatazakaMember.mockRejectedValue(error);

      await expect(getMembersByGroup("hinatazaka")).rejects.toThrow(
        "BigQuery接続エラー"
      );
    });

    test("ペンライトAPI呼び出し時のエラーが適切に処理される", async () => {
      const error = new Error("クエリ実行エラー");
      mockGetHinatazakaPenlight.mockRejectedValue(error);

      await expect(getPenlightByGroup("hinatazaka")).rejects.toThrow(
        "クエリ実行エラー"
      );
    });
  });
});
