/* ================================================================
   YAMLOK Admin Panel — admin.js
   ================================================================ */

/* ── DEFAULT PASSWORD (change this before deploying!) ── */
const DEFAULT_PASSWORD = 'yamlok2025';

/* ── STATE ── */
let mediaData = { images: [], videos: [] };
let isDirty = false;

/* ═══════════════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════════════ */
const loginScreen = document.getElementById('loginScreen');
const adminPanel  = document.getElementById('adminPanel');
const loginBtn    = document.getElementById('loginBtn');
const loginError  = document.getElementById('loginError');
const logoutBtn   = document.getElementById('logoutBtn');

function getPassword() {
    return localStorage.getItem('adm_password') || DEFAULT_PASSWORD;
}

function checkSession() {
    return sessionStorage.getItem('adm_auth') === '1';
}

function login() {
    const val = document.getElementById('loginPassword').value;
    if (val === getPassword()) {
        sessionStorage.setItem('adm_auth', '1');
        loginScreen.style.display = 'none';
        adminPanel.style.display  = 'flex';
        loadSettings();
        loadMedia();
    } else {
        loginError.textContent = 'Incorrect password.';
        document.getElementById('loginPassword').value = '';
    }
}

loginBtn.addEventListener('click', login);
document.getElementById('loginPassword').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adm_auth');
    location.reload();
});

if (checkSession()) {
    loginScreen.style.display = 'none';
    adminPanel.style.display  = 'flex';
    loadSettings();
    loadMedia();
}

/* ═══════════════════════════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════════════════════════ */
document.querySelectorAll('.adm-sidenav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.adm-sidenav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

/* ═══════════════════════════════════════════════════════════════
   LOAD MEDIA (fetch media.json)
═══════════════════════════════════════════════════════════════ */
async function loadMedia() {
    try {
        const res = await fetch('media.json?_=' + Date.now());
        mediaData = await res.json();
    } catch {
        mediaData = { images: [], videos: [] };
    }
    renderImages();
    renderVideos();
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function markDirty() {
    isDirty = true;
    document.getElementById('saveStatus').textContent = '⚠ Unsaved changes';
    document.getElementById('saveStatus').className = 'adm-save-status dirty';
}

function extractYouTubeId(input) {
    input = input.trim();
    // Already a bare ID (11 chars, no slashes)
    if (/^[\w-]{11}$/.test(input)) return input;
    // youtu.be/ID
    const short = input.match(/youtu\.be\/([\w-]{11})/);
    if (short) return short[1];
    // youtube.com/watch?v=ID  or  /embed/ID  or  /shorts/ID
    const long = input.match(/(?:v=|\/embed\/|\/shorts\/)([\w-]{11})/);
    if (long) return long[1];
    return null;
}

function convertDriveLink(url) {
    // Convert Google Drive share links to direct embed links
    const m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    return url;
}

/* ═══════════════════════════════════════════════════════════════
   IMAGES — RENDER
═══════════════════════════════════════════════════════════════ */
function renderImages() {
    const list = document.getElementById('imageList');
    document.getElementById('imgCount').textContent = `(${mediaData.images.length})`;
    list.innerHTML = '';
    mediaData.images.forEach((img, i) => {
        const row = document.createElement('div');
        row.className = 'adm-media-row';
        row.draggable = true;
        row.dataset.index = i;
        row.dataset.type  = 'images';
        row.innerHTML = `
            <span class="adm-drag-handle" title="Drag to reorder">⠿</span>
            <img class="adm-thumb" src="${img.src}" alt="${img.alt}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'60\\' height=\\'40\\'><rect fill=\\'%23111\\' width=\\'60\\' height=\\'40\\'/><text fill=\\'%23555\\' x=\\'50%\\' y=\\'55%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'10\\'>No preview</text></svg>'" />
            <div class="adm-row-info">
                <input class="adm-inline-input" type="url" value="${escHtml(img.src)}" data-field="src" data-index="${i}" data-type="images" placeholder="Image URL" />
                <input class="adm-inline-input adm-inline-small" type="text" value="${escHtml(img.alt)}" data-field="alt" data-index="${i}" data-type="images" placeholder="Caption" />
            </div>
            <button class="adm-remove-btn" data-index="${i}" data-type="images" title="Remove">✕</button>`;
        list.appendChild(row);
    });
    attachListEvents(list, 'images');
}

/* ═══════════════════════════════════════════════════════════════
   VIDEOS — RENDER
═══════════════════════════════════════════════════════════════ */
function renderVideos() {
    const list = document.getElementById('videoList');
    document.getElementById('vidCount').textContent = `(${mediaData.videos.length})`;
    list.innerHTML = '';
    mediaData.videos.forEach((vid, i) => {
        const isYT    = !!vid.id;
        const thumbSrc = isYT
            ? `https://img.youtube.com/vi/${vid.id}/mqdefault.jpg`
            : (vid.thumb || 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\\'68\\'><rect fill=\'%23111\' width=\'120\' height=\'68\'/><text fill=\'%23555\' x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-size=\'11\'>No preview</text></svg>');
        const urlVal   = isYT ? `https://www.youtube.com/watch?v=${vid.id}` : (vid.src || '');
        const row = document.createElement('div');
        row.className = 'adm-media-row';
        row.draggable = true;
        row.dataset.index = i;
        row.dataset.type  = 'videos';
        row.innerHTML = `
            <span class="adm-drag-handle" title="Drag to reorder">⠿</span>
            <img class="adm-thumb" src="${thumbSrc}" alt="${escHtml(vid.title || '')}" loading="lazy" />
            <div class="adm-row-info">
                <input class="adm-inline-input" type="text" value="${escHtml(urlVal)}" data-field="url" data-index="${i}" data-type="videos" placeholder="YouTube URL / video ID / direct URL" />
                <input class="adm-inline-input adm-inline-small" type="text" value="${escHtml(vid.title || '')}" data-field="title" data-index="${i}" data-type="videos" placeholder="Title" />
            </div>
            <button class="adm-remove-btn" data-index="${i}" data-type="videos" title="Remove">✕</button>`;
        list.appendChild(row);
    });
    attachListEvents(list, 'videos');
}

function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ═══════════════════════════════════════════════════════════════
   LIST EVENTS (inline edit, remove, drag-to-reorder)
═══════════════════════════════════════════════════════════════ */
function attachListEvents(list, type) {
    // Inline edits
    list.querySelectorAll('.adm-inline-input').forEach(input => {
        input.addEventListener('change', () => {
            const idx   = +input.dataset.index;
            const field = input.dataset.field;
            if (type === 'images') {
                mediaData.images[idx][field] = input.value.trim();
                if (field === 'src') {
                    const thumb = list.querySelectorAll('.adm-media-row')[idx].querySelector('.adm-thumb');
                    if (thumb) thumb.src = input.value.trim();
                }
            } else {
                // Videos: reconstruct object from url field
                if (field === 'url') {
                    const val = input.value.trim();
                    const ytId = extractYouTubeId(val);
                    if (ytId) {
                        mediaData.videos[idx] = { id: ytId, title: mediaData.videos[idx].title || '' };
                    } else {
                        const converted = convertDriveLink(val);
                        mediaData.videos[idx] = { src: converted, title: mediaData.videos[idx].title || '', thumb: mediaData.videos[idx].thumb || '' };
                    }
                } else if (field === 'title') {
                    mediaData.videos[idx].title = input.value.trim();
                }
            }
            markDirty();
        });
    });

    // Remove buttons
    list.querySelectorAll('.adm-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = +btn.dataset.index;
            if (!confirm('Remove this item?')) return;
            if (type === 'images') mediaData.images.splice(idx, 1);
            else mediaData.videos.splice(idx, 1);
            markDirty();
            if (type === 'images') renderImages(); else renderVideos();
        });
    });

    // Drag-to-reorder
    let dragSrc = null;
    list.querySelectorAll('.adm-media-row').forEach(row => {
        row.addEventListener('dragstart', e => { dragSrc = row; row.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
        row.addEventListener('dragend',   () => { dragSrc = null; list.querySelectorAll('.adm-media-row').forEach(r => r.classList.remove('dragging','drag-over')); });
        row.addEventListener('dragover',  e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; row.classList.add('drag-over'); });
        row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
        row.addEventListener('drop', e => {
            e.preventDefault();
            row.classList.remove('drag-over');
            if (!dragSrc || dragSrc === row) return;
            const from = +dragSrc.dataset.index;
            const to   = +row.dataset.index;
            const arr  = type === 'images' ? mediaData.images : mediaData.videos;
            arr.splice(to, 0, arr.splice(from, 1)[0]);
            markDirty();
            if (type === 'images') renderImages(); else renderVideos();
        });
    });
}

/* ═══════════════════════════════════════════════════════════════
   ADD IMAGE
═══════════════════════════════════════════════════════════════ */
document.getElementById('addImgBtn').addEventListener('click', () => {
    const url = document.getElementById('newImgUrl').value.trim();
    const alt = document.getElementById('newImgAlt').value.trim() || `Work Sample ${mediaData.images.length + 1}`;
    if (!url) { alert('Please enter an image URL or upload a file first.'); return; }
    mediaData.images.push({ src: url, alt });
    document.getElementById('newImgUrl').value = '';
    document.getElementById('newImgAlt').value = '';
    markDirty();
    renderImages();
});

/* ═══════════════════════════════════════════════════════════════
   IMAGE FILE UPLOAD → ImgBB
═══════════════════════════════════════════════════════════════ */
const imgFileInput    = document.getElementById('imgFileInput');
const imgUploadZone   = document.getElementById('imgUploadZone');
const imgUploadLabel  = document.getElementById('imgUploadLabel');
const imgUploadProg   = document.getElementById('imgUploadProgress');
const imgProgressFill = document.getElementById('imgProgressFill');
const imgUploadMsg    = document.getElementById('imgUploadMsg');

imgUploadZone.addEventListener('dragover', e => { e.preventDefault(); imgUploadZone.classList.add('dragover'); });
imgUploadZone.addEventListener('dragleave', () => imgUploadZone.classList.remove('dragover'));
imgUploadZone.addEventListener('drop', e => {
    e.preventDefault();
    imgUploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) uploadToImgBB(e.dataTransfer.files[0]);
});

imgFileInput.addEventListener('change', () => {
    if (imgFileInput.files.length) uploadToImgBB(imgFileInput.files[0]);
});

async function uploadToImgBB(file) {
    const apiKey = localStorage.getItem('imgbb_key');
    if (!apiKey) {
        alert('No ImgBB API key saved. Go to Settings → ImgBB to add one, then try again.');
        return;
    }
    imgUploadProg.style.display = 'block';
    imgProgressFill.style.width = '0%';
    imgUploadMsg.textContent = 'Uploading…';

    const form = new FormData();
    form.append('key', apiKey);
    form.append('image', file);

    try {
        // Fake progress animation while uploading
        let fakeProgress = 0;
        const fakeTimer = setInterval(() => {
            fakeProgress = Math.min(fakeProgress + 8, 85);
            imgProgressFill.style.width = fakeProgress + '%';
        }, 150);

        const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
        clearInterval(fakeTimer);

        if (!res.ok) throw new Error(`ImgBB error: ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message || 'Upload failed');

        imgProgressFill.style.width = '100%';
        imgUploadMsg.textContent = '✅ Uploaded!';

        const uploadedUrl = json.data.url;
        document.getElementById('newImgUrl').value = uploadedUrl;
        imgUploadLabel.textContent = `✅ ${file.name}`;

        setTimeout(() => { imgUploadProg.style.display = 'none'; }, 2000);
    } catch (err) {
        imgProgressFill.style.width = '0%';
        imgUploadMsg.textContent = `❌ ${err.message}`;
    }
    imgFileInput.value = '';
}

/* ═══════════════════════════════════════════════════════════════
   ADD VIDEO
═══════════════════════════════════════════════════════════════ */
document.getElementById('addVidBtn').addEventListener('click', () => {
    const ytInput    = document.getElementById('newVidUrl').value.trim();
    const directUrl  = document.getElementById('newVidDirectUrl').value.trim();
    const title      = document.getElementById('newVidTitle').value.trim() || `Video ${mediaData.videos.length + 1}`;
    const thumbInput = document.getElementById('newVidThumb').value.trim();

    if (ytInput) {
        const ytId = extractYouTubeId(ytInput);
        if (!ytId) { alert('Could not extract a YouTube video ID from that URL. Try pasting the full YouTube link.'); return; }
        mediaData.videos.push({ id: ytId, title });
    } else if (directUrl) {
        const converted = convertDriveLink(directUrl);
        const entry = { src: converted, title };
        if (thumbInput) entry.thumb = thumbInput;
        mediaData.videos.push(entry);
    } else {
        alert('Please enter a YouTube URL/ID or a direct video URL.');
        return;
    }

    document.getElementById('newVidUrl').value        = '';
    document.getElementById('newVidTitle').value      = '';
    document.getElementById('newVidDirectUrl').value  = '';
    document.getElementById('newVidThumb').value      = '';
    markDirty();
    renderVideos();
});

/* ═══════════════════════════════════════════════════════════════
   SETTINGS — LOAD & SAVE
═══════════════════════════════════════════════════════════════ */
function loadSettings() {
    const token    = localStorage.getItem('gh_token')    || '';
    const repo     = localStorage.getItem('gh_repo')     || '';
    const branch   = localStorage.getItem('gh_branch')   || 'main';
    const filePath = localStorage.getItem('gh_filepath') || 'media.json';
    const imgbbKey = localStorage.getItem('imgbb_key')   || '';

    document.getElementById('ghToken').value    = token;
    document.getElementById('ghRepo').value     = repo;
    document.getElementById('ghBranch').value   = branch;
    document.getElementById('ghFilePath').value = filePath;
    document.getElementById('imgbbKey').value   = imgbbKey;
}

document.getElementById('saveGhSettings').addEventListener('click', () => {
    localStorage.setItem('gh_token',    document.getElementById('ghToken').value.trim());
    localStorage.setItem('gh_repo',     document.getElementById('ghRepo').value.trim());
    localStorage.setItem('gh_branch',   document.getElementById('ghBranch').value.trim() || 'main');
    localStorage.setItem('gh_filepath', document.getElementById('ghFilePath').value.trim() || 'media.json');
    showMsg('ghMsg', '✅ GitHub settings saved!', 'success');
});

document.getElementById('saveImgbbSettings').addEventListener('click', () => {
    localStorage.setItem('imgbb_key', document.getElementById('imgbbKey').value.trim());
    showMsg('imgbbMsg', '✅ ImgBB key saved!', 'success');
});

document.getElementById('changePassBtn').addEventListener('click', () => {
    const cur     = document.getElementById('curPass').value;
    const nw      = document.getElementById('newPass').value;
    const confirm = document.getElementById('confirmPass').value;
    if (cur !== getPassword())        { showMsg('passMsg', '❌ Current password is wrong.',      'error'); return; }
    if (nw.length < 6)                { showMsg('passMsg', '❌ New password must be ≥ 6 chars.', 'error'); return; }
    if (nw !== confirm)               { showMsg('passMsg', '❌ Passwords do not match.',          'error'); return; }
    localStorage.setItem('adm_password', nw);
    document.getElementById('curPass').value     = '';
    document.getElementById('newPass').value     = '';
    document.getElementById('confirmPass').value = '';
    showMsg('passMsg', '✅ Password updated!', 'success');
});

function showMsg(elId, text, type) {
    const el = document.getElementById(elId);
    el.textContent = text;
    el.className   = 'adm-settings-msg ' + type;
    setTimeout(() => { el.textContent = ''; el.className = 'adm-settings-msg'; }, 4000);
}

/* ═══════════════════════════════════════════════════════════════
   SAVE & PUBLISH → GitHub API
═══════════════════════════════════════════════════════════════ */
document.getElementById('saveBtn').addEventListener('click', async () => {
    const token    = localStorage.getItem('gh_token');
    const repo     = localStorage.getItem('gh_repo');
    const branch   = localStorage.getItem('gh_branch')   || 'main';
    const filePath = localStorage.getItem('gh_filepath') || 'media.json';

    if (!token || !repo) {
        alert('⚠ GitHub settings are not configured. Go to Settings tab and fill in your GitHub token and repo.');
        return;
    }

    const saveBtn    = document.getElementById('saveBtn');
    const saveStatus = document.getElementById('saveStatus');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Publishing…';
    saveStatus.textContent = '';

    const content = JSON.stringify(mediaData, null, 2);
    const encoded = btoa(unescape(encodeURIComponent(content)));
    const apiBase = `https://api.github.com/repos/${repo}/contents/${filePath}`;

    try {
        // Get current SHA (needed for update)
        let sha = null;
        const getRes = await fetch(`${apiBase}?ref=${branch}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
        });
        if (getRes.ok) {
            const getJson = await getRes.json();
            sha = getJson.sha;
        } else if (getRes.status !== 404) {
            throw new Error(`GitHub fetch error: ${getRes.status} ${getRes.statusText}`);
        }

        // Push file
        const body = {
            message: 'Admin: update media.json',
            content: encoded,
            branch
        };
        if (sha) body.sha = sha;

        const putRes = await fetch(apiBase, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!putRes.ok) {
            const err = await putRes.json();
            throw new Error(err.message || `GitHub error: ${putRes.status}`);
        }

        isDirty = false;
        saveStatus.textContent = '✅ Published to GitHub!';
        saveStatus.className   = 'adm-save-status success';
    } catch (err) {
        saveStatus.textContent = `❌ ${err.message}`;
        saveStatus.className   = 'adm-save-status error';
    } finally {
        saveBtn.disabled    = false;
        saveBtn.textContent = '💾 Save & Publish';
    }
});

/* Warn on page leave if unsaved */
window.addEventListener('beforeunload', e => {
    if (isDirty) { e.preventDefault(); e.returnValue = ''; }
});
