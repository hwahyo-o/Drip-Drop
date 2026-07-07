import { saveCafeFromAdmin } from "./cafeStore.js";

export function renderAdminPanel(container, { user, profile, onSaved }) {
  if (!user || profile?.role !== "admin") {
    container.innerHTML = `<p class="muted">관리자 권한이 필요합니다.</p>`;
    return;
  }

  container.innerHTML = `
    <section class="admin-shell">
      <div class="section-heading"><div><p class="eyebrow">Admin verification dashboard</p><h2>네이버 지도 실존 검증</h2></div></div>
      <div class="admin-infographic" aria-label="검증 단계"><span>01 네이버 지도에서 카페명 검색</span><span>02 실존 장소와 주소 확인</span><span>03 검증 완료 후 공개 승인</span></div>
      <form id="adminCafeForm" class="admin-grid">
        <div class="admin-two"><label>카페명 <input name="name" required></label><label>네이버 검색명 <input name="naverPlaceName" placeholder="네이버 검색란에는 이 이름만 사용됩니다"></label></div>
        <label>주소 <input name="address" required></label>
        <div class="admin-two"><label>위도 <input name="lat" required></label><label>경도 <input name="lng" required></label></div>
        <div class="admin-two"><label>평점 <input name="rating" type="number" min="0" max="5" step="0.1" value="4.5"></label><label>운영시간 설명 <input name="hoursText" placeholder="예: 매일 10:00-21:00"></label></div>
        <label>메뉴 JSON <textarea name="menus" placeholder='[{"name":"필터 커피","price":"7,000원"}]'></textarea></label>
        <label>태그 <input name="tags" placeholder="필터, 원두판매, 산미"></label>
        <label>편의시설 <input name="facilities" placeholder="wifi, parking, outlet"></label>
        <div class="admin-checks"><label><input name="naverVerified" type="checkbox" required> 네이버 지도 실존 검증 완료</label><label><input name="approved" type="checkbox" required> 사용자 화면 공개 승인</label></div>
        <button class="wide-button" type="submit">검증 카페 저장</button>
      </form>
    </section>`;

  document.querySelector("#adminCafeForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const tags = splitList(form.get("tags"));
    const cafe = {
      name: form.get("name"),
      naverPlaceName: form.get("naverPlaceName") || form.get("name"),
      address: form.get("address"),
      lat: form.get("lat"),
      lng: form.get("lng"),
      latText: form.get("lat"),
      lngText: form.get("lng"),
      rating: Number(form.get("rating")),
      hoursText: form.get("hoursText"),
      menus: parseJson(form.get("menus"), []),
      tags,
      facilities: splitList(form.get("facilities")),
      beanSales: tags.some((tag) => tag.includes("원두")),
      brewMethods: tags.filter((tag) => ["필터", "브루잉", "드립"].some((needle) => tag.includes(needle))),
      naverVerified: form.get("naverVerified") === "on",
      approved: form.get("approved") === "on"
    };
    await saveCafeFromAdmin(cafe);
    event.currentTarget.reset();
    onSaved?.();
  });
}

function splitList(value) { return String(value || "").split(",").map((item) => item.trim()).filter(Boolean); }
function parseJson(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
