import re

with open("src/features/ranking/ui/RealtimeRankTable.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. State 추가
state_target = '''  const [keyword, setKeyword] = useState(initialKeyword || "");
  const [province, setProvince] = useState(initialProvince || "서울");'''

state_replacement = '''  const [keyword, setKeyword] = useState(initialKeyword || "");
  const [province, setProvince] = useState(initialProvince || "서울");
  const [selectedStore, setSelectedStore] = useState<RealtimeRank | null>(null);

  // 검색 시 선택된 상점 초기화
  useEffect(() => {
    setSelectedStore(null);
  }, [ranks]);'''

if "const [selectedStore" not in content:
    content = content.replace(state_target, state_replacement)


# 2. Layout Structure 변경 (flex-row 마스터-디테일)
# 찾을 대상: {/* 카드 그리드 리스트 */} 부터 시작되는 부분을 좌측 컨테이너로 감싸고, 우측 컨테이너 추가.
layout_header_target = '''      {/* 카드 그리드 리스트 */}
      <div className="bg-slate-50/50 dark:bg-white/[0.01]">'''

layout_header_replacement = '''      {/* 2열 스플릿 뷰 컨테이너 (좌측 리스트 / 우측 미리보기) */}
      <div className="flex flex-col lg:flex-row bg-slate-50/50 dark:bg-white/[0.01] min-h-[600px]">
        {/* 좌측 1열: 리스트 (스크롤) */}
        <div className="w-full lg:w-[55%] border-r border-slate-100 dark:border-white/[0.04] h-[800px] overflow-y-auto">'''

if "2열 스플릿 뷰 컨테이너" not in content:
    content = content.replace(layout_header_target, layout_header_replacement)


# 3. 우측 컨테이너 (Preview Iframe) 닫기 및 푸터 전 추가
footer_target = '''      {/* 푸터 */}
      {ranks.length > 0 && ('''

preview_panel_code = '''        </div> {/* End of 좌측 1열 */}

        {/* 우측 2열: 네이버 플레이스 미리보기 (Sticky 고정) */}
        <div className="hidden lg:block w-[45%] h-[800px] sticky top-0 bg-white dark:bg-[#0b1120]">
          {selectedStore ? (
            <div className="w-full h-full flex flex-col">
              {/* 상단 툴바 */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedStore.shopName}
                  </span>
                  {selectedStore.rank && (
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                      {selectedStore.rank}위
                    </span>
                  )}
                </div>
                {selectedStore.placeUrl && (
                  <a 
                    href={selectedStore.placeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 transition-colors font-semibold shadow-sm"
                  >
                    <span>새 창으로 열기</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              {/* Iframe View */}
              {selectedStore.placeUrl ? (
                <iframe
                  src={selectedStore.placeUrl}
                  className="w-full flex-1 border-none bg-slate-50 dark:bg-slate-900/50"
                  title="Naver Place Preview"
                  loading="lazy"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <Globe className="size-10 mb-3 opacity-20" />
                  <p className="text-sm">링크 정보가 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="size-16 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center mb-4">
                <MousePointerClick className="size-8 text-blue-400 opacity-60" />
              </div>
              <p className="font-semibold text-slate-500 dark:text-slate-400">가게를 선택해보세요</p>
              <p className="text-sm mt-1">좌측 리스트에서 카드를 클릭하면 상세 정보가 표시됩니다.</p>
            </div>
          )}
        </div>
      </div> {/* End of 스플릿 뷰 */}

      {/* 푸터 */}
      {ranks.length > 0 && ('''

if "End of 스플릿 뷰" not in content:
    content = content.replace(footer_target, preview_panel_code)


# 4. 카드에 onClick 이벤트와 Hover/Active 스타일(isSelected) 부여
card__ui_target = '''                  <motion.div
                    key={shop.shopId}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.3 }}
                    className={cn(
                      'group relative p-3 sm:p-4 rounded-2xl border transition-all duration-300 hover:shadow-md min-w-[500px]', // 리더보드 가로폭 확보
                      isMyShop
                        ? 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/40 shadow-md shadow-blue-500/10'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800',
                    )}
                  >'''

card_ui_replacement = '''                  <motion.div
                    key={shop.shopId}
                    onClick={() => setSelectedStore(shop)}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.3 }}
                    className={cn(
                      'group relative p-3 sm:p-4 rounded-2xl border transition-all duration-300 hover:shadow-md min-w-full cursor-pointer', // min-w-[500px] 제거하고 부모 컨테이너에 맞춤
                      selectedStore?.shopId === shop.shopId
                        ? 'bg-blue-50/50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 scale-[1.01] shadow-lg ring-1 ring-blue-400/50'
                        : isMyShop
                          ? 'bg-blue-50/20 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                    )}
                  >'''

if "onClick={() => setSelectedStore(shop)}" not in content:
    # Notice: the previous patch string `min-w-[500px]` might be different if I edited it.
    import re
    content = re.sub(
        r'<motion\.div\s+key=\{shop\.shopId\}\s+initial=\{\{.*?\s+animate=\{\{.*?\s+transition=\{\{.*?\s+className=\{cn\([^)]+\)\}\s+>',
        card_ui_replacement,
        content,
        flags=re.DOTALL
    )

# Also ensure icons imports `ExternalLink, Globe, MousePointerClick, ChevronRight` are present.
import_target = '''import { Search, MapPin, Loader2, Star, TrendingUp } from "lucide-react";'''
import_replacement = '''import { Search, MapPin, Loader2, Star, TrendingUp, ExternalLink, Globe, MousePointerClick } from "lucide-react";'''
if "MousePointerClick" not in content and "import { Search" in content:
    content = content.replace(import_target, import_replacement)

# Finally, some small bug fixes: The `selectedStore` effect needs `useEffect` imported.
import_react_target = '''import { useState } from "react";'''
import_react_replacement = '''import { useState, useEffect } from "react";'''
if "useEffect" not in content and "import { useState" in content:
    content = content.replace(import_react_target, import_react_replacement)


with open("src/features/ranking/ui/RealtimeRankTable.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Split logic injected!")
