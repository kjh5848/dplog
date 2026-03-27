// Extracts a Naver placeId from various map URLs or a raw numeric ID string.
export function extractNaverPlaceId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(
    /place\/(\d+)|entry\/place\/(\d+)|m\.place\.naver\.com\/[^/]+\/(\d+)|(\d{6,})/,
  );
  return match?.[1] || match?.[2] || match?.[3] || match?.[4] || null;
}

export default extractNaverPlaceId;
