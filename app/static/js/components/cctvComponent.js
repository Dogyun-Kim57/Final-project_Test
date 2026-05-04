export function renderCctvList(listEl, cctvs, onClick) {
  listEl.innerHTML = "";

  if (!cctvs || cctvs.length === 0) {
    listEl.innerHTML = "<p>조회된 CCTV가 없습니다.</p>";
    return;
  }

  cctvs.forEach(cctv => {
    const el = document.createElement("div");
    el.className = "cctv-item";
    el.innerText = cctv.name;

    el.addEventListener("click", () => onClick(cctv));
    listEl.appendChild(el);
  });
}