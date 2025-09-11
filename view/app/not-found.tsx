import { NotFoundImage } from "@/components/Error/ClientError/NotFoundImage";

/**
 * 404 Not Foundページコンポーネント
 * 存在しないページにアクセスされた場合に表示される
 * Next.js App Routerの自動的な404ハンドリング機能を利用
 */
export default function NotFound() {
  return (
    <NotFoundImage />
  );
}
