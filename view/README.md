# 坂道ペンライトクイズ - フロントエンドアプリケーション - fix

日向坂46・櫻坂46のメンバーのペンライト色を当てるクイズアプリケーションです。Next.js 15 App Routerを使用し、Mantine UIでモダンなインターフェースを提供します。

## 🚀 クイック スタート

### 開発環境セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動（ポート3000）
pnpm dev

# テスト実行
pnpm test

# 本番ビルド
pnpm build
```

### 環境変数

```bash
# .env.local
NODE_ENV=development  # 開発モードではモックデータを使用
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json  # 本番用BigQuery認証
```

## 🏗️ アーキテクチャ概要

### 技術スタック
- **フレームワーク**: Next.js 15 (App Router)
- **UI ライブラリ**: Mantine UI v7.17.4
- **状態管理**: Zustand v5.0.5
- **言語**: TypeScript 5.8.3
- **スタイリング**: CSS Modules + PostCSS
- **PWA**: next-pwa v5.6.0
- **データソース**: BigQuery API + モックデータ
- **テスト**: Jest + React Testing Library

### 基本フロー
1. **グループ選択** → メンバーデータ・ペンライトデータをBigQueryから取得
2. **フィルタ適用** → 期生・卒業状況でメンバー絞り込み
3. **ランダム選択** → フィルタされたメンバーからランダム選出
4. **クイズ実行** → ユーザーがペンライト色を選択して回答
5. **結果表示** → 正解・不正解の判定とリアクション表示

## 📂 ディレクトリ構造

### `/components` - Reactコンポーネント

#### `Debug/` - 開発・デバッグ用コンポーネント
- **`CurlButton/`** - APIエンドポイントのcurlコマンド生成ボタン
  - `CurlButton.tsx` - BigQuery APIのデバッグ用cURLコマンド生成
- **`PenlightDebug/`** - ペンライトデータのデバッグ表示
  - `PenlightDebug.tsx` - ペンライト色データの詳細表示・確認

#### `Error/` - エラーページコンポーネント
- **`ClientError/`** - クライアントサイドエラー
  - `NotFoundImage.tsx` - 404エラー時の画像表示コンポーネント
  - `NotFoundImage.module.css` - 404ページ専用スタイル
- **`ServerError/`** - サーバーサイドエラー
  - `ServerError500.tsx` - 500エラーページコンポーネント
  - `ServerError500.module.css` - 500エラーページスタイル

#### `Footer/` - フッター関連
- **`Footer.tsx`** - メインフッターコンポーネント
- **`FooterSocial/`** - ソーシャルリンク
  - `FooterSocial.tsx` - SNS・外部リンク表示
  - `FooterSocial.module.css` - ソーシャルアイコンスタイル
- **`GitHubIcon/`** - GitHubアイコン
  - `GitHubIcon.tsx` - GitHubリポジトリリンク用アイコン

#### `Header/` - ヘッダー関連
- **`Header.tsx`** - メインヘッダーコンポーネント
- **`FilterButton/`** - フィルターボタン
  - `FilterButton.tsx` - メンバーフィルタリング用ボタン
- **`HeaderSimple/`** - シンプルヘッダー
  - `HeaderSimple.tsx` - 最小限のヘッダー表示
  - `HeaderSimple.module.css` - シンプルヘッダースタイル
- **`LightDarkToggle/`** - テーマ切り替え
  - `LightDarkToggle.tsx` - ライト・ダークモード切り替えボタン
  - `LightDarkToggle.module.css` - テーマ切り替えボタンスタイル
- **`SakamichiLogo/`** - ロゴ表示
  - `SakamichiLogo.tsx` - 坂道ペンライトクイズのロゴコンポーネント
- **`SakamichiPenlightQuizIcon/`** - アプリアイコン
  - `SakamichiPenlightQuizIcon.tsx` - アプリケーション専用アイコン
  - `SakamichiPenlightQuizIcon.module.css` - アイコンスタイル

#### `Helper/` - ヘルパーコンポーネント
- **`ModeIconWrapper/`** - 初期化関連
  - `initialMemberLoader.tsx` - アプリ起動時のメンバーデータ初期ローダー
  - `ModeIconWrapper.tsx` - モード表示用アイコンラッパー

#### `Home/` - メインクイズ画面
- **`Home.tsx`** - ホーム画面のメインコンポーネント（2カラムレイアウト）
- **`MemberInfo/`** - メンバー情報表示
  - `MemberInfo.tsx` - 選択されたメンバーの基本情報表示
  - `MemberImage/MemberImage.tsx` - メンバー画像表示コンポーネント
  - `MemberInfoHeader/MemberInfoHeader.tsx` - メンバー名・ニックネーム表示ヘッダー
  - `MemberInfoHeader/MemberInfoHeader.module.css` - ヘッダースタイル
- **`PenlightForm/`** - ペンライトクイズフォーム
  - `PenlightForm.tsx` - 左右ペンライト選択フォーム（2カラム + 回答ボタン）
  - `AnswerButton/AnswerButton.tsx` - クイズ回答送信ボタン
  - `AnswerButton/AnswerButton.module.css` - 回答ボタンスタイル
  - `AnswerButton/FullscreenNotification/` - 全画面通知
    - `FullscreenNotification.tsx` - 正解・不正解時の全画面通知
    - `FullscreenNotification.module.css` - 全画面通知スタイル
    - `QuizReward/QuizReward.tsx` - 正解時のリワードエフェクト
  - `Penlight/Penlight.tsx` - 個別ペンライト色選択コンポーネント
  - `Penlight/Penlight.module.css` - ペンライトスタイル

#### `Notification/` - 通知システム
- **`Notification.tsx`** - 通知表示の統合コンポーネント
- **`EmptyFilteredMember/`** - フィルター結果が空の場合
  - `EmptyFilteredMember.tsx` - フィルター条件に一致するメンバーがいない場合の表示
  - `EmptyFilteredMember.module.css` - 空フィルター通知スタイル
- **`NotImplemented/`** - 未実装機能通知
  - `NotImplemented.tsx` - 未実装機能へのアクセス時の通知
  - `NotImplemented.module.css` - 未実装通知スタイル

### `/hooks` - カスタムReactフック

#### `useColorController.tsx`
ペンライト色選択の状態管理とコントロール用カスタムフック
- **機能**: 指定IDに対するペンライト色のインデックス管理
- **操作**: next/prev関数でペンライト色の切り替え
- **戻り値**: 現在の色情報（color, nameJa, nameEn）とナビゲーション関数
- **使用場所**: `Penlight`コンポーネントでペンライト色選択に使用

```typescript
// 使用例
const { color, nameJa, next, prev } = useColorController('left');
// left/rightペンライトの色を個別に制御
```

### `/stores` - Zustand状態管理ストア

#### メインストア

##### `useSelectedMemberStore.ts`
メンバー選択・フィルタリング・ランダム選択を管理するメインストア
- **メンバー管理**: グループ別メンバーデータ（BigQuery連携）
- **フィルタリング**: 期生・卒業状況によるメンバー絞り込み
- **シャッフル機能**: フィルター結果のランダム並び替え
- **選択機能**: シャッフルされたメンバーから順次選択

```typescript
// 主要な状態
{
  selectedGroup: 'hinatazaka' | 'sakurazaka',
  allMembers: Member[],           // 全メンバーデータ
  filteredMembers: Member[],      // フィルター適用後
  shuffledMembers: Member[],      // シャッフル済み
  currentShuffleIndex: number,    // 現在のシャッフルインデックス
  selectedMember?: Member,        // 現在選択されたメンバー
  hasInvalidFilter: boolean       // 無効なフィルター状態
}
```

##### `usePenlightStore.ts`
ペンライト色マスターデータの管理
- **色データ管理**: グループ別ペンライト色情報（BigQuery連携）
- **色解決**: メンバーのpenlight1_id/penlight2_idから実際の色情報を解決

##### `useColorStore.ts`
ペンライト色選択状態の管理
- **選択状態**: 左右ペンライトの現在選択されている色インデックス
- **色変更**: next/prev操作による色の切り替え状態管理

#### UIトリガー管理ストア

##### `useAnswerTriggerStore.ts`
クイズ回答送信トリガーの管理
- **機能**: 回答ボタン押下時のトリガー状態
- **用途**: 回答処理の開始合図として使用

##### `useAnswerCloseTriggerStore.ts`
回答結果表示終了トリガーの管理
- **機能**: 正解・不正解表示後の終了タイミング制御
- **用途**: 全画面通知の自動閉じ処理

##### `useFilterStore.ts`
フィルター表示状態の管理
- **機能**: フィルターモーダル・パネルの開閉状態
- **用途**: メンバーフィルタリングUIの表示制御

##### `useLogoStore.ts`
ロゴ表示関連状態の管理
- **機能**: ロゴアニメーション・表示状態の制御

#### ストア間連携パターン

```typescript
// 複数ストアの連携例（メンバー選択時）
const setGroup = async (group: Group) => {
  // 1. ローディング開始
  useSelectedMemberStore.getState().setLoading(true);
  
  // 2. データ並行取得
  const [members] = await Promise.all([
    getGroupMembers(group),
    usePenlightStore.getState().fetchPenlightColors(group)
  ]);
  
  // 3. データ設定とフィルタ適用
  useSelectedMemberStore.getState().setMembers(members);
  useSelectedMemberStore.getState().applyFilters();
  
  // 4. ランダム選択実行
  useSelectedMemberStore.getState().pickRandomMember();
};
```

## 🔧 開発ガイドライン

### コンポーネント開発規約

#### ファイル構成
```
ComponentName/
├── ComponentName.tsx          # メインコンポーネント
├── ComponentName.module.css   # CSS Modules スタイル
└── index.ts                   # エクスポート（任意）
```

#### TypeScript型定義
```typescript
/**
 * メンバー情報表示コンポーネント
 * ペンライトクイズのメイン表示部分を担当する
 */
interface MemberInfoProps {
  /** 表示するメンバー情報 */
  member: Member;
  /** ローディング状態 */
  isLoading?: boolean;
}

export const MemberInfo: React.FC<MemberInfoProps> = ({
  member,
  isLoading = false
}) => {
  // ローディング中の表示
  if (isLoading) {
    return <div>メンバー情報を読み込み中...</div>;
  }
  
  return (
    <div>
      {/* メンバー情報の表示 */}
    </div>
  );
};
```

#### CSS Modulesパターン
```css
/* ComponentName.module.css */

/* メインコンテナ */
.container {
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--mantine-color-white);
}

/* Mantineテーマ変数の活用 */
.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--mantine-color-blue-7);
}
```

### Zustand状態管理パターン

#### ストア設計原則
```typescript
/**
 * 状態の型定義（State）
 * アクションの型定義（Actions）
 * を分離して定義
 */
interface SelectedMemberState {
  // 状態プロパティ
  selectedGroup: Group;
  allMembers: Member[];
  isLoading: boolean;
}

interface SelectedMemberActions {
  // アクション関数
  setGroup: (group: Group) => Promise<void>;
  applyFilters: () => void;
  pickRandomMember: () => Member | undefined;
}

type State = SelectedMemberState & SelectedMemberActions;
```

#### 非同期処理パターン
```typescript
export const useSelectedMemberStore = create<State>((set, get) => ({
  // 初期状態
  selectedGroup: 'hinatazaka',
  allMembers: [],
  isLoading: false,
  
  // 非同期アクション
  setGroup: async (group) => {
    set({ isLoading: true, selectedGroup: group });
    try {
      const members = await getGroupMembers(group);
      set({ allMembers: members });
    } catch (error) {
      console.error('メンバー取得エラー:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
```

## 🌐 API仕様

### BigQuery統合API

#### メンバーデータ取得
```typescript
// GET /api/bq/getHinatazakaMember
// GET /api/bq/getSakurazakaMember
interface MemberApiResponse extends Member[] {
  // BigQueryから返されるメンバー配列
}
```

#### ペンライトデータ取得
```typescript
// GET /api/bq/getHinatazakaPenlight
// GET /api/bq/getSakurazakaPenlight
interface PenlightApiResponse extends PenlightColor[] {
  // BigQueryから返されるペンライト色配列
}
```

### 型定義詳細

#### `/types` ディレクトリ

##### `Member.ts`
```typescript
export interface Member {
  id: number;           // メンバーID
  name: string;         // フルネーム
  nickname: string;     // ニックネーム
  emoji: string;        // 代表絵文字
  gen: Generation;      // 所属期生
  graduated: boolean;   // 卒業済みフラグ
  penlight1_id: number; // ペンライト色1のID（外部キー）
  penlight2_id: number; // ペンライト色2のID（外部キー）
  type: string;         // 画像タイプ
  url: string;          // 画像URL
}
```

##### `PenlightColor.ts`
```typescript
export interface PenlightColor {
  id: number;       // ペンライト色ID（主キー）
  name_ja: string;  // 日本語名（例: "青"）
  name_en: string;  // 英語名（例: "blue"）
  color: string;    // HEXカラーコード（例: "#09b8ff"）
}
```

##### `Group.ts`
```typescript
export type Group = 'hinatazaka' | 'sakurazaka';
```

### `/consts` - アプリケーション定数

#### `hinatazakaFilters.ts`
```typescript
export type Generation = '1' | '2' | '3' | '4' | '5';
export const generations = ['1', '2', '3', '4', '5'] as const;
export const graduatedOptions = [
  { value: true, label: '卒業生' },
  { value: false, label: '現役生' }
];
```

#### `hinatazakaColors.ts`
```typescript
export const hinatazakaPenlightColors: PenlightColor[] = [
  { id: 1, name_ja: '青', name_en: 'blue', color: '#09b8ff' },
  { id: 2, name_ja: '赤', name_en: 'red', color: '#ff0066' },
  // ... その他の色定義
];
```

## 🎨 UI・UX設計

### Mantineテーマ設定

#### `/theme.ts`
```typescript
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  // カスタムテーマ定義
  primaryColor: 'blue',
  fontFamily: 'inherit',
  // 坂道グループブランドカラーに合わせた設定
});
```

### レスポンシブ設計
- **主要対象**: モバイル縦画面（ポートレート）
- **Mantineブレークポイント**: `base`, `xs`, `sm`, `md`, `lg`, `xl`
- **Gridシステム**: 12カラムグリッドを使用

```typescript
<Grid>
  <Grid.Col span={{ base: 12, xs: 6 }}>
    {/* モバイルでは全幅、タブレット以上では半幅 */}
  </Grid.Col>
</Grid>
```

### PWA機能

#### Service Worker
- **設定**: `next-pwa`によるWorkbox統合
- **キャッシュ戦略**: ネットワーク優先、オフライン時キャッシュ
- **マニフェスト**: `/public/manifest.json`

#### アプリアイコン
- `icon512_maskable.jpg` - マスカブルアイコン
- `icon512_rounded.jpg` - 角丸アイコン

## 🧪 テスト

### テスト構成
```
view/__tests__/
├── stores/
│   └── useSelectedMemberStore.test.ts  # ストアのテスト
├── components/
│   └── [ComponentName].test.tsx        # コンポーネントテスト
└── setupTests.ts                       # テスト共通設定
```

### テストパターン
```typescript
// ストアのテスト例
describe('useSelectedMemberStore', () => {
  test('グループ変更時にメンバーデータが取得される', async () => {
    const { setGroup } = useSelectedMemberStore.getState();
    await setGroup('hinatazaka');
    
    const { allMembers } = useSelectedMemberStore.getState();
    expect(allMembers.length).toBeGreaterThan(0);
  });
});
```

## 🚀 デプロイメント

### Docker
- **Dockerfile**: マルチステージビルド（開発・本番）
- **開発ステージ**: pnpmとNext.js dev server
- **本番ステージ**: Distrolessイメージで軽量化

### Kubernetes
- **マニフェスト**: `/k8s/manifests/`配下
- **環境分離**: `dev/`, `main/`ディレクトリで環境別設定
- **GitOps**: ArgoCD連携でデプロイメント自動化

### 環境別設定
- **開発環境**: モックデータ使用、デバッグ機能有効
- **本番環境**: BigQuery直接接続、最適化済みビルド

## 📚 参考リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [Mantine UI Documentation](https://mantine.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [BigQuery Node.js Client](https://cloud.google.com/bigquery/docs/reference/libraries#client-libraries-install-nodejs)
