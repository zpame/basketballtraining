<template>
  <div class="schedule-page">
    <h2>Schedule a Session</h2>
    <p class="intro">Pick a time below and fill out the form to request a booking.</p>

    <div class="schedule-grid">
      <div v-for="session in sessions" :key="session.id" class="session-card">
        <div class="session-header">
          <h3>{{ session.date }}</h3>
          <span class="time">{{ session.time }}</span>
        </div>
        <div class="session-details">
          <p><strong>Duration:</strong> {{ session.duration }}</p>
        </div>
        <button class="book-btn" @click="selectSession(session)">Book this session</button>
      </div>
    </div>

    <div v-if="selectedSession" class="booking-form-card" ref="bookingFormRef">
      <h3>Booking request for {{ selectedSession.date }} at {{ selectedSession.time }}</h3>
      <form @submit.prevent="submitBooking" class="booking-form">
        <label>
          Name
          <input v-model="form.name" required />
        </label>
        <label>
          Phone number
          <input v-model="form.phone" required />
        </label>
        <label>
          Email
          <input v-model="form.email" type="email" />
        </label>
        <fieldset class="radio-fieldset">
          <legend>Session type</legend>
          <div class="radio-row">
            <label class="radio-option" :class="{ active: form.sessionType === 'individual' }">
              <input type="radio" value="individual" v-model="form.sessionType" />
              <span class="radio-label">Individual</span>
            </label>
            <label class="radio-option" :class="{ active: form.sessionType === 'group' }">
              <input type="radio" value="group" v-model="form.sessionType" />
              <span class="radio-label">Group</span>
              <span class="note">(Cheaper)</span>
            </label>
          </div>
        </fieldset>
        <label>
          Notes
          <textarea v-model="form.notes" rows="4" placeholder="Anything else you want us to know?"></textarea>
        </label>
        <button class="submit-btn" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send request' }}
        </button>
      </form>
    </div>

    <div v-if="showMessage" class="message-box" :class="messageType">
      <h3>{{ messageTitle }}</h3>
      <p>{{ messageText }}</p>
      <button @click="showMessage = false" class="close-btn">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import scheduleData from '../data/schedule.json';

const sessions = ref<any[]>(scheduleData);
const selectedSession = ref<any | null>(null);
const bookingFormRef = ref<HTMLElement | null>(null);
const showMessage = ref(false);
const messageTitle = ref('');
const messageText = ref('');
const messageType = ref<'success' | 'error'>('success');
const isSubmitting = ref(false);
// Using Formspree endpoint for booking submissions
const form = ref({
  name: '',
  phone: '',
  email: '',
  notes: '',
  sessionType: 'individual',
});

function selectSession(session: any) {
  selectedSession.value = session;
  nextTick(() => {
    const formEl = bookingFormRef.value;
    if (formEl) {
      const offset = 80;
      const top = formEl.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
}

async function submitBooking() {
  isSubmitting.value = true;
  try {
    const res = await fetch('https://formspree.io/f/xvzeqnka', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: form.value.name,
        phone: form.value.phone,
        email: form.value.email,
        notes: form.value.notes,
        sessionType: form.value.sessionType,
        session: selectedSession.value ? `${selectedSession.value.date} ${selectedSession.value.time}` : 'N/A',
      }),
    });

    const data = await res.json().catch(() => ({}));
    const isSuccess = res.ok && (data.ok === true || data.success === true || Boolean(data.next));

    if (isSuccess) {
      const bookedSession = selectedSession.value;
      messageType.value = 'success';
      messageTitle.value = 'Booking confirmed';
      messageText.value = `Thanks ${form.value.name || 'there'}! Your ${form.value.sessionType} session for ${bookedSession?.date} at ${bookedSession?.time} was received. We’ll follow up shortly.`;
      // remove the booked session from the visible list
      const bookedId = bookedSession?.id;
      if (bookedId != null) {
        sessions.value = sessions.value.filter((s: any) => s.id !== bookedId);
      }
      showMessage.value = true;
      form.value = { name: '', phone: '', email: '', notes: '', sessionType: 'individual' };
      selectedSession.value = null;
    } else {
      messageType.value = 'error';
      messageTitle.value = 'Oops';
      messageText.value = 'We could not send your request right now. Please try again.';
      showMessage.value = true;
    }
  } catch (err: any) {
    messageType.value = 'error';
    messageTitle.value = 'Oops';
    messageText.value = err.message || 'We could not send your request right now.';
    showMessage.value = true;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.schedule-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  background: #f6f7fb;
  min-height: 100vh;
}

h2 {
  text-align: center;
  color: #111827;
  margin-bottom: 0.5rem;
  font-size: clamp(2rem, 2.5vw, 3rem);
  letter-spacing: -0.04em;
}

.intro {
  text-align: center;
  color: #4b5563;
  font-size: 1rem;
  margin-bottom: 2.5rem;
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.session-card {
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.session-card:hover {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.1);
  transform: translateY(-4px);
}

.session-header {
  background: transparent;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #111827;
}

.time {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2563eb;
}

.session-details {
  padding: 1.5rem;
}

.session-details p {
  margin: 0.5rem 0;
  color: #555;
  font-size: 0.95rem;
}

.session-details strong {
  color: #333;
}

.book-btn {
  width: 100%;
  padding: 0.95rem 1.1rem;
  margin-top: 1rem;
  background: transparent;
  color: #1e293b;
  border: 1px solid rgba(37, 99, 235, 0.25);
  border-radius: 14px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.book-btn:hover {
  transform: translateY(-1px);
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.45);
}

.booking-form-card {
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  padding: 1.75rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.06);
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.booking-form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
  color: #20232a;
}

.booking-form input,
.booking-form textarea {
  padding: 0.95rem 1rem;
  border: 1px solid #d8dae0;
  border-radius: 12px;
  background: #fafbff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.booking-form input:focus,
.booking-form textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.08);
}

.radio-fieldset {
  border: 1px solid #d8dae0;
  border-radius: 12px;
  padding: 1rem;
  background: #fafbff;
}

.radio-fieldset legend {
  font-weight: 700;
  color: #20232a;
  margin-bottom: 0.75rem;
}

.radio-row {
  display: flex;
  gap: 0.75rem;
}

.radio-option {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 140px;
  justify-content: center;
  padding: 0.9rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  background: #f8fafc;
  color: #334155;
}

.radio-option::selection,
.radio-option *::selection {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.radio-option.active::selection,
.radio-option.active *::selection {
  background: rgba(255, 255, 255, 0.24);
  color: #ffffff;
}

.radio-option.active {
  background: #1d4ed8;
  border-color: #2563eb;
  color: #ffffff;
  transform: translateY(-1px);
}

.radio-option.active:hover {
  background: #2563eb;
}

.radio-option.active .radio-label,
.radio-option.active .note {
  color: #ffffff;
  opacity: 1;
}

.radio-option input {
  display: none;
}

.radio-label {
  font-weight: 700;
}

.note {
  font-weight: 500;
  color: inherit;
  opacity: 1;
}

.radio-option:not(.active):hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.note {
  font-weight: 500;
  color: #4b5563;
}

.submit-btn {
  padding: 0.95rem 1.45rem;
  background: #1d4ed8;
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  width: fit-content;
  align-self: flex-start;
  box-shadow: 0 18px 32px rgba(29, 78, 216, 0.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 22px 38px rgba(29, 78, 216, 0.25);
  background: #2563eb;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message-box {
  padding: 2rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.message-box.success {
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
}

.message-box.error {
  background: #ffebee;
  border-left: 4px solid #d32f2f;
}

.message-box h3 {
  margin-top: 0;
}

.message-box.success h3 {
  color: #2e7d32;
}

.message-box.error h3 {
  color: #c62828;
}

.message-box.success p {
  color: #558b2f;
  margin: 1rem 0;
}

.message-box.error p {
  color: #b71c1c;
  margin: 1rem 0;
}

.close-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn:hover {
  background: #388e3c;
}
</style>