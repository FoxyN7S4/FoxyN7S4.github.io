const grid = document.getElementById("grid");
const player = document.getElementById("player");
const playerVideo = player.querySelector("video");
const playerCase = player.querySelector(".case");

for (const w of WORKS) {
  const card = document.createElement("button");
  card.className = "card";
  card.dataset.cat = w.cat;
  card.innerHTML = `
    <video src="media/${w.id}.mp4" poster="media/${w.id}.webp" muted loop playsinline preload="none"></video>
    <span class="label"><b>${w.brand}</b>${w.title}</span>`;
  const v = card.querySelector("video");
  card.addEventListener("mouseenter", () => v.play().catch(() => {}));
  card.addEventListener("mouseleave", () => { v.pause(); v.currentTime = 0; });
  card.addEventListener("click", () => open(w));
  grid.append(card);
}

function open(w) {
  playerVideo.src = `media/${w.id}.mp4`;
  playerVideo.poster = `media/${w.id}.webp`;
  playerVideo.muted = false;
  const rows = [["Task", w.task], ["Role", w.role], ["Result", w.result]]
    .filter(([, v]) => v)
    .map(([k, v]) => `<p><b>${k}</b> ${v}</p>`).join("");
  playerCase.innerHTML = `<h3>${w.brand} · ${w.title}</h3>${rows}`;
  player.showModal();
  playerVideo.play().catch(() => {});
}

player.addEventListener("close", () => { playerVideo.pause(); playerVideo.removeAttribute("src"); });
player.querySelector(".close").addEventListener("click", () => player.close());
player.addEventListener("click", (e) => { if (e.target === player) player.close(); });

document.querySelectorAll(".filters button").forEach((b) => {
  b.addEventListener("click", () => {
    document.querySelector(".filters .active").classList.remove("active");
    b.classList.add("active");
    const f = b.dataset.filter;
    grid.querySelectorAll(".card").forEach((c) => {
      c.hidden = f !== "all" && c.dataset.cat !== f;
    });
  });
});
