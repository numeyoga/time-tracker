import { initTodayPage } from './pages/today.js';
import { consumeQueuedToast } from './components/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  initTodayPage();
  consumeQueuedToast();
});
