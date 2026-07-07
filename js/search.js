import { isCafeOpenNow } from "./cafeStore.js";

export function filterCafes(cafes, state) {
  const keyword = normalize(state.keyword);
  const filters = state.filters;
  return cafes.filter((cafe) => {
    const text = normalize([
      cafe.name,
      cafe.address,
      cafe.description,
      ...(cafe.tags || []),
      ...(cafe.facilities || []),
      ...(cafe.menus || []).map((menu) => `${menu.name} ${menu.price}`),
      ...(cafe.beans || []).map((bean) => `${bean.name} ${bean.notes}`)
    ].join(" "));
    if (keyword && !text.includes(keyword)) return false;
    if (filters.has("beans") && !cafe.beanSales) return false;
    if (filters.has("filter") && !hasBrewMethod(cafe)) return false;
    if (filters.has("open") && !isCafeOpenNow(cafe)) return false;
    if (filters.has("parking") && !(cafe.facilities || []).includes("parking")) return false;
    if (filters.has("wifi") && !(cafe.facilities || []).includes("wifi")) return false;
    return true;
  });
}

export function normalize(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function hasBrewMethod(cafe) {
  return (cafe.brewMethods || []).some((method) => {
    const normalized = normalize(method);
    return ["filter", "brewing", "drip", "필터", "브루잉", "드립"].some((needle) => normalized.includes(needle));
  });
}
