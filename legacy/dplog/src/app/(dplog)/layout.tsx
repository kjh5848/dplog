import HeaderStats from "@/src/components/common/Headers/HeaderStats";
import Sidebar from "@/src/components/common/Sidebar/Sidebar";
import "@/styles/global.css";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="scrollbar-hide">
        <Sidebar />
        <div className="relative xl:ml-50">
          <div className="relative mx-auto w-full p-10">{children}</div>
        </div>
      </div>
    </>
  );
}
