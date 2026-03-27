"use client";

import { TestimonialsColumn } from "@/shared/ui/testimonials-columns-1";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "D-PLOG 덕분에 어디서부터 손대야 할지 막막했던 플레이스 관리가 명확해졌어요. 리포트 하나로 바로 실행할 수 있었습니다.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "김서연",
    role: "카페 사장님 · 서울 마포구",
  },
  {
    text: "대행사에 맡기면 뭘 해주는 건지 몰랐는데, D-PLOG 리포트를 보니 직접 해도 되겠다는 자신감이 생겼어요.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "박준혁",
    role: "음식점 사장님 · 부산 해운대",
  },
  {
    text: "키워드 순위 변화를 매주 확인할 수 있어서, 어떤 조치가 효과가 있었는지 바로 알 수 있었습니다.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "이하은",
    role: "베이커리 사장님 · 경기 성남",
  },
  {
    text: "클라이언트 매장 5곳을 관리하는데, D-PLOG로 리포트 작성 시간이 절반으로 줄었어요. 대행사에게 필수 도구입니다.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "정우성",
    role: "마케팅 대행사 대표",
  },
  {
    text: "10분 만에 진단이 끝나고, 바로 실행할 수 있는 체크리스트까지 나와서 정말 놀랐어요.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "최민지",
    role: "네일숍 사장님 · 서울 강남",
  },
  {
    text: "사장님께 보고할 때 D-PLOG 리포트를 그대로 첨부합니다. 데이터 기반이라 신뢰도가 확 올라요.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "한소희",
    role: "매장 매니저 · 프랜차이즈",
  },
  {
    text: "처음에는 반신반의했는데, 리포트대로 수정했더니 2주 만에 키워드 3개가 TOP 5에 진입했어요!",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "오민수",
    role: "삼겹살집 사장님 · 대구",
  },
  {
    text: "경쟁 매장 분석까지 해줘서, 우리 매장의 강점과 약점을 객관적으로 파악할 수 있었습니다.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "윤지아",
    role: "뷰티샵 사장님 · 인천",
  },
  {
    text: "월 50만 원 대행비 쓰다가 D-PLOG로 바꿨는데, 오히려 성과가 더 좋아졌어요. 가성비 최고입니다.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "강태준",
    role: "헬스장 사장님 · 서울 송파",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const TestimonialsSection = () => {
  return (
    <section className="py-20 relative bg-white dark:bg-[#050505] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 text-xs font-semibold tracking-widest uppercase mb-5">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-5 [text-wrap:balance]">
            사장님들의 생생한 후기
          </h2>
          <p className="text-center text-slate-500 dark:text-white/40 text-base md:text-lg leading-relaxed [text-wrap:balance]">
            D-PLOG를 직접 사용해본 사장님들의 이야기입니다.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};
