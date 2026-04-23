with open("src/features/ranking/ui/RealtimeRankTable.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Layout
grid_target = '''        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.01]">
            <AnimatePresence>'''

grid_replacement = '''        ) : (
          <div className="flex flex-col gap-3 p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.01] overflow-x-auto">
            <AnimatePresence>'''

content = content.replace(grid_target, grid_replacement)

# 2. Add Link Button
# Replace information block and add the link
info_target = '''                        <p className="text-[11px] sm:text-[12px] text-slate-400 dark:text-slate-500 leading-snug line-clamp-2 mt-auto">
                          {shop.roadAddress || shop.address}
                        </p>
                      </div>
                    </div>
                  </motion.div>'''

info_replacement = '''                        <p className="text-[11px] sm:text-[12px] text-slate-400 dark:text-slate-500 leading-snug line-clamp-2 mt-auto">
                          {shop.roadAddress || shop.address}
                        </p>
                      </div>
                      
                      {/* 가게 바로가기 링크 버튼 */}
                      <div className="flex items-center pl-4 border-l border-slate-100 dark:border-slate-800 ml-auto shrink-0">
                        {shop.placeUrl ? (
                          <a
                            href={shop.placeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <span className="hidden sm:inline">네이버 보기</span>
                            <span>👉</span>
                          </a>
                        ) : (
                          <div className="p-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 text-xs font-bold whitespace-nowrap">
                            링크 탐색 중
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>'''

content = content.replace(info_target, info_replacement)

# 3. Clean up inner card padding
card_target = '''                      'group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl','''
card_replacement = '''                      'group relative p-3 sm:p-4 rounded-2xl border transition-all duration-300 hover:shadow-md min-w-[500px]', // 리더보드 가로폭 확보'''
content = content.replace(card_target, card_replacement)

with open("src/features/ranking/ui/RealtimeRankTable.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("List view replaced grid view!")
