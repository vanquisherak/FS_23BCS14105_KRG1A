const toggle = document.getElementById('theme-toggle');
const root = document.documentElement; 

toggle.addEventListener('click', () => {
  const newTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme); // save preference
});

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    root.dataset.theme = savedTheme;
  }
});
