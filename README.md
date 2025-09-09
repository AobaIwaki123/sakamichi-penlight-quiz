# 坂道ペンライトクイズ - プロジェクト概要

日向坂46のメンバーのペンライト色を当てるクイズアプリケーションです。Next.js 15とBigQueryを使用したモダンなWebアプリケーションです。

## 🎯 アプリケーション概要

### 主な機能
- **ランダムメンバー選択**: 日向坂46メンバーからランダムに選択
- **ペンライトクイズ**: 選択されたメンバーの正しいペンライト色の組み合わせを推測
- **フィルタリング機能**: 期生・卒業状況による絞り込み
- **レスポンシブデザイン**: モバイル優先の縦画面最適化
- **PWA対応**: オフライン機能とアプリライクな体験

### 技術スタック
- **フロントエンド**: Next.js 15 (App Router) + TypeScript
- **UIライブラリ**: Mantine UI v7.17.4
- **状態管理**: Zustand v5.0.3
- **データベース**: BigQuery
- **デプロイメント**: Kubernetes + ArgoCD
- **開発環境**: Docker Compose

## 🏗️ アーキテクチャ概要

### ディレクトリ構成
```
view/                          # Next.jsアプリケーション
├── app/                       # App Routerページ
├── components/                # Reactコンポーネント
│   ├── Header/               # ヘッダー関連
│   ├── Home/                 # メインページ
│   ├── Footer/               # フッター
│   └── Notification/         # 通知コンポーネント
├── stores/                   # Zustand状態管理
├── api/                      # BigQuery API
├── types/                    # TypeScript型定義
└── hooks/                    # カスタムフック

definitions/                   # Dataform SQLクエリ
├── sources/                  # 生データ定義
├── intermediate/             # 中間テーブル処理
└── output/                   # 最終テーブル出力

k8s/                          # Kubernetes設定
├── manifests/                # デプロイメント設定
└── argocd/                   # GitOps設定
```

## 🔄 UIコンポーネント関係図

```mermaid
graph TB
    subgraph "App Router"
        Page[page.tsx]
    end
    
    subgraph "Layout Components"
        Header[Header.tsx]
        Footer[Footer.tsx]
    end
    
    subgraph "Main Components"
        Home[Home.tsx]
        InitialLoader[InitialLoader]
        Notification[Notification.tsx]
    end
    
    subgraph "Member Info Section"
        MemberInfo[MemberInfo.tsx]
        MemberInfoHeader[MemberInfoHeader.tsx]
        MemberImage[MemberImage.tsx]
    end
    
    subgraph "Penlight Form Section"
        PenlightForm[PenlightForm.tsx]
        PenlightLeft[Penlight left]
        PenlightRight[Penlight right]
        AnswerButton[AnswerButton.tsx]
        FullscreenNotification[FullscreenNotification]
    end
    
    subgraph "Header Sub-Components"
        HeaderSimple[HeaderSimple.tsx]
        FilterButton[FilterButton.tsx]
        LightDarkToggle[LightDarkToggle]
        SakamichiLogo[SakamichiLogo]
    end
    
    subgraph "Notification Sub-Components"
        NotImplemented[NotImplemented]
        EmptyFilteredMember[EmptyFilteredMember]
    end

    %% Main flow
    Page --> Header
    Page --> Home
    Page --> Footer
    
    %% Home components
    Home --> InitialLoader
    Home --> Notification
    Home --> MemberInfo
    Home --> PenlightForm
    
    %% Member Info components
    MemberInfo --> MemberInfoHeader
    MemberInfo --> MemberImage
    
    %% Penlight Form components
    PenlightForm --> PenlightLeft
    PenlightForm --> PenlightRight
    PenlightForm --> AnswerButton
    
    %% Header components
    Header --> HeaderSimple
    HeaderSimple --> FilterButton
    HeaderSimple --> LightDarkToggle
    HeaderSimple --> SakamichiLogo
    
    %% Notification components
    Notification --> NotImplemented
    Notification --> EmptyFilteredMember
    
    %% Answer flow
    AnswerButton --> FullscreenNotification
    
    %% Styling
    classDef pageStyle fill:#e1f5fe
    classDef layoutStyle fill:#f3e5f5
    classDef mainStyle fill:#e8f5e8
    classDef memberStyle fill:#fff3e0
    classDef penlightStyle fill:#fce4ec
    classDef headerStyle fill:#f1f8e9
    classDef notificationStyle fill:#fff8e1
    
    class Page pageStyle
    class Header,Footer layoutStyle
    class Home,InitialLoader,Notification mainStyle
    class MemberInfo,MemberInfoHeader,MemberImage memberStyle
    class PenlightForm,PenlightLeft,PenlightRight,AnswerButton,FullscreenNotification penlightStyle
    class HeaderSimple,FilterButton,LightDarkToggle,SakamichiLogo headerStyle
    class NotImplemented,EmptyFilteredMember notificationStyle
```

## 🏪 状態管理アーキテクチャ

```mermaid
graph TB
    subgraph "Zustand Stores"
        SelectedMemberStore[useSelectedMemberStore<br/>・selectedGroup<br/>・allMembers<br/>・filteredMembers<br/>・selectedMember<br/>・filters]
        ColorStore[useColorStore<br/>・colorMap<br/>・leftPenlight<br/>・rightPenlight]
        FilterStore[useFilterStore<br/>・checkedFilters]
        AnswerTriggerStore[useAnswerTriggerStore<br/>・triggerCount]
        AnswerCloseTriggerStore[useAnswerCloseTriggerStore<br/>・triggerCount]
    end
    
    subgraph "API Layer"
        BigQueryAPI[getHinatazakaMember<br/>BigQuery API]
        MockData[hinatazakaMemberMock<br/>Development Mode]
    end
    
    subgraph "Components Using Stores"
        MemberInfo[MemberInfo.tsx]
        FilterButton[FilterButton.tsx]
        Penlight[Penlight.tsx]
        AnswerButton[AnswerButton.tsx]
    end
    
    subgraph "Custom Hooks"
        ColorController[useColorController<br/>ペンライト色制御]
    end

    %% API connections
    BigQueryAPI --> SelectedMemberStore
    MockData --> SelectedMemberStore
    
    %% Store connections
    FilterStore --> SelectedMemberStore
    SelectedMemberStore --> MemberInfo
    FilterStore --> FilterButton
    
    %% Color management
    ColorStore --> ColorController
    ColorController --> Penlight
    ColorController --> AnswerButton
    
    %% Answer flow
    AnswerButton --> AnswerTriggerStore
    AnswerTriggerStore --> MemberInfo
    MemberInfo --> AnswerCloseTriggerStore
    
    %% Styling
    classDef storeStyle fill:#e3f2fd
    classDef apiStyle fill:#e8f5e8
    classDef componentStyle fill:#fff3e0
    classDef hookStyle fill:#f3e5f5
    
    class SelectedMemberStore,ColorStore,FilterStore,AnswerTriggerStore,AnswerCloseTriggerStore storeStyle
    class BigQueryAPI,MockData apiStyle
    class MemberInfo,FilterButton,Penlight,AnswerButton componentStyle
    class ColorController hookStyle
```

## 🎮 ユーザーフロー（シーケンス図）

### 1. アプリケーション初期化フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as アプリ
    participant InitialLoader as InitialLoader
    participant SelectedMemberStore as メンバーストア
    participant API as BigQuery API
    participant MemberInfo as MemberInfo

    User->>App: アプリアクセス
    App->>InitialLoader: 初期化開始
    InitialLoader->>SelectedMemberStore: setGroup('hinatazaka')
    SelectedMemberStore->>API: getHinatazakaMember()
    
    alt 開発モード
        API-->>SelectedMemberStore: モックデータ返却
    else 本番モード
        API-->>SelectedMemberStore: BigQueryからデータ取得
    end
    
    SelectedMemberStore->>SelectedMemberStore: applyFilters()
    SelectedMemberStore->>SelectedMemberStore: pickRandomMember()
    SelectedMemberStore-->>MemberInfo: selectedMember更新
    MemberInfo-->>User: メンバー情報表示
```

### 2. フィルタリング機能フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant FilterButton as フィルターボタン
    participant FilterStore as フィルターストア
    participant SelectedMemberStore as メンバーストア
    participant MemberInfo as MemberInfo

    User->>FilterButton: フィルターボタンクリック
    FilterButton-->>User: フィルターメニュー表示
    User->>FilterButton: チェックボックス操作
    FilterButton->>FilterStore: setFilter(type, checked)
    FilterStore->>SelectedMemberStore: setFilters(filterObj)
    SelectedMemberStore->>SelectedMemberStore: applyFilters()
    SelectedMemberStore->>SelectedMemberStore: pickRandomMember()
    SelectedMemberStore-->>MemberInfo: 新しいメンバー選択
    MemberInfo-->>User: フィルター済みメンバー表示
```

### 3. クイズ回答フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Penlight as ペンライト
    participant ColorStore as カラーストア
    participant AnswerButton as 回答ボタン
    participant SelectedMemberStore as メンバーストア
    participant FullscreenNotification as 通知
    participant MemberInfo as MemberInfo

    User->>Penlight: 左ペンライト色選択
    Penlight->>ColorStore: setIndex('left', newIndex)
    User->>Penlight: 右ペンライト色選択  
    Penlight->>ColorStore: setIndex('right', newIndex)
    
    User->>AnswerButton: 回答ボタンクリック
    AnswerButton->>ColorStore: 選択色取得
    AnswerButton->>SelectedMemberStore: 正解色取得
    AnswerButton->>AnswerButton: 色の組み合わせ比較
    
    alt 正解の場合
        AnswerButton-->>FullscreenNotification: "正解"表示
    else 不正解の場合
        AnswerButton-->>FullscreenNotification: "不正解"表示
    end
    
    AnswerButton->>SelectedMemberStore: trigger()
    SelectedMemberStore->>MemberInfo: 次のメンバー選択
    MemberInfo-->>User: 新しいメンバー表示
```

### 4. ペンライト色選択フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant PenlightUI as ペンライトUI
    participant ColorController as useColorController
    participant ColorStore as カラーストア
    participant HinatazakaColors as 色定数

    User->>PenlightUI: 次の色ボタンクリック
    PenlightUI->>ColorController: next()
    ColorController->>ColorStore: setIndex(id, (prev) => (prev + 1) % length)
    ColorStore->>ColorController: 新しいindex返却
    ColorController->>HinatazakaColors: colors[newIndex]取得
    ColorController-->>PenlightUI: 新しい色情報返却
    PenlightUI-->>User: 新しい色で表示更新
    
    Note over User,HinatazakaColors: prev()の場合も同様の流れで<br/>インデックスを-1する
```

## 🗃️ データフロー

### BigQuery統合パターン

```mermaid
graph TB
    subgraph "Data Sources"
        MemberInfo[member_info.js<br/>基本メンバー情報]
        PenlightData[penlight.js<br/>ペンライト色定義]
        ImageData[member_image_*.js<br/>画像URL情報]
    end
    
    subgraph "Intermediate Processing"
        MemberWithImage[member_with_image<br/>メンバー+画像結合]
        MemberMaster[member_master<br/>ペンライトID結合]
    end
    
    subgraph "Final Output"
        HinatazakaMemberMaster[hinatazaka_member_master<br/>最終統合テーブル]
    end
    
    subgraph "Frontend API"
        GetHinatazakaMember[getHinatazakaMember.ts]
        MockData[hinatazakaMemberMock.ts]
    end
    
    subgraph "Frontend State"
        SelectedMemberStore[useSelectedMemberStore]
    end

    %% Data flow
    MemberInfo --> MemberWithImage
    ImageData --> MemberWithImage
    MemberWithImage --> MemberMaster
    PenlightData --> MemberMaster
    MemberMaster --> HinatazakaMemberMaster
    
    %% API flow
    HinatazakaMemberMaster --> GetHinatazakaMember
    MockData --> GetHinatazakaMember
    GetHinatazakaMember --> SelectedMemberStore
    
    %% Environment handling
    GetHinatazakaMember -.->|開発モード| MockData
    GetHinatazakaMember -.->|本番モード| HinatazakaMemberMaster
    
    %% Styling
    classDef sourceStyle fill:#e8f5e8
    classDef intermediateStyle fill:#fff3e0
    classDef finalStyle fill:#e3f2fd
    classDef apiStyle fill:#f3e5f5
    classDef stateStyle fill:#fce4ec
    
    class MemberInfo,PenlightData,ImageData sourceStyle
    class MemberWithImage,MemberMaster intermediateStyle
    class HinatazakaMemberMaster finalStyle
    class GetHinatazakaMember,MockData apiStyle
    class SelectedMemberStore stateStyle
```

## 🚀 開発環境セットアップ

### 必要な環境
- Node.js 18以上
- pnpm
- Docker & Docker Compose
- Google Cloud SDK（本番BigQuery接続用）

### ローカル開発

```bash
# リポジトリクローン
git clone [repository-url]
cd sakamichi-penlight-quiz

# 開発環境起動（Docker Compose使用）
make dev

# または手動でNext.js開発サーバー起動
cd view/
pnpm install
pnpm dev
```

### 環境変数

```bash
# 開発モード（モックデータ使用）
NODE_ENV=development

# 本番モード（BigQuery接続）
NODE_ENV=production
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### テスト実行

```bash
cd view/
pnpm test        # Jest単体テスト
pnpm test:watch  # ウォッチモード
```

## 🏗️ デプロイメント

### Kubernetes + ArgoCD

```bash
# Kubernetesマニフェスト適用
kubectl apply -f k8s/manifests/main/

# ArgoCD Application作成
kubectl apply -f k8s/argocd/app.yml
```

### Docker Build

```bash
# 本番用イメージビルド
cd view/
docker build -t sakamichi-penlight-quiz .
```

## 📋 主要な型定義

### Member型
```typescript
interface Member {
  id: number;              // メンバーID
  name: string;           // メンバー名
  nickname: string;       // ニックネーム
  emoji: string;          // 代表絵文字
  gen: Generation;        // 所属期生
  graduated: boolean;     // 卒業状況
  penlight1_id: number;   // ペンライト色1のID
  penlight2_id: number;   // ペンライト色2のID
  type: string;           // 画像タイプ
  url: string;            // 画像URL
}
```

### Generation型
```typescript
type Generation = 
  | '1期生' | '2期生' | '3期生' | '4期生' 
  | 'けやき坂46' | 'おひさま'
```

## 🔧 技術的な特徴

### PWA対応
- Service Worker実装
- オフライン機能
- アプリライクなUX
- マニフェストファイルによるインストール可能

### パフォーマンス最適化
- Next.js App Routerの活用
- 画像最適化
- コード分割
- 状態管理の最適化

### モバイル最適化
- レスポンシブデザイン
- タッチインターフェース
- 縦画面優先設計

## 🤝 コントリビューション

1. フォークしてブランチ作成
2. 機能開発・バグ修正
3. テスト実行
4. プルリクエスト作成

### コミット規約
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
refactor: リファクタリング
test: テスト追加・修正
```

## 📄 ライセンス

MIT License

## 🙏 謝辞

- 日向坂46公式
- Mantine UI
- Next.js Team
- Google Cloud BigQuery

---

> 💡 このプロジェクトは日向坂46ファンによる非公式なファンアプリケーションです。