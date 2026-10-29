const page = document.body.dataset.page;
const player = document.getElementById("player");
const playerMedia = player.querySelector(".media");
const playerCase = player.querySelector(".case");
const canHover = matchMedia("(hover: hover)").matches;
const allWorks = SECTIONS.flatMap((s) => s.works);

// Nav: one link per direction page
const nav = document.getElementById("nav-links");
nav.innerHTML = SECTIONS.map((s) =>
  `<a href="${s.id}.html"${page === s.id ? ' class="active"' : ""}>${s.nav}</a>`).join("")
  + `<a href="automation.html"${page === "automation" ? ' class="active"' : ""}>Automation</a><a href="#contact">Contact</a>`;

function card(w) {
  const el = document.createElement("button");
  el.className = `card ${w.shape}`;
  const media = w.img
    ? `<img src="media/${w.id}.webp" alt="${w.title}" loading="lazy">`
    : `<video src="media/${w.id}.mp4" poster="media/${w.id}.webp" muted loop playsinline preload="none"></video>`;
  el.innerHTML = `${media}<span class="label"><b>${w.brand}</b>${w.title}</span>${w.img ? "" : '<span class="play">▶</span>'}`;
  const v = el.querySelector("video");
  if (v && canHover) {
    el.addEventListener("mouseenter", () => v.play().catch(() => {}));
    el.addEventListener("mouseleave", () => { v.pause(); v.currentTime = 0; });
  }
  el.addEventListener("click", () => open(w));
  return el;
}

function open(w) {
  playerMedia.innerHTML = w.img
    ? `<img src="media/${w.id}.webp" alt="${w.title}">`
    : `<video src="media/${w.id}.mp4" poster="media/${w.id}.webp" controls autoplay playsinline></video>`;
  const rows = [["Task", w.task], ["Role", w.role], ["Result", w.result]]
    .filter(([, v]) => v)
    .map(([k, v]) => `<p><b>${k}</b> ${v}</p>`).join("");
  playerCase.innerHTML = `<h3><span>${w.brand}</span> ${w.title}</h3>${rows}`;
  player.showModal();
}

player.addEventListener("close", () => { playerMedia.innerHTML = ""; });
player.querySelector(".close").addEventListener("click", () => player.close());
player.addEventListener("click", (e) => { if (e.target === player) player.close(); });

if (page === "home") {
  const dirs = document.getElementById("dirs");
  SECTIONS.forEach((s, i) => {
    const c = COVERS[s.id];
    dirs.insertAdjacentHTML("beforeend", `
      <a class="dir" href="${s.id}.html">
        <video src="media/${c}.mp4" poster="media/${c}.webp" muted loop playsinline preload="none"></video>
        <span class="dir-body">
          <span class="num">${String(i + 1).padStart(2, "0")}</span>
          <strong>${s.title}</strong>
          <span class="count">${s.works.length} works →</span>
        </span>
      </a>`);
  });
  dirs.insertAdjacentHTML("beforeend", `
    <a class="dir dir-auto" href="automation.html">
      <span class="dir-body">
        <span class="num">${String(SECTIONS.length + 1).padStart(2, "0")}</span>
        <strong>Automation</strong>
        <span class="count">3 After Effects tools →</span>
      </span>
    </a>`);
  if (canHover) dirs.querySelectorAll(".dir video").forEach((v) => {
    v.parentElement.addEventListener("mouseenter", () => v.play().catch(() => {}));
    v.parentElement.addEventListener("mouseleave", () => v.pause());
  });
  const featured = document.getElementById("featured");
  for (const id of FEATURED) featured.append(card(allWorks.find((w) => w.id === id)));
}

const idx = SECTIONS.findIndex((s) => s.id === page);
if (idx >= 0) {
  const s = SECTIONS[idx];
  document.getElementById("page-head").innerHTML = `
    <a class="back" href="./#directions">← All directions</a>
    <div class="ph-row">
      <span class="num">${String(idx + 1).padStart(2, "0")}</span>
      <div>
        <h1 class="ph-title">${s.title}</h1>
        <p class="sec-lead">${s.lead}</p>
        <ul class="tags">${s.tags.map((t) => `<li>${t}</li>`).join("")}</ul>
      </div>
    </div>`;
  const grid = document.getElementById("works");
  if (s.cols3) grid.classList.add("cols3");
  else if (s.works.filter((w) => w.shape === "h").length >= s.works.length / 3) grid.classList.add("wide");
  for (const w of s.works) grid.append(card(w));
}

// "Next direction" link at the bottom of direction pages
const next = document.getElementById("next");
if (next) {
  const order = [...SECTIONS.map((s) => [s.id, s.title]), ["automation", "Automation"]];
  const i = order.findIndex(([id]) => id === page);
  const [nid, ntitle] = order[(i + 1) % order.length];
  next.innerHTML = `<a href="${nid}.html"><span>Next</span><strong>${ntitle} →</strong></a>`;
}

// Hero fan tilts slightly toward the cursor
const fan = document.querySelector(".hero-fan");
if (fan && canHover && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  fan.addEventListener("mousemove", (e) => {
    const r = fan.getBoundingClientRect();
    fan.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`);
    fan.style.setProperty("--rx", `${((e.clientY - r.top) / r.height - 0.5) * -10}deg`);
  });
  fan.addEventListener("mouseleave", () => { fan.style.removeProperty("--rx"); fan.style.removeProperty("--ry"); });
}

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}, { threshold: 0.05 });
document.querySelectorAll(".section, .contact").forEach((el) => io.observe(el));
