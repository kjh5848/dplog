import Navbar from "@/src/components/common/Navbars/Navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-r from-[#9BE15D] to-[#00E3AE]">
      {/* 상단 네비게이션 */}
      <div className="w-full">
        <Navbar />
      </div>
      {/* 가운데 폼 정렬 */}
      <main className="my-[100px] flex w-full flex-1 items-center justify-center px-4">
        {children}
      </main>
    </div>
  );
}
