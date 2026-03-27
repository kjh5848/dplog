"use client";

import LandingPage from "@/features/landing/dplog-v8/LandingPage";

export default function Page() {
  const handleStart = () => {
    // Navigate to dashboard or generic start action
    console.log("Start clicked");
  };

  return <LandingPage onStart={handleStart} />;
}
