"use client";

import { useRouter } from "next/navigation";
import LandingPage from "./LandingPage";

export default function DplogAltLandingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/diagnosis/new");
  };

  return (
    <div className="gemini-root dplog-shell-scrollable theme-v2 min-h-screen bg-black text-white">
      <LandingPage onStart={handleStart} />
    </div>
  );
}
