import { NAVER_MAP_CLIENT_ID, NAVER_MAP_OPTIONS } from "./mapConfig.js";

const LEAFLET_TILE_STYLE = {
  label: "Roadmap",
  detail: "OpenStreetMap Voyager style",
  url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  options: {
    subdomains: "abcd",
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0
};
const GEOLOCATION_SAMPLE_MS = 8500;
const TARGET_ACCURACY_METERS = 45;
const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

let map;
let provider = "leaflet";
let cafeLayer;
let subwayLayer;
let cafeMarkers = [];
let subwayMarkers = [];
let userMarker;
let activeInfoWindow;
let subwayFetchTimer;
let lastSubwayBoundsKey = "";

export async function initMap({ onCafeSelect }) {
  if (NAVER_MAP_OPTIONS.useNaverStyleMap) {
    try {
      await loadNaverMaps(NAVER_MAP_CLIENT_ID);
      if (window.naver?.maps) {
        provider = "naver";
        initNaverMap(onCafeSelect);
        updateMapCaption("Naver", "NaverStyleMapTypeOption");
        return map;
      }
    } catch (error) {
      console.warn("Naver Maps 초기화에 실패해 Leaflet 지도로 전환합니다.", error);
    }
  }

  provider = "leaflet";
  initLeafletMap(onCafeSelect);
  updateMapCaption(LEAFLET_TILE_STYLE.label, LEAFLET_TILE_STYLE.detail);
  return map;
}

export function renderCafeMarkers(cafes, onCafeSelect) {
  if (!map) return;
  if (provider === "naver") {
    renderNaverCafeMarkers(cafes, onCafeSelect);
    return;
  }
  renderLeafletCafeMarkers(cafes, onCafeSelect);
}

export function locateUser() {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("현재 브라우저에서 위치 기능을 지원하지 않습니다."));
  }

  return getBestBrowserLocation().then((location) => {
    showUserLocation(location);
    return location;
  });
}

export function showUserLocation(location) {
  if (!map) return;
  if (provider === "naver") {
    showNaverUserLocation(location);
    return;
  }
  showLeafletUserLocation(location);
}

export function distanceKm(lat1, lng1, lat2, lng2) {
  const radius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function initNaverMap(onCafeSelect) {
  const maps = window.naver.maps;
  const options = {
    center: new maps.LatLng(NAVER_MAP_OPTIONS.defaultCenter.lat, NAVER_MAP_OPTIONS.defaultCenter.lng),
    zoom: NAVER_MAP_OPTIONS.defaultZoom,
    zoomControl: true,
    zoomControlOptions: {
      position: maps.Position.TOP_RIGHT
    },
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: maps.MapTypeControlStyle.BUTTON,
      position: maps.Position.TOP_RIGHT
    }
  };

  const styledMapType = buildNaverStyledMapType(maps);
  if (styledMapType) {
    const registry = new maps.MapTypeRegistry();
    registry.set("drip-drop-naver", styledMapType);
    options.mapTypes = registry;
    options.mapTypeId = "drip-drop-naver";
  }

  map = new maps.Map("map", options);
  maps.Event.addListener(map, "click", () => onCafeSelect(null));
}

function initLeafletMap(onCafeSelect) {
  map = L.map("map", { zoomControl: true, preferCanvas: true }).setView(
    [NAVER_MAP_OPTIONS.defaultCenter.lat, NAVER_MAP_OPTIONS.defaultCenter.lng],
    12
  );
  L.tileLayer(LEAFLET_TILE_STYLE.url, LEAFLET_TILE_STYLE.options).addTo(map);

  cafeLayer = L.layerGroup().addTo(map);
  subwayLayer = L.layerGroup().addTo(map);
  map.on("click", () => onCafeSelect(null));
  map.on("moveend zoomend", scheduleSubwayStationRefresh);
  scheduleSubwayStationRefresh();
}

function buildNaverStyledMapType(maps) {
  const styleFactory = maps.NaverStyleMapTypeOption || maps.NaverStyleMapTypeOptions;
  if (!styleFactory?.getNormalMap) return null;
  return styleFactory.getNormalMap({
    name: "Drip Drop",
    minZoom: 6,
    maxZoom: 21
  });
}

function renderNaverCafeMarkers(cafes, onCafeSelect) {
  const maps = window.naver.maps;
  clearNaverMarkers();
  cafes.forEach((cafe) => {
    if (!cafe.lat || !cafe.lng) return;
    const marker = new maps.Marker({
      position: new maps.LatLng(Number(cafe.lat), Number(cafe.lng)),
      map,
      title: cafe.name,
      icon: buildNaverIcon("cafe", "coffee_maker", "카페 위치")
    });
    const infoWindow = new maps.InfoWindow({
      content: `<div class="map-info"><strong>${escapeHtml(cafe.name)}</strong><span>${escapeHtml(cafe.address || "관리자 주소 검수 완료")}</span></div>`,
      borderWidth: 0,
      backgroundColor: "transparent",
      disableAnchor: true,
      pixelOffset: new maps.Point(0, -10)
    });
    maps.Event.addListener(marker, "click", () => {
      if (activeInfoWindow) activeInfoWindow.close();
      infoWindow.open(map, marker);
      activeInfoWindow = infoWindow;
      onCafeSelect(cafe);
    });
    cafeMarkers.push(marker);
  });
}

function renderLeafletCafeMarkers(cafes, onCafeSelect) {
  if (!cafeLayer) return;
  cafeLayer.clearLayers();
  cafes.forEach((cafe) => {
    if (!cafe.lat || !cafe.lng) return;
    const marker = L.marker([Number(cafe.lat), Number(cafe.lng)], { icon: materialMarkerIcon("cafe", "coffee_maker") })
      .bindPopup(`<strong>${escapeHtml(cafe.name)}</strong><br>${escapeHtml(cafe.address || "관리자 주소 검수 완료")}`)
      .on("click", () => onCafeSelect(cafe));
    marker.addTo(cafeLayer);
  });
}

function showNaverUserLocation(location) {
  const maps = window.naver.maps;
  if (userMarker) userMarker.setMap(null);
  const position = new maps.LatLng(location.lat, location.lng);
  userMarker = new maps.Marker({
    position,
    map,
    title: "현재 위치",
    zIndex: 1000,
    icon: buildNaverIcon("user", "local_cafe", "현재 위치")
  });
  map.setCenter(position);
  map.setZoom(17);
}

function showLeafletUserLocation(location) {
  const latLng = [location.lat, location.lng];
  if (userMarker) userMarker.remove();

  userMarker = L.marker(latLng, { icon: materialMarkerIcon("user", "local_cafe"), zIndexOffset: 1000 })
    .addTo(map)
    .bindPopup("현재 위치");
  map.setView(latLng, 17);
  scheduleSubwayStationRefresh();
}

function getBestBrowserLocation() {
  return new Promise((resolve, reject) => {
    const samples = [];
    let settled = false;
    let watchId;
    let timeoutId;

    const finish = () => {
      if (settled) return;
      settled = true;
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      clearTimeout(timeoutId);
      const best = samples.sort((a, b) => a.accuracy - b.accuracy)[0];
      if (best) resolve(best);
      else reject(new Error("현재 위치를 확인하지 못했습니다."));
    };

    const onPosition = (position) => {
      const sample = formatLocation(position);
      samples.push(sample);
      if (sample.accuracy <= TARGET_ACCURACY_METERS) finish();
    };

    const onError = (error) => {
      if (samples.length) finish();
      else reject(error);
    };

    navigator.geolocation.getCurrentPosition(onPosition, onError, GEOLOCATION_OPTIONS);
    watchId = navigator.geolocation.watchPosition(onPosition, onError, GEOLOCATION_OPTIONS);
    timeoutId = setTimeout(finish, GEOLOCATION_SAMPLE_MS);
  });
}

function formatLocation(position) {
  const latText = Number(position.coords.latitude).toFixed(20);
  const lngText = Number(position.coords.longitude).toFixed(20);
  return {
    lat: Number(latText),
    lng: Number(lngText),
    latText,
    lngText,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp
  };
}

function scheduleSubwayStationRefresh() {
  if (provider !== "leaflet" || !map || !subwayLayer) return;
  clearTimeout(subwayFetchTimer);
  subwayFetchTimer = setTimeout(refreshSubwayStations, 700);
}

async function refreshSubwayStations() {
  if (provider !== "leaflet" || !map || !subwayLayer || map.getZoom() < 13) {
    clearSubwayMarkers();
    return;
  }

  const bounds = map.getBounds();
  const boundsKey = bounds.toBBoxString();
  if (boundsKey === lastSubwayBoundsKey) return;
  lastSubwayBoundsKey = boundsKey;

  const south = bounds.getSouth();
  const west = bounds.getWest();
  const north = bounds.getNorth();
  const east = bounds.getEast();
  const query = `[out:json][timeout:8];(
    node["railway"="station"]["station"="subway"](${south},${west},${north},${east});
    node["railway"="subway_entrance"](${south},${west},${north},${east});
  );out tags;`;

  try {
    const response = await fetch(`${OVERPASS_ENDPOINT}?data=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`Overpass request failed: ${response.status}`);
    const payload = await response.json();
    renderSubwayStations(payload.elements || []);
  } catch (error) {
    console.warn("지하철역 정보를 불러오지 못했습니다.", error);
  }
}

function renderSubwayStations(elements) {
  clearSubwayMarkers();
  const seen = new Set();
  elements.slice(0, 120).forEach((station) => {
    if (!station.lat || !station.lon) return;
    const name = station.tags?.name || station.tags?.["name:ko"] || "지하철역";
    const key = `${Math.round(station.lat * 10000)}:${Math.round(station.lon * 10000)}:${name}`;
    if (seen.has(key)) return;
    seen.add(key);

    const marker = L.marker([station.lat, station.lon], { icon: subwayStationIcon() })
      .bindPopup(`<strong>${escapeHtml(name)}</strong><br>지하철역`);
    marker.addTo(subwayLayer);
    subwayMarkers.push(marker);
  });
}

function clearSubwayMarkers() {
  subwayMarkers.forEach((marker) => marker.remove());
  subwayMarkers = [];
  subwayLayer?.clearLayers();
}

function buildNaverIcon(type, symbol, label) {
  const maps = window.naver.maps;
  return {
    content: markerHtml(type, symbol, label),
    size: new maps.Size(48, 58),
    anchor: new maps.Point(24, 54)
  };
}

function materialMarkerIcon(type, symbol) {
  return L.divIcon({
    className: `material-map-marker ${type}-marker`,
    iconSize: [48, 58],
    iconAnchor: [24, 54],
    popupAnchor: [0, -48],
    html: markerHtml(type, symbol, type === "user" ? "현재 위치" : "카페 위치")
  });
}

function subwayStationIcon() {
  return L.divIcon({
    className: "subway-station-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
    html: `<span class="subway-station-symbol material-symbols-outlined" role="img" aria-label="지하철역">subway</span>`
  });
}

function markerHtml(type, symbol, label) {
  return `
    <span class="marker-shell marker-${type}" role="img" aria-label="${escapeHtml(label)}">
      <span class="marker-symbol material-symbols-outlined" aria-hidden="true">${escapeHtml(symbol)}</span>
    </span>`;
}

function clearNaverMarkers() {
  cafeMarkers.forEach((marker) => marker.setMap(null));
  cafeMarkers = [];
  if (activeInfoWindow) {
    activeInfoWindow.close();
    activeInfoWindow = null;
  }
}

function loadNaverMaps(clientId) {
  return new Promise((resolve, reject) => {
    if (window.naver?.maps) {
      resolve();
      return;
    }
    const existing = document.getElementById("naver-map-sdk");
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "naver-map-sdk";
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Naver Maps SDK를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
}

function updateMapCaption(label, detail) {
  const caption = document.querySelector(".map-caption");
  if (!caption) return;
  const source = caption.querySelector("span");
  const title = caption.querySelector("strong");
  if (source) source.textContent = label;
  if (title) title.textContent = detail;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}