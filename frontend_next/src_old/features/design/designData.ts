export const designVariants = ["v1", "v2", "v3", "v4", "v5", "v6", "v7"] as const;

export const designPages = [
  { slug: "landing", label: "랜딩", route: "/landing/dplog-alt" },
  { slug: "pricing", label: "요금제", route: "/pricing" },
  { slug: "success-stories", label: "성공 사례", route: "/success-stories" },
  { slug: "dashboard", label: "대시보드", route: "/dashboard" },
  { slug: "content-factory", label: "콘텐츠 팩토리", route: "/content-factory" },
  { slug: "diagnosis", label: "진단 시작", route: "/diagnosis/new" },
  { slug: "diagnosis-age", label: "진단 연령대", route: "/diagnosis/new/age-group" },
  { slug: "diagnosis-duration", label: "진단 사업 기간", route: "/diagnosis/new/business-duration" },
  { slug: "diagnosis-region", label: "진단 지역 선택", route: "/diagnosis/new/region-selection" },
  { slug: "diagnosis-results", label: "진단 지원금 결과", route: "/diagnosis/new/grant-results" },
  { slug: "diagnosis-interview", label: "진단 AI 인터뷰", route: "/diagnosis/new/ai-interview" },
] as const;

export type DesignVariant = (typeof designVariants)[number];
export type DesignPageSlug = (typeof designPages)[number]["slug"];
