"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface NaverAccountFormValues {
  naverId: string;
  naverPw: string;
}

interface NaverAccountFormProps {
  mode: "create" | "update";
  defaultId?: string;
  isSubmitting?: boolean;
  onSubmit: (values: NaverAccountFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export default function NaverAccountForm({
  mode,
  defaultId,
  isSubmitting,
  onSubmit,
  onCancel,
}: NaverAccountFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NaverAccountFormValues>({
    defaultValues: {
      naverId: defaultId ?? "",
      naverPw: "",
    },
  });

  useEffect(() => {
    reset({ naverId: defaultId ?? "", naverPw: "" });
  }, [defaultId, reset]);

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values);
    reset({ naverId: values.naverId, naverPw: "" });
  });

  const title = mode === "create" ? "네이버 계정 등록" : "네이버 계정 수정";
  const actionLabel = mode === "create" ? "등록" : "수정";

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              닫기
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {mode === "create"
            ? "네이버 플레이스 댓글 제어에 사용할 계정을 등록해주세요."
            : "아이디는 자동 반영되며, 비밀번호는 다시 입력해야 합니다."}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="naverId">
          네이버 아이디
        </label>
        <input
          id="naverId"
          type="text"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="seller@example.com"
          {...register("naverId", { required: "아이디를 입력해주세요" })}
        />
        {errors.naverId ? (
          <p className="mt-1 text-sm text-red-500">{errors.naverId.message}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="naverPw">
          네이버 비밀번호
        </label>
        <input
          id="naverPw"
          type="password"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="비밀번호"
          {...register("naverPw", { required: "비밀번호를 입력해주세요" })}
        />
        {errors.naverPw ? (
          <p className="mt-1 text-sm text-red-500">{errors.naverPw.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "처리 중..." : `${actionLabel}하기`}
      </button>
    </form>
  );
}
