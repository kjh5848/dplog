"use client";

import React from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { MenuToggleIcon } from '@/shared/ui/menu-toggle-icon';
import { useScroll } from '@/shared/lib/use-scroll';

export const DPlogLogo = () => (
  <Link href="/" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-xl tracking-tighter">
    <span className="material-icons-round text-2xl">hub</span>
    <span>D-PLOG</span>
  </Link>
);

export function Navbar({ isVisible = true, type = 'floating' }: { isVisible?: boolean; type?: 'floating' | 'static' }) {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	const links = [
		{ label: '서비스 소개', href: '#' },
		{ label: '기능', href: '#' },
		{ label: '요금안내', href: '#' },
		{ label: '리소스', href: '#' },
	];

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn(
				'z-50 mx-auto w-full transition-all ease-out',
				type === 'floating' && 'sticky top-0 max-w-5xl lg:rounded-full lg:border border-transparent',
                type === 'static' && 'relative w-full border-b border-white/10 bg-white/50 backdrop-blur-md',
				!isVisible && 'sr-only pointer-events-none opacity-0',
				isVisible && 'animate-in fade-in slide-in-from-top-4',
				{
					'bg-white/80 supports-[backdrop-filter]:bg-white/50 dark:bg-[#0a0a0a]/80 border-slate-200 dark:border-white/10 backdrop-blur-lg lg:top-3 lg:max-w-[70%] lg:shadow-lg':
						scrolled && !open && isVisible && type === 'floating',
					'bg-white dark:bg-[#0a0a0a]': open,
				},
			)}
		>
			<nav
				className={cn(
					'flex h-16 w-full items-center justify-between px-6 lg:h-14 lg:transition-all lg:ease-out',
				)}
			>
				<DPlogLogo />
				<div className="hidden items-center gap-4 lg:flex">
					<div className="flex gap-1 mr-2">
						{links.map((link, i) => (
							<a key={i} className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm px-3' })} href={link.href}>
								{link.label}
							</a>
						))}
					</div>
					<div className="flex items-center gap-2">
						<Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">로그인</Link>
						<Link href="/signup">
							<Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-2 h-10 text-sm font-bold shadow-md shadow-blue-500/10 active:scale-95 transition-all">무료로 시작하기</Button>
						</Link>
					</div>
				</div>
				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="lg:hidden size-8 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white">
					<MenuToggleIcon open={open} className="size-4" duration={300} />
				</Button>
			</nav>

			{/* Mobile Menu */}
			<div
				className={cn(
					'bg-white dark:bg-[#0a0a0a]/95 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y border-slate-200 dark:border-white/10 lg:hidden',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:fade-in-0 data-[slot=open]:zoom-in-95 data-[slot=open]:duration-150 data-[slot=closed]:animate-out data-[slot=closed]:fade-out-0 data-[slot=closed]:zoom-out-95 data-[slot=closed]:duration-100 ease-out',
						'flex h-full w-full flex-col justify-between gap-y-2 p-4',
					)}
				>
					<div className="grid gap-y-2">
						{links.map((link) => (
							<a
								key={link.label}
								className={buttonVariants({
									variant: 'ghost',
									className: 'justify-start text-slate-600 dark:text-white/50 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5',
								})}
								href={link.href}
							>
								{link.label}
							</a>
						))}
					</div>
					<div className="flex flex-col gap-2 pb-10">
						<Link href="/login" className="w-full">
							<Button variant="outline" className="w-full">
								로그인
							</Button>
						</Link>
						<Link href="/signup" className="w-full">
							<Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">무료로 시작하기</Button>
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
