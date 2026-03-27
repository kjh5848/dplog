
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ArrowRight, HelpCircle, CheckCircle, MapPin, 
  TrendingUp, Rocket, Lightbulb, Info, Edit3, Download, 
  Save, LogOut, Send, Mic, PlusCircle, FileText, ChevronRight,
  BarChart2, DollarSign, List, Shield, Zap, Search
} from 'lucide-react';
import { SectionContainer, ParticleCanvas } from './ui/Common';

type Step = 'duration' | 'region' | 'age' | 'results' | 'chat';

interface PathfinderProps {
  onExit: () => void;
}

const Pathfinder: React.FC<PathfinderProps> = ({ onExit }) => {
  const [step, setStep] = useState<Step>('duration');
  const [progress, setProgress] = useState(25);
  
  // State for selections
  const [duration, setDuration] = useState<string>('early'); // Default to Early Stage per request
  const [region, setRegion] = useState<string>('');
  const [ageGroup, setAgeGroup] = useState<string>('');

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleNext = () => {
    if (step === 'duration') {
        setStep('region');
        setProgress(50);
    } else if (step === 'region') {
        setStep('age');
        setProgress(75);
    } else if (step === 'age') {
        setStep('results');
        setProgress(100);
    } else if (step === 'results') {
        setStep('chat');
    }
  };

  const handleBack = () => {
    if (step === 'region') {
        setStep('duration');
        setProgress(25);
    } else if (step === 'age') {
        setStep('region');
        setProgress(50);
    } else if (step === 'results') {
        setStep('age');
        setProgress(75);
    }
  };

  // Helper to determine header width based on step
  const getHeaderWidth = () => {
      switch (step) {
          case 'duration': return 'max-w-5xl'; // Keep compact for start
          case 'chat': return 'max-w-[1600px]'; // Match chat container
          default: return 'max-w-7xl'; // Standard app width for other steps
      }
  };

  // Unified Floating Rounded Header (Matching Main Header)
  const Header = ({ showSave = true }) => (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none">
        <header className={`pointer-events-auto relative w-full ${getHeaderWidth()} flex items-center justify-between px-5 py-3 rounded-full border border-gray-200/60 bg-white/80 shadow-sm backdrop-blur-md transition-all duration-500 ease-in-out`}>
            <div className="flex items-center gap-4">
                {/* Logo Button - Navigates Home */}
                <button onClick={onExit} className="flex items-center gap-2 group hover:opacity-80 transition-opacity focus:outline-none">
                    <div className="size-8 text-blue-600 flex items-center justify-center bg-blue-50 rounded-lg group-hover:scale-105 transition-transform">
                    <Search className="w-5 h-5" />
                    </div>
                    <span className="text-gray-900 dark:text-white text-lg font-bold leading-tight">D-PLOG</span>
                </button>
                
                {/* Service Divider and Name */}
                <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
                <h2 className="text-gray-600 dark:text-gray-300 text-sm font-medium hidden sm:block">Pathfinder</h2>

                {step === 'chat' && (
                    <div className="hidden md:flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-700 ml-2 text-sm text-gray-500">
                        <FileText className="w-4 h-4" />
                        <span>Project: My Cafe Business Plan</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                {showSave && (
                    <button className="hidden sm:flex items-center justify-center h-9 px-4 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 rounded-full transition-colors">
                    Save Draft
                    </button>
                )}
                <button 
                    onClick={onExit}
                    className={`flex items-center justify-center gap-2 h-9 px-5 rounded-full text-sm font-bold transition-colors ${step === 'chat' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                    <span>{step === 'chat' ? 'Exit Interview' : 'Save & Exit'}</span>
                    {step === 'chat' && <LogOut className="w-4 h-4" />}
                </button>
                {step === 'chat' && (
                    <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white shadow-sm ml-1 overflow-hidden">
                        <img src="https://picsum.photos/seed/user/100/100" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
        </header>
    </div>
  );

  // --- STEP 1: DURATION ---
  if (step === 'duration') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#101922] flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 pt-32">
          <div className="w-full max-w-[800px] flex flex-col gap-8 animate-fade-in-up">
            {/* Progress */}
            <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
              <div className="flex justify-between items-end">
                <p className="text-gray-900 dark:text-white text-base font-medium">Onboarding Progress</p>
                <p className="text-gray-500 text-sm">Step 1 of 4</p>
              </div>
              <div className="rounded-full bg-gray-200 h-2 overflow-hidden">
                <div className="h-full rounded-full bg-blue-600 w-1/4 transition-all duration-500"></div>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">창업하신 지 얼마나 되셨나요?</h1>
              <p className="text-gray-500 text-lg">맞춤형 정부 지원사업과 로드맵을 추천해 드립니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                   { id: 'prospective', icon: Lightbulb, title: '예비 창업자', sub: '사업자 등록 전' },
                   { id: 'early', icon: Rocket, title: '초기 창업자', sub: '1년 미만' },
                   { id: 'growth', icon: TrendingUp, title: '도약기 창업자', sub: '3년 미만' },
               ].map((item) => (
                   <label 
                    key={item.id}
                    onClick={() => setDuration(item.id)}
                    className={`relative flex flex-col items-center justify-center p-8 gap-4 bg-white dark:bg-[#1a2632] rounded-3xl border-2 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full ${duration === item.id ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/10' : 'border-gray-100 hover:border-blue-200'}`}
                   >
                       <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-colors ${duration === item.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                           <item.icon className="w-8 h-8" strokeWidth={1.5} />
                       </div>
                       <div className="text-center">
                           <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</p>
                           <p className="text-gray-500 text-sm font-medium">{item.sub}</p>
                       </div>
                       {duration === item.id && <div className="absolute top-6 right-6 text-blue-500"><CheckCircle className="w-6 h-6 fill-current" /></div>}
                   </label>
               ))}
            </div>

            <div className="flex justify-center mt-8">
                <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105"
                >
                    다음으로 <ArrowRight className="w-5 h-5" />
                </button>
            </div>
            
            <div className="text-center mt-4">
                <button className="text-gray-400 hover:text-blue-600 text-sm flex items-center justify-center gap-1 mx-auto transition-colors">
                    <HelpCircle className="w-4 h-4" /> 왜 이 정보가 필요한가요?
                </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- STEP 2: REGION ---
  if (step === 'region') {
    const regions = [
        { id: 'seoul', en: 'Seoul', ko: '서울', icon: '🏢' },
        { id: 'busan', en: 'Busan', ko: '부산', icon: '⛵' },
        { id: 'daegu', en: 'Daegu', ko: '대구', icon: '🏯' },
        { id: 'incheon', en: 'Incheon', ko: '인천', icon: '✈️' },
        { id: 'gwangju', en: 'Gwangju', ko: '광주', icon: '🎨' },
        { id: 'daejeon', en: 'Daejeon', ko: '대전', icon: '🧪' },
        { id: 'ulsan', en: 'Ulsan', ko: '울산', icon: '🏭' },
        { id: 'sejong', en: 'Sejong', ko: '세종', icon: '🏛️' },
        { id: 'gyeonggi', en: 'Gyeonggi', ko: '경기', icon: '🚆' },
        { id: 'gangwon', en: 'Gangwon', ko: '강원', icon: '🏔️' },
        { id: 'chungbuk', en: 'Chungbuk', ko: '충북', icon: '🌲' },
        { id: 'chungnam', en: 'Chungnam', ko: '충남', icon: '🚜' },
        { id: 'jeonbuk', en: 'Jeonbuk', ko: '전북', icon: '🍚' },
        { id: 'jeonnam', en: 'Jeonnam', ko: '전남', icon: '💧' },
        { id: 'gyeongbuk', en: 'Gyeongbuk', ko: '경북', icon: '📜' },
        { id: 'gyeongnam', en: 'Gyeongnam', ko: '경남', icon: '🏗️' },
        { id: 'jeju', en: 'Jeju', ko: '제주', icon: '☀️' },
    ];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#101922] flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-start py-10 px-4 pt-32">
            <div className="w-full max-w-[960px] flex flex-col gap-8 animate-fade-in">
                {/* Progress */}
                <div className="flex flex-col gap-3 px-4">
                    <div className="flex justify-between items-end">
                        <p className="text-gray-900 dark:text-white text-sm font-medium uppercase tracking-wider">Step 2 of 4</p>
                        <p className="text-blue-600 font-bold">50%</p>
                    </div>
                    <div className="rounded-full bg-gray-200 h-2 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-600 w-1/2 transition-all duration-500"></div>
                    </div>
                </div>

                <div className="px-4 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">어디서 시작하시나요?</h1>
                    <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
                        사업자 등록 예정지 혹은 현재 사업장 소재지를 선택해주세요. <br className="hidden md:block"/>해당 지역의 지원금 및 맞춤형 혜택을 찾아드립니다.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4">
                    {regions.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => setRegion(r.id)}
                            className={`group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 aspect-square relative ${region === r.id ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'}`}
                        >
                            {region === r.id && (
                                <div className="absolute top-3 right-3 text-blue-500">
                                    <CheckCircle className="w-5 h-5 fill-current" />
                                </div>
                            )}
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110 ${region === r.id ? 'bg-white' : 'bg-gray-50'}`}>
                                {r.icon}
                            </div>
                            <div className="text-center">
                                <div className="text-gray-900 font-bold">{r.en}</div>
                                <div className="text-gray-500 text-sm font-medium">{r.ko}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="flex justify-between md:justify-end gap-4 px-4 pt-8 border-t border-gray-200 mt-4">
                    <button onClick={handleBack} className="px-8 py-3.5 rounded-full border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                        Back
                    </button>
                    <button onClick={handleNext} disabled={!region} className="px-10 py-3.5 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2">
                        Next Step <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </main>
      </div>
    );
  }

  // --- STEP 3: AGE ---
  if (step === 'age') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#101922] flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4 pt-32">
            <div className="w-full max-w-[640px] flex flex-col gap-8 animate-fade-in">
                {/* Progress */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                        <p className="text-gray-900 dark:text-white text-sm font-semibold uppercase tracking-wider">Step 3 of 4</p>
                        <p className="text-blue-600 font-bold">75%</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-600 w-3/4 transition-all duration-500"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">대표님의 연령대는?</h1>
                    <p className="text-gray-500 text-lg">정부 지원사업 매칭을 위해 필요한 정보입니다.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label 
                        onClick={() => setAgeGroup('under39')}
                        className={`relative cursor-pointer group p-8 rounded-3xl border-2 transition-all duration-200 h-full flex flex-col ${ageGroup === 'under39' ? 'border-blue-500 bg-blue-50/20 shadow-lg' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'}`}
                    >
                        <div className="mb-6 p-4 rounded-2xl bg-blue-50 text-blue-600 w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Rocket className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">만 39세 이하</h3>
                        <p className="text-gray-500 text-base leading-relaxed">청년 창업 우대 혜택을<br/>받을 수 있습니다.</p>
                        {ageGroup === 'under39' && <div className="absolute top-6 right-6 text-blue-500"><CheckCircle className="w-6 h-6 fill-current" /></div>}
                    </label>

                    <label 
                        onClick={() => setAgeGroup('over39')}
                        className={`relative cursor-pointer group p-8 rounded-3xl border-2 transition-all duration-200 h-full flex flex-col ${ageGroup === 'over39' ? 'border-blue-500 bg-blue-50/20 shadow-lg' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'}`}
                    >
                        <div className="mb-6 p-4 rounded-2xl bg-indigo-50 text-indigo-600 w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Lightbulb className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">만 39세 초과</h3>
                        <p className="text-gray-500 text-base leading-relaxed">일반 창업 및 중장년 기술창업<br/>지원을 매칭해드립니다.</p>
                        {ageGroup === 'over39' && <div className="absolute top-6 right-6 text-blue-500"><CheckCircle className="w-6 h-6 fill-current" /></div>}
                    </label>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-100/80 border border-gray-200">
                    <Info className="w-5 h-5 text-gray-500 mt-1 shrink-0" />
                    <p className="text-sm text-gray-600 leading-relaxed">
                        <strong className="font-bold text-gray-800 block mb-1">Why ask?</strong> 만 39세는 '청년창업사관학교' 등 주요 정부 지원사업의 청년 우대 기준이 되는 중요한 나이입니다. 정확하게 선택해 주세요.
                    </p>
                </div>

                <div className="flex items-center justify-between pt-6 mt-4">
                    <button onClick={handleBack} className="h-12 px-8 rounded-full border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                        이전
                    </button>
                    <button onClick={handleNext} disabled={!ageGroup} className="h-12 px-10 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md flex items-center gap-2 hover:shadow-lg transition-all">
                        다음 <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </main>
      </div>
    );
  }

  // --- STEP 4: RESULTS DASHBOARD ---
  if (step === 'results') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#101922] flex flex-col font-sans relative overflow-x-hidden">
        <Header />
        
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
             <ParticleCanvas theme="light" />
        </div>

        <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 pt-32 relative z-10">
            <div className="w-full max-w-[1024px] flex flex-col gap-12 animate-fade-in-up">
                
                <section className="flex flex-col items-center text-center gap-6">
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 text-green-600 mb-2 shadow-sm animate-pulse">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <div className="space-y-4 max-w-3xl">
                        <p className="text-blue-600 font-bold tracking-wide uppercase text-sm bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">Analysis Complete</p>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white">
                            지원 가능 예산 <br className="md:hidden"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">약 2.5억 원</span> 발견
                        </h1>
                        <p className="text-gray-500 text-xl font-normal leading-relaxed max-w-2xl mx-auto">
                            현재 대표님의 조건에서 즉시 지원 가능한 <strong className="text-gray-900">45건의 기회</strong>를 찾았습니다.
                        </p>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* Card 1 */}
                    <div className="flex flex-col gap-4 rounded-3xl p-8 border border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <List className="w-40 h-40" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><BarChart2 className="w-6 h-6" /></div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Opportunities</p>
                        </div>
                        <div>
                            <p className="text-gray-900 text-6xl font-black leading-tight tracking-tight">45 <span className="text-2xl font-bold text-gray-400">건</span></p>
                        </div>
                        <div className="mt-auto pt-6 border-t border-gray-100 w-full">
                            <div className="flex items-center gap-2 text-green-600 text-sm font-semibold bg-green-50 w-fit px-3 py-1 rounded-full">
                                <TrendingUp className="w-4 h-4" />
                                <span>동종 업계 평균 대비 +12%</span>
                            </div>
                        </div>
                    </div>
                    {/* Card 2 */}
                    <div className="flex flex-col gap-4 rounded-3xl p-8 border border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <DollarSign className="w-40 h-40" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Shield className="w-6 h-6" /></div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Estimated Value</p>
                        </div>
                        <div>
                            <p className="text-gray-900 text-6xl font-black leading-tight tracking-tight">2.5 <span className="text-2xl font-bold text-gray-400">억 원</span></p>
                        </div>
                        <div className="mt-auto pt-6 border-t border-gray-100 w-full">
                            <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold bg-blue-50 w-fit px-3 py-1 rounded-full">
                                <CheckCircle className="w-4 h-4" />
                                <span>매칭 확률 높음 (85%+)</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="flex flex-col gap-8">
                    <h3 className="text-2xl font-bold text-gray-900 px-1">기회 상세 분석</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                         <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-blue-400 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><Zap className="w-6 h-6"/></div>
                                <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">High Priority</span>
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-bold text-xl">R&D Grants</h4>
                                <p className="text-gray-500 text-sm mt-2 leading-relaxed">기술 개발 자금 2건 확보 가능. 시제품 제작 지원 포함.</p>
                            </div>
                         </div>
                         <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-purple-400 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform"><Rocket className="w-6 h-6"/></div>
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-bold text-xl">Startup Pkgs</h4>
                                <p className="text-gray-500 text-sm mt-2 leading-relaxed">초기창업패키지 등 종합 지원사업 1건 매칭.</p>
                            </div>
                         </div>
                         <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-orange-400 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform"><DollarSign className="w-6 h-6"/></div>
                                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">Most Volume</span>
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-bold text-xl">Policy Loans</h4>
                                <p className="text-gray-500 text-sm mt-2 leading-relaxed">저금리 정책 자금 42건 리스트업 완료.</p>
                            </div>
                         </div>
                    </div>
                </section>

                <section className="mt-8 mb-12">
                    <div className="relative overflow-hidden rounded-3xl bg-[#1a1f2e] p-8 md:p-14 text-center shadow-2xl">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                        <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                        
                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <div>
                                <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-4">이제 계획서를 써볼까요?</h2>
                                <p className="text-gray-400 max-w-lg mx-auto text-lg leading-relaxed">
                                    45건의 기회를 내 것으로 만들려면 탄탄한 사업계획서가 필요합니다. D-PLOG AI가 작성을 도와드립니다.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full justify-center">
                                <button onClick={handleNext} className="flex items-center justify-center gap-3 h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-900/50 w-full sm:w-auto min-w-[240px]">
                                    <Edit3 className="w-5 h-5" />
                                    <span>사업계획서 작성 시작</span>
                                </button>
                                <button className="flex items-center justify-center gap-3 h-14 px-10 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full text-lg font-medium transition-colors w-full sm:w-auto backdrop-blur-sm">
                                    전체 리스트 보기
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
      </div>
    );
  }

  // --- STEP 5: CHAT INTERFACE ---
  if (step === 'chat') {
      const messages = [
          {
              id: 1, role: 'ai',
              text: "안녕하세요! 대표님의 사업계획서 작성을 도와드릴 D-PLOG AI입니다. \n지난 단계에서 '카페' 창업을 준비 중이라고 하셨는데요, 시그니처 메뉴나 경쟁력에 대해 조금 더 구체적으로 말씀해 주시겠어요?",
              timestamp: '10:23 AM'
          },
          {
              id: 3, role: 'user',
              text: "네, 저희는 로컬 꿀과 귀리 우유를 사용한 허니 오트 라떼가 시그니처입니다. 꿀은 인근 10km 내 농장에서 직접 공수받아요.",
              timestamp: '10:24 AM'
          },
          {
              id: 2, role: 'ai',
              text: "좋습니다! '로컬 소싱'과 '건강한 단맛'이 핵심 키워드가 되겠네요. \n이 내용을 바탕으로 [제품 경쟁력] 파트를 작성해 보겠습니다. 혹시 타겟 고객층은 어떻게 생각하고 계신가요?",
              timestamp: '10:23 AM'
          },
      ];

      return (
        <div className="h-screen bg-gray-50 dark:bg-[#101922] flex flex-col font-sans overflow-hidden">
            <Header showSave={false} />
            
            {/* Main Content Area - Padded top for fixed header */}
            <main className="flex-1 flex overflow-hidden relative pt-24 md:pt-28 pb-4 px-4 max-w-[1600px] mx-auto w-full gap-6">
                
                {/* Left Panel: Chat (Rounded Card) */}
                <section className="flex flex-col w-full md:w-[45%] lg:w-[40%] bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-gray-800 relative z-10 shadow-xl rounded-[2rem] overflow-hidden">
                    {/* Progress Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-[#1a2632]/90 backdrop-blur sticky top-0 z-10">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm font-bold text-gray-800">AI Interview In Progress</span>
                                </div>
                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">47%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full w-[47%] transition-all duration-1000"></div>
                            </div>
                        </div>
                    </div>

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-gray-50/30">
                        <div className="flex justify-center my-4">
                            <span className="text-xs font-medium text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">오늘, 오전 10:23</span>
                        </div>
                        
                        {messages.map(m => (
                            <div key={m.id} className={`flex items-start gap-4 max-w-[90%] animate-fade-in-up ${m.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
                                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${m.role === 'ai' ? 'bg-white border-gray-100 text-blue-600' : 'bg-gray-200 border-gray-300 overflow-hidden'}`}>
                                    {m.role === 'ai' ? <Rocket className="w-5 h-5" /> : <img src="https://picsum.photos/seed/user/100/100" className="w-full h-full" alt="User" />}
                                </div>
                                <div className="flex flex-col gap-1 items-start">
                                    <span className={`text-xs font-medium text-gray-400 ${m.role === 'user' ? 'self-end mr-1' : 'ml-1'}`}>{m.role === 'ai' ? 'Pathfinder AI' : 'You'}</span>
                                    <div className={`p-4 shadow-sm text-[15px] leading-relaxed ${m.role === 'ai' ? 'bg-white border border-gray-200 rounded-2xl rounded-tl-none text-gray-800' : 'bg-blue-600 text-white rounded-2xl rounded-tr-none'}`}>
                                        <p className="whitespace-pre-wrap">{m.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        <div className="flex items-start gap-4 max-w-[90%]">
                            <div className="size-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm text-blue-600 opacity-70">
                                <Rocket className="w-4 h-4" />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-5 bg-white dark:bg-[#1a2632] border-t border-gray-100">
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                             {['구체적인 예시 보여줘', '전문 용어 설명해줘', '나중에 답변할래'].map(label => (
                                 <button key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:border-gray-300 whitespace-nowrap transition-colors">
                                     <Lightbulb className="w-3 h-3" /> {label}
                                 </button>
                             ))}
                        </div>
                        <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-[1.5rem] p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-inner">
                            <button className="p-2.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"><PlusCircle className="w-5 h-5"/></button>
                            <textarea 
                                className="flex-1 bg-transparent border-none focus:ring-0 p-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none max-h-32" 
                                placeholder="답변을 입력하세요..." 
                                rows={1}
                                style={{ minHeight: '44px' }}
                            ></textarea>
                            <button className="p-2.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"><Mic className="w-5 h-5"/></button>
                            <button className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105"><Send className="w-4 h-4"/></button>
                        </div>
                    </div>
                </section>

                {/* Right Panel: Document Preview (Rounded Card) */}
                <section className="hidden md:flex flex-col flex-1 bg-[#F3F4F6] dark:bg-[#1a32] border border-gray-200 dark:border-gray-800 p-8 overflow-hidden h-full relative rounded-[2rem] shadow-inner">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-3">
                             <div className="bg-white p-2 rounded-lg shadow-sm">
                                <FileText className="text-blue-600 w-5 h-5" />
                             </div>
                             <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">실시간 사업계획서 미리보기</h2>
                                <p className="text-xs text-gray-500">자동 저장 중...</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-all"><Edit3 className="w-3.5 h-3.5"/> 편집</button>
                             <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-all"><Download className="w-3.5 h-3.5"/> PDF</button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#101922] rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700 flex-1 overflow-y-auto p-12 custom-scrollbar max-w-[800px] mx-auto w-full relative">
                        {/* Paper Content */}
                        <div className="border-b border-gray-100 mb-10 pb-6">
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">사업계획서: 로컬 허니 카페</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>작성자: 김이오</span>
                                <span>•</span>
                                <span>2024년 5월 20일</span>
                            </div>
                        </div>

                        <div className="mb-12 opacity-60 hover:opacity-100 transition-opacity group cursor-default">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                <CheckCircle className="text-green-500 w-4 h-4" /> 1. 창업 동기 및 개요
                            </h3>
                            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                                본 사업은 부산 연제구 지역의 특산품인 벌꿀을 활용한 스페셜티 커피 전문점입니다. 단순한 카페를 넘어 지역 농가와의 상생 모델을 구축하고, 2030 세대에게 '건강한 단맛'이라는 새로운 트렌드를 제안하고자 합니다.
                            </p>
                        </div>

                        <div className="mb-12 relative p-1 rounded-xl -mx-4 px-4 transition-colors bg-blue-50/50">
                             <div className="absolute -left-10 top-2">
                                 <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                                     <Edit3 className="w-4 h-4 animate-pulse" />
                                 </div>
                             </div>
                             <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">2. 제품 경쟁력 및 차별화 전략</h3>
                             <div className="space-y-4">
                                 <div>
                                     <h4 className="text-sm font-bold text-gray-900 mb-1">핵심 제품 (Core Product)</h4>
                                     <p className="text-sm leading-relaxed text-gray-700">
                                        주력 메뉴는 <strong>"허니 오트 라떼"</strong>입니다. 설탕 대신 <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded border border-yellow-200">100% 천연 벌꿀</span>을 사용하여 당 함량을 낮추고, 유당불내증 고객을 위한 귀리 우유 옵션을 기본으로 제공합니다.
                                     </p>
                                 </div>
                                 <div>
                                     <h4 className="text-sm font-bold text-gray-900 mb-1">로컬 소싱 전략</h4>
                                     <p className="text-sm leading-relaxed text-gray-700">
                                         반경 10km 이내 양봉 농가와 직접 계약하여 물류비를 30% 절감하고, 신선도를 극대화합니다.
                                     </p>
                                 </div>
                             </div>
                        </div>

                        <div className="mb-10 opacity-30 select-none grayscale">
                             <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div> 3. 시장 분석 (작성 예정)
                            </h3>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>

                    {/* Floating FAB */}
                    <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-20">
                        <button className="bg-white dark:bg-[#1a2632] text-gray-900 dark:text-white p-4 rounded-full shadow-xl border border-gray-100 hover:scale-110 transition-transform group relative">
                             <DollarSign className="w-6 h-6 text-orange-500"/>
                             <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">예상 지원금 확인</span>
                        </button>
                    </div>
                </section>
            </main>
        </div>
      );
  }

  return null;
};

export default Pathfinder;
