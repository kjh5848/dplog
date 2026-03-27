import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D-PLOG",
  description: "AI 기반 맞춤 전략으로 매장 데이터를 분석하고 실행 가능한 성장 로드맵을 제공합니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
