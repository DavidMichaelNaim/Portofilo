// PERMANENT DARK MODE - No Toggle
const root = document.documentElement;

// Force dark mode always
root.setAttribute('data-theme', 'dark');
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';

// Remove theme toggle button if exists
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.style.display = 'none';
}

console.log('🌙 Permanent Dark Mode Active');
