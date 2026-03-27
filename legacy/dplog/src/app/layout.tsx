import { StoreProvider } from '@/src/store/provider/StoreProvider';
import { Inter } from "next/font/google";
import "@/styles/global.css";
import { Metadata } from 'next';
import Script from 'next/script';
import { Toaster } from "react-hot-toast";
import QueryProviders from '../store/provider/QueryProviders';
import PageBackground from '@/src/components/common/layouts/PageBackground';
export const metadata: Metadata = {
  title: {
    template: "%s | D-PLOG | 네이버 플레이스 순위 추적 서비스",
    default: "D-PLOG",
  },
  description:
    "아직도 우리 가게 순위 모르시나요? 실시간 네이버 플레이스 순위 확인부터 매일 순위 추적까지!",
  icons: {
    icon: "/img/brand/dplog_favicon_2.png",
    shortcut: "/img/brand/dplog_favicon_2.png",
    apple: "/img/brand/dplog_favicon_2.png",
  },
  keywords:
    "네이버 플레이스, 순위 추적, 가게 순위, 지역 검색, 맛집 순위, 사업자 마케팅",
  openGraph: {
    title: "D-PLOG - 네이버 플레이스 순위 추적 서비스",
    description: "실시간 네이버 플레이스 순위 확인부터 매일 순위 추적까지!",
    type: "website",
    url: "https://d-plog.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "D-PLOG - 네이버 플레이스 순위 추적 서비스",
    description: "실시간 네이버 플레이스 순위 확인부터 매일 순위 추적까지!",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.7/kakao.min.js"
          integrity="sha384-tJkjbtDbvoxO+diRuDtwRO9JXR7pjWnfjfRn5ePUpl7e7RJCxKCwwnfqUAdXh53p"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        <QueryProviders>
          <StoreProvider>
            <main>
              <PageBackground>{children}</PageBackground>
            </main>
          </StoreProvider>
        </QueryProviders>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
