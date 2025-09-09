import type { Member } from '@/types/Member';

/**
 * 乃木坂46メンバーのモックデータ
 * 開発環境でBigQueryコストを避けるために使用
 */
export const nogizakaMemberMock: Member[] = [
  // 1期生
  {
    id: 1001,
    name: "秋元真夏",
    nickname: "まなったん",
    emoji: "🌻",
    gen: "1st",
    graduated: false,
    penlight1_id: 1, // 赤
    penlight2_id: 2, // 青
    type: "member",
    url: "https://example.com/akimoto_manatsu.jpg"
  },
  {
    id: 1002,
    name: "生田絵梨花",
    nickname: "いくちゃん",
    emoji: "🎹",
    gen: "1st",
    graduated: true,
    penlight1_id: 3, // 黄
    penlight2_id: 4, // 緑
    type: "member",
    url: "https://example.com/ikuta_erika.jpg"
  },
  {
    id: 1003,
    name: "齋藤飛鳥",
    nickname: "あしゅ",
    emoji: "🕊️",
    gen: "1st",
    graduated: true,
    penlight1_id: 5, // 紫
    penlight2_id: 6, // ピンク
    type: "member",
    url: "https://example.com/saito_asuka.jpg"
  },
  {
    id: 1004,
    name: "松村沙友理",
    nickname: "さゆりん",
    emoji: "🌸",
    gen: "1st",
    graduated: true,
    penlight1_id: 7, // オレンジ
    penlight2_id: 8, // 水色
    type: "member",
    url: "https://example.com/matsumura_sayuri.jpg"
  },
  {
    id: 1005,
    name: "高山一実",
    nickname: "かずみん",
    emoji: "📚",
    gen: "1st",
    graduated: true,
    penlight1_id: 9, // 白
    penlight2_id: 10, // 黒
    type: "member",
    url: "https://example.com/takayama_kazumi.jpg"
  },
  
  // 2期生
  {
    id: 1101,
    name: "堀未央奈",
    nickname: "みおな",
    emoji: "🐰",
    gen: "2nd",
    graduated: true,
    penlight1_id: 1, // 赤
    penlight2_id: 3, // 黄
    type: "member",
    url: "https://example.com/hori_miona.jpg"
  },
  {
    id: 1102,
    name: "新内眞衣",
    nickname: "まいまい",
    emoji: "🌙",
    gen: "2nd",
    graduated: true,
    penlight1_id: 2, // 青
    penlight2_id: 5, // 紫
    type: "member",
    url: "https://example.com/shinuchi_mai.jpg"
  },
  
  // 3期生
  {
    id: 1201,
    name: "久保史緒里",
    nickname: "しおりん",
    emoji: "🍀",
    gen: "3rd",
    graduated: false,
    penlight1_id: 4, // 緑
    penlight2_id: 6, // ピンク
    type: "member",
    url: "https://example.com/kubo_shiori.jpg"
  },
  {
    id: 1202,
    name: "山下美月",
    nickname: "みづき",
    emoji: "🌙",
    gen: "3rd",
    graduated: false,
    penlight1_id: 2, // 青
    penlight2_id: 9, // 白
    type: "member",
    url: "https://example.com/yamashita_mizuki.jpg"
  },
  {
    id: 1203,
    name: "与田祐希",
    nickname: "よだちゃん",
    emoji: "🎀",
    gen: "3rd",
    graduated: false,
    penlight1_id: 6, // ピンク
    penlight2_id: 7, // オレンジ
    type: "member",
    url: "https://example.com/yoda_yuki.jpg"
  },
  
  // 4期生
  {
    id: 1301,
    name: "賀喜遥香",
    nickname: "かっきー",
    emoji: "🌺",
    gen: "4th",
    graduated: false,
    penlight1_id: 1, // 赤
    penlight2_id: 8, // 水色
    type: "member",
    url: "https://example.com/kaki_haruka.jpg"
  },
  {
    id: 1302,
    name: "遠藤さくら",
    nickname: "さくらちゃん",
    emoji: "🌸",
    gen: "4th",
    graduated: false,
    penlight1_id: 6, // ピンク
    penlight2_id: 4, // 緑
    type: "member",
    url: "https://example.com/endo_sakura.jpg"
  },
  {
    id: 1303,
    name: "筒井あやめ",
    nickname: "あやめちゃん",
    emoji: "🌻",
    gen: "4th",
    graduated: false,
    penlight1_id: 3, // 黄
    penlight2_id: 5, // 紫
    type: "member",
    url: "https://example.com/tsutsui_ayame.jpg"
  },
  {
    id: 1304,
    name: "黒見明香",
    nickname: "あすか",
    emoji: "🖤",
    gen: "4th",
    graduated: false,
    penlight1_id: 10, // 黒
    penlight2_id: 1, // 赤
    type: "member",
    url: "https://example.com/kuromi_haruka.jpg"
  },
  
  // 5期生
  {
    id: 1401,
    name: "池田瑛紗",
    nickname: "てれさ",
    emoji: "🌟",
    gen: "5th",
    graduated: false,
    penlight1_id: 8, // 水色
    penlight2_id: 9, // 白
    type: "member",
    url: "https://example.com/ikeda_teresa.jpg"
  },
  {
    id: 1402,
    name: "一ノ瀬美空",
    nickname: "みく",
    emoji: "☁️",
    gen: "5th",
    graduated: false,
    penlight1_id: 2, // 青
    penlight2_id: 9, // 白
    type: "member",
    url: "https://example.com/ichinose_miku.jpg"
  },
  {
    id: 1403,
    name: "井上和",
    nickname: "なぎ",
    emoji: "🌿",
    gen: "5th",
    graduated: false,
    penlight1_id: 4, // 緑
    penlight2_id: 3, // 黄
    type: "member",
    url: "https://example.com/inoue_nagi.jpg"
  },
  {
    id: 1404,
    name: "岡本姫奈",
    nickname: "ひなちゃん",
    emoji: "👑",
    gen: "5th",
    graduated: false,
    penlight1_id: 7, // オレンジ
    penlight2_id: 6, // ピンク
    type: "member",
    url: "https://example.com/okamoto_hina.jpg"
  },
  {
    id: 1405,
    name: "奥田いろは",
    nickname: "いろは",
    emoji: "🌈",
    gen: "5th",
    graduated: false,
    penlight1_id: 5, // 紫
    penlight2_id: 1, // 赤
    type: "member",
    url: "https://example.com/okuda_iroha.jpg"
  }
];