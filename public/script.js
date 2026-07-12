const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const submitBtn = document.getElementById('submitBtn');
const pillBar = document.getElementById('pillBar');
const historyList = document.getElementById('historyList');

// Correct API address for Vercel relative path
const API_URL = '/api/translate';

// Sidebar Mechanics
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');

document.getElementById('openSidebar').onclick = () => { sidebar.classList.add('active'); overlay.classList.add('active'); };
document.getElementById('closeSidebar').onclick = () => closeSidebar();
overlay.onclick = () => closeSidebar();

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.onchange = (e) => {
    document.body.classList.toggle('dark', e.target.checked);
    localStorage.setItem('translator-dark', e.target.checked);
};
if (localStorage.getItem('translator-dark') === 'true') {
    darkModeToggle.checked = true;
    document.body.classList.add('dark');
}

// Translation Handler
async function translate() {
    const text = userInput.value.trim();
    if (!text) return;

    const target = document.getElementById('targetLang').value;
    const autoDetect = document.getElementById('autoDetectToggle').checked;

    addMessage(text, 'user');
    userInput.value = '';
    pillBar.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                target: target,
                source: autoDetect ? 'auto' : 'en'
            })
        });

        if (!response.ok) throw new Error('API unreachable');

        const data = await response.json();
        if (data.translated) {
            addMessage(data.translated, 'ai');
            saveToHistory(text, data.translated);
        }
    } catch (err) {
        addMessage("Sorry, I can't reach the translator right now.", "ai");
    } finally {
        pillBar.classList.remove('loading');
        submitBtn.disabled = false;
        userInput.focus();
    }
}

function addMessage(text, sender) {
    const group = document.createElement('div');
    group.className = `message-group ${sender}`;
    group.innerHTML = `
        <div class="avatar"><i class="fa-solid fa-${sender === 'ai' ? 'robot' : 'user'}"></i></div>
        <div class="bubble shadow">${text}</div>
    `;
    chatArea.appendChild(group);
    
    // Improved Scroll Fix
    setTimeout(() => {
        chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
    }, 100);
}

function saveToHistory(orig, trans) {
    let hist = JSON.parse(localStorage.getItem('tr_hist') || '[]');
    if (hist.some(h => h.orig === orig)) return;
    hist.unshift({ orig, trans });
    localStorage.setItem('tr_hist', JSON.stringify(hist.slice(0, 15)));
    loadHistory();
}

function loadHistory() {
    const hist = JSON.parse(localStorage.getItem('tr_hist') || '[]');
    historyList.innerHTML = hist.map(h => `
        <div class="history-item" onclick="window.reloadPhrase('${h.orig.replace(/'/g, "\\'")}')">
            <p><strong>${h.orig.substring(0,25)}...</strong></p>
            <span>${h.trans.substring(0,30)}...</span>
        </div>
    `).join('');
}

window.reloadPhrase = (text) => {
    userInput.value = text;
    if (window.innerWidth < 768) closeSidebar();
    userInput.focus();
};

submitBtn.onclick = translate;
userInput.onkeypress = (e) => { if (e.key === 'Enter') translate(); };
document.getElementById('logoutBtn').onclick = () => { localStorage.clear(); location.reload(); };
loadHistory();