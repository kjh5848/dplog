import MvpLogisticsPage from "./MvpLogisticsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MVP Logistics | Global Logistics Solutions",
  description: "We deliver more than cargo — we deliver peace of mind.",
};

export default function Page() {
  return <MvpLogisticsPage />;
}
