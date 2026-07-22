<template>
  <div class="about-page">
    <header class="hero-section">
      <div>
        <p class="eyebrow">About Backyard Basketball</p>
        <h1>Simple, fun basketball coaching for local players.</h1>
        <p class="hero-copy">
          
        </p>
        <div class="hero-actions">
          <a href="/schedule" class="primary-btn">View sample schedule</a>
          <a href="mailto:info@backyardbasketball.com" class="secondary-btn">Contact us</a>
        </div>
      </div>
      <div class="hero-image"></div>
    </header>

    <section class="features-section">
      <h2>What we offer</h2>
      <div class="features-grid">
        <div class="feature-card">
          <h3>Personal coaching</h3>
          <p>One-on-one sessions focused on shooting, ball handling, and agility.</p>
        </div>
        <div class="feature-card">
          <h3>Group practice</h3>
          <p>Small group training for team drills, conditioning, and competition readiness.</p>
        </div>
        <div class="feature-card">
          <h3>Skills development</h3>
          <p>Fundamentals-based training that builds confidence and court awareness.</p>
        </div>
      </div>
    </section>

    <section class="coaches-section">
      <h2>Meet the coaches</h2>
      <div class="coaches-grid">
        <div class="coach-card">
          <div class="coach-icon">🏀</div>
          <h3>Coach Mike</h3>
          <p>Focused on shooting mechanics, footwork, and strength building.</p>
        </div>
        <div class="coach-card">
          <div class="coach-icon">🏀</div>
          <h3>Coach Sarah</h3>
          <p>Specializes in defense, positioning, and high-intensity drills.</p>
        </div>
        <div class="coach-card">
          <div class="coach-icon">🏀</div>
          <h3>Coach Jay</h3>
          <p>Great with youth players, fundamentals, and team concepts.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Static about page - no database integration needed.
</script>

<style scoped>
.about-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 3rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.85rem;
  color: #667eea;
  margin-bottom: 1rem;
}

h1 {
  font-size: clamp(2.2rem, 3vw, 4rem);
  line-height: 1.05;
  margin-bottom: 1.5rem;
  color: #111;
}

.hero-copy {
  font-size: 1.05rem;
  color: #555;
  line-height: 1.8;
  max-width: 40rem;
  margin-bottom: 1.75rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.95rem 1.4rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
}

.primary-btn {
  background: #667eea;
  color: white;
}

.secondary-btn {
  background: #f1f5ff;
  color: #334155;
}

.hero-image {
  min-height: 320px;
  background: url('https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80') center/cover no-repeat;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(102, 126, 234, 0.14);
}

.features-section,
.coaches-section {
  margin-bottom: 3rem;
}

.features-section h2,
.coaches-section h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #111;
}

.features-grid,
.coaches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.feature-card,
.coach-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.feature-card h3,
.coach-card h3 {
  margin-bottom: 0.85rem;
  color: #111;
}

.feature-card p,
.coach-card p {
  margin: 0;
  color: #475569;
  line-height: 1.75;
}

.coach-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  margin-bottom: 1rem;
  font-size: 2rem;
  background: #eef2ff;
  border-radius: 50%;
}

@media (max-width: 900px) {
  .hero-section {
    grid-template-columns: 1fr;
  }
}
</style>
