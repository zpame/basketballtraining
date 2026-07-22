<template>
  <div class="booking-form">
    <h3>Schedule a Session</h3>
    <form @submit.prevent="onSubmit">
      <label>
        Name
        <input v-model="name" required />
      </label>
      <label>
        Email
        <input v-model="email" type="email" required />
      </label>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Scheduling...' : 'Schedule Session' }}
      </button>
    </form>
    <div v-if="message" :class="messageType">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({ 
  selectedSlot: { type: Object, required: true }, 
  userId: { type: String, required: false } 
});
const emit = defineEmits(['created', 'error']);

const name = ref('');
const email = ref('');
const isLoading = ref(false);
const message = ref('');
const messageType = ref('');

async function onSubmit() {
  isLoading.value = true;
  message.value = '';

  try {
    const payload = {
      start: props.selectedSlot.start,
      end: props.selectedSlot.end,
      coach_id: props.selectedSlot.coach_id,
      user_id: props.userId || null,
      availability_id: props.selectedSlot.id,
      customer: { name: name.value, email: email.value }
    };

    const res = await fetch('/functions/v1/create_booking', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    if (data.success || data.booking_id) {
      message.value = 'Session scheduled!';
      messageType.value = 'success';
      name.value = '';
      email.value = '';
      emit('created', data);
    } else {
      message.value = 'Error: ' + (data.error || 'Failed to create booking');
      messageType.value = 'error';
      emit('error', data);
    }
  } catch (err: any) {
    message.value = 'Error: ' + (err.message || 'Network error');
    messageType.value = 'error';
    emit('error', err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.booking-form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 500px;
  margin: 1rem auto;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 500;
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

button {
  padding: 0.75rem 1rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #357abd;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success {
  color: #27ae60;
  padding: 1rem;
  background: #e8f8f5;
  border-radius: 4px;
  margin-top: 1rem;
}

.error {
  color: #e74c3c;
  padding: 1rem;
  background: #fadbd8;
  border-radius: 4px;
  margin-top: 1rem;
}
</style>

