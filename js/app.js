import { getAuthErrorMessage, getCurrentProfile, getCurrentUser, loginWithGoogle, logout, saveUserTasteProfile, watchAuth } from "./auth.js";
import { buildNaverMapUrl, isCafeOpenNow, loadCafes } from "./cafeStore.js";
import { filterCafes } from "./search.js";
import { initMap, locateUser, renderCafeMarkers } from "./map.js";
import { recommendCafes } from "./recommendations.js";
import { fillProfileForm, readProfileForm } from "./profile.js";
import { loadFavorites, toggleFavorite } from "./favorites.js";
import { buildAnnualReport } from "./reports.js";
import { renderAdminPanel } from "./admin.js";

const state = {
  cafes: [],
  filtered: [],
  keyword: "",
  filters: new Set(),
  selectedCafe: null,
  user: null,
  profile: null,
  favorites: [],
  userLocation: null,
  view: "map"
};

const $ = (selector) => document.querySelector(selector);

document.addEventListener("DOMContentLoaded", boot);

async function boot() {
  bindEvents();
  await initMap({ onCafeSelect: selectCafe });
  requestLocationOnLanding();
  state.cafes = await loadCafes();
  applyFilters();

  watchAuth(async (user, profile) => {
    state.user = user;
    state.profile = profile;
    state.favorites = user ? await loadFavorites(user.uid) : [];
    renderAuth();
    renderAll();
  });
}

function bindEvents() {
  $("#searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.keyword = $("#searchInput").value;
    applyFilters();
  });

  document.querySelectorAll("[data-filter]").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) state.filters.add(input.value);
      else state.filters.delete(input.value);
      applyFilters();
    });
  });

  $("#mapViewButton").addEventListener("click", () => setView("map"));
  $("#listViewButton").addEventListener("click", () => setView("list"));
  $("#loginButton").addEventListener("click", handleLogin);
  $("#logoutButton").addEventListener("click", logout);
  $("#locateButton").addEventListener("click", requestLocationOnLanding);
  $("#allowLocationButton").addEventListener("click", requestLocationOnLanding);
  $("#laterLocationButton").addEventListener("click", hideLocationPrompt);
  $("#dismissLocationPrompt").addEventListener("click", hideLocationPrompt);
  $("#saveProfileButton").addEventListener("click", async () => {
    await saveUserTasteProfile(readProfileForm());
    alert("프로필을 저장했습니다.");
  });
  $("#refreshRecommendationsButton").addEventListener("click", renderRecommendations);

  document.querySelectorAll("[data-drawer-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-drawer-tab]").forEach((tab) => tab.classList.remove("active"));
      button.classList.add("active");
      renderDrawer(button.dataset.drawerTab);
    });
  });
}

async function handleLogin() {
  const button = $("#loginButton");
  try {
    button.disabled = true;
    button.textContent = "로그인 중...";
    await loginWithGoogle();
  } catch (error) {
    alert(getAuthErrorMessage(error));
  } finally {
    button.disabled = false;
    if (!state.user) button.textContent = "Google 로그인";
  }
}

async function requestLocationOnLanding() {
  try {
    state.userLocation = await locateUser();
    hideLocationPrompt();
    renderRecommendations();
  } catch (error) {
    $("#locationPrompt")?.classList.add("is-warning");
    const copy = $("#locationPrompt p");
    if (copy) copy.textContent = "위치 권한이 거부되었거나 사용할 수 없습니다. 검색으로 지역을 찾을 수 있어요.";
  }
}

function hideLocationPrompt() {
  $("#locationPrompt")?.classList.add("hidden");
}

function applyFilters() {
  state.filtered = filterCafes(state.cafes, state);
  renderAll();
}

function renderAll() {
  renderCafeMarkers(state.filtered, selectCafe);
  renderCafeLists();
  renderDetail();
  renderRecommendations();
  renderDrawer(document.querySelector("[data-drawer-tab].active")?.dataset.drawerTab || "favorites");
}

function renderAuth() {
  $("#loginButton").classList.toggle("hidden", Boolean(state.user));
  $("#logoutButton").classList.toggle("hidden", !state.user);
  $("#signedOutState").classList.toggle("hidden", Boolean(state.user));
  $("#signedInState").classList.toggle("hidden", !state.user);
  $("#adminTabButton").classList.toggle("hidden", state.profile?.role !== "admin");

  if (state.user) {
    $("#userSummary").textContent = `${state.user.displayName || state.user.email}님`;
    fillProfileForm(state.profile);
  }
}

function setView(view) {
  state.view = view;
  $("#mapViewButton").classList.toggle("active", view === "map");
  $("#listViewButton").classList.toggle("active", view === "list");
  $(".map-stage").classList.toggle("hidden", view !== "map");
  $("#listStage").classList.toggle("hidden", view !== "list");
}

function selectCafe(cafe) {
  state.selectedCafe = cafe;
  renderDetail();
}

function renderCafeLists() {
  $("#resultCount").textContent = state.filtered.length;
  const html = state.filtered.map(renderCafeCard).join("") || renderEmptyVerifiedState();
  $("#cafeList").innerHTML = html;
  $("#wideCafeList").innerHTML = html;
  bindCardActions();
}

function renderEmptyVerifiedState() {
  return `
    <div class="empty-state">
      <div class="empty-illustration" aria-hidden="true">
        <svg viewBox="0 0 96 72"><path d="M14 57h68M22 47h24v-8H22v8Zm4-8V25h16v14M54 48c0-9 7-16 16-16 5 0 9 2 12 5M58 54h24M63 43l8 8 14-18"/></svg>
      </div>
      <h3>아직 검증 완료된 카페가 없습니다</h3>
      <p>관리자가 네이버 지도에서 실존 여부를 확인하고 승인한 카페만 공개됩니다.</p>
    </div>`;
}

function renderCafeCard(cafe) {
  const active = state.favorites.some((item) => item.cafeId === cafe.id);
  return `
    <article class="cafe-card" data-cafe-card="${escapeHtml(cafe.id)}">
      <div>
        <div class="verified-line"><span>검증 완료</span><i></i></div>
        <h3>${escapeHtml(cafe.name)}</h3>
        <p class="muted">${escapeHtml(cafe.address)}</p>
      </div>
      <div class="meta-row">
        <span class="badge">★ ${cafe.rating || "신규"}</span>
        <span class="tag ${isCafeOpenNow(cafe) ? "" : "warn"}">${isCafeOpenNow(cafe) ? "운영 중" : "운영 확인 필요"}</span>
        ${cafe.beanSales ? `<span class="tag">원두 구매</span>` : ""}
        ${(cafe.brewMethods || []).length ? `<span class="tag">브루잉</span>` : ""}
      </div>
      <div class="tag-row">${(cafe.facilities || []).map((item) => `<span class="tag">${facilityLabel(item)}</span>`).join("")}</div>
      <p class="muted">${escapeHtml((cafe.menus || [])[0]?.name || "메뉴 등록 예정")} ${escapeHtml((cafe.menus || [])[0]?.price || "")}</p>
      <div class="card-actions">
        <button class="primary" type="button" data-select-cafe="${escapeHtml(cafe.id)}">상세</button>
        <button type="button" data-favorite-cafe="${escapeHtml(cafe.id)}">${active ? "찜 해제" : "찜하기"}</button>
        <a href="${buildNaverMapUrl(cafe)}" target="_blank" rel="noopener">네이버 길찾기</a>
      </div>
    </article>
  `;
}

function bindCardActions() {
  document.querySelectorAll("[data-select-cafe]").forEach((button) => {
    button.addEventListener("click", () => {
      const cafe = state.cafes.find((item) => item.id === button.dataset.selectCafe);
      selectCafe(cafe);
      setView("map");
    });
  });

  document.querySelectorAll("[data-favorite-cafe]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!state.user) {
        alert("찜 기능은 로그인이 필요합니다.");
        return;
      }
      const cafeId = button.dataset.favoriteCafe;
      const active = state.favorites.some((item) => item.cafeId === cafeId);
      await toggleFavorite(state.user.uid, cafeId, active);
      state.favorites = await loadFavorites(state.user.uid);
      renderAll();
    });
  });
}

function renderDetail() {
  const panel = $("#detailPanel");
  const cafe = state.selectedCafe;
  if (!cafe) {
    panel.innerHTML = "";
    return;
  }

  panel.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="eyebrow">Naver verified</p>
        <h2>${escapeHtml(cafe.name)}</h2>
        <p class="muted">${escapeHtml(cafe.address)}</p>
      </div>
      <span class="badge">★ ${cafe.rating || "신규"}</span>
    </div>
    <div class="meta-row">
      <span class="tag ${isCafeOpenNow(cafe) ? "" : "warn"}">${isCafeOpenNow(cafe) ? "운영 중" : "운영 확인 필요"}</span>
      <span class="tag">${escapeHtml(cafe.hoursText || "운영시간 관리자 검수 필요")}</span>
    </div>
    <div class="tag-row">${(cafe.facilities || []).map((item) => `<span class="tag">${facilityLabel(item)}</span>`).join("")}</div>
    <div class="compact-list">
      ${(cafe.menus || []).map((menu) => `<p>${escapeHtml(menu.name)} <strong>${escapeHtml(menu.price)}</strong></p>`).join("")}
    </div>
    <p class="muted">${escapeHtml(cafe.description || "")}</p>
    <div class="card-actions">
      <a class="primary" href="${buildNaverMapUrl(cafe)}" target="_blank" rel="noopener">네이버 지도에서 길찾기</a>
    </div>
  `;
}

function renderRecommendations() {
  const list = recommendCafes(state.filtered, state.profile?.tasteProfile, state.userLocation);
  $("#recommendationsList").innerHTML = list.map(({ cafe, score }) => `
    <button class="cafe-card mini" type="button" data-select-cafe="${escapeHtml(cafe.id)}">
      <span class="verified-line"><span>검증</span><i></i></span>
      <strong>${escapeHtml(cafe.name)}</strong>
      <span class="muted">추천 점수 ${Math.round(score)}</span>
    </button>
  `).join("") || `<p class="muted">검증된 카페가 등록되면 취향 추천이 표시됩니다.</p>`;
  bindCardActions();
}

function renderDrawer(tab) {
  const content = $("#drawerContent");
  if (tab === "favorites") {
    const favoriteCafes = state.favorites.map((favorite) => state.cafes.find((cafe) => cafe.id === favorite.cafeId)).filter(Boolean);
    content.innerHTML = favoriteCafes.map(renderCafeCard).join("") || `<p class="muted">찜한 검증 카페가 없습니다.</p>`;
    bindCardActions();
    return;
  }
  if (tab === "community") {
    content.innerHTML = `<div class="panel"><h2>커뮤니티</h2><p class="muted">게시글, 댓글, 대댓글, 공감, 공유 기능을 위한 공간입니다.</p></div>`;
    return;
  }
  if (tab === "reviews") {
    content.innerHTML = `<div class="panel"><h2>내 리뷰</h2><p class="muted">로그인 후 작성한 리뷰가 이곳에 모입니다.</p></div>`;
    return;
  }
  if (tab === "alerts") {
    content.innerHTML = `<div class="panel"><h2>알림</h2><p class="muted">내 글, 댓글, 리뷰에 대한 반응 알림이 이곳에 표시됩니다.</p></div>`;
    return;
  }
  if (tab === "report") {
    const report = buildAnnualReport({ profile: state.profile, favorites: state.favorites, posts: [], reviews: [] });
    content.innerHTML = `<div class="panel"><h2>${report.year} 연간 리포트</h2><p>${escapeHtml(report.tasteSummary)}</p><p><strong>${escapeHtml(report.title)}</strong></p><p>${escapeHtml(report.socialSummary)}</p><p>${escapeHtml(report.nextChallenge)}</p></div>`;
    return;
  }
  if (tab === "admin") {
    renderAdminPanel(content, {
      user: getCurrentUser(),
      profile: getCurrentProfile(),
      onSaved: async () => {
        state.cafes = await loadCafes();
        applyFilters();
      }
    });
  }
}

function facilityLabel(value) {
  return {
    wifi: "Wi-Fi",
    parking: "주차",
    outlet: "콘센트",
    pet: "반려동물",
    takeout: "포장"
  }[value] || value;
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
