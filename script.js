/* ========================================================================
   SAMUEL.DEV — Portfolio Interactivity
   ======================================================================== */

(() => {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  /* ============================================================
     1. Custom cursor
     ============================================================ */
  function initCursor() {
    if (isMobile || prefersReducedMotion) return;

    const dot = $("#cursor-dot");
    const ring = $("#cursor-ring");
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverables =
      "a, button, input, textarea, .project-card, .nav-link, .social-link";
    $$(hoverables).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        dot.classList.add("hovering");
        ring.classList.add("hovering");
      });
      el.addEventListener("mouseleave", () => {
        dot.classList.remove("hovering");
        ring.classList.remove("hovering");
      });
    });
  }

  /* ============================================================
     2. Particle network canvas
     ============================================================ */
  function initParticles() {
    if (prefersReducedMotion) return;

    const canvas = $("#particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const PARTICLE_COUNT_BASE = isMobile ? 50 : 110;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.scale(DPR, DPR);

      const count = Math.floor(
        (PARTICLE_COUNT_BASE * (width * height)) / (1920 * 1080),
      );
      particles = Array.from({ length: count }, () => createParticle());
    }

    function createParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.4 + 0.6,
      };
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      // Update + draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const force = (130 - dist) / 130;
          p.x += (dx / dist) * force * 1.4;
          p.y += (dy / dist) * force * 1.4;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 240, 255, 0.85)";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 6;
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Connections
      const MAX_DIST = isMobile ? 90 : 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const opacity = (1 - d / MAX_DIST) * 0.35;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Mouse connections
      if (mouse.x > 0 && mouse.y > 0) {
        particles.forEach((p) => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) {
            const opacity = (1 - d / 160) * 0.55;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(255, 0, 234, ${opacity})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        });
      }

      requestAnimationFrame(step);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    resize();
    step();
  }

  /* ============================================================
     3. Reveal on scroll
     ============================================================ */
  function initReveal() {
    const items = $$("[data-reveal]");
    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger
            setTimeout(() => entry.target.classList.add("is-visible"), i * 90);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    items.forEach((el) => io.observe(el));
  }

  /* ============================================================
     4. Active nav highlighting
     ============================================================ */
  function initNavActive() {
    const sections = ["hero", "stack", "projects", "contact"];
    const navLinks = $$(".nav-link");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle("active", link.dataset.section === id);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    // Nav scroll appearance
    const nav = $("#nav");
    window.addEventListener(
      "scroll",
      () => {
        if (!nav) return;
        nav.classList.toggle("scrolled", window.scrollY > 30);
      },
      { passive: true },
    );
  }

  /* ============================================================
     5. Typing effect
     ============================================================ */
  function initTyped() {
    const el = $("#typed-text");
    if (!el) return;

    const phrases = [
      "Building scalable web platforms...",
      "Designing elegant user interfaces...",
      "Optimizing backend performance...",
      "Shipping features at terminal velocity...",
      "Architecting distributed systems...",
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const TYPE_SPEED = 55;
    const DELETE_SPEED = 30;
    const HOLD_TIME = 1800;

    function tick() {
      const current = phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, HOLD_TIME);
          return;
        }
        setTimeout(tick, TYPE_SPEED + Math.random() * 40);
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    }
    tick();
  }

  /* ============================================================
     7. Tech progress bar animation
     ============================================================ */
  function initSkillBars() {
    const fills = $$(".tech-progress-bar");
    if (!fills.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const level = el.dataset.level || 0;
            setTimeout(() => {
              el.style.width = level + "%";
            }, 200);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.3 },
    );

    fills.forEach((el) => io.observe(el));
  }

  /* ============================================================
     8. Uptime counter
     ============================================================ */
  function initUptime() {
    const el = $("#uptime");
    if (!el) return;
    const start = Date.now();
    function update() {
      const seconds = Math.floor((Date.now() - start) / 1000);
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      el.textContent = `${h}:${m}:${s}`;
    }
    update();
    setInterval(update, 1000);
  }

  /* ============================================================
     9. Contact form validation + fake submit
     ============================================================ */
  function initContactForm() {
    const form = $("#contact-form");
    if (!form) return;
    const response = $("#form-response");

    function setStatus(field, msg, type) {
      const wrapper = field.closest(".input-wrapper");
      const status = document.querySelector(`[data-status-for="${field.id}"]`);
      if (wrapper) wrapper.classList.toggle("error", type === "error");
      if (status) {
        status.textContent = msg || "";
        status.classList.remove("error", "success");
        if (type) status.classList.add(type);
      }
    }

    function validateField(field) {
      const value = field.value.trim();
      if (!value) {
        setStatus(field, "× required", "error");
        return false;
      }
      if (field.type === "email") {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!ok) {
          setStatus(field, "× invalid email format", "error");
          return false;
        }
        setStatus(field, "✓ valid", "success");
        return true;
      }
      if (field.tagName === "TEXTAREA" && value.length < 10) {
        setStatus(field, "× minimum 10 chars", "error");
        return false;
      }
      setStatus(field, "✓ ok", "success");
      return true;
    }

    ["name", "email", "message"].forEach((id) => {
      const field = document.getElementById(id);
      if (!field) return;
      field.addEventListener("blur", () => {
        if (field.value.trim()) validateField(field);
      });
      field.addEventListener("input", () => {
        const wrapper = field.closest(".input-wrapper");
        if (wrapper?.classList.contains("error") && field.value.trim()) {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = ["name", "email", "message"]
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      const allValid = fields.every(validateField);
      if (!allValid) {
        response.textContent = "× form_validation_failed // fix errors above";
        response.classList.add("show", "error-state");
        response.classList.remove("success");
        return;
      }

      const btn = $(".btn-submit", form);
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      const subject = "Project Inquiry";
      const body = `Name: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0A%0AMessage:%0A${encodeURIComponent(message)}`;

      const mailtoUrl = `mailto:danielsamuel730@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

      response.textContent = "> opening email client...";
      response.classList.add("show");
      response.classList.remove("success", "error-state");

      btn.disabled = true;
      $(".btn-text", btn).textContent = "OPENING...";

      setTimeout(() => {
        window.location.href = mailtoUrl;
        form.reset();
        fields.forEach((f) => setStatus(f, "", null));
        response.textContent = "✓ email_client_opened";
        response.classList.add("success");
        response.classList.remove("error-state");
        setTimeout(() => {
          btn.disabled = false;
          $(".btn-text", btn).textContent = "SEND_MESSAGE";
        }, 2500);
      }, 600);
    });
  }

  /* ============================================================
     10. Project card 3D tilt
     ============================================================ */
  function initTilt() {
    if (isMobile || prefersReducedMotion) return;
    const cards = $$(".project-card");
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -4;
        const rotateY = ((x - cx) / cx) * 4;
        card.style.transform = `translateY(-4px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ============================================================
     11. Tech card brand colors
     ============================================================ */
  function initTechCardColors() {
    const cards = $$(".tech-card[data-color]");
    cards.forEach((card) => {
      const color = card.dataset.color;
      if (!color) return;
      card.style.setProperty("--logo-color", color);
      // Pick readable text color based on luminance
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      card.style.setProperty("--logo-text", lum > 0.6 ? "#05050a" : "#ffffff");
    });
  }

  /* ============================================================
     12. ASCII art scramble effect on hero load
     ============================================================ */
  function initAsciiScramble() {
    const pre = $(".ascii-art");
    if (!pre) return;
    const target = pre.textContent;
    const chars = "!<>-_\\/[]{}—=+*^?#@$%&";
    let frame = 0;

    function scramble() {
      let output = "";
      for (let i = 0; i < target.length; i++) {
        if (target[i] === " " || target[i] === "\n") {
          output += target[i];
        } else if (frame / 2 > i) {
          output += target[i];
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      pre.textContent = output;
      frame++;
      if (frame < target.length * 2) {
        setTimeout(scramble, 28);
      } else {
        pre.textContent = target;
      }
    }
    if (!prefersReducedMotion) scramble();
  }

  /* ============================================================
     Boot
     ============================================================ */
  function boot() {
    initCursor();
    initParticles();
    initReveal();
    initNavActive();
    initTyped();
    initSkillBars();
    initUptime();
    initContactForm();
    initTilt();
    initTechCardColors();
    initAsciiScramble();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
