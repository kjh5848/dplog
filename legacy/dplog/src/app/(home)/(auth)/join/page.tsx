"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import JoinForm from "@/src/components/common/auth/JoinForm";
import Link from "next/link";

export default function JoinPage() {
  return (
    <div className="container mx-auto h-full px-4">
      <div className="flex h-full content-center items-center justify-center">
        <div className="w-full px-4 lg:w-6/12">
          <JoinForm />

          <div className="relative mt-6 flex flex-wrap">
            <div className="w-1/2">
              <Link href="/">
                <span className="text-blueGray-500 text-sm hover:underline">
                  이미 계정이 있으신가요?
                </span>
              </Link>
            </div>
            <div className="w-1/2 text-right">
              <Link href="/">
                <span className="text-blueGray-500 text-sm hover:underline">
                  Home
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
