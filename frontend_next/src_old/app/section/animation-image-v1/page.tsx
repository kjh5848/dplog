"use client";

import React from "react";
import HeroScrollVideo from "@/shared/ui/scroll-animated-video";

export default function AnimationImageV1Page() {
  return (
    <main>
      <HeroScrollVideo
        title="Scroll Animated Video"
        subtitle="Subtitle"
        meta="Q3 • 2025"
        media="https://videos.pexels.com/video-files/6151238/6151238-hd_1920_1080_30fps.mp4"
        overlay={{
          caption: "PROJECT • 07",
          heading: "Clarity in Motion",
          paragraphs: ["A focused reel highlighting interaction, craft, and intent."],
        }}
      />
      <section style={{ minHeight: "150vh" }} />
    </main>
  );
}
