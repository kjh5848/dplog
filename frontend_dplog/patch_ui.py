import re

with open("src/features/ranking/ui/RealtimeRankTable.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. 폼 순서 변경 (Select 블록을 Input 블록 앞으로 이동)
form_pattern = re.compile(r'(<form[^>]+>)\s*(<div className="flex-1 relative">.*?</div>)\s*(<select.*?</select>)\s*(<button type="submit".*?</button>)\s*(</form>)', re.DOTALL)
content = form_pattern.sub(r'\1\n          \3\n          \2\n          \4\n        \5', content)

# 2. Select 스타일에 width 제한(w-28 shrink-0) 적용
content = content.replace(
    'className="px-4 py-2.5 rounded-xl bg-slate-50',
    'className="w-28 shrink-0 px-4 py-2.5 rounded-xl bg-slate-50 font-semibold'
)

# 3. 테이블 블록을 그리드 레이아웃으로 변경
table_block_pattern = re.compile(r'\{/\* 테이블 \*/\}.*?(?=\{/\* 푸터 \*/\})', re.DOTALL)

grid_layout = '''{/* 카드 그리드 리스트 */}
      <div className="bg-slate-50/50 dark:bg-white/[0.01]">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 h-32 flex gap-4">
                 <div className="size-16 bg-slate-200 dark:bg-white/10 rounded-xl shrink-0" />
                 <div className="flex-1 space-y-3 py-1">
                   <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
                   <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
                   <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
                 </div>
              </div>
            ))}
          </div>
        ) : ranks.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="size-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <MapPin className="size-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">검색 결과가 없습니다.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">상단 검색창에서 키워드를 입력하고 검색해주세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.01]">
            <AnimatePresence>
              {ranks.map((shop, idx) => {
                const isMyShop = myShopId && shop.shopId === myShopId;
                return (
                  <motion.div
                    key={shop.shopId}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.3 }}
                    className={cn(
                      'group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                      isMyShop
                        ? 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/40 shadow-md shadow-blue-500/10'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                    )}
                  >
                    {/* 내 가게 뱃지 플로팅 */}
                    {isMyShop && (
                      <div className="absolute -top-3 -right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-black shadow-lg shadow-blue-500/30 z-10 flex items-center gap-1">
                        <Star className="size-3 fill-white" />
                        내 가게
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4 h-full">
                      {/* 순위 및 이미지 */}
                      <div className="relative shrink-0">
                        {shop.shopImageUrl ? (
                          <img
                            src={shop.shopImageUrl}
                            alt={shop.shopName}
                            className="size-[72px] sm:size-20 rounded-xl object-cover border border-slate-100 dark:border-slate-800"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIgLz48L3N2Zz4=';
                            }}
                          />
                        ) : (
                          <div className="size-[72px] sm:size-20 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <MapPin className="size-6 text-slate-300 dark:text-slate-600" />
                          </div>
                        )}
                        
                        {/* 랭크 오버레이 뱃지 */}
                        <div className="absolute -bottom-2 -left-2 z-10">
                           <RankBadge rank={shop.rank} />
                        </div>
                      </div>

                      {/* 정보 영역 */}
                      <div className="flex-1 min-w-0 py-0.5 relative pr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                           <h4 className={cn(
                             "text-sm sm:text-base font-bold truncate transition-colors w-full",
                             isMyShop ? "text-blue-800 dark:text-blue-400" : "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-amber-400"
                           )}
                           title={shop.shopName}>
                             {shop.shopName}
                           </h4>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-white/5">
                            {shop.category || '기타'}
                          </span>
                          
                          {shop.scoreInfo && shop.scoreInfo !== '없음' && (
                            <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-500/20">
                              <Star className="size-3 fill-amber-500/80" />
                              {shop.scoreInfo}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] sm:text-[12px] text-slate-400 dark:text-slate-500 leading-snug line-clamp-2 mt-auto">
                          {shop.roadAddress || shop.address}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      '''

content = table_block_pattern.sub(grid_layout, content)

with open("src/features/ranking/ui/RealtimeRankTable.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Patch applied to RealtimeRankTable.tsx")
