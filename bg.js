// Animated background layer drawn into .bg.
// Preview a variant with ?bg=<name>; it is kept while browsing the site in that tab.
// Calm, CSS-only variants: clean, spot, grid, grain, calm, fade. Animated canvas variants: liquid, graph, dots, stars, wire, type.
(() => {
  const DEFAULT = "none"; // "none" keeps the plain gradient blobs
  const store = (k, v) => { try { return v === undefined ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch { return null; } };
  const asked = new URLSearchParams(location.search).get("bg");
  if (asked) store("bg", asked);
  const mode = asked || store("bg") || DEFAULT;
  const host = document.querySelector(".bg");
  if (!host || mode === "none") return;
  if (["clean", "spot", "grid", "grain", "calm", "fade"].includes(mode)) {
    host.dataset.fx = mode;
    if (mode === "spot") addEventListener("pointermove", (e) => {
      host.style.setProperty("--mx", `${e.clientX}px`); host.style.setProperty("--my", `${e.clientY}px`);
    }, { passive: true });
    return;
  }
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.createElement("canvas");
  canvas.className = "bgfx";
  host.append(canvas);
  host.dataset.fx = mode;

  // Pointer in 0..1 page coordinates, eased toward the real cursor each frame.
  // Starts off-screen so touch screens without a pointer show no cursor effect.
  const mouse = { x: -1, y: -1, tx: -1, ty: -1 };
  addEventListener("pointermove", (e) => {
    mouse.tx = e.clientX / innerWidth; mouse.ty = e.clientY / innerHeight;
    if (mouse.x < 0) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
  }, { passive: true });

  let draw, resize;
  if (mode === "liquid") [draw, resize] = liquid() || [];
  else if (mode === "graph") [draw, resize] = graph();
  else if (mode === "dots") [draw, resize] = dots();
  else if (mode === "stars") [draw, resize] = stars();
  else if (mode === "wire") [draw, resize] = wire();
  else if (mode === "type") [draw, resize] = type();
  if (!draw) { canvas.remove(); delete host.dataset.fx; return; }

  resize(); addEventListener("resize", resize);
  const t0 = performance.now();
  let last = 0;
  const frame = (now) => {
    if (!still) requestAnimationFrame(frame);
    if (document.hidden || now - last < 30) return; // ~30 fps is plenty for a background
    last = now;
    mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
    draw((now - t0) / 1000);
  };
  requestAnimationFrame(frame);

  // Slow flowing gradient in the site colors, with a soft light under the cursor
  function liquid() {
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return null;
    const vs = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
    const fs = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
vec2 uv=gl_FragCoord.xy/r;vec2 asp=vec2(r.x/r.y,1.);vec2 p=uv*asp*1.4;float s=t*.035;
vec2 q=vec2(fbm(p+s),fbm(p+vec2(5.2,1.3)-s));
vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+s*1.4),fbm(p+3.*q+vec2(8.3,2.8)-s));
float f=fbm(p+2.4*w);
vec3 pink=vec3(1.,.25,.64),violet=vec3(.49,.3,1.),blue=vec3(.17,.42,1.);
vec3 col=mix(violet,pink,smoothstep(.25,.85,q.x));col=mix(col,blue,smoothstep(.35,.95,w.y));
float g=smoothstep(.38,1.,f)*.5;
vec2 d=(uv-vec2(m.x,1.-m.y))*asp;g+=.22*exp(-dot(d,d)*9.);
vec3 c=vec3(.031,.024,.051)+col*g;c*=1.-.3*length(uv-.5);
gl_FragColor=vec4(c,1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const ur = gl.getUniformLocation(prog, "r"), ut = gl.getUniformLocation(prog, "t"), um = gl.getUniformLocation(prog, "m");
    return [
      (t) => { gl.uniform1f(ut, t); gl.uniform2f(um, mouse.x, mouse.y); gl.drawArrays(gl.TRIANGLES, 0, 3); },
      () => { // render at half resolution; the blur-like look hides it and saves battery
        canvas.width = Math.ceil(innerWidth / 2); canvas.height = Math.ceil(innerHeight / 2);
        gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(ur, canvas.width, canvas.height);
      },
    ];
  }

  // After Effects graph editor: easing curves that keep re-shaping, keyframes and a moving playhead
  function graph() {
    const ctx = canvas.getContext("2d");
    let w, h, dpr;
    const curves = [
      { y0: 0.78, y1: 0.22, phase: 0, speed: 0.21, sel: true },
      { y0: 0.30, y1: 0.70, phase: 2.1, speed: 0.17 },
      { y0: 0.62, y1: 0.42, phase: 4.2, speed: 0.13, bounce: true },
    ];
    const pt = (c, t, x) => { // control points of one curve at time t
      const e1 = 0.25 + 0.2 * Math.sin(t * c.speed + c.phase), e2 = 0.25 + 0.2 * Math.cos(t * c.speed * 1.3 + c.phase);
      const a = [x[0], c.y0 * h], b = [x[1], c.y1 * h];
      return { a, b, h1: [a[0] + (b[0] - a[0]) * e1, a[1]], h2: [b[0] - (b[0] - a[0]) * e2, b[1]] };
    };
    const bez = (p, u) => {
      const k = 1 - u;
      return [k * k * k * p.a[0] + 3 * k * k * u * p.h1[0] + 3 * k * u * u * p.h2[0] + u * u * u * p.b[0],
              k * k * k * p.a[1] + 3 * k * k * u * p.h1[1] + 3 * k * u * u * p.h2[1] + u * u * u * p.b[1]];
    };
    const diamond = (x, y, s, fill) => {
      ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
    };
    return [
      (t) => {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const scroll = scrollY * 0.08;
        // grid
        ctx.lineWidth = 1;
        for (let x = (-scroll % 80); x < w; x += 80) { ctx.strokeStyle = "rgba(255,255,255,.035)"; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 80) { ctx.strokeStyle = "rgba(255,255,255,.035)"; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, "rgba(255,63,164,.5)"); grad.addColorStop(0.55, "rgba(124,77,255,.5)"); grad.addColorStop(1, "rgba(43,107,255,.5)");
        // playhead
        const px = ((t * 0.07) % 1) * w;
        curves.forEach((c, i) => {
          const keys = [w * -0.05, w * 0.32, w * 0.68, w * 1.05].map((k) => k - scroll * (i + 1) * 0.3);
          for (let s = 0; s < 3; s++) {
            const segment = { ...c, y0: s % 2 ? c.y1 : c.y0, y1: s % 2 ? c.y0 : c.y1 };
            const p = pt(segment, t + s, [keys[s], keys[s + 1]]);
            ctx.beginPath(); ctx.moveTo(p.a[0], p.a[1]);
            if (c.bounce && s === 1) { // overshoot: ease out with a small bounce
              for (let u = 0; u <= 1.001; u += 0.02) {
                const y = p.a[1] + (p.b[1] - p.a[1]) * (1 - Math.cos(u * Math.PI * 2.5) * Math.exp(-u * 4));
                ctx.lineTo(p.a[0] + (p.b[0] - p.a[0]) * u, y);
              }
            } else ctx.bezierCurveTo(p.h1[0], p.h1[1], p.h2[0], p.h2[1], p.b[0], p.b[1]);
            ctx.strokeStyle = grad; ctx.lineWidth = c.sel ? 1.8 : 1.3; ctx.stroke();
            if (c.sel) { // bezier handles of the selected curve
              ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(p.a[0], p.a[1]); ctx.lineTo(p.h1[0], p.h1[1]); ctx.moveTo(p.b[0], p.b[1]); ctx.lineTo(p.h2[0], p.h2[1]); ctx.stroke();
              for (const q of [p.h1, p.h2]) { ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, 7); ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fill(); }
            }
            diamond(p.a[0], p.a[1], c.sel ? 6 : 4.5, "rgba(255,213,74,.55)");
            if (px > p.a[0] && px < p.b[0] && !(c.bounce && s === 1)) { // dot where the playhead crosses the curve
              let lo = 0, hi = 1;
              for (let k = 0; k < 14; k++) { const mid = (lo + hi) / 2; if (bez(p, mid)[0] < px) lo = mid; else hi = mid; }
              const [cx, cy] = bez(p, lo);
              ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.fill();
            }
          }
        });
        ctx.strokeStyle = "rgba(255,63,164,.35)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
        const f = Math.floor(t * 25), tc = `00:00:${String(Math.floor(f / 25) % 60).padStart(2, "0")}:${String(f % 25).padStart(2, "0")}`;
        ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.fillStyle = "rgba(255,63,164,.6)"; ctx.fillText(tc, px + 6, h - 14);
      },
      () => {
        dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
      },
    ];
  }

  // Dot grid with a slow wave; dots near the cursor grow and pick up the accent colors
  function dots() {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, gap;
    return [
      (t) => {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const mx = mouse.x * w, my = mouse.y * h, off = (scrollY * 0.15) % gap;
        for (let y = gap / 2 - off; y < h + gap; y += gap) {
          for (let x = gap / 2; x < w; x += gap) {
            const dx = x - mx, dy = y - my, d = Math.sqrt(dx * dx + dy * dy);
            const lens = Math.max(0, 1 - d / 190);
            const wave = 0.5 + 0.5 * Math.sin(x * 0.012 + y * 0.008 - t * 1.1);
            const r = 0.9 + wave * 0.7 + lens * 2.6;
            const push = lens * 10 / (d || 1);
            ctx.beginPath(); ctx.arc(x + dx * push, y + dy * push, r, 0, 7);
            ctx.fillStyle = lens > 0.02
              ? `rgba(${Math.round(124 + 131 * lens)},${Math.round(77 - 14 * lens)},${Math.round(255 - 91 * lens)},${0.2 + lens * 0.5})`
              : `rgba(255,255,255,${0.07 + wave * 0.09})`;
            ctx.fill();
          }
        }
      },
      () => {
        dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight; gap = w < 760 ? 24 : 28;
        canvas.width = w * dpr; canvas.height = h * dpr;
      },
    ];
  }

  // Drifting particles that link up when close; the cursor pulls nearby ones in
  function stars() {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, pts = [];
    return [
      () => {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const mx = mouse.x * w, my = mouse.y * h;
        for (const p of pts) {
          const dx = mx - p.x, dy = my - p.y, d = Math.hypot(dx, dy);
          if (d < 180 && d > 1) { p.vx += dx / d * 0.012; p.vy += dy / d * 0.012; }
          p.vx *= 0.985; p.vy *= 0.985;
          p.x += p.vx + p.sx; p.y += p.vy + p.sy;
          if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
        }
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 130) {
              ctx.strokeStyle = `rgba(124,77,255,${(1 - d / 130) * 0.5})`; ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
          const dm = Math.hypot(a.x - mx, a.y - my);
          if (dm < 170) {
            ctx.strokeStyle = `rgba(255,63,164,${(1 - dm / 170) * 0.6})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke();
          }
          ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 7); ctx.fillStyle = `rgba(255,255,255,${a.o})`; ctx.fill();
        }
      },
      () => {
        dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        const n = Math.round(Math.min(130, Math.max(45, w * h / 12000)));
        pts = Array.from({ length: n }, () => ({
          x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0,
          sx: (Math.random() - 0.5) * 0.35, sy: (Math.random() - 0.5) * 0.35,
          r: 1 + Math.random() * 1.6, o: 0.35 + Math.random() * 0.5,
        }));
      },
    ];
  }

  // Slowly turning wireframe torus, a nod to the 3D work; it leans toward the cursor
  function wire() {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, cx, cy, size;
    const U = 40, V = 18, R = 1, r = 0.42;
    return [
      (t) => {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const hasMouse = mouse.x >= 0;
        const ax = 1.05 + t * 0.11 + (hasMouse ? (mouse.y - 0.5) * 0.6 : 0);
        const ay = t * 0.17 + (hasMouse ? (mouse.x - 0.5) * 0.8 : 0);
        const sxa = Math.sin(ax), cxa = Math.cos(ax), sya = Math.sin(ay), cya = Math.cos(ay);
        const pts = [];
        for (let i = 0; i < U; i++) {
          const u = i / U * Math.PI * 2;
          for (let j = 0; j < V; j++) {
            const v = j / V * Math.PI * 2;
            let x = (R + r * Math.cos(v)) * Math.cos(u), y = (R + r * Math.cos(v)) * Math.sin(u), z = r * Math.sin(v);
            let y2 = y * cxa - z * sxa, z2 = y * sxa + z * cxa; // rotate around x
            let x3 = x * cya + z2 * sya, z3 = -x * sya + z2 * cya; // rotate around y
            const k = 3.2 / (3.2 + z3);
            pts.push([cx + x3 * size * k, cy + y2 * size * k, z3]);
          }
        }
        ctx.lineWidth = 1;
        for (let i = 0; i < U; i++) for (let j = 0; j < V; j++) {
          const a = pts[i * V + j], b = pts[((i + 1) % U) * V + j], c = pts[i * V + (j + 1) % V];
          const depth = (a[2] + 1.5) / 3; // 0 = near, 1 = far
          const al = 0.1 + (1 - depth) * 0.42;
          ctx.strokeStyle = `rgba(${Math.round(255 - 212 * depth)},${Math.round(63 + 44 * depth)},${Math.round(164 + 91 * depth)},${al})`;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
        }
      },
      () => {
        dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        const narrow = w < 760;
        cx = narrow ? w * 0.5 : w * 0.68; cy = narrow ? h * 0.68 : h * 0.52; size = Math.min(w, h) * (narrow ? 0.34 : 0.3);
      },
    ];
  }

  // Huge outlined words drifting in rows; the row under the cursor lights up
  function type() {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, fs;
    const words = ["MOTION", "3D", "AI", "UA CREATIVES", "AFTER EFFECTS", "BRAND"];
    const rowText = (i) => { let s = ""; for (let k = 0; k < 6; k++) s += words[(i + k) % words.length] + "  ·  "; return s; };
    return [
      (t) => {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.font = `800 ${fs}px Unbounded, Inter, sans-serif`; ctx.textBaseline = "middle"; ctx.lineWidth = 1.4;
        const rowH = fs * 1.15, rows = Math.ceil(h / rowH) + 1, my = mouse.y * h;
        for (let i = 0; i < rows; i++) {
          const y = rowH * (i + 0.5) - (scrollY * 0.1) % rowH;
          const text = rowText(i), tw = ctx.measureText(text).width;
          const dir = i % 2 ? 1 : -1, speed = 18 + (i % 3) * 9;
          let x = ((t * speed * dir) % tw + tw) % tw - tw;
          const near = mouse.y >= 0 ? Math.max(0, 1 - Math.abs(y - my) / rowH) : 0;
          ctx.strokeStyle = near > 0.05 ? `rgba(255,63,164,${0.11 + near * 0.25})` : "rgba(255,255,255,.1)";
          for (; x < w; x += tw) ctx.strokeText(text, x, y);
        }
      },
      () => {
        dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight;
        canvas.width = w * dpr; canvas.height = h * dpr; fs = Math.round(Math.max(64, Math.min(170, h * 0.19)));
      },
    ];
  }
})();
