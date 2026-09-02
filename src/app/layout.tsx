import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketOps Hub",
  description: "一个清晰、实用的市场运营管理平台。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
