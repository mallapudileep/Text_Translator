const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const submitBtn = document.getElementById('submitBtn');
const pillBar = document.getElementById('pillBar');
const historyList = document.getElementById('historyList');

/**
 * AUTOMATIC API URL DETECTION
 * When local (127.0.0.1 or localhost), it uses the Python Port 5000.
 * When deployed, it uses the Vercel Serverless path.
 */
const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:5000/api/translate' 
    : '/api/translate';

// --- Sidebar logic ---
document.getElementById('openSidebar').onclick = () => {
    document.getElementById('sidebar').classList.add('active');
};

document.getElementById('closeSidebar').onclick = () => {
    document.getElementById('sidebar').classList.remove('active');
};

// --- Dark Mode logic ---
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.onchange = (e) => {
    const isDark = e.target.checked;
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('dark-mode', isDark);
};

// Load saved dark mode preference
if (localStorage.getItem('dark-mode') === 'true') {
    darkModeToggle.checked = true;
    document.body.classList.add('dark');
}

// --- Translation Logic ---
async function handleTranslate() {
    const text = userInput.value.trim();
    if (!text) return;

    const target = document.getElementById('targetLang').value;
    const autoDetect = document.getElementById('autoDetectToggle').checked;

    // UI Updates
    addMessage(text, 'user');
    userInput.value = '';
    pillBar.classList.add('loading'); // START Loading Animation
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
        console.error("Connection Error:", err);
        addMessage("Error: Is your Python terminal running on port 5000?", 'ai');
    } finally {
        // UI Reset
        pillBar.classList.remove('loading'); // STOP Loading Animation
        submitBtn.disabled = false;
        userInput.focus();
    }
}

// --- Chat UI Helpers ---
function addMessage(text, sender) {
    const group = document.createElement('div');
    group.className = `message-group ${sender}`;
    group.innerHTML = `
        <div class="avatar">
            <i class="fa-solid fa-${sender === 'ai' ? 'robot' : 'user'}"></i>
        </div>
        <div class="message shadow-sm">${text}</div>
    `;
    chatArea.appendChild(group);
    
    // Improved Scrolling Logic
    setTimeout(() => {
        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: 'smooth'
        });
    }, 50); // Small delay to wait for browser rendering
}

// --- History Logic (LocalStorage) ---
function saveToHistory(orig, trans) {
    let hist = JSON.parse(localStorage.getItem('trans_hist') || '[]');
    
    // Check for duplicates
    const isDuplicate = hist.some(item => item.orig === orig);
    if (isDuplicate) return;

    hist.unshift({ orig, trans }); // Add newest at top
    localStorage.setItem('trans_hist', JSON.stringify(hist.slice(0, 10))); // Save last 10 items
    loadHistory();
}

function loadHistory() {
    const hist = JSON.parse(localStorage.getItem('trans_hist') || '[]');
    historyList.innerHTML = hist.map(i => `
        <div class="history-item" onclick="reloadPhrase('${i.orig.replace(/'/g, "\\'")}')">
            <div style="font-weight:600; opacity: 0.8; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">
                ${i.orig}
            </div>
            <div style="color:var(--primary); font-size: 0.85rem;">
                ${i.trans.substring(0, 35)}...
            </div>
        </div>
    `).join('');
}

// Helper to put history text back into input
window.reloadPhrase = (text) => {
    userInput.value = text;
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
    userInput.focus();
};

// --- Action Listeners ---
submitBtn.onclick = handleTranslate;

userInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
        handleTranslate();
    }
};

// Mock Logout (Clears history)
document.getElementById('logoutBtn').onclick = () => {
    if (confirm("Do you want to clear history and logout?")) {
        localStorage.clear();
        location.reload();
    }
};

// --- Initialization ---
loadHistory();