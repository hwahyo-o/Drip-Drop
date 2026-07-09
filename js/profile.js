export function readProfileForm() {
  return {
    nickname: document.querySelector("#nicknameInput")?.value.trim() || "",
    taste: document.querySelector("#tasteInput")?.value.trim() || "",
    ownedBeans: document.querySelector("#ownedBeansInput")?.value.trim() || "",
    wantedBeans: document.querySelector("#wantedBeansInput")?.value.trim() || ""
  };
}

export function fillProfileForm(profile) {
  const tasteProfile = profile?.tasteProfile || {};
  setValue("#nicknameInput", tasteProfile.nickname || profile?.displayName);
  setValue("#tasteInput", tasteProfile.taste);
  setValue("#ownedBeansInput", tasteProfile.ownedBeans);
  setValue("#wantedBeansInput", tasteProfile.wantedBeans);
}

function setValue(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.value = value || "";
}