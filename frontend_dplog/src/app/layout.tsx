import type { Metadata } from "next";
import "@/shared/styles/globals.css";
import { AuroraBackground } from "@/shared/ui/aurora-background";
import { MswProvider } from "@/shared/providers/MswProvider";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { VersionCheckModal } from "@/features/version-check/ui/VersionCheckModal";
import SingleInstanceGuard from "@/app/SingleInstanceGuard";

export const metadata: Metadata = {
  title: "D-PLOG | 데이터 자생력 기반 외식업 성장 솔루션",
  description: "비싼 월 대행료 없이도 매출이 오르는 법, 사장님의 데이터 자생력에 있습니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased selection:bg-blue-100">
        <MswProvider>
          <AuthProvider>
            <AuroraBackground className="min-h-screen">
              <SingleInstanceGuard />
              <VersionCheckModal />
              {children}
            </AuroraBackground>
          </AuthProvider>
        </MswProvider>
      </body>
    </html>
  );
}
