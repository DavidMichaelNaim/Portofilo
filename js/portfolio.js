document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('portfolio-grid');
    const filtersContainer = document.getElementById('filters');

    // 4. Show Skeletons during load
    renderSkeletons(6);

    // 1. Fetch Data
    let portfolioData = { categories: [], items: [] };
    try {
        // Add a small artificial delay (600ms) to ensure the skeleton is visible
        // even on very fast connections like GitHub Pages.
        const [response] = await Promise.all([
            fetch('data/portfolio.json'),
            new Promise(resolve => setTimeout(resolve, 600))
        ]);
        portfolioData = await response.json();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">عذراً، حدث خطأ في تحميل البيانات.</p>';
        return;
    }

    // 2. Render Categories
    if (portfolioData.categories && filtersContainer) {
        filtersContainer.innerHTML = '<button class="filter-btn active" data-filter="all">الكل</button>';

        portfolioData.categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.filter = cat.id;
            btn.textContent = cat.title;
            btn.onclick = () => filterItems(cat.id);
            filtersContainer.appendChild(btn);
        });

        filtersContainer.querySelector('[data-filter="all"]').onclick = () => filterItems('all');
    }

    // 3. Initial Render
    renderItems(portfolioData.items);

    // 4. Check URL Params
    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get('category');
    if (initialCategory) {
        filterItems(initialCategory);
    }

    // --- Helper Functions ---

    function renderSkeletons(count) {
        grid.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'portfolio-card skeleton-card';
            skeleton.innerHTML = `
                <div class="skeleton-image skeleton"></div>
                <div class="card-content">
                    <div class="skeleton-text skeleton" style="width: 30%;"></div>
                    <div class="skeleton-title skeleton"></div>
                    <div class="skeleton-desc skeleton"></div>
                    <div class="skeleton-desc skeleton" style="width: 80%;"></div>
                </div>
            `;
            grid.appendChild(skeleton);
        }
    }

    function renderItems(items) {
        grid.innerHTML = '';
        if (items.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #888;">لا توجد أعمال في هذا القسم حالياً.</p>';
            return;
        }

        const imagePromises = items.map((item, index) => {
            return new Promise((resolve) => {
                const card = document.createElement('div');
                card.className = 'portfolio-card fade-up';
                card.style.display = 'none'; // Hide initially
                card.style.animationDelay = `${index * 50}ms`;

                const isVideo = item.type === 'video';

                // Auto-convert Google Drive Thumbnail Links
                let imageSrc = item.thumbnail || item.image || 'imgs/placeholder.jpg';
                if (imageSrc) {
                    let driveId = null;
                    if (imageSrc.includes('/d/')) {
                        driveId = imageSrc.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
                    } else if (imageSrc.includes('id=')) {
                        driveId = imageSrc.match(/id=([a-zA-Z0-9_-]+)/)?.[1];
                    }

                    if (driveId && (imageSrc.includes('google.com') || imageSrc.includes('drive'))) {
                        imageSrc = `https://lh3.googleusercontent.com/d/${driveId}`;
                    }
                }

                card.innerHTML = `
                    <div class="card-image-wrapper" style="position: relative; cursor: pointer;">
                        <img src="${imageSrc}" alt="${item.title}" class="card-image">
                        ${isVideo ? `
                        <div class="play-icon" style="
                            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                            width: 60px; height: 60px; background: rgba(255, 0, 51, 0.9);
                            border-radius: 50%; display: flex; align-items: center; justify-content: center;
                            box-shadow: 0 0 20px rgba(255, 0, 51, 0.5); pointer-events: none;
                            transition: transform 0.3s ease;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="margin-left: 4px;">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                        ` : ''}
                    </div>
                    <div class="card-content">
                        <div class="card-category">${getCategoryNames(item.categories || [item.category])}</div>
                        <div class="card-title">${item.title}</div>
                        <p style="color: #aaa; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">${item.description || ''}</p>
                    </div>
                `;

                const img = card.querySelector('.card-image');

                const onImageLoad = () => {
                    resolve(card);
                };

                if (img.complete) {
                    onImageLoad();
                } else {
                    img.onload = onImageLoad;
                    img.onerror = onImageLoad; // Don't block if image fails
                }

                card.querySelector('.card-image-wrapper').onclick = () => openLightbox(item);

                const wrapper = card.querySelector('.card-image-wrapper');
                const playIcon = wrapper.querySelector('.play-icon');
                if (playIcon) {
                    wrapper.onmouseenter = () => playIcon.style.transform = 'translate(-50%, -50%) scale(1.1)';
                    wrapper.onmouseleave = () => playIcon.style.transform = 'translate(-50%, -50%) scale(1)';
                }
            });
        });

        Promise.all(imagePromises).then((cards) => {
            grid.innerHTML = ''; // Clear skeletons
            cards.forEach(card => {
                card.style.display = 'block';
                grid.appendChild(card);
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            });
            grid.querySelectorAll('.portfolio-card').forEach(el => observer.observe(el));
        });
    }

    function getCategoryName(catId) {
        const cat = portfolioData.categories.find(c => c.id === catId);
        return cat ? cat.title : catId;
    }

    // Handle multiple categories (new format)
    function getCategoryNames(categories) {
        if (!categories || !Array.isArray(categories)) {
            return getCategoryName(categories);
        }
        return categories.map(catId => getCategoryName(catId)).join(' ، ');
    }

    // Check if item has a specific category
    function itemHasCategory(item, category) {
        // Support both old format (item.category) and new format (item.categories)
        if (item.categories && Array.isArray(item.categories)) {
            return item.categories.includes(category);
        }
        return item.category === category;
    }

    function filterItems(category) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });

        const filtered = (category === 'all')
            ? portfolioData.items
            : portfolioData.items.filter(item => itemHasCategory(item, category));

        renderItems(filtered);

        const url = new URL(window.location);
        if (category === 'all') url.searchParams.delete('category');
        else url.searchParams.set('category', category);
        window.history.pushState({}, '', url);
    }

    // --- Lightbox Logic ---
    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.95); z-index: 5000; display: none; 
            justify-content: center; align-items: center; padding: 0;
            backdrop-filter: blur(15px); opacity: 0; transition: opacity 0.3s ease;
        `;
        lightbox.innerHTML = `
            <button id="lb-close" style="position: absolute; top: 2rem; right: 2rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 5001;">&times;</button>
            <div id="lb-content-wrapper" style="width: 90%; max-width: 1000px; aspect-ratio: 16/9; position: relative;"></div>
            <div id="lb-details" style="position: absolute; bottom: 2rem; left: 0; width: 100%; text-align: center; pointer-events: none;">
                <h3 id="lb-title" style="color: white; font-family: 'Cairo'; margin-bottom: 0.5rem; text-shadow: 0 2px 10px black;"></h3>
            </div>
        `;
        document.body.appendChild(lightbox);

        const closeBtn = lightbox.querySelector('#lb-close');
        const closeLb = () => {
            lightbox.style.opacity = '0';
            setTimeout(() => {
                lightbox.style.display = 'none';
                document.getElementById('lb-content-wrapper').innerHTML = '';
                document.body.style.overflow = 'auto';
            }, 300);
        };
        closeBtn.onclick = closeLb;
        lightbox.onclick = (e) => { if (e.target === lightbox) closeLb(); };
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
    }

    function openLightbox(item) {
        const wrapper = document.getElementById('lb-content-wrapper');
        const title = document.getElementById('lb-title');

        wrapper.innerHTML = '';
        title.textContent = item.title;

        if (item.type === 'video' && item.videoUrl) {
            let videoSrc = item.videoUrl;

            // Auto-convert Google Drive Video and Thumbnail Links
            if (videoSrc.includes('google.com') || videoSrc.includes('drive')) {
                let driveId = null;
                if (videoSrc.includes('/d/')) {
                    driveId = videoSrc.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
                } else if (videoSrc.includes('id=')) {
                    driveId = videoSrc.match(/id=([a-zA-Z0-9_-]+)/)?.[1];
                }

                if (driveId) {
                    videoSrc = `https://drive.google.com/file/d/${driveId}/preview`;
                }
            }
            // Youtube Check
            else if (videoSrc.includes('youtube') || videoSrc.includes('youtu.be')) {
                let videoId = '';
                if (videoSrc.includes('embed')) videoId = videoSrc.split('embed/')[1];
                else if (videoSrc.includes('watch?v=')) videoId = videoSrc.split('v=')[1].split('&')[0];
                else videoId = videoSrc.split('/').pop();
                videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            }

            wrapper.innerHTML = `
                <iframe width="100%" height="100%" src="${videoSrc}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen style="border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);"></iframe>
            `;

        } else {
            // Image Fallback
            let imgSrc = item.image || item.thumbnail;
            if (imgSrc && (imgSrc.includes('google.com') || imgSrc.includes('drive'))) {
                let driveId = null;
                if (imgSrc.includes('/d/')) {
                    driveId = imgSrc.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
                } else if (imgSrc.includes('id=')) {
                    driveId = imgSrc.match(/id=([a-zA-Z0-9_-]+)/)?.[1];
                }
                if (driveId) imgSrc = `https://drive.google.com/uc?export=view&id=${driveId}`;
            }
            wrapper.innerHTML = `
                <img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px;">
            `;
        }

        lightbox.style.display = 'flex';
        lightbox.offsetHeight;
        lightbox.style.opacity = '1';
        document.body.style.overflow = 'hidden';
    }
});
