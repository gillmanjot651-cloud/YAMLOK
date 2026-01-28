/* ----------------- CONFIG ----------------- */
const GLITCH_DURATION = 1000;
const MAX_SPARKS = 100;
const AMBIENT_SPAWN_CHANCE = 0.12;
const EDGE_TRIGGER_DISTANCE = 48;
let activePage = 'home';
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);

/* --- PAGE SWITCHING --- */
const pages = {
    home: { el: document.getElementById('homeView') },
    aboutme: { el: document.getElementById('aboutme') },
    portfolio: { el: document.getElementById('portfolio') },
    video: { el: document.getElementById('video') },
    contact: { el: document.getElementById('contact') }
};

function showPage(key) {
    activePage = key;
    const hero = document.getElementById('homeView');

    // Home View
    if (key === 'home') {
        if (hero) { hero.style.display = 'flex'; hero.classList.add('active-glitch'); }
    } else {
        if (hero) { hero.style.display = 'none'; hero.classList.remove('active-glitch'); }
    }

    // Page Visibility
    if (!pages.hasOwnProperty(key) && key !== 'home') return;
    Object.keys(pages).forEach(k => {
        const p = pages[k].el;
        if (k === key && k !== 'home') {
            if (p) { p.classList.add('active'); p.setAttribute('aria-hidden', 'false'); p.scrollTop = 0; }
        } else {
            if (p) { p.classList.remove('active'); p.setAttribute('aria-hidden', 'true'); }
        }
    });
    if (isTouchDevice) window.scrollTo({ top: 0, behavior: 'instant' });
}

/* --- NAV HIGHLIGHT & LOGIC --- */
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tgt = btn.dataset.target;
        showPage(tgt);
        // Visual Feedback
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
        btn.classList.add('active-nav');
    });
});

/* --- GALLERY LIGHTBOX SYSTEM --- */
let currentGalleryItems = [];
let currentIndex = 0;
const imgModal = document.getElementById('imgModal');
const imgModalContent = document.getElementById('imgModalContent');
const imgModalClose = document.getElementById('imgModalClose');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');

function openLightbox(index, items) {
    currentGalleryItems = items;
    currentIndex = index;
    updateLightboxContent();
    imgModal.style.display = 'flex';
    imgModal.setAttribute('aria-hidden', 'false');
}

function updateLightboxContent() {
    if (!currentGalleryItems.length) return;
    const item = currentGalleryItems[currentIndex];

    imgModalContent.innerHTML = ''; // Clear previous

    if (item.type === 'image') {
        // Image Logic
        imgModalContent.innerHTML = `<img src="${item.src}" alt="${item.alt}">`;
    } else if (item.type === 'video') {
        // Video Logic (YouTube Embed)
        imgModalContent.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${item.id}?autoplay=1&rel=0" 
            title="YouTube video player" frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen></iframe>`;
    }
}

function nextItem() {
    if (!currentGalleryItems.length) return;
    currentIndex = (currentIndex + 1) % currentGalleryItems.length;
    updateLightboxContent();
}

function prevItem() {
    if (!currentGalleryItems.length) return;
    currentIndex = (currentIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
    updateLightboxContent();
}

// Event Listeners for Gallery Items
document.querySelectorAll('.gallery-group').forEach(group => {
    // Collect siblings for context-aware navigation
    const children = Array.from(group.querySelectorAll('.img-slot, .video-card'));

    children.forEach((el, index) => {
        el.addEventListener('click', () => {
            // Build the list of items based on this group
            const items = children.map(child => {
                if (child.classList.contains('img-slot')) {
                    const img = child.querySelector('img');
                    return { type: 'image', src: img.src, alt: img.alt };
                } else {
                    const vidId = child.getAttribute('data-video-id');
                    return { type: 'video', id: vidId };
                }
            });
            openLightbox(index, items);
        });
    });
});

// Modal Controls
if (modalNext) modalNext.addEventListener('click', (e) => { e.stopPropagation(); nextItem(); });
if (modalPrev) modalPrev.addEventListener('click', (e) => { e.stopPropagation(); prevItem(); });
if (imgModalClose) imgModalClose.addEventListener('click', () => { imgModal.style.display = 'none'; imgModalContent.innerHTML = ''; });
if (imgModal) imgModal.addEventListener('click', (e) => {
    if (e.target === imgModal) { imgModal.style.display = 'none'; imgModalContent.innerHTML = ''; }
});

// Keyboard Nav
document.addEventListener('keydown', (e) => {
    if (imgModal.style.display === 'flex') {
        if (e.key === 'ArrowRight') nextItem();
        if (e.key === 'ArrowLeft') prevItem();
        if (e.key === 'Escape') { imgModal.style.display = 'none'; imgModalContent.innerHTML = ''; }
    }
});

/* --- CURSOR --- */
const cursor = document.getElementById('cursorRing');
if (cursor && !isTouchDevice) {
    document.addEventListener('mousemove', e => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
}
const interactiveSelector = 'button, .nav-btn, .img-slot, a, .video-card';
function setCursorHoverState(on) { if (cursor) { if (on) cursor.classList.add('cursor-large'); else cursor.classList.remove('cursor-large'); } }
if (!isTouchDevice) {
    document.querySelectorAll(interactiveSelector).forEach(el => {
        el.addEventListener('mouseenter', () => setCursorHoverState(true));
        el.addEventListener('mouseleave', () => setCursorHoverState(false));
    });
}

/* --- AMBIENT TITLE GLITCH --- */
const siteTitle = document.getElementById('siteTitle');
setInterval(() => {
    if (!siteTitle || activePage !== 'home') return;
    siteTitle.classList.add('title-glitch');
    document.body.classList.add('glitch', 'glitch-active');
    const overlay = document.querySelector('.glitch-overlay');
    if (overlay) overlay.style.display = 'block';
    setTimeout(() => {
        siteTitle.classList.remove('title-glitch');
        document.body.classList.remove('glitch', 'glitch-active');
        if (overlay) overlay.style.display = '';
    }, GLITCH_DURATION);
}, 30000);

/* --- INIT --- */
showPage('home');

/* --- POPOUTS (Side Menus) --- */
const leftEdge = document.getElementById('leftEdge');
const rightEdge = document.getElementById('rightEdge');
const leftPanel = document.getElementById('leftPanel');
const rightPanel = document.getElementById('rightPanel');

function openLeft() { if (leftPanel) leftPanel.classList.add('open-left'); }
function closeLeft() { if (leftPanel) leftPanel.classList.remove('open-left'); }
function openRight() { if (rightPanel) rightPanel.classList.add('open-right'); }
function closeRight() { if (rightPanel) rightPanel.classList.remove('open-right'); }

if (!isTouchDevice) {
    if (leftEdge) { leftEdge.addEventListener('mouseenter', () => openLeft()); leftEdge.addEventListener('mouseleave', () => closeLeft()); }
    if (rightEdge) { rightEdge.addEventListener('mouseenter', () => openRight()); rightEdge.addEventListener('mouseleave', () => closeRight()); }
    let popTimers = { left: null, right: null };
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX; const w = window.innerWidth;
        if (x < EDGE_TRIGGER_DISTANCE) {
            if (popTimers.left) { clearTimeout(popTimers.left); popTimers.left = null; }
            if (leftPanel && !leftPanel.classList.contains('open-left')) openLeft();
        } else if (x > w - EDGE_TRIGGER_DISTANCE) {
            if (popTimers.right) { clearTimeout(popTimers.right); popTimers.right = null; }
            if (rightPanel && !rightPanel.classList.contains('open-right')) openRight();
        } else {
            if (!popTimers.left) popTimers.left = setTimeout(() => closeLeft(), 500);
            if (!popTimers.right) popTimers.right = setTimeout(() => closeRight(), 500);
        }
    });
}

document.querySelectorAll('#leftPanel [data-pop]').forEach(btn => {
    btn.addEventListener('click', () => { showPage(btn.dataset.pop); closeLeft(); });
});
document.querySelectorAll('#rightPanel [data-social]').forEach(btn => {
    btn.addEventListener('click', () => { window.open(btn.dataset.social, '_blank', 'noopener'); closeRight(); });
});

/* --- SPARKS ANIMATION --- */
(function () {
    if (isTouchDevice) return;
    const canvas = document.getElementById('sparksCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let W = Math.floor(window.innerWidth * dpr);
    let H = Math.floor(window.innerHeight * dpr);
    canvas.width = W; canvas.height = H;
    canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sparks = [];
    const rand = (min, max) => Math.random() * (max - min) + min;
    class Spark {
        constructor(x, y, fx) {
            this.x = x; this.y = y;
            const angle = rand(0, Math.PI * 2);
            const speed = rand(0.6, 3.2);
            this.vx = Math.cos(angle) * speed + (fx || 0);
            this.vy = Math.sin(angle) * speed + rand(-1.2, 1.2);
            this.life = rand(600, 1200);
            this.age = 0;
            this.size = rand(1.2, 3.2);
            const t = Math.random();
            this.colorPrefix = t < 0.5 ? `rgba(0, 234, 255,` : `rgba(123, 44, 191,`;
        }
        update(dt) { this.age += dt; this.vx *= 0.99; this.vy += 0.02; this.x += this.vx; this.y += this.vy; }
        draw(ctx) {
            const lifeRatio = 1 - this.age / this.life;
            if (lifeRatio <= 0) return;
            ctx.beginPath();
            ctx.fillStyle = this.colorPrefix + (lifeRatio * 0.9) + ')';
            ctx.arc(this.x, this.y, this.size * lifeRatio, 0, Math.PI * 2);
            ctx.fill();
        }
        alive() { return this.age < this.life; }
    }
    let last = performance.now(); let running = true;
    function resizeCanvas() {
        dpr = Math.max(1, window.devicePixelRatio || 1);
        W = Math.floor(window.innerWidth * dpr); H = Math.floor(window.innerHeight * dpr);
        canvas.width = W; canvas.height = H;
        canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(loop); } });
    function spawnAt(x, y, fx) {
        const count = Math.floor(rand(2, 5));
        for (let i = 0; i < count; i++) { if (sparks.length >= MAX_SPARKS) break; sparks.push(new Spark(x + rand(-6, 6), y + rand(-6, 6), fx)); }
    }
    function ambientSpawn() { if (sparks.length < MAX_SPARKS && Math.random() < AMBIENT_SPAWN_CHANCE) spawnAt(rand(0, window.innerWidth), rand(0, window.innerHeight), 0); }
    let lastMouseSpawn = 0;
    window.addEventListener('mousemove', (e) => { const now = performance.now(); if (now - lastMouseSpawn > 40) { spawnAt(e.clientX, e.clientY, 0); lastMouseSpawn = now; } });
    setInterval(() => { if (!running) return; if (Math.random() < 0.65) { if (Math.random() < 0.5) spawnAt(rand(0, 50), rand(0, window.innerHeight), 1.2); else spawnAt(rand(window.innerWidth - 50, window.innerWidth), rand(0, window.innerHeight), -1.2); } }, 900);
    function loop(now) {
        if (!running) return;
        const dt = now - last; last = now;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ambientSpawn();
        for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.update(dt); if (!s.alive()) { sparks.splice(i, 1); continue; } s.draw(ctx); }
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
})();