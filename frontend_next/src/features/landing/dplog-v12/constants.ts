
import { FileCode2, Sparkles, Folder, Terminal, CheckCircle2, Layout, Plus, FileText, Share2, MonitorPlay, BarChart3, Megaphone, Coins } from "lucide-react";

export const NAV_LINKS = [
  { label: "솔루션", href: "#product" },
  { label: "고객 사례", href: "#use-cases", hasDropdown: true },
  { label: "요금 안내", href: "#pricing" },
  { label: "블로그", href: "#blog" },
  { label: "자료실", href: "#resources", hasDropdown: true },
];

export const FOOTER_LINKS = {
  primary: [
    { label: "앱 다운로드", href: "#" },
    { label: "솔루션 소개", href: "#" },
    { label: "가이드북", href: "#" },
    { label: "업데이트", href: "#" },
    { label: "보도자료", href: "#" },
  ],
  secondary: [
    { label: "블로그", href: "#" },
    { label: "요금 정책", href: "#" },
    { label: "제휴 문의", href: "#" },
  ]
};

export const FEATURES = [
  {
    title: "RAG 기반 정밀 진단",
    description: "단순히 매출 추이만 보여주지 않습니다. RAG 엔진이 리뷰와 상권 데이터를 분석하여 '왜' 매출이 떨어졌는지, '무엇'을 개선해야 하는지 명확한 원인과 처방을 제시합니다.",
    videoSrc: "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4"
  },
  {
    title: "AI 콘텐츠 팩토리",
    description: "전문 마케터 없이도 블로그 원고, 인스타그램 이미지, 숏폼 대본을 AI가 자동으로 생성합니다. 매일 반복되는 마케팅 고민을 10분 만에 해결하세요.",
    videoSrc: "https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4"
  },
  {
    title: "맞춤형 성장 로드맵",
    description: "내 가게 상황에 딱 맞는 정부 지원사업을 자동으로 매칭하고, 복잡한 사업계획서 초안까지 작성해 드립니다. 비용 부담은 줄이고 성장 기회는 놓치지 마세요.",
    videoSrc: "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4"
  }
];

export const USE_CASES = [
  {
    role: "예비 창업자",
    description: "상권 분석부터 인테리어 무드보드, 초기 사업계획서 수립까지. 시행착오를 줄이는 완벽한 창업 시뮬레이션을 제공합니다.",
    image: "https://picsum.photos/800/600?random=1"
  },
  {
    role: "운영 중인 사장님",
    description: "매일 아침 도착하는 진단 리포트와 마케팅 미션으로 매출 하락을 방어하고, 단골 고객을 확보하는 루틴을 만드세요.",
    image: "https://picsum.photos/800/600?random=2"
  },
  {
    role: "프랜차이즈 본사",
    description: "전 지점의 마케팅 퀄리티를 표준화하고, 데이터 기반의 슈퍼바이징 시스템을 통해 가맹점과의 상생 성장을 실현합니다.",
    image: "https://picsum.photos/800/600?random=3"
  }
];

export const BLOGS = [
  {
    title: "2025년 외식업 생존 전략: 데이터 경영",
    date: "2025. 05. 20",
    category: "트렌드",
    image: "https://picsum.photos/400/400?random=4"
  },
  {
    title: "대행사 없이 매출 2배 올린 카페 사례",
    date: "2025. 05. 15",
    category: "성공사례",
    image: "https://picsum.photos/400/400?random=5"
  },
  {
    title: "D-PLOG, 초기창업패키지 최우수 선정",
    date: "2025. 05. 10",
    category: "뉴스",
    image: "https://picsum.photos/400/400?random=6"
  }
];

export const ICONS_LIST = [
  { Icon: BarChart3, label: "분석" },
  { Icon: Sparkles, label: "AI" },
  { Icon: Megaphone, label: "홍보" },
  { Icon: Terminal, label: "진단" },
  { Icon: CheckCircle2, label: "검증" },
  { Icon: Layout, label: "리포트" },
  { Icon: Plus, label: "생성" },
  { Icon: FileText, label: "계획서" },
  { Icon: Share2, label: "공유" },
  { Icon: Coins, label: "지원금" },
  // Duplicate for density
  { Icon: BarChart3, label: "분석" },
  { Icon: Sparkles, label: "AI" },
  { Icon: Megaphone, label: "홍보" },
  { Icon: Terminal, label: "진단" },
  { Icon: CheckCircle2, label: "검증" },
  { Icon: Layout, label: "리포트" },
  { Icon: Plus, label: "생성" },
  { Icon: FileText, label: "계획서" },
  { Icon: Share2, label: "공유" },
  { Icon: Coins, label: "지원금" },
];
