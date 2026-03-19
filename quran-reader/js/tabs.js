// ============================================
// Tab switching logic
// ============================================
(function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    function switchTab(tabId) {
        tabBtns.forEach(btn => {
            const isActive = btn.dataset.tab === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });

        tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === 'panel-' + tabId);
        });

        // Lazy-load random tools on first activation
        if (tabId === 'ayah' && !window._ayahLoaded) {
            window._ayahLoaded = true;
            // Auto-generate first ayah when tab opens
            setTimeout(generateRandomAyah, 200);
        }
        if (tabId === 'hadeeth' && !window._hadeethLoaded) {
            window._hadeethLoaded = true;
            // Auto-generate first hadeeth when tab opens
            setTimeout(generateRandomHadeeth, 200);
        }
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Expose for potential external calls
    window.switchTab = switchTab;
})();
