const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const progress = document.querySelector(".progress");
const nav = document.querySelector(".nav");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll(".nav a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const tiltItems = [...document.querySelectorAll("[data-tilt]")];
const copyEmailButton = document.querySelector("#copyEmail");
const cursor = document.querySelector(".cursor");

document.querySelector("#year").textContent = new Date().getFullYear();

function setProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = `${scrolled}%`;
}

function openMenu() {
  nav.classList.add("is-open");
  menuToggle.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  nav.classList.remove("is-open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  nav.classList.contains("is-open") ? closeMenu() : openMenu();
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

function updateActiveNav() {
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const current = sections.find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= 160 && rect.bottom >= 160;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", current && link.getAttribute("href") === `#${current.id}`);
  });
}

function setupReveal() {
  const groups = new Map();
  revealItems.forEach((item) => {
    const parent = item.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(item);
  });
  groups.forEach((items) => {
    items.forEach((item, i) => {
      item.style.setProperty("--reveal-delay", `${Math.min(i, 6) * 75}ms`);
    });
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupTilt() {
  if (prefersReducedMotion) return;

  const tiltElements = tiltItems.filter(item => !item.classList.contains("hero-visual"));

  tiltElements.forEach((item) => {
    item.addEventListener("mousemove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      const rotateX = ((0.5 - y / rect.height)) * 8;

      item.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "";
    });
  });
}

function setupCursor() {
  // STRICT MOBILE KILL SWITCH: Block cursor animation completely on screens <= 980px
  if (prefersReducedMotion || !cursor || window.innerWidth <= 980) {
    if (cursor) cursor.style.display = 'none';
    return;
  }

  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let mouseX = cursorX;
  let mouseY = cursorY;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  document.querySelectorAll("a, button, .project-card, .service-card, .mute-btn").forEach((target) => {
    target.addEventListener("mouseenter", () => cursor.classList.add("is-hovering"));
    target.addEventListener("mouseleave", () => cursor.classList.remove("is-hovering"));
  });
}

function setupEmailMenu() {
  const trigger = document.querySelector("#emailMeBtn");
  const menu = document.querySelector("#emailMenu");
  if (!trigger || !menu) return null;

  function open() {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  }

  function close() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    menu.hidden ? open() : close();
  });

  document.addEventListener("click", (event) => {
    if (!menu.hidden && !menu.contains(event.target) && event.target !== trigger) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      close();
      trigger.focus();
    }
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close);
  });

  return close;
}

function setupCopyEmail(closeEmailMenu) {
  if (!copyEmailButton) return;

  const email = copyEmailButton.dataset.email || "sadarulakshan669@gmail.com";
  const fallbackHint = document.querySelector("#copyFallbackHint");
  let resetTimer;

  function showState(label, revert = true) {
    clearTimeout(resetTimer);
    copyEmailButton.textContent = label;
    if (revert) {
      resetTimer = setTimeout(() => {
        copyEmailButton.textContent = "Copy Email Address";
      }, 2200);
    }
  }

  function legacyCopy() {
    const textarea = document.createElement("textarea");
    textarea.value = email;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, email.length);

    let succeeded = false;
    try {
      succeeded = document.execCommand("copy");
    } catch {
      succeeded = false;
    }
    document.body.removeChild(textarea);
    return succeeded;
  }

  copyEmailButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (fallbackHint) fallbackHint.hidden = true;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(email);
        showState("Email Copied");
        setTimeout(() => closeEmailMenu && closeEmailMenu(), 900);
        return;
      } catch {
        // fall through to legacy copy
      }
    }

    if (legacyCopy()) {
      showState("Email Copied");
      setTimeout(() => closeEmailMenu && closeEmailMenu(), 900);
      return;
    }

    showState("Tap to Select Email", false);
    if (fallbackHint) fallbackHint.hidden = false;
    setTimeout(() => {
      window.location.href = `mailto:${email}`;
    }, 400);
  });
}

// ----------------------------------------------------
// YOUTUBE API SETUP - NOW CONNECTS DIRECTLY TO HTML IFRAME
// ----------------------------------------------------
const ytTag = document.createElement('script');
ytTag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(ytTag, firstScriptTag);

let ytPlayer;
window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new YT.Player('yt-player', {
    events: {
      'onReady': onPlayerReady
    }
  });
};

function onPlayerReady(event) {
  event.target.playVideo();
  setupMuteButton();
}

function setupMuteButton() {
  const muteBtn = document.getElementById('muteBtn');
  if (!muteBtn || !ytPlayer) return;

  const iconMuted = muteBtn.querySelector('.icon-muted');
  const iconUnmuted = muteBtn.querySelector('.icon-unmuted');

  muteBtn.addEventListener('click', () => {
    if (ytPlayer.isMuted()) {
      ytPlayer.unMute();
      iconMuted.style.display = 'none';
      iconUnmuted.style.display = 'block';
    } else {
      ytPlayer.mute();
      iconMuted.style.display = 'block';
      iconUnmuted.style.display = 'none';
    }
  });
}

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------

let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    setProgress();
    updateActiveNav();
    scrollTicking = false;
  });
}, { passive: true });

window.addEventListener("load", () => {
  setProgress();
  updateActiveNav();
});

setupReveal();
setupTilt();
setupCursor();
const closeEmailMenu = setupEmailMenu();
setupCopyEmail(closeEmailMenu);
