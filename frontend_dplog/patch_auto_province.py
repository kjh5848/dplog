import re

with open("src/features/ranking/ui/RealtimeRankTable.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add findClosestProvince logic right before handleGetLocation
target_code = '''  const handleGetLocation = () => {'''

replacement_code = '''  const findClosestProvince = (lat: number, lon: number): string => {
    const provinceCoords: Record<string, [number, number]> = {
      '서울': [37.5665, 126.9780],
      '경기': [37.2636, 127.0286], // 수원 기준
      '인천': [37.4563, 126.7052],
      '부산': [35.1796, 129.0756],
      '대구': [35.8714, 128.6014],
      '대전': [36.3504, 127.3845],
      '광주': [35.1595, 126.8526],
      '울산': [35.5384, 129.3114],
      '세종': [36.4800, 127.2890],
      '강원': [37.8813, 127.7298], // 춘천 기준
      '충북': [36.6356, 127.4913], // 청주 기준
      '충남': [36.6588, 126.6728], // 내포 기준
      '전북': [35.8242, 127.1480], // 전주 기준
      '전남': [34.8161, 126.4629], // 무안 기준
      '경북': [36.5760, 128.5056], // 안동 기준
      '경남': [35.2383, 128.6922], // 창원 기준
      '제주': [33.4890, 126.4983],
    };

    let closest = '서울';
    let minDistance = Infinity;

    for (const [prov, [pLat, pLon]] of Object.entries(provinceCoords)) {
      // 단순 유클리디안 거리 (정밀 역지오코딩 없이 가장 가까운 도심을 찾음)
      const dist = Math.pow(lat - pLat, 2) + Math.pow(lon - pLon, 2);
      if (dist < minDistance) {
        minDistance = dist;
        closest = prov;
      }
    }
    return closest;
  };

  const handleGetLocation = () => {'''

content = content.replace(target_code, replacement_code)

# Add setProvince call into getCurrentPosition success callback
success_target = '''        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
        setIsLocating(false);
        alert("현재 위치 정보가 반영되었습니다! 이제 검색 버튼을 누르시면 해당 위치 기준 순위가 조회됩니다.");'''

success_replacement = '''        const newLat = pos.coords.latitude;
        const newLon = pos.coords.longitude;
        setLat(newLat);
        setLon(newLon);
        setIsLocating(false);
        
        // GPS 좌표 기반으로 가장 가까운 지역(도/광역시) 자동 매핑
        const detectedProvince = findClosestProvince(newLat, newLon);
        setProvince(detectedProvince);
        
        alert(`현재 위치 정보(${detectedProvince} 인근)가 반영되었습니다! 이제 검색 버튼을 누르시면 해당 위치 기준 순위가 조회됩니다.`);'''

content = content.replace(success_target, success_replacement)

with open("src/features/ranking/ui/RealtimeRankTable.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Auto-province set patch applied!")
