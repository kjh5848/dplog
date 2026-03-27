import Footer from "@/src/components/common/Footers/Footer";
import Navbar from "@/src/components/common/Navbars/Navbar";
import "@/styles/global.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "홈",
};

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
