import { Metadata } from "next";
import { SignupClient } from "@/features/auth";

export const metadata: Metadata = {
  title: "회원가입 - D-PLOG",
  description: "D-PLOG에 가입하고 매장 성장을 시작하세요.",
};

export default function SignupPage() {
  return <SignupClient />;
}
