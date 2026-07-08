export const NAVER_MAP_CLIENT_ID = "";

// Security policy: keep this empty for GitHub Pages unless a public browser SDK
// client id with strict domain restrictions is intentionally accepted.
// Drip Drop defaults to Leaflet + OpenStreetMap, which does not require a key.
export const NAVER_MAP_OPTIONS = {
  useNaverStyleMap: Boolean(NAVER_MAP_CLIENT_ID),
  defaultCenter: { lat: 37.5665, lng: 126.978 },
  defaultZoom: 14
};