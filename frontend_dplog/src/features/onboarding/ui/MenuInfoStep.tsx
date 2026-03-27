'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Plus, Trash2, Utensils } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

export const MenuInfoStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState('');
  const [mainMenu, setMainMenu] = useState('');
  const [menuList, setMenuList] = useState<string[]>([]);
  const [menuInput, setMenuInput] = useState('');

  const handleAddMenu = () => {
    if (!menuInput.trim()) return;
    if (menuList.length >= 10) return;
    setMenuList([...menuList, menuInput.trim()]);
    setMenuInput('');
  };

  const removeMenu = (index: number) => {
    setMenuList(menuList.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('food_category', category);
    params.set('main_menu', mainMenu);
    params.set('menu_list', menuList.join(','));
    
    // Route to Keyword Strategy (Existing)
    router.push(`/05-keywords?${params.toString()}&type=existing`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          어떤 메뉴를 판매하시나요?
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          메뉴 구성을 분석하여 트렌드에 맞는<br/>
          신메뉴 제안이나 가격 전략을 수립해드립니다.
        </p>
      </div>

      <div className="w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 mb-8">
        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">음식 카테고리</label>
          <Select onValueChange={setCategory}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="korean">한식</SelectItem>
              <SelectItem value="western">양식</SelectItem>
              <SelectItem value="chinese">중식</SelectItem>
              <SelectItem value="japanese">일식</SelectItem>
              <SelectItem value="cafe">카페/디저트</SelectItem>
              <SelectItem value="chicken">치킨/호프</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Menu */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">대표 메뉴 (시그니처)</label>
          <div className="relative">
            <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="예: 숙성 삼겹살, 바질 파스타" 
              className="pl-10 h-12"
              value={mainMenu}
              onChange={(e) => setMainMenu(e.target.value)}
            />
          </div>
        </div>

        {/* Menu List */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
            전체 메뉴 리스트 
            <span className="text-slate-400 font-normal ml-2 text-xs">(최대 10개)</span>
          </label>
          <div className="flex gap-2">
            <Input 
              placeholder="메뉴명 입력" 
              className="h-12"
              value={menuInput}
              onChange={(e) => setMenuInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMenu()}
            />
            <Button onClick={handleAddMenu} variant="outline" className="h-12 w-12 p-0 shrink-0">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl min-h-[100px]">
             {menuList.length === 0 && (
               <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                 등록된 메뉴가 없습니다
               </div>
             )}
             {menuList.map((menu, idx) => (
               <div key={idx} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-sm shadow-sm">
                 <span>{menu}</span>
                 <button onClick={() => removeMenu(idx)} className="text-slate-400 hover:text-red-500">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}
          </div>
        </div>
      </div>

      <Button
        onClick={handleNext}
        size="lg"
        className="w-full max-w-md h-12 text-lg rounded-xl"
      >
        다음 단계로
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
};
