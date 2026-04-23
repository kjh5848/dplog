import re

with open("src/features/ranking/ui/RealtimeRankTable.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. 랭크 오버레이 뱃지를 조건부로 변경하여 광고 표시 적용
badge_pattern = re.compile(r'{/\* 랭크 오버레이 뱃지 \*/\}\s*<div className="absolute -bottom-2 -left-2 z-10">\s*<RankBadge rank=\{shop\.rank\} />\s*</div>')

ad_badge_replacement = '''{/* 랭크 오버레이 뱃지 (광고/일반 분기) */}
                        <div className="absolute -bottom-2 -left-2 z-10">
                           {shop.isAd ? (
                             <div className="bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-md border border-slate-700">
                               AD 광고
                             </div>
                           ) : (
                             <RankBadge rank={shop.rank} />
                           )}
                        </div>'''

content = badge_pattern.sub(ad_badge_replacement, content)

with open("src/features/ranking/ui/RealtimeRankTable.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("UI Patch applied to RealtimeRankTable.tsx")
