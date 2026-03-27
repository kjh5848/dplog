import { AuroraBackground } from "@/shared/ui/aurora-background";
import { Navbar } from "@/shared/ui/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4 pt-12 md:pt-16 overflow-y-auto">
          <div className="w-full max-w-md my-8">
            {children}
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
}
