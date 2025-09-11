# BigQuery API モジュール

坂道ペンライトクイズアプリケーション用のBigQuery API統合モジュールです。

## 📁 ディレクトリ構造

```
view/api/bq/
├── README.md                    # このファイル
├── index.ts                     # 統合エントリーポイント
├── common/                      # 共通ユーティリティ
│   ├── bigqueryClient.ts       # BigQueryクライアント管理
│   ├── errorHandling.ts        # エラーハンドリング・ロギング
│   └── queryUtils.ts           # クエリ実行・データ検証
├── getHinatazakaMember.ts      # 日向坂46メンバー取得API
├── getSakurazakaMember.ts      # 櫻坂46メンバー取得API
├── getHinatazakaPenlight.ts    # 日向坂46ペンライト色取得API
├── getSakurazakaPenlight.ts    # 櫻坂46ペンライト色取得API
├── debugPenlight.ts            # デバッグ用関数
└── mockData/                    # モックデータ
    ├── hinatazakaMemberMock.ts
    ├── sakurazakaMemberMock.ts
    ├── hinatazakaPenlightMock.ts
    └── sakurazakaPenlightMock.ts
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

// 完全なデータセット（メンバー + ペンライト色）を並列取得
const { members, colors } = await getCompleteDataByGroup('hinatazaka');
```

### 3. デバッグ機能の使用

```typescript
import { debugPenlightTable, debugAllPenlightTables } from '@/api/bq';

// 特定グループのペンライトテーブルをデバッグ
const result = await debugPenlightTable('hinatazaka');
if (result.exists) {
  console.log(`データ件数: ${result.count}`);
  console.log('サンプルデータ:', result.sample);
}

// 全グループのペンライトテーブルを一括デバッグ
const allResults = await debugAllPenlightTables();
Object.entries(allResults).forEach(([group, result]) => {
  console.log(`${group}: ${result.exists ? 'OK' : 'NG'}`);
});
```

## ⚙️ 環境設定

### 環境変数

| 変数名 | 説明 | デフォルト値 | 必須 |
|--------|------|-------------|------|
| `USE_MOCK` | モックデータを使用するか | `false` | ❌ |
| `NODE_ENV` | 実行環境 | `development` | ❌ |
| `GOOGLE_APPLICATION_CREDENTIALS` | BigQuery認証情報 | - | ✅ (本番環境) |

### モック環境での使用

```bash
# モックデータを使用（BigQueryに接続しない）
USE_MOCK=true npm run dev

# BigQueryに接続（本番データを使用）
USE_MOCK=false npm run dev
```

## 🏗️ アーキテクチャ

### BigQueryクライアント管理

```typescript
import { getBigQueryClient, executeQuery } from '@/api/bq/common/bigqueryClient';

// シングルトンクライアントの取得
const client = getBigQueryClient();

// 安全なクエリ実行
const result = await executeQuery(`
  SELECT * FROM sakamichipenlightquiz.sakamichi.hinatazaka_member_master
  LIMIT 10
`);
```

### エラーハンドリング

```typescript
import { 
  handleApiError, 
  createApiError, 
  ApiErrorCode 
} from '@/api/bq/common/errorHandling';

try {
  const data = await someApiCall();
  return data;
} catch (error) {
  // フォールバック付きエラーハンドリング
  return handleApiError('APIName', error, fallbackData);
}

// カスタムエラーの作成
const customError = createApiError(
  ApiErrorCode.BIGQUERY_CONNECTION_ERROR,
  'BigQuery接続に失敗しました',
  originalError,
  { additionalInfo: 'value' }
);
```

### データ検証

```typescript
import { 
  validateMemberData, 
  validatePenlightData,
  validateGroup 
} from '@/api/bq/common/queryUtils';

// グループ名の検証
const validGroup = validateGroup('hinatazaka'); // 'hinatazaka' | 'sakurazaka'

// メンバーデータの検証
const validMembers = validateMemberData(rawMemberData);

// ペンライトデータの検証
const validColors = validatePenlightData(rawPenlightData);
```

## 🧪 テスト

### テスト実行

```bash
# 全APIテストを実行
npm test -- --testPathPattern=api/bq

# 共通ユーティリティのテスト
npm test -- __tests__/api/bq/common.test.ts

# 統合APIのテスト
npm test -- __tests__/api/bq/integration.test.ts
```

### テスト構造

- **`common.test.ts`**: 共通ユーティリティ関数のユニットテスト
- **`integration.test.ts`**: 統合API関数の動作テスト
- **既存テスト**: `useSelectedMemberStore.test.ts` がAPI関数を使用

## 📊 パフォーマンス

### 最適化ポイント

1. **BigQueryクライアントの再利用**: シングルトンパターンでインスタンス管理
2. **並列処理**: `getCompleteDataByGroup` でメンバーとペンライト色を同時取得
3. **クエリ最適化**: 必要なカラムのみ選択、適切なインデックス使用
4. **モックデータ**: 開発環境でBigQueryコストを削減

### パフォーマンス監視

```typescript
import { logApiStart, logApiComplete } from '@/api/bq/common/errorHandling';

// API実行時間の自動ログ出力
logApiStart('getHinatazakaMember');
const members = await getHinatazakaMember();
logApiComplete('getHinatazakaMember', members.length, executionTime);
```

## 🔒 セキュリティ

### BigQuery認証

- 本番環境: サービスアカウントキーを使用
- 開発環境: ローカル認証またはモックデータ
- デプロイメント: Kubernetes Secret経由で認証情報を注入

### データ検証

- すべてのAPI応答データは型安全な検証を実行
- 必須フィールドの存在確認
- データ型の適切な変換

## 🐛 トラブルシューティング

### よくある問題

#### 1. BigQuery接続エラー

```
Error: BigQueryクエリの実行に失敗しました: Permission denied
```

**解決方法:**
- `GOOGLE_APPLICATION_CREDENTIALS` 環境変数を確認
- サービスアカウントキーのファイルパスが正しいか確認
- BigQueryプロジェクトへのアクセス権限を確認

#### 2. テーブルが存在しない

```
Error: ペンライトテーブルが存在しません: hinatazaka_penlight
```

**解決方法:**
- Dataformでテーブルが正常にデプロイされているか確認
- BigQueryコンソールでテーブル存在を手動確認
- モックデータの使用を検討（`USE_MOCK=true`）

#### 3. データ検証エラー

```
Error: メンバーデータに必須フィールドが不足しています: penlight1_id
```

**解決方法:**
- BigQueryテーブルのスキーマを確認
- Dataformの中間テーブル処理を確認
- モックデータとの整合性を確認

### デバッグ手順

1. **環境確認**: `USE_MOCK` 環境変数の設定確認
2. **テーブル存在確認**: `debugPenlightTable` 関数でテーブル状態確認
3. **サンプルデータ確認**: デバッグ結果のサンプルデータを検証
4. **ログ確認**: コンソールログでAPI実行状況を確認

## 🔄 マイグレーション

### リファクタリング前後の対応

#### 旧API (非推奨)

```typescript
// 旧: 直接BigQueryクライアントを使用
const bigquery = new BigQuery();
const [job] = await bigquery.createQueryJob(options);
const [rows] = await job.getQueryResults();
```

#### 新API (推奨)

```typescript
// 新: 統合ユーティリティを使用
const result = await executeQuery(query);
const validatedData = validateMemberData(result.data);
```

### 段階的移行

1. **既存コードの動作確認**: 現在のAPI呼び出しがエラーなく実行されるか確認
2. **新APIの並行使用**: 既存APIと新APIを並行して実行、結果を比較
3. **段階的置き換え**: 機能単位で新APIに置き換え
4. **旧コードの削除**: 全ての移行完了後に旧実装を削除

## 📈 今後の拡張予定

- **キャッシュ機能**: Redis等を使用したAPIレスポンスキャッシュ
- **リアルタイム更新**: WebSocketを使用したデータ更新通知
- **GraphQL対応**: RESTに加えてGraphQL APIエンドポイントの提供
- **メトリクス**: Prometheus等を使用したAPI使用状況の監視

## 🤝 貢献ガイド

### コードスタイル

- TypeScript厳格モードを使用
- JSDocコメントは日本語で記述
- 関数・変数名は英語、コメントは日本語
- エラーメッセージはユーザー向けは日本語、開発者向けは英語併用

### テスト

- 新機能追加時は対応するテストも作成
- カバレッジ80%以上を維持
- モック関数を適切に使用してBigQuery呼び出しを分離

### ドキュメント

- 新しいAPI関数には適切なJSDocを記述
- 破壊的変更時はマイグレーションガイドを更新
- READMEの使用例を最新状態に保持
