# Kubernetes から Cloud Run への移行ガイド

## 概要

現在 Kubernetes (ArgoCD) で運用されている坂道ペンライトクイズアプリケーションを Google Cloud Run に移行し、ブランチごとの自動デプロイメント環境を構築するための手順書です。

## 🎯 移行の目的とメリット

### 現在の課題
- Kubernetes クラスターの運用・保守コスト
- 複雑な設定管理（マニフェスト、ArgoCD設定）
- スケーリングの調整が手動
- 開発者の学習コスト

### Cloud Run のメリット
- **サーバーレス**: インフラ管理不要
- **自動スケーリング**: リクエストに応じて自動でスケール
- **コスト効率**: 使用した分だけの課金
- **簡単なデプロイ**: GitHub Actions で完全自動化
- **ブランチ別環境**: PR ごとにプレビュー環境を自動作成

## 📊 移行前後の比較

| 項目 | Kubernetes (現在) | Cloud Run (移行後) |
|------|------------------|-------------------|
| **インフラ管理** | 手動（クラスター、ノード） | 自動（フルマネージド） |
| **スケーリング** | HPA設定が必要 | 自動（0→N、N→0） |
| **デプロイ方法** | ArgoCD + マニフェスト更新 | GitHub Actions のみ |
| **環境管理** | dev/main の2環境 | ブランチごと + PR環境 |
| **コスト** | 常時稼働（最低料金発生） | リクエスト従量課金 |
| **監視** | Prometheus + Grafana | Cloud Monitoring 標準 |
| **セキュリティ** | Kubernetes RBAC | Cloud IAM |

## 🚀 移行手順

### Phase 1: Cloud Run 環境の準備

#### 1.1 Google Cloud 設定
```bash
# 必要な API の有効化
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com

# Artifact Registry の作成
gcloud artifacts repositories create penlight \
  --repository-format=docker \
  --location=asia-northeast1
```

#### 1.2 サービスアカウントの作成
```bash
# Cloud Run 実行用
gcloud iam service-accounts create cloud-run-penlight \
  --display-name="Cloud Run Penlight Service Account"

# GitHub Actions デプロイ用
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deploy Service Account"
```

#### 1.3 権限設定
```bash
PROJECT_ID="your-project-id"

# BigQuery アクセス権限（既存の設定を移行）
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"
```

### Phase 2: GitHub Actions の設定

#### 2.1 新しいワークフローの追加
既存の `.github/workflows/deploy.yml` を維持しながら、新しく `.github/workflows/cloud-run-deploy.yml` を追加。

#### 2.2 GitHub Secrets の設定
```bash
# 必要なシークレット
GCP_PROJECT_ID="your-project-id"
GCP_SA_KEY="$(cat github-actions-key.json)"
CLOUD_RUN_SA_EMAIL="cloud-run-penlight@your-project-id.iam.gserviceaccount.com"
```

### Phase 3: 段階的移行

#### 3.1 開発環境の移行（develop ブランチ）

1. **Cloud Run デプロイのテスト**
```bash
git checkout develop
git commit --allow-empty -m "test: Cloud Run デプロイテスト"
git push origin develop
```

2. **動作確認**
   - Cloud Run サービスが正常にデプロイされるか
   - BigQuery 接続が正常に動作するか
   - アプリケーションの機能が正常に動作するか

3. **パフォーマンステスト**
   - レスポンス時間の測定
   - 同時接続数のテスト
   - メモリ使用量の確認

#### 3.2 フィーチャーブランチでの検証

1. **新機能開発での検証**
```bash
git checkout -b feature/cloud-run-test
# 何らかの変更を加える
git push origin feature/cloud-run-test
```

2. **PR プレビュー環境の確認**
   - PR 作成時に自動でプレビュー環境が作成されるか
   - PR コメントに適切な情報が表示されるか
   - PR クローズ時にリソースが削除されるか

#### 3.3 本番環境の移行準備

1. **パフォーマンス要件の確認**
   - 現在の Kubernetes 環境での負荷測定
   - Cloud Run での同等パフォーマンスの確認

2. **DNS 設定の準備**
   - 現在の Ingress 設定の確認
   - Cloud Run URL への切り替え準備

### Phase 4: 本番移行

#### 4.1 移行日の作業

1. **メンテナンス告知**
   - ユーザーへの事前通知
   - 想定ダウンタイムの案内

2. **本番デプロイ**
```bash
git checkout main
git commit --allow-empty -m "migrate: Cloud Run本番環境への移行"
git push origin main
```

3. **DNS 切り替え**
```bash
# 現在の設定確認
kubectl get ingress -n penlight

# Cloud Run URL の確認
gcloud run services describe penlight-prod --region=asia-northeast1 --format="value(status.url)"
```

4. **動作確認**
   - 全機能の動作テスト
   - パフォーマンステスト
   - ログ・監視の確認

### Phase 5: 旧環境のクリーンアップ

#### 5.1 Kubernetes リソースの削除

1. **ArgoCD アプリケーションの停止**
```bash
# ArgoCD アプリケーションの削除
kubectl delete application penlight -n argocd
```

2. **Kubernetes リソースの削除**
```bash
# ネームスペース全体の削除
kubectl delete namespace penlight
```

3. **不要なファイルの削除**
```bash
# k8s ディレクトリの移動（バックアップ用）
mkdir -p archive/
mv k8s/ archive/k8s-backup-$(date +%Y%m%d)/

# 不要なワークフローの無効化
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled
```

## 📈 移行後の運用

### 監視・アラート設定

#### 1. Cloud Monitoring の設定
```bash
# アラートポリシーの作成
gcloud alpha monitoring policies create \
  --policy-from-file=cloud-run-monitoring-policy.yaml
```

#### 2. ログ監視
```bash
# エラーログのアラート設定
gcloud logging sinks create cloud-run-errors \
  bigquery.googleapis.com/projects/your-project-id/datasets/logs \
  --log-filter='resource.type="cloud_run_revision" AND severity>=ERROR'
```

### バックアップ・災害復旧

#### 1. 設定のバックアップ
- GitHub リポジトリ（コード + GitHub Actions設定）
- Google Cloud 設定（gcloud コマンドでエクスポート可能）
- Secret Manager の内容

#### 2. 災害復旧手順
1. 新しい Google Cloud プロジェクトの作成
2. サービスアカウント・権限の再設定
3. GitHub Secrets の更新
4. GitHub Actions による自動デプロイ

### コスト管理

#### 1. コスト監視
```bash
# 予算アラートの設定
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT \
  --display-name="Cloud Run Penlight Budget" \
  --budget-amount=50USD
```

#### 2. リソース最適化
- 不要なプレビュー環境の定期削除
- 古い Docker イメージの削除
- Cloud Run インスタンスの最適化

## 🔄 ロールバック計画

万が一の問題に備えたロールバック手順：

### 緊急時のロールバック

#### 1. Kubernetes 環境の復旧
```bash
# バックアップからの復元
cp -r archive/k8s-backup-YYYYMMDD/ k8s/

# ArgoCD アプリケーションの再作成
kubectl apply -f k8s/argocd/app.yml

# 強制同期
argocd app sync penlight
```

#### 2. DNS の切り戻し
- Cloud Run から Kubernetes Ingress への切り戻し
- ヘルスチェックの確認

#### 3. 監視・アラートの確認
- 旧環境での正常性確認
- ユーザーへの復旧通知

## 📊 移行チェックリスト

### 事前準備
- [ ] Google Cloud プロジェクトの準備完了
- [ ] 必要な API の有効化完了
- [ ] サービスアカウントの作成・権限設定完了
- [ ] GitHub Secrets の設定完了
- [ ] Cloud Run ワークフローのテスト完了

### 開発環境移行
- [ ] develop ブランチでのデプロイ成功
- [ ] BigQuery 接続の動作確認完了
- [ ] アプリケーション機能の動作確認完了
- [ ] パフォーマンステスト完了

### プレビュー環境テスト
- [ ] PR 作成時の自動デプロイ確認
- [ ] プレビュー環境の動作確認
- [ ] PR クローズ時の自動削除確認

### 本番移行
- [ ] 本番環境でのデプロイ成功
- [ ] DNS 切り替え完了
- [ ] 全機能の動作確認完了
- [ ] 監視・アラートの設定完了
- [ ] ユーザーへの移行完了通知

### 後処理
- [ ] Kubernetes リソースの削除完了
- [ ] 不要なファイルのクリーンアップ完了
- [ ] ドキュメントの更新完了
- [ ] チームメンバーへの運用手順共有完了

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### 1. BigQuery 接続エラー
```bash
# サービスアカウントの権限確認
gcloud projects get-iam-policy your-project-id \
  --filter="bindings.members:serviceAccount:cloud-run-penlight@your-project-id.iam.gserviceaccount.com"

# Secret Manager の確認
gcloud secrets versions list bigquery-sa-key
```

#### 2. メモリ不足
```bash
# メモリ制限の増加
gcloud run services update penlight-prod \
  --region=asia-northeast1 \
  --memory=2Gi
```

#### 3. コールドスタート問題
```bash
# 最小インスタンス数の設定
gcloud run services update penlight-prod \
  --region=asia-northeast1 \
  --min-instances=1
```

## 📞 サポート・エスカレーション

### 緊急時の連絡先
- **技術責任者**: [担当者名・連絡先]
- **Google Cloud サポート**: [サポートケース番号]
- **GitHub サポート**: [サポートチケット]

### 問題報告時の情報
1. 発生時刻と継続時間
2. 影響範囲（ユーザー数、機能）
3. エラーメッセージ・ログ
4. 実行した対応手順
5. 現在の状況

---

**最終更新日**: 2025-09-15  
**移行責任者**: [担当者名]  
**バージョン**: 1.0.0