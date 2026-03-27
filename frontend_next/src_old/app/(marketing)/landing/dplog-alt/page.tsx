import LandingPageV7 from "@/features/landing/dplog-alt/LandingPageV7";

export const metadata = {
  title: "D-PLOG 구독형 운영 플랫폼",
  description:
    "소상공인을 위한 구독형 SaaS. 매출·리뷰·상권 데이터를 통합 분석하고 실행 가능한 성장 전략을 제공합니다.",
};

export default function Page() {
  return (
    <div className="gemini-root dplog-shell theme-v7">
      <LandingPageV7 />
    </div>
  );
}
