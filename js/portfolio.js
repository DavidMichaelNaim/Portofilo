
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('portfolio-grid');
    const filtersContainer = document.getElementById('filters');

    // 1. Fetch Data
    let portfolioData = { categories: [], items: [] };
    try {
        const response = await fetch('data/portfolio.json');
        portfolioData = await response.json();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        grid.innerHTML = '<p>حدث خطأ في تحميل البيانات.</p>';
        return;
    }

    // 2. Render Categories
    if (portfolioData.categories) {
        portfolioData.categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.filter = cat.id;
            btn.textContent = cat.title;
            btn.onclick = () => filterItems(cat.id);
            filtersContainer.appendChild(btn);
        });
    }

    // 3. Check URL Params for Initial Filter
    const params = window.appParams || new URLSearchParams(window.location.search);
    const initialCategory = params.get('category'); // e.g., ?category=collage

    // 4. Render Items
    renderItems(portfolioData.items);

    // 5. Apply Initial Filter if present
    if (initialCategory) {
        filterItems(initialCategory);
    }

    // --- Helper Functions ---

    // --- Lightbox Logic ---
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.9); z-index: 2000; display: none; 
        justify-content: center; align-items: center; padding: 2rem;
        backdrop-filter: blur(10px);
    `;
    lightbox.innerHTML = `
        <button id="lb-close" style="position: absolute; top: 2rem; right: 2rem; background: none; border: none; color: white; font-size: 2rem; cursor: pointer;">&times;</button>
        <div class="lb-content" style="max-width: 90%; max-height: 90%; text-align: center;">
            <img id="lb-img" src="" style="max-width: 100%; max-height: 80vh; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
            <h2 id="lb-title" style="color: white; margin-top: 1rem;"></h2>
            <p id="lb-desc" style="color: #ccc;"></p>
        </div>
    `;
    document.body.appendChild(lightbox);

    lightbox.querySelector('#lb-close').onclick = () => {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scroll
    };

    lightbox.onclick = (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    function openLightbox(item) {
        document.getElementById('lb-img').src = item.image;
        document.getElementById('lb-title').textContent = item.title;
        document.getElementById('lb-desc').textContent = item.description || '';
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Disable scroll
    }

    function renderItems(items) {
        grid.innerHTML = '';
        if (items.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">لا توجد أعمال في هذا القسم حالياً.</p>';
            return;
        }

        items.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'portfolio-item glass scale-in';
            el.style.animationDelay = `${index * 100}ms`;

            el.innerHTML = `
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="item-overlay">
                    <h3>${item.title}</h3>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.8;">القسم: ${item.category}</p>
                </div>
            `;

            // Add click to open lightbox
            el.onclick = () => openLightbox(item);

            grid.appendChild(el);
        });
    }

    function filterItems(category) {
        // Update Buttons UI
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
            if (category === 'all' && btn.dataset.filter === 'all') btn.classList.add('active');
        });

        // Update Grid
        if (category === 'all' || !category) {
            renderItems(portfolioData.items);
            // Update URL without reloading (optional, nice for sharing)
            const url = new URL(window.location);
            url.searchParams.delete('category');
            window.history.pushState({}, '', url);
        } else {
            const filtered = portfolioData.items.filter(item => item.category === category);
            renderItems(filtered);

            // Update URL
            const url = new URL(window.location);
            url.searchParams.set('category', category);
            window.history.pushState({}, '', url);
        }
    }
});
