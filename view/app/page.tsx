import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Home from "@/components/Home/Home";

/**
 * ホームページコンポーネント
 * 坂道ペンライトクイズのメインページを表示
 * ヘッダー、メインコンテンツ、フッターで構成される
 */
export default function HomePage() {
  return (
    <>
      {/* アプリケーションヘッダー（フィルターボタン、ロゴ、テーマ切り替えなど） */}
      <Header />

      {/* メインクイズコンテンツ（メンバー情報とペンライトフォーム） */}
      <Home />

      {/* アプリケーションフッター（ソーシャルリンクなど） */}
      <Footer />
    </>
  );
}
