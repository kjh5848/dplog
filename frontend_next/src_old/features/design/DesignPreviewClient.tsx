"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import LandingPage from "@/features/landing/dplog-alt/LandingPage";
import LandingPageV3 from "@/features/landing/dplog-v3/LandingPage";
import LandingPageV4 from "@/features/landing/dplog-v4/LandingPage";
import LandingPageV5 from "@/features/landing/dplog-alt/LandingPageV5";
import LandingPageV6 from "@/features/landing/dplog-alt/LandingPageV6";
import LandingPageV7 from "@/features/landing/dplog-alt/LandingPageV7";
import PricingPage from "@/features/marketing/PricingPage";
import SuccessStoriesPage from "@/features/marketing/SuccessStoriesPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import ContentFactoryPage from "@/features/content-factory/ContentFactoryPage";
import DiagnosisStep1Page from "@/features/onboarding/DiagnosisStep1Page";
import AgeGroupPage from "@/features/onboarding/AgeGroupPage";
import BusinessDurationPage from "@/features/onboarding/BusinessDurationPage";
import RegionSelectionPage from "@/features/onboarding/RegionSelectionPage";
import GrantResultsPage from "@/features/onboarding/GrantResultsPage";
import AiInterviewPage from "@/features/onboarding/AiInterviewPage";
import { designPages, designVariants, type DesignPageSlug, type DesignVariant } from "./designData";

const pageLabels = Object.fromEntries(designPages.map((page) => [page.slug, page.label])) as Record<
  DesignPageSlug,
  string
>;

export default function DesignPreviewClient({
  variant,
  page,
}: {
  variant: DesignVariant;
  page: DesignPageSlug;
}) {
  const router = useRouter();
  const themeClass = `theme-${variant}`;
  const isLanding = page === "landing";
  const lightClass = isLanding ? "" : "theme-light";

  const renderers: Record<DesignPageSlug, () => JSX.Element> = {
    landing: () => (
      <div className="gemini-root dplog-shell">
        {variant === "v3" ? (
          <LandingPageV3 onStart={() => router.push("/diagnosis/new")} />
        ) : variant === "v4" ? (
          <LandingPageV4 />
        ) : variant === "v5" ? (
          <LandingPageV5 />
        ) : variant === "v6" ? (
          <LandingPageV6 />
        ) : variant === "v7" ? (
          <LandingPageV7 />
        ) : (
          <LandingPage onStart={() => router.push("/diagnosis/new")} />
        )}
      </div>
    ),
    pricing: () => <PricingPage />,
    "success-stories": () => <SuccessStoriesPage />,
    dashboard: () => <DashboardPage />,
    "content-factory": () => <ContentFactoryPage />,
    diagnosis: () => <DiagnosisStep1Page />,
    "diagnosis-age": () => <AgeGroupPage />,
    "diagnosis-duration": () => <BusinessDurationPage />,
    "diagnosis-region": () => <RegionSelectionPage />,
    "diagnosis-results": () => <GrantResultsPage />,
    "diagnosis-interview": () => <AiInterviewPage />,
  };

  const render = renderers[page];

  return (
    <div className={`design-preview ${themeClass} ${lightClass}`.trim()}>
      <div className="fixed left-4 top-4 z-[80] flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs text-white/70 shadow-lg backdrop-blur">
        <Link className="text-white hover-text-accent-soft" href="/design">
          디자인 목록
        </Link>
        <span className="text-white/30">|</span>
        <span className="text-white/80">{pageLabels[page]}</span>
        <div className="flex items-center gap-1">
          {designVariants.map((item) => (
            <Link
              key={item}
              className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase transition ${
                item === variant
                  ? "bg-accent text-black"
                  : "border border-white/20 text-white/60 hover-border-accent hover:text-white"
              }`}
              href={`/design/${item}/${page}`}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
      {render ? render() : null}
    </div>
  );
}
