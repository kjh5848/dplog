'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormValues } from "./schemas";

export const useSignupViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCompanyVerified, setIsCompanyVerified] = useState(false);
  const [isVerifyingCompany, setIsVerifyingCompany] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      passwordConfirm: "",
      name: "",
      emailId: "",
      emailDomain: "",
      emailCustomDomain: "",
      tel: "",
      gender: "",
      birthDate: "",
      companyName: "",
      companyNumber: "",
      privacyPolicy: false,
      termsOfService: false,
      marketingConsent: false,
    },
  });

  const { watch, setValue, trigger } = form; // Extract for internal logic
  const emailDomain = watch("emailDomain");

  // Auto-format helpers
  const handleTelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length >= 3 && value.length <= 7) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length >= 8) {
      value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    }
    setValue("tel", value);
  };

  const handleCompanyNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    if (value.length < 3) {
      // keep
    } else if (value.length < 5) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
    }
    setValue("companyNumber", value);
    setIsCompanyVerified(false);
  };

  const checkUsernameDuplicate = async () => {
    const username = watch("username");
    if (!username) return;
    setIsCheckingUsername(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsCheckingUsername(false);
      setIsUsernameAvailable(true); // Mock always available
      alert("사용 가능한 아이디입니다. (Mock)");
    }, 500);
  };

  const verifyCompanyNumber = async () => {
    const companyNumber = watch("companyNumber");
    if (!companyNumber) return;
    setIsVerifyingCompany(true);

    // Simulate API call
    setTimeout(() => {
      setIsVerifyingCompany(false);
      setIsCompanyVerified(true); // Mock always verified
      alert("인증되었습니다. (Mock)");
    }, 500);
  };

  const onSubmit = async (data: SignupFormValues) => {
    if (!isUsernameAvailable) {
      alert("아이디 중복 확인을 해주세요.");
      return;
    }
    // In real app, check isCompanyVerified too (or bypass for dev)

    setIsLoading(true);
    console.log("Signup submitted:", data);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("회원가입이 완료되었습니다. (UI 데모)");
    }, 1500);
  };

  return {
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
    setValue, // Exported for direct usage in UI if needed, or wrap in handlers
    trigger, // Exported for direct usage
    setIsUsernameAvailable, // Exported for inline handlers
  };
};
