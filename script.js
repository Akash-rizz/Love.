
// Edit these values to personalize the experience.
const CONFIG = {
  name: "Ayesha",
  heartPhrases: [
    "I love you, Ayesha",
    "You are special",
    "My favorite person",
    "A little piece of happiness",
    "You make ordinary moments special",
    "Forever in this little universe",
    "Made with love",
    "I love you",
    "Ayesha ♡"
  ],
  letter:
    "This little corner of the internet was created just to make you smile. I hope it brings a little warmth to your day and reminds you that you are special.",
  easterEgg: "I Love You, Ayesha"
};

const $ = id => document.getElementById(id);

const scenes = [
  "intro",
  "heartScene",
  "reveal",
  "letter",
  "ending"
].map($);

const reduced = matchMedia(
  "(prefers-reduced-motion: reduce)"
);

let audio = null;
let secretTaps = 0;

function show(id) {
  scenes.forEach(scene => {
    scene.classList.toggle("active", scene.id === id);
    scene.setAttribute(
      "aria-hidden",
      String(scene.id !== id)
    );
  });

  if (id === "heartScene") {
    buildHeart();
  }
}

function point(t) {
  return {
    x: 50 + 16 * Math.pow(Math.sin(t), 3) * 2.25,
    y:
      49 -
      (
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      ) * 2.45
  };
}

function buildHeart() {
  const box = $("heart");
  box.replaceChildren();

  const items = [];

  for (let i = 0; i < 48; i++) {
    const p = point((2 * Math.PI * i) / 48);

    items.push({
      ...p,
      phrase:
        CONFIG.heartPhrases[
          i % CONFIG.heartPhrases.length
        ],
      delay: reduced.matches ? 0 : i * 35
    });
  }

  for (let i = 0; i < 20; i++) {
    const p = point((2 * Math.PI * i) / 20);
    const scale = i % 2 ? 0.46 : 0.68;

    items.push({
      x: 50 + (p.x - 50) * scale,
      y: 49 + (p.y - 49) * scale,
      phrase:
        CONFIG.heartPhrases[
          (i + 2) % CONFIG.heartPhrases.length
        ],
      delay: reduced.matches ? 0 : (48 + i) * 35
    });
  }

  items.forEach(item => {
    const span = document.createElement("span");

    span.className = "word";
    span.textContent = item.phrase;
    span.style.left =
      Math.max(5, Math.min(95, item.x)) + "%";
    span.style.top =
      Math.max(7, Math.min(91, item.y)) + "%";
    span.style.animationDelay = item.delay + "ms";

    box.append(span);
  });
}

// Main navigation
$("begin").onclick = () => show("heartScene");
$("continue").onclick = () => show("reveal");
$("openLetter").onclick = () => show("letter");
$("back").onclick = () => show("reveal");
$("backLetter").onclick = () => show("letter");

// Open the envelope and reveal the letter
$("envelope").onclick = () => {
  $("envelope").classList.add("open");
  $("envelope").setAttribute("aria-expanded", "true");

  setTimeout(() => {
    $("paper").classList.add("open");
    $("paper").setAttribute("aria-hidden", "false");
    $("closeLetter").focus({ preventScroll: true });
  }, reduced.matches ? 0 : 200);
};

// Close the letter
$("closeLetter").onclick = () => {
  $("paper").classList.remove("open");
  $("paper").setAttribute("aria-hidden", "true");
  $("envelope").classList.remove("open");
  $("envelope").setAttribute("aria-expanded", "false");
  $("envelope").focus({ preventScroll: true });
};

// Hidden surprise: tap the secret heart three times
$("secret").onclick = () => {
  secretTaps++;

  if (secretTaps >= 3) {
    $("secretReveal").hidden = false;
  }

  $("secret").style.transform =
    `scale(${1 + Math.min(secretTaps, 3) * 0.06})`;
};

// Replay the entire experience
$("replay").onclick = () => {
  secretTaps = 0;
  $("secretReveal").hidden = true;

  $("paper").classList.remove("open");
  $("paper").setAttribute("aria-hidden", "true");

  $("envelope").classList.remove("open");
  $("envelope").setAttribute("aria-expanded", "false");

  show("intro");
};

// Optional music control
$("music").onclick = async () => {
  if (!audio) {
    $("musicLabel").textContent = "Add your own music";

    setTimeout(() => {
      $("musicLabel").textContent = "Music off";
    }, 1800);

    return;
  }

  try {
    if (audio.paused) {
      await audio.play();
      $("musicLabel").textContent = "Music on";
      $("music").setAttribute("aria-pressed", "true");
    } else {
      audio.pause();
      $("musicLabel").textContent = "Music off";
      $("music").setAttribute("aria-pressed", "false");
    }
  } catch {
    $("musicLabel").textContent = "Music unavailable";
  }
};

// Cinematic floating particles
// Respects reduced-motion settings and hidden tabs.
(() => {
  const canvas = $("dust");
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  let w, h, raf;
  let particles = [];

  function resize() {
    const d = Math.min(devicePixelRatio || 1, 1.5);

    w = innerWidth;
    h = innerHeight;

    canvas.width = w * d;
    canvas.height = h * d;

    ctx.setTransform(d, 0, 0, d, 0, 0);

    particles = Array.from(
      { length: reduced.matches ? 12 : 32 },
      () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.3,
        a: 0.15 + Math.random() * 0.35,
        s: 0.08 + Math.random() * 0.22
      })
    );
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = `rgba(235, 78, 109, ${p.a})`;
      ctx.fill();

      if (!reduced.matches) {
        p.y -= p.s;

        if (p.y < 0) {
          p.y = h;
          p.x = Math.random() * w;
        }
      }
    });

    if (!document.hidden && !reduced.matches) {
      raf = requestAnimationFrame(draw);
    }
  }

  function start() {
    cancelAnimationFrame(raf);
    draw();
  }

  resize();
  start();

  addEventListener("resize", () => {
    resize();
    start();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      start();
    }
  });
})();
