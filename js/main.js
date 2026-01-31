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

    // Show Skeletons
    container.innerHTML = Array(3).fill(0).map(() => `
        <div class="glass skeleton-card" style="padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
            <div class="skeleton" style="width: 40px; height: 40px; border-radius: 50%; margin-bottom: 1.5rem;"></div>
            <div class="skeleton" style="width: 100%; height: 1rem; margin-bottom: 0.5rem; border-radius: 4px;"></div>
            <div class="skeleton" style="width: 80%; height: 1rem; margin-bottom: 2rem; border-radius: 4px;"></div>
            <div class="skeleton" style="width: 120px; height: 1.2rem; margin-bottom: 0.4rem; border-radius: 4px;"></div>
            <div class="skeleton" style="width: 80px; height: 0.9rem; border-radius: 4px;"></div>
        </div>
    `).join('');

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
