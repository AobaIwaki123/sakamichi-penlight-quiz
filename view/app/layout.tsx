import "@mantine/core/styles.css";
import React from "react";
import {
  MantineProvider,
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";
import { theme } from "../theme";

export const metadata = {
  title: "Sakamichi Penlight Quiz",
  description: "坂道グループのペンライトクイズ",
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/icon512_rounded.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon512_rounded.jpg" />
        <link rel="icon" type="image/jpeg" sizes="32x32" href="/icon512_rounded.jpg" />
        <link rel="icon" type="image/jpeg" sizes="16x16" href="/icon512_rounded.jpg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
