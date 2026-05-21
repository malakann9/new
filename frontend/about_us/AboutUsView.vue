<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const statEls = document.querySelectorAll(".about-stat-number");

  // OPTIONAL:
  // If other pages set window.circleStats, we use those live values:
  // window.circleStats = { universities: 3, clubs: 20, users: 230, events: 75 }
  if (window.circleStats && typeof window.circleStats === "object") {
    statEls.forEach((el) => {
      const key = el.dataset.statKey;
      if (key && window.circleStats[key] != null) {
        el.dataset.target = String(window.circleStats[key]);
      }
    });
  }

  function animateStat(el, target) {
    const duration = 1100; // ms
    const startTime = performance.now();
    const start = 0;

    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const value = Math.floor(start + (target - start) * eased);
      el.textContent = value.toString();
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = target.toString();
      }
    }

    requestAnimationFrame(frame);
  }

  function startStatsAnimation() {
    statEls.forEach((el) => {
      const target = parseInt(el.dataset.target || "0", 10);
      animateStat(el, target);
    });
  }

  // Animate when stats grid enters viewport
  const statsGrid = document.querySelector(".about-stats-grid");
  if ("IntersectionObserver" in window && statsGrid) {
    let done = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !done) {
            done = true;
            startStatsAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(statsGrid);
  } else {
    // Fallback: animate immediately
    startStatsAnimation();
  }
});
</script>

<template>
  <div class="about-us-container">
    <!-- TOP GREEN STRIP -->
    <div class="top-bar"></div>

    <!-- NAVBAR -->
    <header class="navbar">
      <div class="nav-inner">
        <div class="nav-left">
          <a href="index.html" class="logo">CirCle</a>

          <nav class="tabs" aria-label="Primary navigation">
            <a href="communities.html" class="tab">Communities</a>
            <a href="events.html" class="tab">Events</a>
          </nav>
        </div>

        <div class="nav-center">
          <form class="global-search" role="search" aria-label="Search for an Event">
            <input
              type="search"
              placeholder="Search for an Event"
              aria-label="Search for an Event"
            />
          </form>
        </div>

        <div class="nav-right">
          <button class="icon-btn" aria-label="Account">
            <!-- Replace this src with your avatar system if needed -->
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=circle1"
              alt="Profile"
              class="nav-avatar"
              loading="lazy"
            />
          </button>
        </div>
      </div>
    </header>

    <div class="nav-bottom-line"></div>

    <!-- MAIN CONTENT -->
    <main class="page-wrap">
      <!-- HERO (single rounded rectangle) -->
      <section class="about-hero">
        <div class="about-hero-card">
          <div class="about-hero-pill">
            <span class="pill-dot"></span>
            Campus event hub
          </div>

          <h1 class="about-hero-title">All your campus life in one circle.</h1>

          <p class="about-hero-text">
            CirCle connects students, clubs, and events in a simple, colorful space.
            One platform to discover what’s happening next.
          </p>

          <div class="about-hero-tags">
            <button type="button" class="about-tag">
              <i class="fa-regular fa-calendar-check"></i>
              Real events
            </button>
            <button type="button" class="about-tag">
              <i class="fa-solid fa-people-group"></i>
              Real communities
            </button>
            <button type="button" class="about-tag">
              <i class="fa-solid fa-bolt"></i>
              Zero FOMO
            </button>
          </div>
        </div>
      </section>

      <!-- STATS SECTION -->
      <section class="about-stats-section">
        <div class="about-stats-header">
          <h2>
            <i class="fa-solid fa-chart-simple"></i>
            CirCle at a glance
          </h2>
          <p>
            A quick snapshot of the platform. These numbers can grow as more campuses join.
          </p>
        </div>

        <div class="about-stats-grid">
          <!-- Universities -->
          <article class="about-stat-card">
            <div class="about-stat-icon about-stat-icon-uni">
              <i class="fa-solid fa-building-columns"></i>
            </div>
            <div
              class="about-stat-number"
              data-stat-key="universities"
              data-target="2"
            >
              0
            </div>
            <div class="about-stat-label">Universities</div>
            <div class="about-stat-sub">Pilot campus + upcoming partners.</div>
          </article>

          <!-- Clubs -->
          <article class="about-stat-card">
            <div class="about-stat-icon about-stat-icon-clubs">
              <i class="fa-solid fa-users-line"></i>
            </div>
            <div
              class="about-stat-number"
              data-stat-key="clubs"
              data-target="14"
            >
              0
            </div>
            <div class="about-stat-label">Student clubs</div>
            <div class="about-stat-sub">Publishing and managing events on CirCle.</div>
          </article>

          <!-- Users -->
          <article class="about-stat-card">
            <div class="about-stat-icon about-stat-icon-users">
              <i class="fa-solid fa-user-graduate"></i>
            </div>
            <div
              class="about-stat-number"
              data-stat-key="users"
              data-target="150"
            >
              0
            </div>
            <div class="about-stat-label">Active students</div>
            <div class="about-stat-sub">Exploring events and saving favorites.</div>
          </article>

          <!-- Events -->
          <article class="about-stat-card">
            <div class="about-stat-icon about-stat-icon-events">
              <i class="fa-solid fa-calendar-star"></i>
            </div>
            <div
              class="about-stat-number"
              data-stat-key="events"
              data-target="50"
            >
              0
            </div>
            <div class="about-stat-label">Published events</div>
            <div class="about-stat-sub">Workshops, meetups, and campus activities.</div>
          </article>
        </div>
      </section>

      <!-- WHY CIRCLE SECTION -->
      <section class="about-features-section">
        <div class="about-stats-header">
          <h2>
            <i class="fa-solid fa-heart"></i>
            Why CirCle?
          </h2>
        </div>

        <div class="about-features-grid">
          <!-- Feature 1 -->
          <article class="about-feature-card">
            <div class="feature-icon green">
              <i class="fa-solid fa-compass"></i>
            </div>
            <div class="feature-title">One place to discover</div>
            <p class="feature-text">
              All official campus events collected into one clear timeline.
            </p>
          </article>

          <!-- Feature 2 -->
          <article class="about-feature-card">
            <div class="feature-icon purple">
              <i class="fa-solid fa-bullhorn"></i>
            </div>
            <div class="feature-title">Clubs reach the right people</div>
            <p class="feature-text">
              Clubs share once, students see instantly — no lost posters or links.
            </p>
          </article>

          <!-- Feature 3 -->
          <article class="about-feature-card">
            <div class="feature-icon blue">
              <i class="fa-solid fa-laptop-code"></i>
            </div>
            <div class="feature-title">Made for the browser</div>
            <p class="feature-text">
              Works on any device. No installs, no downloads — just open and join.
            </p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ROOT TOKENS */

:root {
 --brand: #372D2D;    
  --brand-600: #241D1D;   
  --brand-200: #EBE8E8;

  --page: #ffffff;
  --card: #ffffff;

  --ink: #153226;
  --muted: #6b7c74;
  --outline: #d8eadb;

  --shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.about-us-container {
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  background: #ffffff; /* var(--page) */
  color: #153226; /* var(--ink) */
  min-height: 100vh;
}

/* TOP STRIP + NAVBAR */

.top-bar {
  width: 100%;
  height: 14px;
  background: #1b8f48; /* var(--brand) */
}

.navbar {
  background: #ffffff; /* var(--page) */
}

.nav-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 14px 20px 12px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 18px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 48px;
}

.logo {
  font-weight: 900;
  font-size: 40px;
  line-height: 1;
  color: #1b8f48; /* var(--brand) */
  text-decoration: none;
}

.tabs {
  display: flex;
  gap: 28px;
}

.tab {
  font-weight: 500;
  font-size: 16px;
  text-decoration: none;
  color: #333;
  padding-bottom: 6px;
}

.nav-center {
  display: flex;
  justify-content: center;
}

.global-search {
  width: 56vw;
  max-width: 720px;
  min-width: 320px;
  height: 44px;
  padding: 0 18px;
  border-radius: 26px;
  background: #e6f3e9; /* var(--brand-200) */
  display: flex;
  align-items: center;
}

.global-search input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #2b4c3d;
}

.global-search input::placeholder {
  color: #8ca59a;
}

.nav-right {
  display: flex;
  justify-content: flex-end;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: #e6f3e9; /* var(--brand-200) */
  display: grid;
  place-items: center;
  cursor: pointer;
}

.nav-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.nav-bottom-line {
  height: 2px;
  background: #1b8f48; /* var(--brand) */
  opacity: 0.6;
}

/* GENERAL PAGE WRAP */

.page-wrap {
  max-width: 1180px;
  margin: 18px auto 56px;
  padding: 0 20px 40px;
}

/* HERO – single rounded rectangle */

.about-hero {
  margin-top: 24px;
  margin-bottom: 26px;
}

.about-hero-card {
  border-radius: 28px;
  padding: 26px 28px 22px;
  background: linear-gradient(135deg, #e6f6e6, #ffe7d8);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06); /* var(--shadow) */
}

/* Pill */

.about-hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 11px;
  border-radius: 999px;
  background: #ffffffc8;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #167a3d; /* var(--brand-600) */
  margin-bottom: 10px;
}

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: 2px solid #167a3d; /* var(--brand-600) */
  background-color: #ffffff;
}

/* Hero text */

.about-hero-title {
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #163828;
}

.about-hero-text {
  font-size: 14px;
  line-height: 1.7;
  color: #385445;
  max-width: 560px;
}

/* Hero tags */

.about-hero-tags {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.about-tag {
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #ffffff;
  color: #264535;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

/* STATS SECTION */

.about-stats-section {
  margin-bottom: 30px;
}

.about-stats-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.about-stats-header h2 {
  font-size: 18px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.about-stats-header h2 i {
  color: #1b8f48; /* var(--brand) */
}

.about-stats-header p {
  font-size: 12px;
  color: #6b7c74; /* var(--muted) */
}

/* Stats grid */

.about-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.about-stat-card {
  border-radius: 18px;
  background-color: #ffffff; /* var(--card) */
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06); /* var(--shadow) */
  padding: 14px 14px 12px;
  position: relative;
  overflow: hidden;
}

/* Colored icon */

.about-stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #ffffff;
  margin-bottom: 8px;
  font-size: 16px;
}

.about-stat-icon-uni {
  background: linear-gradient(135deg, #1b8f48, #7fd292);
}

.about-stat-icon-clubs {
  background: linear-gradient(135deg, #7d3ff2, #f391da);
}

.about-stat-icon-users {
  background: linear-gradient(135deg, #f08c00, #ffd26d);
}

.about-stat-icon-events {
  background: linear-gradient(135deg, #1a6fd6, #76c2ff);
}

/* Numbers + labels */

.about-stat-number {
  font-size: 22px;
  font-weight: 800;
  color: #167a3d; /* var(--brand-600) */
  margin-bottom: 2px;
}

.about-stat-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 3px;
}

.about-stat-sub {
  font-size: 11px;
  color: #6b7c74; /* var(--muted) */
  line-height: 1.4;
}

/* WHY CIRCLE */

.about-features-section {
  margin-top: 24px;
}

.about-features-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 6px;
}

.about-feature-card {
  border-radius: 18px;
  background-color: #ffffff; /* var(--card) */
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06); /* var(--shadow) */
  padding: 14px 14px 12px;
}

.feature-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 16px;
  margin-bottom: 8px;
}

.feature-icon.green {
  background: #e6f6e6;
  color: #167a3d; /* var(--brand-600) */
}

.feature-icon.purple {
  background: #f2e6ff;
  color: #7d3ff2;
}

.feature-icon.blue {
  background: #e2f0ff;
  color: #1a6fd6;
}

.feature-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.feature-text {
  font-size: 12px;
  color: #6b7c74; /* var(--muted) */
  line-height: 1.5;
}

/* RESPONSIVE */

@media (max-width: 960px) {
  .nav-inner {
    grid-template-columns: 1fr;
    row-gap: 8px;
  }

  .nav-center {
    order: 3;
  }

  .nav-right {
    order: 2;
    justify-content: flex-start;
  }

  .about-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .about-features-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .page-wrap {
    padding: 0 14px 32px;
  }

  .about-hero-card {
    padding: 20px 18px 18px;
    border-radius: 22px;
  }

  .about-hero-title {
    font-size: 24px;
  }

  .about-hero-text {
    font-size: 13px;
  }

  .about-stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .about-features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
