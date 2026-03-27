"use client";

import React from 'react';
import { NavbarV3 } from "@/shared/ui/navbar-v3";

export default function NavV3Page() {
	return (
		<div className="w-full bg-[#050505] min-h-screen text-white">
			<NavbarV3 />

			<main className="mx-auto w-full max-w-3xl px-4 py-32">
        <div className="mb-20 text-center">
          <h2 className="text-sm font-bold tracking-[0.4em] text-white/20 uppercase mb-4">Navbar V3</h2>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">REFINED STICKY</h1>
          <p className="text-white/40 font-light leading-relaxed">
            스크롤을 내려보세요. 내비게이션 바가 부드럽게 압축되며 <br />
            플로팅 카드로 정교하게 변형되는 모습을 확인할 수 있습니다.
          </p>
        </div>

				<div className="space-y-2 mb-4">
					<div className="bg-white/5 h-6 w-4/6 rounded-md border border-white/5" />
					<div className="bg-white/5 h-6 w-1/2 rounded-md border border-white/5" />
				</div>
				<div className="flex gap-2 mb-8">
					<div className="bg-white/5 h-3 w-14 rounded-md border border-white/5" />
					<div className="bg-white/5 h-3 w-12 rounded-md border border-white/5" />
				</div>

				{Array.from({ length: 7 }).map((_, i) => (
					<div key={i} className="space-y-4 mb-12">
						<div className="bg-white/5 h-4 w-full rounded-md border border-white/5" />
						<div className="bg-white/5 h-4 w-full rounded-md border border-white/5" />
						<div className="bg-white/5 h-4 w-full rounded-md border border-white/5" />
						<div className="bg-white/5 h-4 w-1/2 rounded-md border border-white/5" />
					</div>
				))}
			</main>

      <footer className="py-20 text-center text-white/10 text-xs tracking-widest uppercase border-t border-white/5 mt-20">
        Cinematic Navigation System
      </footer>
		</div>
	);
}
