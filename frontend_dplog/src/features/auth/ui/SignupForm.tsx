"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useSignupViewModel } from "../model/useSignupViewModel";
import { Gift, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const {
    form,
    isLoading,
    isUsernameAvailable,
    isCheckingUsername,
    isCompanyVerified,
    isVerifyingCompany,
    emailDomain,
    handleTelChange,
    handleCompanyNumberChange,
    checkUsernameDuplicate,
    verifyCompanyNumber,
    onSubmit,
    setValue,
    trigger,
    setIsUsernameAvailable,
  } = useSignupViewModel();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* 가입 안내 배너 */}
      <div className="p-6 rounded-2xl border-2 border-dashed bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800/50 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="p-3 rounded-xl shrink-0 bg-blue-100 dark:bg-blue-900/30">
          <Gift className="size-6 text-blue-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-slate-900 dark:text-white">회원가입 특별 혜택!</h4>
            <Sparkles className="size-4 text-amber-500 animate-pulse" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            가입 즉시 <strong className="text-blue-600">매장 진단 리포트</strong>를 무료로 받아보실 수 있습니다.
          </p>
        </div>
      </div>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Account Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">
          계정 정보
        </h3>
        
        <div className="grid gap-2">
          <Label htmlFor="username">아이디 <span className="text-red-500">*</span></Label>
          <div className="flex gap-2">
            <Input
              id="username"
              placeholder="영문 소문자/숫자 4-12자"
              {...register("username")}
              disabled={isLoading}
              onChange={(e) => {
                register("username").onChange(e);
                setIsUsernameAvailable(false);
              }}
            />
            <Button
              type="button"
              onClick={checkUsernameDuplicate}
              disabled={isCheckingUsername || isUsernameAvailable}
              variant="outline"
              className="w-24 whitespace-nowrap border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
            >
              {isCheckingUsername ? <Loader2 className="h-4 w-4 animate-spin" /> : isUsernameAvailable ? "확인완료" : "중복확인"}
            </Button>
          </div>
          {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
          {isUsernameAvailable && <p className="text-sm text-green-500">사용 가능한 아이디입니다.</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호 <span className="text-red-500">*</span></Label>
            <Input
              id="password"
              type="password"
              placeholder="영문+특수문자 6-15자"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="passwordConfirm">비밀번호 재확인 <span className="text-red-500">*</span></Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="비밀번호 재확인"
              {...register("passwordConfirm")}
              disabled={isLoading}
            />
            {errors.passwordConfirm && <p className="text-sm text-red-500">{errors.passwordConfirm.message}</p>}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">
          개인 정보
        </h3>

        <div className="grid gap-2">
          <Label htmlFor="name">이름(대표자) <span className="text-red-500">*</span></Label>
          <Input id="name" placeholder="이름을 입력하세요" {...register("name")} disabled={isLoading} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label>이메일 <span className="text-red-500">*</span></Label>
          <div className="flex gap-2 items-start">
            <Input 
              placeholder="아이디" 
              className="flex-1" 
              {...register("emailId")} 
              disabled={isLoading} 
            />
            <span className="py-2 text-slate-500">@</span>
            <div className="flex-1 min-w-[120px]">
              <Select 
                onValueChange={(val) => {
                  setValue("emailDomain", val);
                  if (val !== "custom") setValue("emailCustomDomain", "");
                  trigger("emailDomain");
                }} 
                defaultValue={watch("emailDomain")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="naver.com">naver.com</SelectItem>
                  <SelectItem value="gmail.com">gmail.com</SelectItem>
                  <SelectItem value="daum.net">daum.net</SelectItem>
                  <SelectItem value="custom">직접입력</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {emailDomain === "custom" && (
             <Input 
               placeholder="도메인 입력 (예: example.com)" 
               {...register("emailCustomDomain")} 
               disabled={isLoading} 
               className="mt-2"
             />
          )}
          {(errors.emailId || errors.emailDomain || errors.emailCustomDomain) && (
            <p className="text-sm text-red-500">
              {errors.emailId?.message || errors.emailDomain?.message || errors.emailCustomDomain?.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tel">연락처 <span className="text-red-500">*</span></Label>
            <Input 
              id="tel" 
              placeholder="010-0000-0000" 
              {...register("tel")}
              onChange={handleTelChange}
              disabled={isLoading} 
            />
            {errors.tel && <p className="text-sm text-red-500">{errors.tel.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label>성별 <span className="text-red-500">*</span></Label>
            <Select onValueChange={(val) => setValue("gender", val)} defaultValue={watch("gender")}>
              <SelectTrigger>
                <SelectValue placeholder="성별 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">남성</SelectItem>
                <SelectItem value="female">여성</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="birthDate">생년월일 <span className="text-red-500">*</span></Label>
          <Input 
            id="birthDate" 
            type="date" 
            {...register("birthDate")} 
            disabled={isLoading} 
          />
          {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate.message}</p>}
        </div>
      </div>

      {/* Company Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">
          업체 정보
        </h3>

        <div className="grid gap-2">
          <Label htmlFor="companyName">업체명 <span className="text-red-500">*</span></Label>
          <Input id="companyName" placeholder="업체명 입력" {...register("companyName")} disabled={isLoading} />
          {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="companyNumber">사업자등록번호 <span className="text-red-500">*</span></Label>
          <div className="flex gap-2">
            <Input
              id="companyNumber"
              placeholder="000-00-00000"
              {...register("companyNumber")}
              onChange={handleCompanyNumberChange}
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={verifyCompanyNumber}
              disabled={isVerifyingCompany || isCompanyVerified}
              variant="outline"
              className="w-24 whitespace-nowrap border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
            >
              {isVerifyingCompany ? <Loader2 className="h-4 w-4 animate-spin" /> : isCompanyVerified ? "인증완료" : "인증하기"}
            </Button>
          </div>
          {errors.companyNumber && <p className="text-sm text-red-500">{errors.companyNumber.message}</p>}
          {isCompanyVerified && <p className="text-sm text-green-500">인증되었습니다.</p>}
        </div>
      </div>

      {/* Agreements */}
      <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="privacyPolicy" 
            onCheckedChange={(checked) => setValue("privacyPolicy", checked === true, { shouldValidate: true })}
          />
          <Label htmlFor="privacyPolicy" className="leading-normal font-normal">
            <Link href="/privacy" className="text-blue-600 hover:underline">개인정보처리방침</Link>에 동의합니다. <span className="text-red-500">*</span>
          </Label>
        </div>
        {errors.privacyPolicy && <p className="text-sm text-red-500 ml-6">{errors.privacyPolicy.message}</p>}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="termsOfService" 
            onCheckedChange={(checked) => setValue("termsOfService", checked === true, { shouldValidate: true })}
          />
          <Label htmlFor="termsOfService" className="leading-normal font-normal">
            <Link href="/terms" className="text-blue-600 hover:underline">서비스 이용약관</Link>에 동의합니다. <span className="text-red-500">*</span>
          </Label>
        </div>
        {errors.termsOfService && <p className="text-sm text-red-500 ml-6">{errors.termsOfService.message}</p>}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="marketingConsent" 
            onCheckedChange={(checked) => setValue("marketingConsent", checked === true)}
          />
          <Label htmlFor="marketingConsent" className="leading-normal font-normal">
            <Link href="/marketing" className="text-blue-600 hover:underline">마케팅 정보 활용</Link>에 동의합니다. (선택)
          </Label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 text-lg">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            가입 처리 중...
          </>
        ) : (
          "회원가입 완료"
        )}
      </Button>

      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary font-semibold text-slate-900 dark:text-white">
          로그인
        </Link>
      </div>
    </form>
    </div>

  );
}
