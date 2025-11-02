// ====== Studix AI Tutor - Enhanced JavaScript with Quiz, Bookmarks, Flashcards & TTS ======

// Global variables
let chatData = [];
let subjectData = {};
let currentSession = { id: null, messages: [], title: '', timestamp: null };
let allSessions = [];
let currentTheme = 'dark';
let historyOpen = false;
let messageToEdit = null;
let dataLoaded = false;
let isFirstMessage = true;

// Scroll variables
let scrollToTopBtn = null;
let scrollToTopVisible = false;
let scrollToBottomBtn = null;
let scrollToBottomVisible = false;
let bottomFadeTimeout = null;
let userInteractionTimeout = null;

// Smart Navigation Scroll
let lastScroll = 0;
let headerElement = null;
let headerHeight = 0;
let currentTranslate = 0;

// ===== NEW: Quiz, Bookmarks, Flashcards, TTS Variables =====
let bookmarks = [];
let flashcards = [];
let currentFlashcardIndex = 0;
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
let quizAnswers = [];
let isSpeaking = false;
let currentUtterance = null;

// Init when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadChatData();
    loadAllSessions();
    setupInputHandlers();
    loadTheme();
    setupChatScrollHandler();
    initScrollToTop();
    initScrollToBottom();
    initSmartNavigation();
    loadBookmarks();
    loadFlashcards();
    initTextToSpeech();
});

/* ---------- Smart Navigation (Facebook-style) ---------- */
function initSmartNavigation() {
    headerElement = document.getElementById('header');
    headerHeight = headerElement.offsetHeight;
    
    window.addEventListener('scroll', handleNavigationScroll);
}

function handleNavigationScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDifference = currentScroll - lastScroll;
    
    if (currentScroll <= 0) {
        currentTranslate = 0;
        headerElement.style.transform = 'translateY(0px)';
    } else {
        currentTranslate -= scrollDifference;
        
        if (currentTranslate < -headerHeight) {
            currentTranslate = -headerHeight;
        }
        if (currentTranslate > 0) {
            currentTranslate = 0;
        }
        headerElement.style.transform = `translateY(${currentTranslate}px)`;
    }
    
    lastScroll = currentScroll;
}

/* ---------- Scroll to Top ---------- */
function initScrollToTop() {
    scrollToTopBtn = document.getElementById('scrollToTop');
    
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.addEventListener('scroll', handleChatScroll);
    
    scrollToTopBtn.addEventListener('click', scrollToTop);
}

function handleChatScroll() {
    const chatMessages = document.getElementById('chatMessages');
    const scrollY = chatMessages.scrollTop;
    
    if (scrollY > 300) {
        if (!scrollToTopVisible) showScrollToTop();
    } else {
        if (scrollToTopVisible) hideScrollToTop();
    }
    
    const isAtBottom = chatMessages.scrollTop >= 
        chatMessages.scrollHeight - chatMessages.clientHeight - 50;
    
    if (isAtBottom) {
        hideScrollToBottom();
    } else {
        showScrollToBottom();
        startBottomFadeTimeout();
    }
    
    resetUserInteractionTimer();
}

function showScrollToTop() {
    scrollToTopVisible = true;
    scrollToTopBtn.classList.add('visible');
}

function hideScrollToTop() {
    scrollToTopVisible = false;
    scrollToTopBtn.classList.remove('visible');
}

function scrollToTop() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Scroll to Bottom ---------- */
function initScrollToBottom() {
    scrollToBottomBtn = document.getElementById('scrollToBottom');
    scrollToBottomBtn.addEventListener('click', scrollToBottomSmooth);
    scrollToBottomBtn.addEventListener('mouseenter', clearBottomFadeTimeout);
    scrollToBottomBtn.addEventListener('mouseleave', startBottomFadeTimeout);
    
    document.addEventListener('mousemove', resetUserInteractionTimer);
    document.addEventListener('keydown', resetUserInteractionTimer);
    document.addEventListener('click', resetUserInteractionTimer);
}

function setupChatScrollHandler() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.addEventListener('scroll', handleChatScroll);
}

function showScrollToBottom() {
    if (!scrollToBottomVisible) {
        scrollToBottomVisible = true;
        scrollToBottomBtn.classList.add('show');
        scrollToBottomBtn.classList.remove('fade-out');
    }
}

function hideScrollToBottom() {
    if (scrollToBottomVisible) {
        scrollToBottomVisible = false;
        scrollToBottomBtn.classList.remove('show', 'fade-out');
        clearBottomFadeTimeout();
        clearUserInteractionTimeout();
    }
}

function startBottomFadeTimeout() {
    clearBottomFadeTimeout();
    bottomFadeTimeout = setTimeout(() => {
        if (scrollToBottomVisible) {
            scrollToBottomBtn.classList.add('fade-out');
        }
    }, 2000);
}

function clearBottomFadeTimeout() {
    if (bottomFadeTimeout) {
        clearTimeout(bottomFadeTimeout);
        bottomFadeTimeout = null;
    }
    if (scrollToBottomVisible) {
        scrollToBottomBtn.classList.remove('fade-out');
    }
}

function resetUserInteractionTimer() {
    clearUserInteractionTimeout();
    if (scrollToBottomVisible) {
        scrollToBottomBtn.classList.remove('fade-out');
        userInteractionTimeout = setTimeout(() => {
            if (scrollToBottomVisible) {
                scrollToBottomBtn.classList.add('fade-out');
            }
        }, 3000);
    }
}

function clearUserInteractionTimeout() {
    if (userInteractionTimeout) {
        clearTimeout(userInteractionTimeout);
        userInteractionTimeout = null;
    }
}

function scrollToBottomSmooth() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTo({ 
        top: chatMessages.scrollHeight, 
        behavior: 'smooth' 
    });
    clearBottomFadeTimeout();
    resetUserInteractionTimer();
}

/* ---------- Data Loading ---------- */
async function loadChatData() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    try {
        const possiblePaths = ['./data.json', 'data.json', '/data.json'];
        let response = null;
        for (const path of possiblePaths) {
            try {
                response = await fetch(path);
                if (response.ok) break;
            } catch { continue; }
        }
        if (!response || !response.ok) throw new Error('Could not find data.json');

        const rawData = await response.json();
        if (!Array.isArray(rawData)) throw new Error('JSON must be an array');
        chatData = rawData.filter(item =>
            typeof item === 'object' && item.question && item.answer
        );
        if (chatData.length === 0) throw new Error('No valid Q&A found');

        await loadSubjectFiles();
        dataLoaded = true;
        loadingIndicator.style.display = 'none';
        startNewChat();
    } catch (err) {
        console.error('Error loading chat data:', err);
        loadingIndicator.style.display = 'none';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML =
            `<strong>⚠️ Error:</strong> ${err.message}<br>Using fallback responses.`;
        document.getElementById('chatMessages').appendChild(errorDiv);
        chatData = [
            { question: "hi", answer: "Hello! I'm your Studix AI Tutor." },
            { question: "hello", answer: "Hi there!" },
            { question: "bye", answer: "Goodbye! Keep studying." },
            { question: "help", answer: "Ask me about Science or Social Studies." }
        ];
        dataLoaded = true;
        startNewChat();
    }
}

async function loadSubjectFiles() {
    const subjectFiles = ['Chemistry.json', 'Physics.json', 'Biology.json'];
    for (const file of subjectFiles) {
        try {
            const res = await fetch(file);
            if (res.ok) subjectData[file.replace('.json', '')] = await res.json();
        } catch { /* optional */ }
    }
}

/* ---------- Input Handling ---------- */
function setupInputHandlers() {
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    messageInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            if (!isMobile() && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        }
    });
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        .test(navigator.userAgent) || window.innerWidth <= 768;
}

/* ---------- Chat Functions ---------- */
function startNewChat() {
    if (!dataLoaded) return;

    if (currentSession.messages.length > 0) saveCurrentSession();
    currentSession = {
        id: Date.now(),
        messages: [],
        title: 'New Chat',
        timestamp: new Date()
    };

    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="welcome-prompt" id="welcomePrompt">
            <div class="welcome-title">Studix AI Tutor</div>
            <div class="welcome-subtitle">Ask anything related to your Class 10 studies - Science or Social Studies</div>
        </div>
        <button class="scroll-to-bottom" id="scrollToBottom" onclick="scrollToBottomSmooth()">↓</button>
    `;

    isFirstMessage = true;
    updateSessionsList();
    setupChatScrollHandler();
    initScrollToBottom();
}

function sendMessage() {
    if (!dataLoaded) {
        alert('Please wait for data to load.');
        return;
    }
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text) return;

    if (isFirstMessage) {
        const welcome = document.getElementById('welcomePrompt');
        if (welcome) {
            welcome.classList.add('hidden');
            setTimeout(() => welcome.remove(), 500);
        }
        isFirstMessage = false;
    }

    removePreviousSuggestions();

    addMessage('user', text);
    input.value = '';
    input.style.height = 'auto';

    setTimeout(() => {
        const result = findResponse(text);
        addMessage('bot', result.answer, result.suggestions, true, result.subject);
    }, 500);
}

function removePreviousSuggestions() {
    const allSuggestions = document.querySelectorAll('.suggestions-container');
    allSuggestions.forEach(suggestion => {
        const parentMessage = suggestion.closest('.message');
        if (parentMessage) {
            parentMessage.remove();
        }
    });
}

/* ---------- Enhanced Response Finding ---------- */
function findResponse(msg) {
    const lower = msg.toLowerCase().trim();
    
    for (let item of chatData) {
        if (item.question.toLowerCase().trim() === lower) {
            return { 
                answer: item.answer, 
                suggestions: getSimilarQuestions(item.question, 4),
                matchType: 'exact'
            };
        }
    }
    
    const sub = checkSubjectDataEnhanced(lower);
    if (sub) return sub;
    
    const fuzzyMatch = findFuzzyMatch(lower);
    if (fuzzyMatch) return fuzzyMatch;
    
    const semanticMatch = findSemanticMatch(lower);
    if (semanticMatch) return semanticMatch;
    
    return getFallbackWithContext(lower);
}

/* ---------- Enhanced Subject Data Checker ---------- */
function checkSubjectDataEnhanced(text) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [subject, data] of Object.entries(subjectData)) {
        if (!data.chapters) continue;
        
        for (const chapter of data.chapters) {
            if (!chapter.topics) continue;
            
            for (const topic of chapter.topics) {
                const topicLower = topic.topic.toLowerCase();
                
                let score = 0;
                
                if (text.includes(topicLower)) {
                    score += 10;
                }
                
                const topicWords = topicLower.split(/\s+/);
                const textWords = text.split(/\s+/);
                
                topicWords.forEach(tw => {
                    if (tw.length > 2) {
                        textWords.forEach(word => {
                            if (word.length > 2) {
                                if (word === tw) {
                                    score += 3;
                                } else if (word.includes(tw) || tw.includes(word)) {
                                    score += 1;
                                }
                            }
                        });
                    }
                });
                
                if (topic.subtopics) {
                    topic.subtopics.forEach(st => {
                        if (text.includes(st.name.toLowerCase())) {
                            score += 5;
                        }
                    });
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = { topic, chapter, data };
                }
            }
        }
    }
    
    if (bestScore >= 3) {
        const { topic, chapter, data } = bestMatch;
        let ans = `**${topic.topic}**\n\n${topic.brief || ''}\n\n`;
        
        if (topic.subtopics && topic.subtopics.length) {
            ans += `**Key Points:**\n\n`;
            topic.subtopics.forEach((st, i) =>
                ans += `${i + 1}. **${st.name}:** ${st.explanation || ''}\n\n`);
        }
        
        if (topic.examples && topic.examples.length) {
            ans += `**Examples:**\n\n`;
            topic.examples.forEach((ex, i) => 
                ans += `${i + 1}. ${ex}\n\n`);
        }
        
        ans += `📚 Subject: ${data.subject}\n📖 Chapter: ${chapter.chapter_no} - ${chapter.chapter_name}`;
        
        return { 
            answer: ans, 
            suggestions: getContextualSuggestions(topic, data, chapter, 4),
            matchType: 'subject',
            subject: data.subject
        };
    }
    
    return null;
}

/* ---------- Contextual Suggestions ---------- */
function getContextualSuggestions(currentTopic, subjectData, currentChapter, count = 4) {
    const suggestions = [];
    
    if (currentTopic.subtopics && currentTopic.subtopics.length > 0) {
        currentTopic.subtopics.slice(0, 2).forEach(st => {
            suggestions.push(`Explain ${st.name}`);
        });
    }
    
    if (currentChapter.topics && suggestions.length < count) {
        const otherTopics = currentChapter.topics
            .filter(t => t.topic !== currentTopic.topic)
            .slice(0, count - suggestions.length);
        
        otherTopics.forEach(t => {
            suggestions.push(`What is ${t.topic}?`);
        });
    }
    
    if (suggestions.length < count && subjectData.chapters) {
        const currentChapterIndex = subjectData.chapters.findIndex(
            ch => ch.chapter_no === currentChapter.chapter_no
        );
        
        if (currentChapterIndex !== -1 && currentChapterIndex < subjectData.chapters.length - 1) {
            const nextChapter = subjectData.chapters[currentChapterIndex + 1];
            if (nextChapter.topics && nextChapter.topics.length > 0) {
                suggestions.push(`Tell me about ${nextChapter.topics[0].topic}`);
            }
        }
    }
    
    if (suggestions.length < count && subjectData.chapters) {
        for (const chapter of subjectData.chapters) {
            if (suggestions.length >= count) break;
            if (chapter.chapter_no !== currentChapter.chapter_no && chapter.topics) {
                for (const topic of chapter.topics) {
                    if (suggestions.length >= count) break;
                    suggestions.push(`Explain ${topic.topic}`);
                }
            }
        }
    }
    
    return suggestions.slice(0, count);
}

/* ---------- Fuzzy Matching ---------- */
function findFuzzyMatch(text) {
    function levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }
    
    let bestMatch = null;
    let bestDistance = Infinity;
    const threshold = Math.max(3, Math.floor(text.length * 0.3));
    
    for (let item of chatData) {
        const distance = levenshtein(text, item.question.toLowerCase());
        if (distance < bestDistance && distance <= threshold) {
            bestDistance = distance;
            bestMatch = item;
        }
    }
    
    if (bestMatch) {
        return {
            answer: `*Did you mean: "${bestMatch.question}"?*\n\n${bestMatch.answer}`,
            suggestions: getSimilarQuestions(bestMatch.question, 4),
            matchType: 'fuzzy'
        };
    }
    
    return null;
}

/* ---------- Semantic Keyword Matching ---------- */
function findSemanticMatch(lower) {
    const stopWords = new Set([
        "what","is","are","how","why","when","where","who","which","can","will","would","could","should",
        "the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","up","about","into","through","during",
        "kya","hai","hain","ka","ki","ke","ko","se","me","par","aur","ya","jo","kaise","kab","kahan","kaun","batao","bta","btao"
    ]);
    
    function words(t) {
        return t.replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));
    }
    
    const userWords = words(lower);
    if (userWords.length === 0) return null;
    
    let best = null, bestScore = 0;
    
    for (let item of chatData) {
        const qWords = words(item.question.toLowerCase());
        let score = 0;
        
        userWords.forEach(u => {
            qWords.forEach(q => {
                if (u === q) {
                    score += 3;
                } else if (u.length > 3 && q.length > 3) {
                    if (u.includes(q) || q.includes(u)) {
                        score += 1;
                    }
                }
            });
        });
        
        if (score > bestScore) {
            bestScore = score;
            best = item;
        }
    }
    
    if (best && bestScore >= 3) {
        return { 
            answer: best.answer, 
            suggestions: getSimilarQuestions(best.question, 4),
            matchType: 'semantic'
        };
    }
    
    return null;
}

/* ---------- Smart Fallback ---------- */
function getFallbackWithContext(text) {
    const subjectKeywords = {
        Physics: ['force', 'motion', 'energy', 'light', 'electricity', 'magnetic', 'current', 'voltage', 
                  'power', 'work', 'pressure', 'velocity', 'acceleration', 'gravity', 'wave'],
        Chemistry: ['atom', 'molecule', 'chemical', 'reaction', 'acid', 'base', 'salt', 'element', 
                    'compound', 'periodic', 'electron', 'proton', 'neutron', 'bond', 'valency'],
        Biology: ['cell', 'organism', 'plant', 'animal', 'evolution', 'dna', 'gene', 'tissue', 
                  'organ', 'photosynthesis', 'respiration', 'digestion', 'reproduction']
    };
    
    let detectedSubject = null;
    let maxMatches = 0;
    
    for (const [subject, keywords] of Object.entries(subjectKeywords)) {
        const matches = keywords.filter(kw => text.includes(kw)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            detectedSubject = subject;
        }
    }
    
    let answer = "I don't have specific information on that. ";
    let suggestions = [];
    
    if (detectedSubject && subjectData[detectedSubject]) {
        const subject = subjectData[detectedSubject];
        answer += `But I can help you with ${detectedSubject}! Here are some related topics:`;
        
        if (subject.chapters && subject.chapters.length > 0) {
            const randomChapters = [...subject.chapters]
                .sort(() => Math.random() - 0.5)
                .slice(0, 2);
            
            randomChapters.forEach(chapter => {
                if (chapter.topics && chapter.topics.length > 0) {
                    chapter.topics.slice(0, 2).forEach(topic => {
                        if (suggestions.length < 4) {
                            suggestions.push(`What is ${topic.topic}?`);
                        }
                    });
                }
            });
        }
    } else {
        answer += "Try asking about Science or Social Studies topics from Class 10.";
        suggestions = getRandomSuggestions(4);
    }
    
    return { 
        answer, 
        suggestions, 
        matchType: 'fallback',
        subject: detectedSubject
    };
}

/* ---------- Get Similar Questions ---------- */
function getSimilarQuestions(q, c = 4) {
    const suggestions = [];
    const used = new Set([q.toLowerCase()]);
    const shuffled = [...chatData].sort(() => Math.random() - 0.5);
    
    for (const item of shuffled) {
        if (suggestions.length >= c) break;
        if (!used.has(item.question.toLowerCase())) {
            suggestions.push(item.question);
            used.add(item.question.toLowerCase());
        }
    }
    
    return suggestions;
}

/* ---------- Get Random Suggestions ---------- */
function getRandomSuggestions(c = 4) {
    const shuf = [...chatData].sort(() => Math.random() - 0.5);
    return shuf.slice(0, c).map(i => i.question);
}

/* ---------- Add Message ---------- */
function addMessage(sender, text, suggestions = null, typewriter = false, subject = null) {
    const container = document.getElementById('chatMessages');
    const id = Date.now() + Math.random();
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.dataset.messageId = id;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    let formatted = text.replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/📚|📖/g, '<br>$&');

    if (sender === 'bot' && typewriter) {
        bubble.innerHTML = '';
        msgDiv.appendChild(bubble);
        container.appendChild(msgDiv);
        typewriterEffect(bubble, formatted, () => {
            if (suggestions && suggestions.length) {
                addSuggestions(container, suggestions, subject);
            }
            container.scrollTop = container.scrollHeight;
        });
    } else {
        bubble.innerHTML = formatted;
        msgDiv.appendChild(bubble);
        container.appendChild(msgDiv);
        if (sender === 'bot' && suggestions && suggestions.length) {
            addSuggestions(container, suggestions, subject);
        }
        container.scrollTop = container.scrollHeight;
    }

    const actions = document.createElement('div');
    actions.className = 'message-actions';
    if (sender === 'user') {
        actions.innerHTML = `
            <button class="action-btn" onclick="editMessage(${id})">✏️ Edit</button>
            <button class="action-btn" onclick="deleteMessage(${id})">🗑️ Delete</button>`;
    } else {
        actions.innerHTML = `
            <button class="action-btn" onclick="bookmarkMessage(${id})">⭐ Bookmark</button>
            <button class="action-btn tts-btn" onclick="speakMessage(${id})">🔊 Listen</button>
            <button class="action-btn" onclick="createFlashcardFromMessage(${id})">📇 Flashcard</button>
            <button class="action-btn" onclick="deleteMessage(${id})">🗑️ Delete</button>`;
    }
    msgDiv.appendChild(actions);

    let pressTimer;
    msgDiv.addEventListener('mousedown', e => {
        if (e.button === 2) { e.preventDefault(); showMessageActions(id); }
    });
    msgDiv.addEventListener('touchstart', () => {
        pressTimer = setTimeout(() => showMessageActions(id), 500);
    });
    msgDiv.addEventListener('touchend', () => clearTimeout(pressTimer));
    msgDiv.addEventListener('contextmenu', e => {
        e.preventDefault();
        showMessageActions(id);
    });

    currentSession.messages.push({
        id, sender, text, suggestions, timestamp: new Date(), subject
    });
    
    if (sender === 'user' && currentSession.title === 'New Chat') {
        currentSession.title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
    }
}

function typewriterEffect(el, text, cb) {
    const words = text.split(' ');
    let i = 0;
    el.innerHTML = '';
    (function next() {
        if (i < words.length) {
            el.innerHTML += (i ? ' ' : '') + words[i++];
            setTimeout(next, 50);
        } else if (cb) cb();
    })();
}

function addSuggestions(container, suggestions, subject = null) {
    const wrap = document.createElement('div');
    wrap.className = 'message bot';
    const box = document.createElement('div');
    box.className = 'suggestions-container';
    const title = document.createElement('div');
    title.className = 'suggestions-title';
    
    if (subject) {
        title.textContent = `Related ${subject} questions:`;
    } else {
        title.textContent = 'You might also ask:';
    }
    
    box.appendChild(title);
    const grid = document.createElement('div');
    grid.className = 'suggestions-grid';
    suggestions.forEach(s => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.textContent = s;
        card.onclick = () => {
            document.getElementById('messageInput').value = s;
            sendMessage();
        };
        grid.appendChild(card);
    });
    box.appendChild(grid);
    wrap.appendChild(box);
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
}

/* ---------- Message Edit/Delete ---------- */
function showMessageActions(id) {
    document.querySelectorAll('.message-actions').forEach(a => a.classList.remove('show'));
    const el = document.querySelector(`[data-message-id="${id}"] .message-actions`);
    if (el) {
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 3000);
    }
}

function editMessage(id) {
    const el = document.querySelector(`[data-message-id="${id}"] .message-bubble`);
    if (!el) return;
    messageToEdit = id;
    document.getElementById('editTextarea').value = el.textContent.trim();
    document.getElementById('editModal').classList.add('show');
}

function saveEdit() {
    if (!messageToEdit) return;
    const newText = document.getElementById('editTextarea').value.trim();
    if (!newText) return;
    const index = currentSession.messages.findIndex(m => m.id === messageToEdit);
    if (index === -1) return;

    currentSession.messages[index].text = newText;
    const el = document.querySelector(`[data-message-id="${messageToEdit}"] .message-bubble`);
    el.innerHTML = newText.replace(/\n/g, '<br>');

    let next = document.querySelector(`[data-message-id="${messageToEdit}"]`).nextElementSibling;
    while (next) { const t = next; next = next.nextElementSibling; t.remove(); }

    cancelEdit();
    if (currentSession.messages[index].sender === 'user') {
        setTimeout(() => {
            const result = findResponse(newText);
            addMessage('bot', result.answer, result.suggestions, true, result.subject);
        }, 500);
    }
}

function cancelEdit() {
    messageToEdit = null;
    document.getElementById('editModal').classList.remove('show');
}

function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    const el = document.querySelector(`[data-message-id="${id}"]`);
    if (el) el.remove();
    currentSession.messages =currentSession.messages.filter(m => m.id !== id);
}

/* ---------- Sessions ---------- */
function saveCurrentSession() {
    if (!currentSession.messages.length) return;

    const idx = allSessions.findIndex(s => s.id === currentSession.id);
    if (idx !== -1) {
        allSessions[idx] = { ...currentSession };
    } else {
        allSessions.unshift({ ...currentSession });
    }

    if (allSessions.length > 50) {
        allSessions = allSessions.slice(0, 50);
    }

    localStorage.setItem('chatSessions', JSON.stringify(allSessions));
    updateSessionsList();
}

function loadAllSessions() {
    const saved = localStorage.getItem('chatSessions');
    if (saved) {
        try {
            allSessions = JSON.parse(saved);
            updateSessionsList();
        } catch (err) {
            console.error('Error loading sessions:', err);
            allSessions = [];
        }
    }
}

function updateSessionsList() {
    const container = document.getElementById('historySessions');
    container.innerHTML = '';

    if (allSessions.length === 0) {
        container.innerHTML = '<p style="padding:1rem;color:var(--text-secondary);text-align:center;">No previous chats</p>';
        return;
    }

    allSessions.forEach(session => {
        const div = document.createElement('div');
        div.className = 'session-item';
        if (session.id === currentSession.id) {
            div.classList.add('active');
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'session-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteSession(session.id);
        };
        
        div.innerHTML = `
            <div class="session-title">${session.title}</div>
            <div class="session-date">${new Date(session.timestamp).toLocaleString()}</div>
        `;
        div.appendChild(deleteBtn);
        div.onclick = () => loadSession(session.id);
        container.appendChild(div);
    });
}

function loadSession(id) {
    const found = allSessions.find(s => s.id === id);
    if (!found) return;

    currentSession = JSON.parse(JSON.stringify(found));
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '<button class="scroll-to-bottom" id="scrollToBottom" onclick="scrollToBottomSmooth()">↓</button>';

    removePreviousSuggestions();

    let lastBotMessageIndex = -1;
    for (let i = currentSession.messages.length - 1; i >= 0; i--) {
        if (currentSession.messages[i].sender === 'bot') {
            lastBotMessageIndex = i;
            break;
        }
    }

    currentSession.messages.forEach((m, index) => {
        const isLastBotMessage = index === lastBotMessageIndex;
        
        if (isLastBotMessage && m.suggestions && m.suggestions.length > 0) {
            addMessage(m.sender, m.text, m.suggestions, false, m.subject);
        } else {
            addMessage(m.sender, m.text, null, false, m.subject);
        }
    });

    updateSessionsList();
    setupChatScrollHandler();
    initScrollToBottom();
    
    if (isMobile() && historyOpen) {
        toggleHistory();
    }
}

function deleteSession(id) {
    if (!confirm('Delete this chat session?')) return;
    
    allSessions = allSessions.filter(s => s.id !== id);
    localStorage.setItem('chatSessions', JSON.stringify(allSessions));
    
    if (currentSession.id === id) {
        startNewChat();
    } else {
        updateSessionsList();
    }
}

function deleteAllSessions() {
    if (!confirm('Delete all chat history? This cannot be undone!')) return;
    
    allSessions = [];
    localStorage.setItem('chatSessions', JSON.stringify(allSessions));
    startNewChat();
    updateSessionsList();
}

/* ---------- Theme Toggle ---------- */
function toggleTheme() {
    const body = document.body;
    if (currentTheme === 'dark') {
        body.setAttribute('data-theme', 'light');
        currentTheme = 'light';
    } else {
        body.setAttribute('data-theme', 'dark');
        currentTheme = 'dark';
    }
    localStorage.setItem('chatTheme', currentTheme);
}

function loadTheme() {
    const saved = localStorage.getItem('chatTheme');
    if (saved) {
        currentTheme = saved;
        document.body.setAttribute('data-theme', currentTheme);
    }
}

function toggleHistory() {
    historyOpen = !historyOpen;
    const panel = document.getElementById('historyPanel');
    const chatContainer = document.getElementById('chatContainer');
    
    if (historyOpen) {
        panel.classList.add('open');
        chatContainer.classList.add('history-open');
    } else {
        panel.classList.remove('open');
        chatContainer.classList.remove('history-open');
    }
}

document.addEventListener('click', function(e) {
    const panel = document.getElementById('historyPanel');
    const toggleBtn = document.querySelector('.history-toggle');
    
    if (historyOpen && !panel.contains(e.target) && !toggleBtn.contains(e.target)) {
        if (e.target.closest('.history-panel')) return;
    }
});

/* ==================== BOOKMARKS SYSTEM ==================== */

function loadBookmarks() {
    const saved = localStorage.getItem('chatBookmarks');
    if (saved) {
        try {
            bookmarks = JSON.parse(saved);
            updateBookmarksList();
        } catch (err) {
            console.error('Error loading bookmarks:', err);
            bookmarks = [];
        }
    }
}

function saveBookmarks() {
    localStorage.setItem('chatBookmarks', JSON.stringify(bookmarks));
    updateBookmarksList();
}

function bookmarkMessage(messageId) {
    const msg = currentSession.messages.find(m => m.id === messageId);
    if (!msg) return;
    
    // Check if already bookmarked
    const existingIndex = bookmarks.findIndex(b => b.messageId === messageId);
    if (existingIndex !== -1) {
        bookmarks.splice(existingIndex, 1);
        showToast('Bookmark removed! ⭐');
    } else {
        const bookmark = {
            id: Date.now(),
            messageId: messageId,
            text: msg.text,
            timestamp: new Date(),
            sessionId: currentSession.id,
            sessionTitle: currentSession.title
        };
        bookmarks.unshift(bookmark);
        showToast('Bookmarked! ⭐');
    }
    
    saveBookmarks();
}

function updateBookmarksList() {
    const container = document.getElementById('bookmarksList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (bookmarks.length === 0) {
        container.innerHTML = '<p style="padding:1rem;color:var(--text-secondary);text-align:center;">No bookmarks yet</p>';
        return;
    }
    
    bookmarks.forEach(bookmark => {
        const div = document.createElement('div');
        div.className = 'bookmark-item';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'bookmark-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteBookmark(bookmark.id);
        };
        
        const text = bookmark.text.length > 100 ? bookmark.text.substring(0, 100) + '...' : bookmark.text;
        
        div.innerHTML = `
            <div class="bookmark-text">${text}</div>
            <div class="bookmark-meta">
                <span class="bookmark-session">${bookmark.sessionTitle}</span>
                <span class="bookmark-date">${new Date(bookmark.timestamp).toLocaleDateString()}</span>
            </div>
        `;
        div.appendChild(deleteBtn);
        div.onclick = () => viewBookmark(bookmark);
        container.appendChild(div);
    });
}

function deleteBookmark(id) {
    bookmarks = bookmarks.filter(b => b.id !== id);
    saveBookmarks();
    showToast('Bookmark deleted!');
}

function viewBookmark(bookmark) {
    // Load the session containing this bookmark
    const session = allSessions.find(s => s.sessionId === bookmark.sessionId);
    if (session) {
        loadSession(session.id);
    }
    
    // Highlight the bookmarked message
    setTimeout(() => {
        const msgElement = document.querySelector(`[data-message-id="${bookmark.messageId}"]`);
        if (msgElement) {
            msgElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            msgElement.classList.add('highlight-message');
            setTimeout(() => msgElement.classList.remove('highlight-message'), 2000);
        }
    }, 500);
    
    // Close bookmarks panel if on mobile
    if (isMobile()) {
        toggleBookmarks();
    }
}

function toggleBookmarks() {
    const panel = document.getElementById('bookmarksPanel');
    if (panel) {
        panel.classList.toggle('open');
    }
}

function clearAllBookmarks() {
    if (!confirm('Delete all bookmarks? This cannot be undone!')) return;
    
    bookmarks = [];
    saveBookmarks();
    showToast('All bookmarks cleared!');
}

/* ==================== FLASHCARDS SYSTEM ==================== */

function loadFlashcards() {
    const saved = localStorage.getItem('chatFlashcards');
    if (saved) {
        try {
            flashcards = JSON.parse(saved);
        } catch (err) {
            console.error('Error loading flashcards:', err);
            flashcards = [];
        }
    }
}

function saveFlashcards() {
    localStorage.setItem('chatFlashcards', JSON.stringify(flashcards));
}

function createFlashcardFromMessage(messageId) {
    const msg = currentSession.messages.find(m => m.id === messageId);
    if (!msg || msg.sender !== 'bot') return;
    
    // Find the user's question (previous message)
    const msgIndex = currentSession.messages.findIndex(m => m.id === messageId);
    const userMsg = msgIndex > 0 ? currentSession.messages[msgIndex - 1] : null;
    
    if (!userMsg || userMsg.sender !== 'user') {
        showToast('Could not create flashcard');
        return;
    }
    
    const flashcard = {
        id: Date.now(),
        front: userMsg.text,
        back: msg.text,
        subject: msg.subject || 'General',
        created: new Date(),
        lastReviewed: null,
        reviewCount: 0,
        mastered: false
    };
    
    flashcards.unshift(flashcard);
    saveFlashcards();
    showToast('Flashcard created! 📇');
}

function openFlashcardMode() {
    if (flashcards.length === 0) {
        showToast('No flashcards yet! Create some from bot messages.');
        return;
    }
    
    currentFlashcardIndex = 0;
    showFlashcard(currentFlashcardIndex);
    document.getElementById('flashcardModal').classList.add('show');
}

function showFlashcard(index) {
    if (index < 0 || index >= flashcards.length) return;
    
    const flashcard = flashcards[index];
    const modal = document.getElementById('flashcardModal');
    
    const card = modal.querySelector('.flashcard');
    const front = modal.querySelector('.flashcard-front');
    const back = modal.querySelector('.flashcard-back');
    const counter = modal.querySelector('.flashcard-counter');
    const subject = modal.querySelector('.flashcard-subject');
    
    front.innerHTML = flashcard.front;
    back.innerHTML = flashcard.back.replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    counter.textContent = `${index + 1} / ${flashcards.length}`;
    subject.textContent = flashcard.subject;
    
    // Reset flip
    card.classList.remove('flipped');
    
    // Update mastered button
    const masteredBtn = modal.querySelector('.flashcard-mastered-btn');
    if (flashcard.mastered) {
        masteredBtn.textContent = '✅ Mastered';
        masteredBtn.classList.add('mastered');
    } else {
        masteredBtn.textContent = '⭐ Mark as Mastered';
        masteredBtn.classList.remove('mastered');
    }
}

function flipFlashcard() {
    const card = document.querySelector('.flashcard');
    card.classList.toggle('flipped');
    
    // Update review count
    const flashcard = flashcards[currentFlashcardIndex];
    flashcard.lastReviewed = new Date();
    flashcard.reviewCount++;
    saveFlashcards();
}

function nextFlashcard() {
    currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcards.length;
    showFlashcard(currentFlashcardIndex);
}

function prevFlashcard() {
    currentFlashcardIndex = (currentFlashcardIndex - 1 + flashcards.length) % flashcards.length;
    showFlashcard(currentFlashcardIndex);
}

function toggleFlashcardMastered() {
    const flashcard = flashcards[currentFlashcardIndex];
    flashcard.mastered = !flashcard.mastered;
    saveFlashcards();
    showFlashcard(currentFlashcardIndex);
    showToast(flashcard.mastered ? 'Marked as mastered! 🎉' : 'Unmarked');
}

function deleteFlashcard() {
    if (!confirm('Delete this flashcard?')) return;
    
    flashcards.splice(currentFlashcardIndex, 1);
    saveFlashcards();
    
    if (flashcards.length === 0) {
        closeFlashcardMode();
        showToast('All flashcards deleted!');
        return;
    }
    
    if (currentFlashcardIndex >= flashcards.length) {
        currentFlashcardIndex = flashcards.length - 1;
    }
    
    showFlashcard(currentFlashcardIndex);
    showToast('Flashcard deleted!');
}

function closeFlashcardMode() {
    document.getElementById('flashcardModal').classList.remove('show');
}

function shuffleFlashcards() {
    flashcards = flashcards.sort(() => Math.random() - 0.5);
    currentFlashcardIndex = 0;
    saveFlashcards();
    showFlashcard(currentFlashcardIndex);
    showToast('Flashcards shuffled! 🔀');
}

function filterFlashcardsBySubject(subject) {
    // This would filter in a separate view - for now just show all
    showToast(`Showing ${subject} flashcards`);
}

/* ==================== QUIZ SYSTEM ==================== */

function generateQuiz(subject = null, count = 10) {
    quizQuestions = [];
    quizScore = 0;
    quizAnswers = [];
    currentQuizIndex = 0;
    
    // Generate quiz from chatData and subjectData
    let sourceData = [];
    
    if (subject && subjectData[subject]) {
        // Generate from specific subject
        const subj = subjectData[subject];
        if (subj.chapters) {
            subj.chapters.forEach(chapter => {
                if (chapter.topics) {
                    chapter.topics.forEach(topic => {
                        if (topic.subtopics && topic.subtopics.length > 0) {
                            topic.subtopics.forEach(st => {
                                sourceData.push({
                                    question: `What is ${st.name}?`,
                                    answer: st.explanation || st.name,
                                    topic: topic.topic,
                                    subject: subject
                                });
                            });
                        }
                    });
                }
            });
        }
    }
    
    // Add from chatData
    chatData.forEach(item => {
        sourceData.push({
            question: item.question,
            answer: item.answer,
            topic: 'General',
            subject: subject || 'General'
        });
    });
    
    // Shuffle and select
    sourceData = sourceData.sort(() => Math.random() - 0.5).slice(0, count);
    
    // Convert to MCQ format
    sourceData.forEach((item, index) => {
        const options = generateMCQOptions(item.answer, sourceData);
        quizQuestions.push({
            id: index,
            question: item.question,
            options: options,
            correctAnswer: 0, // Correct answer is always first, then we shuffle
            topic: item.topic,
            explanation: item.answer
        });
    });
    
    // Shuffle options for each question
    quizQuestions.forEach(q => {
        const correct = q.options[0];
        q.options = q.options.sort(() => Math.random() - 0.5);
        q.correctAnswer = q.options.indexOf(correct);
    });
    
    if (quizQuestions.length === 0) {
        showToast('Not enough data to generate quiz!');
        return false;
    }
    
    return true;
}

function generateMCQOptions(correctAnswer, allData) {
    const options = [correctAnswer];
    
    // Generate 3 wrong options
    const wrongOptions = allData
        .filter(item => item.answer !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(item => item.answer);
    
    options.push(...wrongOptions);
    
    // If not enough wrong options, generate generic ones
    while (options.length < 4) {
        options.push(`Option ${options.length}`);
    }
    
    return options.slice(0, 4);
}

function startQuiz(subject = null) {
    if (!generateQuiz(subject, 10)) return;
    
    document.getElementById('quizModal').classList.add('show');
    showQuizQuestion(currentQuizIndex);
}

function showQuizQuestion(index) {
    if (index < 0 || index >= quizQuestions.length) return;
    
    const question = quizQuestions[index];
    const modal = document.getElementById('quizModal');
    
    const questionText = modal.querySelector('.quiz-question-text');
    const optionsContainer = modal.querySelector('.quiz-options');
    const counter = modal.querySelector('.quiz-counter');
    const progress = modal.querySelector('.quiz-progress-fill');
    
    questionText.textContent = question.question;
    counter.textContent = `Question ${index + 1} of ${quizQuestions.length}`;
    progress.style.width = `${((index) / quizQuestions.length) * 100}%`;
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Create option buttons
    question.options.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = option.substring(0, 150) + (option.length > 150 ? '...' : '');
        btn.onclick = () => selectQuizOption(i);
        
        // Show previous answer if exists
        if (quizAnswers[index] !== undefined) {
            if (i === quizAnswers[index]) {
                btn.classList.add('selected');
            }
            if (i === question.correctAnswer) {
                btn.classList.add('correct');
            } else if (i === quizAnswers[index]) {
                btn.classList.add('wrong');
            }
            btn.disabled = true;
        }
        
        optionsContainer.appendChild(btn);
    });
    
    // Update navigation buttons
    const prevBtn = modal.querySelector('.quiz-prev-btn');
    const nextBtn = modal.querySelector('.quiz-next-btn');
    const submitBtn = modal.querySelector('.quiz-submit-btn');
    
    prevBtn.disabled = index === 0;
    
    if (index === quizQuestions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

function selectQuizOption(optionIndex) {
    const question = quizQuestions[currentQuizIndex];
    quizAnswers[currentQuizIndex] = optionIndex;
    
    // Visual feedback
    const buttons = document.querySelectorAll('.quiz-option-btn');
    buttons.forEach((btn, i) => {
        btn.classList.remove('selected');
        if (i === optionIndex) {
            btn.classList.add('selected');
        }
    });
    
    // Auto advance after 1 second
    setTimeout(() => {
        if (currentQuizIndex < quizQuestions.length - 1) {
            nextQuizQuestion();
        }
    }, 800);
}

function nextQuizQuestion() {
    if (currentQuizIndex < quizQuestions.length - 1) {
        currentQuizIndex++;
        showQuizQuestion(currentQuizIndex);
    }
}

function prevQuizQuestion() {
    if (currentQuizIndex > 0) {
        currentQuizIndex--;
        showQuizQuestion(currentQuizIndex);
    }
}

function submitQuiz() {
    // Calculate score
    quizScore = 0;
    quizQuestions.forEach((q, i) => {
        if (quizAnswers[i] === q.correctAnswer) {
            quizScore++;
        }
    });
    
    showQuizResults();
}

function showQuizResults() {
    const modal = document.getElementById('quizModal');
    const percentage = Math.round((quizScore / quizQuestions.length) * 100);
    
    let grade = '';
    let message = '';
    
    if (percentage >= 90) {
        grade = 'A+';
        message = 'Outstanding! 🏆';
    } else if (percentage >= 80) {
        grade = 'A';
        message = 'Excellent work! 🌟';
    } else if (percentage >= 70) {
        grade = 'B';
        message = 'Good job! 👍';
    } else if (percentage >= 60) {
        grade = 'C';
        message = 'Not bad! Keep practicing! 📚';
    } else {
        grade = 'F';
        message = 'Need more practice! 💪';
    }
    
    modal.querySelector('.quiz-content').innerHTML = `
        <div class="quiz-results">
            <div class="quiz-results-header">
                <h2>Quiz Complete! ${message}</h2>
            </div>
            <div class="quiz-results-score">
                <div class="quiz-score-circle">
                    <span class="quiz-score-number">${percentage}%</span>
                    <span class="quiz-score-grade">${grade}</span>
                </div>
                <p class="quiz-score-text">${quizScore} out of ${quizQuestions.length} correct</p>
            </div>
            <div class="quiz-results-actions">
                <button class="quiz-btn primary" onclick="reviewQuiz()">📝 Review Answers</button>
                <button class="quiz-btn" onclick="startQuiz()">🔄 Try Again</button>
                <button class="quiz-btn" onclick="closeQuiz()">✖️ Close</button>
            </div>
        </div>
    `;
}

function reviewQuiz() {
    currentQuizIndex = 0;
    const modal = document.getElementById('quizModal');
    
    modal.querySelector('.quiz-content').innerHTML = `
        <div class="quiz-header">
            <h2>Quiz Review</h2>
            <div class="quiz-counter"></div>
        </div>
        <div class="quiz-progress">
            <div class="quiz-progress-fill"></div>
        </div>
        <div class="quiz-body">
            <div class="quiz-question-text"></div>
            <div class="quiz-options"></div>
            <div class="quiz-explanation"></div>
        </div>
        <div class="quiz-navigation">
            <button class="quiz-btn quiz-prev-btn" onclick="prevQuizQuestion()">← Previous</button>
            <button class="quiz-btn quiz-next-btn" onclick="nextQuizQuestion()">Next →</button>
            <button class="quiz-btn quiz-close-btn" onclick="closeQuiz()">Close</button>
        </div>
    `;
    
    showQuizReviewQuestion(currentQuizIndex);
}

function showQuizReviewQuestion(index) {
    if (index < 0 || index >= quizQuestions.length) return;
    
    const question = quizQuestions[index];
    const userAnswer = quizAnswers[index];
    const isCorrect = userAnswer === question.correctAnswer;
    
    const modal = document.getElementById('quizModal');
    const questionText = modal.querySelector('.quiz-question-text');
    const optionsContainer = modal.querySelector('.quiz-options');
    const explanation = modal.querySelector('.quiz-explanation');
    const counter = modal.querySelector('.quiz-counter');
    const progress = modal.querySelector('.quiz-progress-fill');
    
    questionText.textContent = question.question;
    counter.textContent = `Question ${index + 1} of ${quizQuestions.length}`;
    progress.style.width = `${((index + 1) / quizQuestions.length) * 100}%`;
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Create option buttons
    question.options.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = option.substring(0, 150) + (option.length > 150 ? '...' : '');
        btn.disabled = true;
        
        if (i === question.correctAnswer) {
            btn.classList.add('correct');
        }
        if (i === userAnswer && i !== question.correctAnswer) {
            btn.classList.add('wrong');
        }
        if (i === userAnswer) {
            btn.classList.add('selected');
        }
        
        optionsContainer.appendChild(btn);
    });
    
    // Show explanation
    explanation.innerHTML = `
        <div class="quiz-explanation-box ${isCorrect ? 'correct' : 'wrong'}">
            <strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</strong>
            <p>${question.explanation}</p>
        </div>
    `;
    
    // Update navigation
    const prevBtn = modal.querySelector('.quiz-prev-btn');
    const nextBtn = modal.querySelector('.quiz-next-btn');
    
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === quizQuestions.length - 1;
}

function closeQuiz() {
    document.getElementById('quizModal').classList.remove('show');
    quizQuestions = [];
    quizAnswers = [];
    currentQuizIndex = 0;
    quizScore = 0;
}

/* ==================== TEXT-TO-SPEECH SYSTEM ==================== */

function initTextToSpeech() {
    if ('speechSynthesis' in window) {
        // TTS is supported
        console.log('Text-to-Speech initialized');
    } else {
        console.warn('Text-to-Speech not supported');
    }
}

function speakMessage(messageId) {
    const msg = currentSession.messages.find(m => m.id === messageId);
    if (!msg) return;
    
    if (isSpeaking && currentUtterance) {
        stopSpeaking();
        return;
    }
    
    const cleanText = msg.text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/📚|📖/g, '')
        .replace(/<[^>]*>/g, '');
    
    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance.lang = 'en-US';
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1;
    currentUtterance.volume = 1;
    
    currentUtterance.onstart = () => {
        isSpeaking = true;
        updateTTSButton(messageId, true);
    };
    
    currentUtterance.onend = () => {
        isSpeaking = false;
        currentUtterance = null;
        updateTTSButton(messageId, false);
    };
    
    currentUtterance.onerror = (event) => {
        console.error('TTS Error:', event);
        isSpeaking = false;
        currentUtterance = null;
        updateTTSButton(messageId, false);
        showToast('Speech error occurred');
    };
    
    window.speechSynthesis.speak(currentUtterance);
}

function stopSpeaking() {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    currentUtterance = null;
    
    // Update all TTS buttons
    document.querySelectorAll('.tts-btn').forEach(btn => {
        btn.textContent = '🔊 Listen';
        btn.classList.remove('speaking');
    });
}

function updateTTSButton(messageId, speaking) {
    const btn = document.querySelector(`[data-message-id="${messageId}"] .tts-btn`);
    if (btn) {
        if (speaking) {
            btn.textContent = '⏸️ Stop';
            btn.classList.add('speaking');
        } else {
            btn.textContent = '🔊 Listen';
            btn.classList.remove('speaking');
        }
    }
}

/* ==================== UTILITY FUNCTIONS ==================== */

function showToast(message, duration = 2000) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/* ---------- Auto-save ---------- */
setInterval(() => {
    if (currentSession.messages.length > 0) {
        saveCurrentSession();
    }
}, 30000);

window.addEventListener('beforeunload', () => {
    if (currentSession.messages.length > 0) {
        saveCurrentSession();
    }
    stopSpeaking();
});

/* ---------- Keyboard Shortcuts ---------- */
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K: Start Quiz
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        startQuiz();
    }
    
    // Ctrl/Cmd + B: Toggle Bookmarks
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleBookmarks();
    }
    
    // Ctrl/Cmd + F: Open Flashcards
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        openFlashcardMode();
    }
    
    // Ctrl/Cmd + N: New chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        startNewChat();
    }
    
    // Ctrl/Cmd + H: Toggle history
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        toggleHistory();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        cancelEdit();
        closeQuiz();
        closeFlashcardMode();
        const bookmarksPanel = document.getElementById('bookmarksPanel');
        if (bookmarksPanel && bookmarksPanel.classList.contains('open')) {
            toggleBookmarks();
        }
    }
    
    // Space: Flip flashcard (if flashcard modal is open)
    if (e.key === ' ' && document.getElementById('flashcardModal').classList.contains('show')) {
        e.preventDefault();
        flipFlashcard();
    }
    
    // Arrow keys for flashcard navigation
    if (document.getElementById('flashcardModal').classList.contains('show')) {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextFlashcard();
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevFlashcard();
        }
    }
    
    // Arrow keys for quiz navigation
    if (document.getElementById('quizModal').classList.contains('show')) {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextQuizQuestion();
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevQuizQuestion();
        }
    }
});

/* ==================== QUICK ACCESS MENU ==================== */

function showQuickMenu() {
    const modal = document.createElement('div');
    modal.className = 'quick-menu-modal';
    modal.innerHTML = `
        <div class="quick-menu-content">
            <div class="quick-menu-header">
                <h3>Quick Actions</h3>
                <button onclick="closeQuickMenu()" class="close-btn">×</button>
            </div>
            <div class="quick-menu-grid">
                <button class="quick-menu-btn" onclick="startQuiz(); closeQuickMenu();">
                    <span class="quick-menu-icon">📝</span>
                    <span class="quick-menu-text">Start Quiz</span>
                </button>
                <button class="quick-menu-btn" onclick="openFlashcardMode(); closeQuickMenu();">
                    <span class="quick-menu-icon">📇</span>
                    <span class="quick-menu-text">Flashcards</span>
                    <span class="quick-menu-badge">${flashcards.length}</span>
                </button>
                <button class="quick-menu-btn" onclick="toggleBookmarks(); closeQuickMenu();">
                    <span class="quick-menu-icon">⭐</span>
                    <span class="quick-menu-text">Bookmarks</span>
                    <span class="quick-menu-badge">${bookmarks.length}</span>
                </button>
                <button class="quick-menu-btn" onclick="exportChat(); closeQuickMenu();">
                    <span class="quick-menu-icon">📥</span>
                    <span class="quick-menu-text">Export Chat</span>
                </button>
                <button class="quick-menu-btn" onclick="showStatistics(); closeQuickMenu();">
                    <span class="quick-menu-icon">📊</span>
                    <span class="quick-menu-text">Statistics</span>
                </button>
                <button class="quick-menu-btn" onclick="toggleTheme(); closeQuickMenu();">
                    <span class="quick-menu-icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
                    <span class="quick-menu-text">Toggle Theme</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeQuickMenu() {
    const modal = document.querySelector('.quick-menu-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

/* ==================== STATISTICS ==================== */

function showStatistics() {
    const totalSessions = allSessions.length;
    const totalMessages = allSessions.reduce((sum, session) => sum + session.messages.length, 0);
    const userMessages = allSessions.reduce((sum, session) => 
        sum + session.messages.filter(m => m.sender === 'user').length, 0);
    const botMessages = totalMessages - userMessages;
    
    const subjectCount = {};
    allSessions.forEach(session => {
        session.messages.forEach(msg => {
            if (msg.subject) {
                subjectCount[msg.subject] = (subjectCount[msg.subject] || 0) + 1;
            }
        });
    });
    
    const modal = document.createElement('div');
    modal.className = 'statistics-modal';
    
    let subjectStats = '';
    for (const [subject, count] of Object.entries(subjectCount)) {
        subjectStats += `
            <div class="stat-item">
                <span>${subject}:</span>
                <strong>${count} questions</strong>
            </div>`;
    }
    
    modal.innerHTML = `
        <div class="statistics-content">
            <div class="statistics-header">
                <h3>📊 Your Learning Statistics</h3>
                <button onclick="closeStatistics()" class="close-btn">×</button>
            </div>
            <div class="statistics-body">
                <div class="stat-card">
                    <div class="stat-icon">💬</div>
                    <div class="stat-info">
                        <div class="stat-value">${totalSessions}</div>
                        <div class="stat-label">Chat Sessions</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">❓</div>
                    <div class="stat-info">
                        <div class="stat-value">${userMessages}</div>
                        <div class="stat-label">Questions Asked</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-info">
                        <div class="stat-value">${bookmarks.length}</div>
                        <div class="stat-label">Bookmarked</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📇</div>
                    <div class="stat-info">
                        <div class="stat-value">${flashcards.length}</div>
                        <div class="stat-label">Flashcards</div>
                    </div>
                </div>
                ${subjectStats ? '<div class="stat-divider"></div>' + subjectStats : ''}
            </div>
            <div class="statistics-footer">
                <button class="stat-btn" onclick="closeStatistics()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeStatistics() {
    const modal = document.querySelector('.statistics-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

/* ==================== EXPORT CHAT ==================== */

function exportChat() {
    if (currentSession.messages.length === 0) {
        showToast('No messages to export!');
        return;
    }
    
    let exportText = `Studix AI Tutor - Chat Export\n`;
    exportText += `Title: ${currentSession.title}\n`;
    exportText += `Date: ${new Date(currentSession.timestamp).toLocaleString()}\n`;
    exportText += `=${'='.repeat(60)}\n\n`;
    
    currentSession.messages.forEach((msg, index) => {
        const sender = msg.sender === 'user' ? 'You' : 'Studix AI';
        const time = new Date(msg.timestamp).toLocaleTimeString();
        exportText += `[${time}] ${sender}:\n`;
        exportText += `${msg.text}\n\n`;
        
        if (msg.suggestions && msg.suggestions.length > 0) {
            exportText += `Suggestions: ${msg.suggestions.join(' | ')}\n\n`;
        }
        
        exportText += `-${'-'.repeat(60)}\n\n`;
    });
    
    exportText += `\n${'='.repeat(60)}\n`;
    exportText += `Total Messages: ${currentSession.messages.length}\n`;
    exportText += `Exported on: ${new Date().toLocaleString()}\n`;
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studix-chat-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Chat exported successfully! 📥');
}

/* ==================== SUBJECT FILTER FOR QUIZ ==================== */

function showQuizSubjectSelector() {
    const subjects = ['All Subjects', ...Object.keys(subjectData)];
    
    const modal = document.createElement('div');
    modal.className = 'subject-selector-modal';
    modal.innerHTML = `
        <div class="subject-selector-content">
            <div class="subject-selector-header">
                <h3>Select Quiz Subject</h3>
                <button onclick="closeSubjectSelector()" class="close-btn">×</button>
            </div>
            <div class="subject-selector-body">
                ${subjects.map(subject => `
                    <button class="subject-btn" onclick="startQuizWithSubject('${subject === 'All Subjects' ? null : subject}')">
                        ${subject}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeSubjectSelector() {
    const modal = document.querySelector('.subject-selector-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function startQuizWithSubject(subject) {
    closeSubjectSelector();
    startQuiz(subject);
}

/* ==================== FLASHCARD SUBJECT FILTER ==================== */

function showFlashcardsBySubject(subject) {
    if (subject === 'all') {
        openFlashcardMode();
        return;
    }
    
    const filtered = flashcards.filter(f => f.subject === subject);
    if (filtered.length === 0) {
        showToast(`No ${subject} flashcards yet!`);
        return;
    }
    
    // Temporarily replace flashcards
    const originalFlashcards = [...flashcards];
    flashcards = filtered;
    currentFlashcardIndex = 0;
    
    openFlashcardMode();
    
    // Restore after closing
    document.getElementById('flashcardModal').addEventListener('transitionend', function restoreCards() {
        if (!document.getElementById('flashcardModal').classList.contains('show')) {
            flashcards = originalFlashcards;
            document.getElementById('flashcardModal').removeEventListener('transitionend', restoreCards);
        }
    });
}

/* ==================== STUDY STREAK TRACKER ==================== */

function updateStudyStreak() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisitDate');
    let streak = parseInt(localStorage.getItem('studyStreak') || '0');
    
    if (lastVisit === today) {
        // Already visited today
        return streak;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastVisit === yesterday.toDateString()) {
        // Consecutive day
        streak++;
    } else if (lastVisit) {
        // Streak broken
        streak = 1;
    } else {
        // First visit
        streak = 1;
    }
    
    localStorage.setItem('studyStreak', streak.toString());
    localStorage.setItem('lastVisitDate', today);
    
    if (streak > 1) {
        showToast(`🔥 ${streak} day streak! Keep it up!`);
    }
    
    return streak;
}

// Update streak on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateStudyStreak, 2000);
});

/* ==================== PERFORMANCE OPTIMIZATION ==================== */

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ==================== ACCESSIBILITY FEATURES ==================== */

// Focus management for modals
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

/* ==================== INITIALIZATION CHECKS ==================== */

// Check if all required DOM elements exist
function checkRequiredElements() {
    const required = [
        'chatMessages',
        'messageInput',
        'header',
        'historyPanel',
        'loadingIndicator',
        'editModal',
        'scrollToTop',
        'scrollToBottom'
    ];
    
    const missing = required.filter(id => !document.getElementById(id));
    
    if (missing.length > 0) {
        console.error('Missing required elements:', missing);
        return false;
    }
    
    return true;
}

/* ==================== ERROR HANDLING ==================== */

window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showToast('An error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

/* ==================== WELCOME TIPS ==================== */

function showWelcomeTips() {
    const hasSeenTips = localStorage.getItem('hasSeenWelcomeTips');
    if (hasSeenTips) return;
    
    setTimeout(() => {
        const tips = [
            '💡 Tip: Click ⭐ Bookmark on any answer to save it for later!',
            '💡 Tip: Press Ctrl+K to start a quick quiz!',
            '💡 Tip: Create flashcards from bot messages for better learning!',
            '💡 Tip: Use 🔊 Listen to hear answers read aloud!'
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        showToast(randomTip, 4000);
        
        localStorage.setItem('hasSeenWelcomeTips', 'true');
    }, 3000);
}

// Show tips on first load
if (dataLoaded) {
    showWelcomeTips();
}

/* ==================== CONSOLE INFO ==================== */

console.log(`
╔════════════════════════════════════════╗
║   Studix AI Tutor - Enhanced Edition   ║
║                                        ║
║   Features:                            ║
║   ✅ Smart Q&A System                  ║
║   ✅ Quiz Mode                         ║
║   ✅ Flashcards                        ║
║   ✅ Bookmarks                         ║
║   ✅ Text-to-Speech                    ║
║   ✅ Study Streak Tracker              ║
║                                        ║
║   Keyboard Shortcuts:                  ║
║   Ctrl+K - Start Quiz                  ║
║   Ctrl+B - Toggle Bookmarks            ║
║   Ctrl+F - Open Flashcards             ║
║   Ctrl+N - New Chat                    ║
║   Ctrl+H - Toggle History              ║
║                                        ║
╚════════════════════════════════════════╝
`);

console.log('✅ Studix AI Tutor Loaded Successfully!');
console.log('📊 Data loaded:', chatData.length, 'questions');
console.log('📚 Subjects loaded:', Object.keys(subjectData));
console.log('⭐ Bookmarks:', bookmarks.length);
console.log('📇 Flashcards:', flashcards.length);

/* ==================== END OF FILE ==================== */
