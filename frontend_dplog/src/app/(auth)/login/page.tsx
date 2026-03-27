import { Metadata } from "next";
import { LoginClient } from "@/features/auth";

export const metadata: Metadata = {
  title: "로그인 - D-PLOG",
  description: "D-PLOG에 로그인하고 매장을 관리하세요.",
};

export default function LoginPage() {
  return <LoginClient />;
}
