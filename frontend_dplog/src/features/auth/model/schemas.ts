import * as z from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    username: z
      .string()
      .min(4, "아이디는 최소 4자 이상이어야 합니다.")
      .max(12, "아이디는 최대 12자까지 가능합니다.")
      .regex(/^[a-z0-9]+$/, "아이디는 영문 소문자와 숫자만 사용 가능합니다."),
    password: z
      .string()
      .min(6, "비밀번호는 6-15자 사이로 입력하세요.")
      .max(15, "비밀번호는 6-15자 사이로 입력하세요.")
      .regex(/[a-zA-Z]/, "영문을 포함해야 합니다.")
      .regex(/[!@#$%&]/, "특수문자(!@#$%&)를 포함해야 합니다."),
    passwordConfirm: z.string(),
    name: z.string().min(1, "이름을 입력하세요."),
    emailId: z
      .string()
      .min(1, "이메일 아이디를 입력하세요.")
      .regex(/^[A-Z0-9._%+-]+$/i, "올바른 이메일 아이디를 입력하세요."),
    emailDomain: z.string().min(1, "이메일을 선택하세요."),
    emailCustomDomain: z.string(),
    tel: z
      .string()
      .min(1, "연락처를 입력하세요.")
      .regex(/^01[0-9]-\d{3,4}-\d{4}$/, "올바른 전화번호 형식을 입력하세요."),
    gender: z.string().min(1, "성별을 선택하세요."),
    birthDate: z.string().min(1, "생년월일을 입력하세요."),
    companyName: z.string().min(2, "업체명은 최소 2자 이상이어야 합니다."),
    companyNumber: z
      .string()
      .regex(/^\d{3}-\d{2}-\d{5}$/, "올바른 사업자등록번호 형식을 입력하세요."),
    privacyPolicy: z.boolean().refine((val) => val === true, {
      message: "개인정보처리방침에 동의해야 합니다.",
    }),
    termsOfService: z.boolean().refine((val) => val === true, {
      message: "이용약관에 동의해야 합니다.",
    }),
    marketingConsent: z.boolean(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  })
  .refine(
    (data) => {
      if (data.emailDomain === "custom") {
        return !!data.emailCustomDomain && /^[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.emailCustomDomain);
      }
      return true;
    },
    {
      message: "올바른 도메인을 입력하세요.",
      path: ["emailCustomDomain"],
    }
  );

export type SignupFormValues = z.infer<typeof signupSchema>;
