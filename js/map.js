let map;
let cafeLayer;
let userMarker;

export function initMap({ onCafeSelect }) {
  map = L.map("map", { zoomControl: true, preferCanvas: true }).setView([37.5665, 126.978], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Roadmap'
  }).addTo(map);
  cafeLayer = L.layerGroup().addTo(map);
  map.on("click", () => onCafeSelect(null));
  return map;
}

export function renderCafeMarkers(cafes, onCafeSelect) {
  if (!cafeLayer) return;
  cafeLayer.clearLayers();
  cafes.forEach((cafe) => {
    if (!cafe.lat || !cafe.lng) return;
    const marker = L.marker([Number(cafe.lat), Number(cafe.lng)], { icon: coffeeMakerIcon() })
      .bindPopup(`<strong>${escapeHtml(cafe.name)}</strong><br>${escapeHtml(cafe.address || "관리자 주소 검수 완료")}`)
      .on("click", () => onCafeSelect(cafe));
    marker.addTo(cafeLayer);
  });
}

export function fitToCafes(cafes) {
  const points = cafes.filter((cafe) => cafe.lat && cafe.lng).map((cafe) => [Number(cafe.lat), Number(cafe.lng)]);
  if (!map || !points.length) return;
  map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
}

export function locateUser() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("현재 브라우저에서 위치 기능을 지원하지 않습니다."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy };
        showUserLocation(location);
        resolve(location);
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

export function showUserLocation(location) {
  if (!map) return;
  if (userMarker) userMarker.remove();
  userMarker = L.marker([location.lat, location.lng], { icon: coffeeBeansIcon(), zIndexOffset: 1000 })
    .addTo(map)
    .bindPopup("현재 위치");
  map.setView([location.lat, location.lng], 15);
}

export function distanceKm(lat1, lng1, lat2, lng2) {
  const radius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function coffeeMakerIcon() {
  return L.divIcon({
    className: "coffee-maker-marker",
    iconSize: [48, 58],
    iconAnchor: [24, 54],
    popupAnchor: [0, -48],
    html: `<span class="marker-pin" aria-hidden="true"><svg viewBox="0 0 48 58" focusable="false"><path class="pin-fill" d="M24 57s18-18.2 18-34A18 18 0 0 0 6 23c0 15.8 18 34 18 34Z"/><path class="pin-line" d="M24 52s14.5-15.4 14.5-28.7A14.5 14.5 0 0 0 9.5 23.3C9.5 36.6 24 52 24 52Z"/><path class="maker" d="M17 18h14v6H17v-6Zm2 6h10v10a5 5 0 0 1-5 5 5 5 0 0 1-5-5V24Zm12 4h2a3 3 0 0 1 0 6h-2M19 15h10M21 12h6"/></svg></span>`
  });
}

function coffeeBeansIcon() {
  return L.divIcon({
    className: "coffee-beans-marker",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
    html: `<span class="beans-pulse" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><circle class="beans-ring" cx="24" cy="24" r="21"/><path class="bean bean-a" d="M15 26c-3.2-5.7-1.5-12 3.2-14.7 4.7-2.6 10.4-.5 13.6 5.2-5.4.7-10.1 3.7-13.8 9.2-.9 1.2-1.8 1.4-3 .3Z"/><path class="bean bean-b" d="M33 22c3.2 5.7 1.5 12-3.2 14.7-4.7 2.6-10.4.5-13.6-5.2 5.4-.7 10.1-3.7 13.8-9.2.9-1.2 1.8-1.4 3-.3Z"/><path class="bean-line" d="M20 28c3-5 6-8 10-9M18 31c4-.7 7.2-2.7 10.2-6"/></svg></span>`
  });
}

function toRad(value) { return (value * Math.PI) / 180; }
function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
