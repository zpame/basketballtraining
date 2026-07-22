import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Schedule from './pages/Schedule.vue';
import AdminDashboard from './pages/AdminDashboard.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/schedule', component: Schedule },
  { path: '/admin', component: AdminDashboard },
];

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});