/* Main Application Logic */
console.log('Main JS Loaded. Welcome to David Michael Portfolio.');

// Smooth Scroll for Anchor Links (if not handled by CSS scroll-behavior)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Load Testimonials
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('testimonials-grid');
    if (!container) return;

    try {
        const response = await fetch('data/testimonials.json');
        const testimonials = await response.json();

        container.innerHTML = '';
        testimonials.forEach(t => {
            const el = document.createElement('div');
            el.className = 'glass fade-up';
            el.style.padding = '2rem';
            el.innerHTML = `
                <div style="color: var(--accent); font-size: 2rem; margin-bottom: 1rem;">"</div>
                <p style="margin-bottom: 1.5rem; font-style: italic;">${t.text}</p>
                <div>
                    <h4 style="margin-bottom: 0.2rem;">${t.name}</h4>
                    <span style="color: var(--text-secondary); font-size: 0.9rem;">${t.company}</span>
                </div>
            `;
            container.appendChild(el);
        });

        // Re-run observer for new elements
        if (typeof observer !== 'undefined') {
            document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
        }

    } catch (error) {
        console.error('Error loading testimonials:', error);
        container.innerHTML = '<p>تعذر تحميل الآراء حالياً.</p>';
    }
});
