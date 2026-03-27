import React from "react";
import UserClientPage from "@/src/components/user/UserClientPage";
import { Metadata } from "next";
import NplaceHeader from "@/src/components/common/Headers/DplogHeader";

export const metadata: Metadata = {
  title: "회원 관리 | D-PLOG",
  description: "시스템에 등록된 회원들을 관리할 수 있는 페이지입니다.",
  keywords: ["회원 관리", "사용자 관리", "멤버십", "승인", "정지"],
};

// SSR 페이지 컴포넌트
export default async function UserListManagementPage() {
  return <UserClientPage />;
};
