<template>
  <div class="home">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Backyard basketball</p>
        <h1>Simple sessions. Clear schedule.</h1>
        <p class="tagline">Open practice time, straightforward booking, and a calm place to get work done.</p>
        <div class="hero-actions">
          <a href="/schedule" class="btn primary">View schedule</a>
        </div>
      </div>
      <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80" alt="Basketball court in the rain" class="hero-image" />
    </section>

    <section class="info-grid">
      <div class="info-card">
        <h2>What to expect</h2>
        <p>Sessions are kept simple so the focus stays on the work.</p>
      </div>
      <div class="info-card">
        <h2>How it works</h2>
        <p>Check the available times, choose a slot, and send a request.</p>
      </div>
      <div class="info-card">
        <h2>Contact</h2>
        <p>Questions can be sent by email and we’ll help from there.</p>
      </div>
    </section>

    <section class="cta-section">
      <h2>Ready to book?</h2>
      <p>Open the schedule and pick a time that works for you.</p>
      <a href="/schedule" class="btn primary">Open schedule</a>
    </section>
  </div>
</template>

<script setup lang="ts">
// Home page - static content
</script>

<style scoped>
.home {
  width: 100%;
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  align-items: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f3f6ff 0%, #eef3ff 100%);
  color: #23324a;
}

.hero-copy {
  max-width: 560px;
}

.eyebrow {
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #667eea;
  margin-bottom: 0.75rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  line-height: 1.1;
}

.tagline {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #4d5870;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.85rem 1.2rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn.primary {
  background: #667eea;
  color: white;
}

.btn.secondary {
  background: white;
  color: #23324a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.hero-image {
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.12);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.info-card {
  background: white;
  border: 1px solid #e8ecf5;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.info-card h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #23324a;
}

.info-card p {
  color: #5f6b83;
  line-height: 1.6;
}

.cta-section {
  text-align: center;
  background: #23324a;
  color: white;
  padding: 3.5rem 2rem;
}

.cta-section h2 {
  margin-bottom: 0.75rem;
  font-size: 1.8rem;
}

.cta-section p {
  margin-bottom: 1.5rem;
  color: #dbe2f0;
}
</style>