import { NavbarV3 } from '@/shared/ui/navbar-v3';
import { Footer } from '@/features/landing/components/Footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarV3 />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
