import "@mantine/core/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import type { Metadata, Viewport } from "next";
import type React from "react";
import { theme } from "../theme";

/**
 * アプリケーションのメタデータ設定
 * 坂道ペンライトクイズアプリのSEO情報を定義
 */
export const metadata: Metadata = {
  title: {
    template: "%s | 坂道ペンライトクイズ",
    default: "坂道ペンライトクイズ",
  },
  description:
    "日向坂46のペンライト色を当てるクイズアプリ。アイドルのペンライトカラーを覚えて楽しもう！",
  keywords: ["日向坂46", "ペンライト", "クイズ", "アイドル", "坂道グループ"],
  authors: [{ name: "AobaIwaki" }],
  creator: "AobaIwaki",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    title: "坂道ペンライトクイズ",
    description: "日向坂46のペンライト色を当てるクイズアプリ",
    siteName: "坂道ペンライトクイズ",
  },
  twitter: {
    card: "summary_large_image",
    title: "坂道ペンライトクイズ",
    description: "日向坂46のペンライト色を当てるクイズアプリ",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon512_rounded.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/icon512_rounded.jpg", sizes: "16x16", type: "image/jpeg" },
    ],
    shortcut: "/icon512_rounded.svg",
    apple: "/icon512_rounded.jpg",
  },
};

/**
 * ビューポート設定
 * モバイル最適化とPWA対応の設定
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1b1e" },
  ],
};

/**
 * ルートレイアウトコンポーネント
 * アプリケーション全体の基本構造とMantineプロバイダーを提供
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" {...mantineHtmlProps}>
      <head>
        {/* Mantineのカラースキーム用スクリプト */}
        <ColorSchemeScript />
      </head>
      <body>
        {/* Mantineテーマプロバイダーでアプリケーション全体をラップ */}
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
