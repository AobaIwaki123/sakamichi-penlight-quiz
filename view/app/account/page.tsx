import { Metadata } from 'next';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import AccountSettings from '@/components/AccountSettings/AccountSettings';

/**
 * アカウント設定ページのメタデータ
 */
export const metadata: Metadata = {
  title: 'アカウント設定',
  description: '坂道ペンライトクイズのアカウント設定ページ。テーマ設定、通知設定、プロフィール設定などを管理できます。',
};

/**
 * アカウント設定ページコンポーネント
 * ユーザーの設定項目を管理するページ
 */
export default function AccountPage() {
  return (
    <>
      {/* アプリケーションヘッダー */}
      <Header />
      
      {/* アカウント設定メインコンテンツ */}
      <AccountSettings />
      
      {/* アプリケーションフッター */}
      <Footer />
    </>
  );
}