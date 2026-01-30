/**
 * URL Parameters Manager
 * Handles ?category=xyz, ?theme=dark, etc.
 */

const getUrlParams = () => {
    const queryString = window.location.search;
    return new URLSearchParams(queryString);
};

const applyUrlSettings = () => {
    const params = getUrlParams();

    // 1. Theme Handling
    if (params.has('theme')) {
        const theme = params.get('theme');
        if (['dark', 'light'].includes(theme)) {
            setTheme(theme); // Uses main theme function
        }
    }

    // 2. Hide Sections Handling (for index.html)
    if (params.has('hide')) {
        const sectionsToHide = params.get('hide').split(',');
        sectionsToHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    }

    // 3. Show Specific Sections Only (Focus Mode)
    if (params.has('show')) {
        const sectionsToShow = params.get('show').split(',');
        // Hide all main sections first
        document.querySelectorAll('section').forEach(sec => {
            sec.style.display = 'none';
        });
        // Show requested ones
        sectionsToShow.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'block';
        });
    }

    // 4. Portfolio Category (Handled in portfolio.js, but exposed here)
    // We return the params object for other scripts to use
    return params;
};

// Expose to window for other scripts
window.appParams = applyUrlSettings();
