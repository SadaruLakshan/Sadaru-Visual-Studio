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

  tiltItems.forEach((item) => {
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
  if (prefersReducedMotion || !cursor) return;

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

  document.querySelectorAll("a, button, .project-card, .service-card").forEach((target) => {
    target.addEventListener("mouseenter", () => cursor.classList.add("is-hovering"));
    target.addEventListener("mouseleave", () => cursor.classList.remove("is-hovering"));
  });
}

function setupCopyEmail() {
  if (!copyEmailButton) return;

  copyEmailButton.addEventListener("click", async () => {
    const email = "sadarulakshan669@gmail.com";

    try {
      await navigator.clipboard.writeText(email);
      copyEmailButton.textContent = "Email Copied";
      setTimeout(() => {
        copyEmailButton.textContent = "Copy Email";
      }, 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
}

window.addEventListener("scroll", () => {
  setProgress();
  updateActiveNav();
}, { passive: true });

window.addEventListener("load", () => {
  setProgress();
  updateActiveNav();
});

setupReveal();
setupTilt();
setupCursor();
setupCopyEmail();
