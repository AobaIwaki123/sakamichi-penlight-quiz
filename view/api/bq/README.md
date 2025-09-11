# BigQuery API モジュール

坂道ペンライトクイズアプリケーション用のBigQuery API統合モジュールです。

## 📁 ディレクトリ構造

```
view/api/bq/
├── README.md                        # このファイル
├── index.ts                         # 統合エントリーポイント
├── common/                          # 共通ユーティリティ
│   ├── bigqueryClient.ts           # BigQueryクライアント管理
│   ├── errorHandling.ts            # エラーハンドリング・ロギング
│   └── queryUtils.ts               # クエリ実行・データ検証
├── getHinatazakaMember.ts          # 日向坂46メンバー取得API
├── getSakurazakaMember.ts          # 櫻坂46メンバー取得API
├── getHinatazakaPenlight.ts        # 日向坂46ペンライト色取得API
├── getSakurazakaPenlight.ts        # 櫻坂46ペンライト色取得API
├── recordMemberAnswer.ts           # メンバー回答記録API（新規追加）
├── getMemberCorrectAnswers.ts      # メンバー正答数取得API（新規追加）
├── getMemberAnswerStats.ts         # メンバー正答数統計API（新規追加）
├── debugPenlight.ts                # デバッグ用関数
└── mockData/                        # モックデータ
    ├── hinatazakaMemberMock.ts
    ├── sakurazakaMemberMock.ts
    ├── hinatazakaPenlightMock.ts
    ├── sakurazakaPenlightMock.ts
    └── memberCorrectAnswersMock.ts  # 正答数記録モックデータ（新規追加）
```

## 🚀 基本的な使用方法

### 1. 個別API関数の使用

```typescript
import { 
  getHinatazakaMember, 
  getHinatazakaPenlight 
} from '@/api/bq';

// 日向坂46のメンバー情報を取得
const members = await getHinatazakaMember();
console.log(`メンバー数: ${members.length}`);

// 日向坂46のペンライト色情報を取得
const colors = await getHinatazakaPenlight();
console.log(`色数: ${colors.length}`);
```

### 2. 統合関数の使用（推奨）

```typescript
import { 
  getMembersByGroup, 
  getPenlightByGroup,
  getCompleteDataByGroup 
} from '@/api/bq';

// グループを指定してメンバー情報を取得
const hinatazakaMembers = await getMembersByGroup('hinatazaka');
const sakurazakaMembers = await getMembersByGroup('sakurazaka');

// グループを指定してペンライト色を取得
const hinatazakaColors = await getPenlightByGroup('hinatazaka');

// 完全なデータセット（メンバー情報とペンライト色）を一括取得
const { members, colors } = await getCompleteDataByGroup('hinatazaka');
console.log(`メンバー数: ${members.length}, 色数: ${colors.length}`);
```

## 📊 メンバー正答数記録API（新機能）

### 3. 回答結果の記録

```typescript
import { recordMemberAnswer } from '@/api/bq';

// メンバーの正解を記録
const result = await recordMemberAnswer({
  member_id: 1,
  group: 'hinatazaka',
  is_correct: true
});

console.log(`正答数: ${result.correct_count}/${result.total_count}`);
```

### 4. 正答数データの取得

```typescript
import { 
  getMemberCorrectAnswers,
  getMemberAnswerStats 
} from '@/api/bq';

// 特定グループの全メンバー正答数を取得
const allAnswers = await getMemberCorrectAnswers('hinatazaka');

// 特定メンバーの正答数を取得
const memberAnswers = await getMemberCorrectAnswers('hinatazaka', 1);

// 正答数統計情報を正答率順で取得
const stats = await getMemberAnswerStats('hinatazaka', undefined, 'correct_rate');
console.log('正答率ランキング:', stats);
```

## ⚙️ 環境設定

### 開発モード vs 本番モード

このAPIモジュールは環境変数`USE_MOCK`によって動作を切り替えます：

- **開発モード**（`USE_MOCK=true`）: モックデータを使用
- **本番モード**（`USE_MOCK=false`）: BigQueryへの実際のクエリ実行

```typescript
// 環境変数の設定例
process.env.USE_MOCK = 'true';  // 開発時
process.env.USE_MOCK = 'false'; // 本番時
```

### BigQuery認証

本番環境では以下の環境変数が必要です：

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## 🗄️ データベーステーブル構造

### 既存テーブル

1. **メンバーマスターテーブル**
   - `sakamichi.hinatazaka_member_master`
   - `sakamichi.sakurazaka_member_master`

2. **ペンライト色テーブル**
   - `sakamichi.hinatazaka_penlight`
   - `sakamichi.sakurazaka_penlight`

### 新規追加テーブル

3. **メンバー正答数記録テーブル**
   - `sakamichi.member_correct_answers`

```sql
-- テーブル構造
CREATE TABLE `sakamichi.member_correct_answers` (
  id INT64,                    -- 記録ID（自動採番）
  member_id INT64,             -- メンバーID（外部キー）
  group STRING,                -- グループ名（hinatazaka/sakurazaka）
  correct_count INT64,         -- 正答数
  total_count INT64,           -- 総出題数
  created_at TIMESTAMP,        -- 作成日時
  updated_at TIMESTAMP         -- 更新日時
);
```

## 📘 API関数一覧

### メンバー情報取得

| 関数名 | 説明 | 戻り値 |
|--------|------|---------|
| `getHinatazakaMember()` | 日向坂46メンバー情報取得 | `Promise<Member[]>` |
| `getSakurazakaMember()` | 櫻坂46メンバー情報取得 | `Promise<Member[]>` |
| `getMembersByGroup(group)` | グループ別メンバー情報取得 | `Promise<Member[]>` |

### ペンライト色情報取得

| 関数名 | 説明 | 戻り値 |
|--------|------|---------|
| `getHinatazakaPenlight()` | 日向坂46ペンライト色取得 | `Promise<PenlightColor[]>` |
| `getSakurazakaPenlight()` | 櫻坂46ペンライト色取得 | `Promise<PenlightColor[]>` |
| `getPenlightByGroup(group)` | グループ別ペンライト色取得 | `Promise<PenlightColor[]>` |

### メンバー正答数記録（新機能）

| 関数名 | 説明 | 戻り値 |
|--------|------|---------|
| `recordMemberAnswer(request)` | メンバー回答結果記録 | `Promise<MemberCorrectAnswers>` |
| `getMemberCorrectAnswers(group, memberId?)` | メンバー正答数取得 | `Promise<MemberCorrectAnswers[]>` |
| `getMemberAnswerStats(group, memberId?, sortBy?)` | メンバー正答数統計取得 | `Promise<CorrectAnswersStats[]>` |

### 統合関数

| 関数名 | 説明 | 戻り値 |
|--------|------|---------|
| `getCompleteDataByGroup(group)` | 完全なデータセット取得 | `Promise<{members, colors}>` |

### デバッグ関数

| 関数名 | 説明 | 戻り値 |
|--------|------|---------|
| `debugPenlightTable(group)` | ペンライトテーブルデバッグ | `Promise<DebugResult>` |

## 📊 型定義

### 基本型

```typescript
// グループ種別
type Group = 'hinatazaka' | 'sakurazaka';

// メンバー情報
interface Member {
  id: number;
  name: string;
  nickname: string;
  emoji: string;
  gen: string;
  graduated: boolean;
  penlight1_id: number;
  penlight2_id: number;
  type: string;
  url: string;
}

// ペンライト色情報
interface PenlightColor {
  id: number;
  name_ja: string;
  name_en: string;
  color: string;
}
```

### 正答数記録用型（新規追加）

```typescript
// メンバー正答数記録
interface MemberCorrectAnswers {
  id: number;
  member_id: number;
  group: Group;
  correct_count: number;
  total_count: number;
  created_at: string;
  updated_at: string;
}

// 回答記録リクエスト
interface CreateOrUpdateCorrectAnswersRequest {
  member_id: number;
  group: Group;
  is_correct: boolean;
}

// 正答数統計情報
interface CorrectAnswersStats {
  member_id: number;
  group: Group;
  correct_count: number;
  total_count: number;
  correct_rate: number;      // 0-1の小数
  last_updated: string;
}
```

## 🧪 テスト

### テスト実行方法

```bash
# メンバー正答数記録APIのテスト実行
npm test -- view/__tests__/api/bq/memberCorrectAnswers.test.ts

# 全APIテストの実行
npm test -- view/__tests__/api/bq/
```

### テストケース

- ✅ 正解・不正解の記録
- ✅ グループ別データ取得
- ✅ 特定メンバーデータ取得
- ✅ 統計情報の計算とソート
- ✅ データ整合性の確認

## 🔧 エラーハンドリング

### エラータイプ

- `TABLE_NOT_FOUND`: テーブルが見つからない
- `DATA_NOT_FOUND`: データが見つからない
- `DATA_VALIDATION_ERROR`: データ検証エラー
- `INVALID_DATA`: 無効なデータ形式
- `BIGQUERY_ERROR`: BigQuery実行エラー

### ログ出力

すべてのAPI関数は以下の情報をログ出力します：

- API関数の開始・完了
- 実行時間
- 取得データ数
- エラー詳細（発生時）
- モックデータ使用時の通知

## 🚀 更新履歴

### 2025-09-11 - メンバー正答数記録機能追加
- **新機能**: メンバーごとの正答数記録・取得機能
- **追加ファイル**: 
  - `recordMemberAnswer.ts`
  - `getMemberCorrectAnswers.ts`
  - `getMemberAnswerStats.ts`
  - `types/MemberCorrectAnswers.ts`
  - `mockData/memberCorrectAnswersMock.ts`
  - `definitions/output/sakamichi/member_correct_answers.sqlx`
- **テスト**: 包括的なテストスイートを追加
- **統計機能**: 正答率計算、ソート機能

## 📖 使用例

### フルワークフロー例

```typescript
import {
  getMembersByGroup,
  recordMemberAnswer,
  getMemberAnswerStats
} from '@/api/bq';

// 1. メンバー情報を取得
const members = await getMembersByGroup('hinatazaka');
const randomMember = members[Math.floor(Math.random() * members.length)];

// 2. クイズの回答を記録
const answerResult = await recordMemberAnswer({
  member_id: randomMember.id,
  group: 'hinatazaka',
  is_correct: true
});

console.log(`${randomMember.name}さんの正答数: ${answerResult.correct_count}/${answerResult.total_count}`);

// 3. 統計情報を取得（正答率順）
const stats = await getMemberAnswerStats('hinatazaka', undefined, 'correct_rate');
console.log('正答率ランキング:');
stats.forEach((stat, index) => {
  const member = members.find(m => m.id === stat.member_id);
  console.log(`${index + 1}位: ${member?.name} - ${(stat.correct_rate * 100).toFixed(1)}%`);
});
```

## ⚠️ 注意事項

1. **開発時は必ず`USE_MOCK=true`に設定**してBigQueryコストを削減
2. **本番環境では適切なBigQuery認証情報を設定**
3. **正答数記録は累積的**（既存レコードに加算）
4. **統計情報は自動計算**（手動での正答率計算は不要）
5. **テーブルパーティション**を活用してクエリパフォーマンスを最適化