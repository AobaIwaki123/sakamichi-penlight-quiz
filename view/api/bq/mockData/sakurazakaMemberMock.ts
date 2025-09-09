import type { Member } from '@/types/Member';

/**
 * 櫻坂46のメンバー情報のモックデータ
 * 開発環境で使用される
 */
export const sakurazakaMemberMock: Member[] = [
  {
    id: 1,
    name: "上村ひなの",
    nickname: "ひなの",
    emoji: "🌻",
    gen: "2nd",
    graduated: false,
    penlight1_id: 5,
    penlight2_id: 7,
    type: "regular",
    url: "https://example.com/sakurazaka/uemura_hinano.jpg"
  },
  {
    id: 2,
    name: "遠藤光莉",
    nickname: "ひかり",
    emoji: "☀️",
    gen: "2nd",
    graduated: false,
    penlight1_id: 3,
    penlight2_id: 6,
    type: "regular",
    url: "https://example.com/sakurazaka/endo_hikari.jpg"
  },
  {
    id: 3,
    name: "小池美波",
    nickname: "みなみ",
    emoji: "🌊",
    gen: "1st",
    graduated: false,
    penlight1_id: 5,
    penlight2_id: 2,
    type: "regular",
    url: "https://example.com/sakurazaka/koike_minami.jpg"
  },
  {
    id: 4,
    name: "小林由依",
    nickname: "ゆい",
    emoji: "🍀",
    gen: "1st",
    graduated: false,
    penlight1_id: 4,
    penlight2_id: 7,
    type: "regular",
    url: "https://example.com/sakurazaka/kobayashi_yui.jpg"
  },
  {
    id: 5,
    name: "齋藤冬優花",
    nickname: "ふゆか",
    emoji: "❄️",
    gen: "1st",
    graduated: false,
    penlight1_id: 6,
    penlight2_id: 7,
    type: "regular",
    url: "https://example.com/sakurazaka/saito_fuyuka.jpg"
  },
  {
    id: 6,
    name: "関有美子",
    nickname: "ゆみこ",
    emoji: "🎀",
    gen: "2nd",
    graduated: false,
    penlight1_id: 0,
    penlight2_id: 1,
    type: "regular",
    url: "https://example.com/sakurazaka/seki_yumiko.jpg"
  },
  {
    id: 7,
    name: "武元唯衣",
    nickname: "ゆい",
    emoji: "🌸",
    gen: "2nd",
    graduated: false,
    penlight1_id: 0,
    penlight2_id: 4,
    type: "regular",
    url: "https://example.com/sakurazaka/takemoto_yui.jpg"
  },
  {
    id: 8,
    name: "田村保乃",
    nickname: "ほの",
    emoji: "🐰",
    gen: "2nd",
    graduated: false,
    penlight1_id: 1,
    penlight2_id: 3,
    type: "regular",
    url: "https://example.com/sakurazaka/tamura_hono.jpg"
  },
  {
    id: 9,
    name: "土生瑞穂",
    nickname: "みずほ",
    emoji: "🌙",
    gen: "1st",
    graduated: false,
    penlight1_id: 6,
    penlight2_id: 4,
    type: "regular",
    url: "https://example.com/sakurazaka/habu_mizuho.jpg"
  },
  {
    id: 10,
    name: "原田葵",
    nickname: "あおい",
    emoji: "🌿",
    gen: "1st",
    graduated: false,
    penlight1_id: 4,
    penlight2_id: 5,
    type: "regular",
    url: "https://example.com/sakurazaka/harada_aoi.jpg"
  },
  {
    id: 11,
    name: "藤吉夏鈴",
    nickname: "かりん",
    emoji: "🍑",
    gen: "2nd",
    graduated: false,
    penlight1_id: 1,
    penlight2_id: 6,
    type: "regular",
    url: "https://example.com/sakurazaka/fujiyoshi_karin.jpg"
  },
  {
    id: 12,
    name: "松田里奈",
    nickname: "りな",
    emoji: "🌺",
    gen: "2nd",
    graduated: false,
    penlight1_id: 0,
    penlight2_id: 2,
    type: "regular",
    url: "https://example.com/sakurazaka/matsuda_rina.jpg"
  },
  {
    id: 13,
    name: "森田ひかる",
    nickname: "ひかる",
    emoji: "✨",
    gen: "2nd",
    graduated: false,
    penlight1_id: 3,
    penlight2_id: 5,
    type: "regular",
    url: "https://example.com/sakurazaka/morita_hikaru.jpg"
  },
  {
    id: 14,
    name: "山﨑天",
    nickname: "てん",
    emoji: "☁️",
    gen: "2nd",
    graduated: false,
    penlight1_id: 6,
    penlight2_id: 0,
    type: "regular",
    url: "https://example.com/sakurazaka/yamasaki_ten.jpg"
  },
  {
    id: 15,
    name: "守屋麗奈",
    nickname: "れな",
    emoji: "👑",
    gen: "1st",
    graduated: false,
    penlight1_id: 2,
    penlight2_id: 7,
    type: "regular",
    url: "https://example.com/sakurazaka/moriya_rena.jpg"
  },
  // 3期生の例
  {
    id: 16,
    name: "石森璃花",
    nickname: "りか",
    emoji: "🌹",
    gen: "3rd",
    graduated: false,
    penlight1_id: 1,
    penlight2_id: 4,
    type: "regular",
    url: "https://example.com/sakurazaka/ishimori_rika.jpg"
  },
  {
    id: 17,
    name: "井上梨名",
    nickname: "りな",
    emoji: "🍎",
    gen: "3rd",
    graduated: false,
    penlight1_id: 2,
    penlight2_id: 5,
    type: "regular",
    url: "https://example.com/sakurazaka/inoue_rina.jpg"
  },
  // 卒業生の例
  {
    id: 18,
    name: "平手友梨奈",
    nickname: "てち",
    emoji: "⚡",
    gen: "1st",
    graduated: true,
    penlight1_id: 1,
    penlight2_id: 2,
    type: "graduated",
    url: "https://example.com/sakurazaka/hirate_yurina.jpg"
  },
  {
    id: 19,
    name: "今泉佑唯",
    nickname: "ずーみん",
    emoji: "🎵",
    gen: "1st",
    graduated: true,
    penlight1_id: 3,
    penlight2_id: 6,
    type: "graduated",
    url: "https://example.com/sakurazaka/imaizumi_yui.jpg"
  }
];