const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const submitBtn = document.getElementById('submitBtn');
const pillBar = document.getElementById('pillBar');
const historyList = document.getElementById('historyList');

// Correct API detection for Local vs Vercel
const API_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') 
    ? 'http://127.0.0.1:5000/api/translate' 
    : '/api/translate';

// Sidebar UI
document.getElementById('openSidebar').onclick = () => document.getElementById('sidebar').classList.add('active');
document.getElementById('closeSidebar').onclick = () => document.getElementById('sidebar').classList.remove('active');

// Dark Mode logic
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.onchange = (e) => {
    document.body.classList.toggle('dark', e.target.checked);
    localStorage.setItem('dark-mode', e.target.checked);
};
if (localStorage.getItem('dark-mode') === 'true') {
    darkModeToggle.checked = true;
    document.body.classList.add('dark');
}

// Translation Handler
async function handleTranslate() {
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
        console.error(err);
        addMessage("Error: Could not reach the translator service.", 'ai');
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
        <div class="message shadow-sm">${text}</div>
    `;
    chatArea.appendChild(group);
    
    // Auto-scroll logic
    setTimeout(() => {
        chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
    }, 50);
}

function saveToHistory(orig, trans) {
    let hist = JSON.parse(localStorage.getItem('trans_hist') || '[]');
    if (hist.some(item => item.orig === orig)) return;
    hist.unshift({ orig, trans });
    localStorage.setItem('trans_hist', JSON.stringify(hist.slice(0, 10)));
    loadHistory();
}

function loadHistory() {
    const hist = JSON.parse(localStorage.getItem('trans_hist') || '[]');
    historyList.innerHTML = hist.map(i => `
        <div class="history-item" onclick="window.reloadPhrase('${i.orig.replace(/'/g, "\\'")}')">
            <div style="font-weight:600; opacity:0.8">${i.orig.substring(0,25)}...</div>
            <div style="color:var(--primary); font-size:0.8rem">${i.trans.substring(0,25)}...</div>
        </div>
    `).join('');
}

window.reloadPhrase = (text) => {
    userInput.value = text;
    if (window.innerWidth < 768) document.getElementById('sidebar').classList.remove('active');
    userInput.focus();
};

submitBtn.onclick = handleTranslate;
userInput.onkeypress = (e) => { if (e.key === 'Enter') handleTranslate(); };
loadHistory();