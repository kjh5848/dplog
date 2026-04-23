import re

with open("src/features/ranking/ui/RealtimeRankTable.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. onSearch 타입 변경 (lat, lon 추가)
content = content.replace(
    'onSearch: (keyword: string, province: string) => void;',
    'onSearch: (keyword: string, province: string, lat?: number, lon?: number) => void;'
)

# 2. handleSearch 수정
handle_search_target = '''  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onSearch(keyword, province);
  };'''

handle_search_replacement = '''  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onSearch(keyword, province, lat, lon);
  };

  const [lat, setLat] = useState<number | undefined>();
  const [lon, setLon] = useState<number | undefined>();
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("브라우저가 위치 정보를 지원하지 않습니다.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
        setIsLocating(false);
        // 위치를 가져왔으므로 곧바로 검색 실행 트리거를 원한다면 여기서 onSearch 호출 가능
        alert("현재 위치 정보가 반영되었습니다! 이제 검색 버튼을 누르시면 해당 위치 기준 순위가 조회됩니다.");
      },
      (err) => {
        setIsLocating(false);
        alert("위치 정보를 가져오는데 실패했습니다: " + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };'''

content = content.replace(handle_search_target, handle_search_replacement)

# 3. GPS 버튼 추가 (select 윗쪽이나 select를 대체, 하지만 select 옆에 추가)
select_target = '''          {/* 드롭다운 왼쪽(앞쪽)으로 이동 */}
          <select'''

select_replacement = '''          {/* 드롭다운 왼쪽(앞쪽)으로 이동 */}
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className={cn(
                "px-3 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 transition-all text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 shrink-0",
                lat ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30" : "bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10"
              )}
            >
              {isLocating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
              {lat ? "위치 적용됨" : "내 위치"}
            </button>
            <select'''

content = content.replace(select_target, select_replacement)
content = content.replace('</select>', '</select>\n          </div>')

with open("src/features/ranking/ui/RealtimeRankTable.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("GPS feature added to RealtimeRankTable.tsx")
