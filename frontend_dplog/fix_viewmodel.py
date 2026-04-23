import re

with open("src/features/ranking/model/useRankingViewModel.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Delete the first fetchRealtime at line 85 (or wherever it was added via replace_file)
content = re.sub(
    r'  const fetchRealtime = useCallback\(\s*\(\s*keyword: string,\s*province: string,\s*lat\?: number,\s*lon\?: number\s*\)\s*=>\s*\{.*?\},\s*\[\],\s*\);\n',
    '',
    content,
    flags=re.DOTALL
)

# And if there was an original one without lat/lon that I didn't replace fully:
content = re.sub(
    r'  const fetchRealtime = useCallback\(\s*\(\s*keyword: string,\s*province: string\s*\)\s*=>\s*\{.*?\},\s*\[\],\s*\);\n',
    '',
    content,
    flags=re.DOTALL
)

# Update the second fetchRealtime bridge wrapper
bridge_target = '''  const fetchRealtime = useCallback(
    async (keyword?: string, province?: string) => {
      console.log('fetchRealtime triggered:', { keyword, province });
      if (keyword !== undefined) setRealtimeKeyword(keyword);
      if (province !== undefined) setRealtimeProvince(province);'''

bridge_replacement = '''  const fetchRealtime = useCallback(
    async (keyword?: string, province?: string, lat?: number, lon?: number) => {
      console.log('fetchRealtime triggered:', { keyword, province, lat, lon });
      if (keyword !== undefined) setRealtimeKeyword(keyword);
      if (province !== undefined) setRealtimeProvince(province);
      if (lat !== undefined) setRealtimeLat(lat);
      if (lon !== undefined) setRealtimeLon(lon);'''

content = content.replace(bridge_target, bridge_replacement)

with open("src/features/ranking/model/useRankingViewModel.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed useRankingViewModel.ts")
