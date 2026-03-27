import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "@/shared/config/routes";
import { LandingPage, LandingAltPage } from "@/pages/landing";
import {
  DiagnosisStartPage,
  DiagnosisStorePage,
  DiagnosisKeywordsPage,
  DiagnosisConfirmPage,
  DiagnosisStatusPage,
  DiagnosisResultPage,
} from "@/pages/diagnosis";
import { ReportPage } from "@/pages/report";
import { NotFoundPage } from "@/pages/not-found";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.home} element={<LandingPage />} />
        <Route path={routes.landingAlt} element={<LandingAltPage />} />
        <Route path={routes.diagnosisNew} element={<DiagnosisStartPage />} />
        <Route path={routes.diagnosisStore} element={<DiagnosisStorePage />} />
        <Route path={routes.diagnosisKeywords} element={<DiagnosisKeywordsPage />} />
        <Route path={routes.diagnosisConfirm} element={<DiagnosisConfirmPage />} />
        <Route path={routes.diagnosisStatus} element={<DiagnosisStatusPage />} />
        <Route path={routes.diagnosisResult} element={<DiagnosisResultPage />} />
        <Route path={routes.reportDetail} element={<ReportPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
