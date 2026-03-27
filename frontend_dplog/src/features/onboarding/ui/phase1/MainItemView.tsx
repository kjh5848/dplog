import { useOnboardingStore } from '../../store/useOnboardingStore';
import { cn } from '@/shared/lib/utils';
import { Coffee, Utensils, Pizza, Beer } from 'lucide-react';

export const MainItemView = () => {
  const { mainItem, setMainItem } = useOnboardingStore();

  const items = [
    { id: 'korean_food', label: '한식/백반', icon: Utensils },
    { id: 'cafe_dessert', label: '카페/디저트', icon: Coffee },
    { id: 'fast_food', label: '패스트푸드/피자', icon: Pizza },
    { id: 'pub_bar', label: '주점/호프', icon: Beer },
    { id: 'other', label: '기타 외식업', icon: Utensils },
  ];

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          어떤 <span className="text-blue-600 dark:text-blue-400">메뉴(아이템)</span>를<br/>판매하실 계획인가요?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          아이템에 따라 마진율 시뮬레이션 공식이 달라집니다.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto w-full">
        {items.map((item) => {
          const isSelected = mainItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMainItem(item.id)}
              className={cn(
                "flex items-center gap-3 py-4 px-6 rounded-xl border-2 font-bold transition-all text-lg",
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
