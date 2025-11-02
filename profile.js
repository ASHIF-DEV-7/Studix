import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, get, child, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCksCocSC8aWU1andDDnMhOd7TwvZ0hGSE",
    authDomain: "studix-e1f6a.firebaseapp.com",
    databaseURL: "https://studix-e1f6a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "studix-e1f6a",
    storageBucket: "studix-e1f6a.firebasestorage.app",
    messagingSenderId: "178428897987",
    appId: "1:178428897987:web:76b6be04e90de27b055076",
    measurementId: "G-9P23L30DFG"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = null;
let uploadedPhoto = null;
let editedPhoto = null;

// ============ Motivational Quotes ============
const motivationalQuotes = {
    doctor: [
        "Study hard today, save lives tomorrow! 💉",
        "Every page you read brings you closer to your white coat! 📚",
        "Future doctors are made in the library! 🩺",
        "Your patients are counting on your dedication today! ❤️",
        "Medicine is learned by hard work, not by chance! 🏥",
        "Today's study is tomorrow's life saved! 🌟",
        "Great doctors weren't born, they were made through sacrifice! 💪"
    ],
    engineer: [
        "Code today, build tomorrow! 💻",
        "Engineers create the future, start creating yours now! 🚀",
        "Every problem solved makes you a better engineer! 🔧",
        "Innovation starts with dedication! ⚡",
        "Build your dreams with lines of code and determination! 🏗️",
        "The best engineers never stop learning! 📐",
        "Your breakthrough is just one more attempt away! 🎯"
    ],
    teacher: [
        "Shape minds, change the world! 📚",
        "Great teachers inspire greatness in others! 🌟",
        "Education is the key you're helping others unlock! 🔑",
        "Every lesson planned is a life impacted! ✨",
        "Teachers don't just teach, they transform lives! 💫",
        "Your dedication creates tomorrow's leaders! 🎓",
        "Knowledge shared is knowledge multiplied! 📖"
    ],
    artist: [
        "Create art that speaks louder than words! 🎨",
        "Every brushstroke brings your vision to life! 🖌️",
        "Artists see what others miss! 👁️",
        "Your creativity can change perspectives! 🌈",
        "Practice makes your passion perfect! ✏️",
        "Art is how you leave your mark on the world! 🎭",
        "Keep creating, the world needs your vision! 🖼️"
    ],
    default: [
        "Chase your dreams with unstoppable determination! 🌟",
        "Every step forward is progress, keep moving! 🚀",
        "Your future self is counting on today's effort! 💪",
        "Success is built one day at a time! ⭐",
        "Believe in yourself and work hard! 🎯",
        "Your goals are achievable with dedication! 🏆",
        "Stay focused, stay determined, stay unstoppable! ⚡"
    ]
};

function getMotivationalQuote(goal) {
    const goalLower = goal.toLowerCase();
    let category = 'default';
    
    if (goalLower.includes('doctor') || goalLower.includes('medical')) {
        category = 'doctor';
    } else if (goalLower.includes('engineer') || goalLower.includes('developer') || goalLower.includes('programmer')) {
        category = 'engineer';
    } else if (goalLower.includes('teacher') || goalLower.includes('professor')) {
        category = 'teacher';
    } else if (goalLower.includes('artist') || goalLower.includes('painter') || goalLower.includes('designer')) {
        category = 'artist';
    }
    
    const quotes = motivationalQuotes[category];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

// ============ Initialize App ============
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadSavedTheme();
    checkAutoLogin();
});

function setupEventListeners() {
    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Main Menu Buttons
    document.getElementById('btnCreateProfile').addEventListener('click', showCreateProfile);
    document.getElementById('btnLogin').addEventListener('click', showLogin);
    
    // Login Section
    document.getElementById('btnLoginSubmit').addEventListener('click', loginUser);
    document.getElementById('btnLoginBack').addEventListener('click', showMainMenu);
    document.getElementById('loginPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') loginUser();
    });
    document.getElementById('btnShowRecovery').addEventListener('click', showRecoveryInfo);
    
    // Create Profile Section
    document.getElementById('btnCreateSubmit').addEventListener('click', createProfile);
    document.getElementById('btnCreateBack').addEventListener('click', showMainMenu);
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
    document.getElementById('password').addEventListener('keyup', checkPasswordStrength);
    
    // Profile Display
    document.getElementById('btnEnableEdit').addEventListener('click', enableEdit);
    document.getElementById('btnLogout').addEventListener('click', logout);
    
    // Edit Section
    document.getElementById('btnSaveEdit').addEventListener('click', saveEdit);
    document.getElementById('btnCancelEdit').addEventListener('click', cancelEdit);
    document.getElementById('editPhotoInput').addEventListener('change', handleEditPhotoUpload);
}

// ============ Theme Management ============
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-theme');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.querySelector('.theme-icon').textContent = '☀️';
    }
}

// ============ Auto Login ============
async function checkAutoLogin() {
    const savedUsername = localStorage.getItem('loggedInUser');
    if (savedUsername) {
        showLoading('Welcome back! 👋', 'Loading your profile...');
        try {
            const snapshot = await get(child(ref(db), `users/${savedUsername}`));
            if (snapshot.exists()) {
                currentUser = snapshot.val();
                await simulateLoading();
                hideLoading();
                showProfile(currentUser);
            } else {
                localStorage.removeItem('loggedInUser');
                hideLoading();
            }
        } catch (error) {
            console.error('Auto login failed:', error);
            localStorage.removeItem('loggedInUser');
            hideLoading();
        }
    }
}

// ============ IMPROVED Loading Overlay (Smooth 0-100%) ============
let loadingInterval = null;
let currentProgress = 0;

function showLoading(text = 'Loading...', subtext = 'Please wait ⏳') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const loadingSubtext = document.getElementById('loadingSubtext');
    const percentage = document.getElementById('loadingPercentage');
    const progressBar = document.getElementById('progressBar');
    
    loadingText.textContent = text;
    loadingSubtext.textContent = subtext;
    percentage.textContent = '0%';
    progressBar.style.width = '0%';
    currentProgress = 0;
    
    overlay.classList.add('active');
    
    // Clear any existing interval
    clearInterval(loadingInterval);
    
    // Smooth progress animation
    loadingInterval = setInterval(() => {
        if (currentProgress < 90) {
            // Increment by random amount between 3-8%
            const increment = Math.random() * 5 + 3;
            currentProgress += increment;
            
            if (currentProgress > 90) currentProgress = 90;
            
            percentage.textContent = Math.floor(currentProgress) + '%';
            progressBar.style.width = currentProgress + '%';
        }
    }, 150); // Update every 150ms for smooth animation
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    const percentage = document.getElementById('loadingPercentage');
    const progressBar = document.getElementById('progressBar');
    
    clearInterval(loadingInterval);
    
    // Quickly complete to 100%
    let finalProgress = currentProgress;
    const finalInterval = setInterval(() => {
        finalProgress += 5;
        if (finalProgress >= 100) {
            finalProgress = 100;
            clearInterval(finalInterval);
            
            percentage.textContent = '100%';
            progressBar.style.width = '100%';
            
            // Hide after short delay
            setTimeout(() => {
                overlay.classList.remove('active');
                percentage.textContent = '0%';
                progressBar.style.width = '0%';
                currentProgress = 0;
            }, 300);
        } else {
            percentage.textContent = Math.floor(finalProgress) + '%';
            progressBar.style.width = finalProgress + '%';
        }
    }, 30);
}

function updateLoading(text, subtext) {
    const loadingText = document.getElementById('loadingText');
    const loadingSubtext = document.getElementById('loadingSubtext');
    
    loadingText.textContent = text;
    loadingSubtext.textContent = subtext;
    
    // Jump to 95% when updating
    clearInterval(loadingInterval);
    currentProgress = 95;
    document.getElementById('loadingPercentage').textContent = '95%';
    document.getElementById('progressBar').style.width = '95%';
}

// Simulate loading for better UX
async function simulateLoading() {
    return new Promise(resolve => {
        setTimeout(resolve, 800);
    });
}

// ============ Navigation ============
function showMainMenu() {
    document.getElementById('mainMenu').style.display = 'block';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('createSection').style.display = 'none';
    document.getElementById('profileDisplay').style.display = 'none';
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('motivationBox').classList.add('hidden');
}

function showLogin() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('createSection').style.display = 'none';
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('recoveryInfo').classList.add('hidden');
}

function showCreateProfile() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('createSection').style.display = 'block';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('createError').classList.add('hidden');
    document.getElementById('createSuccess').classList.add('hidden');
}

// ============ Password Strength Checker ============
function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (password.length === 0) {
        strengthDiv.textContent = '';
        return;
    }
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) {
        strengthDiv.textContent = '⚠️ Weak password';
        strengthDiv.className = 'password-strength strength-weak';
    } else if (strength <= 3) {
        strengthDiv.textContent = '✓ Medium password';
        strengthDiv.className = 'password-strength strength-medium';
    } else {
        strengthDiv.textContent = '✓✓ Strong password';
        strengthDiv.className = 'password-strength strength-strong';
    }
}

// ============ Photo Upload ============
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5000000) {
            alert('⚠️ Image size should be less than 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('photoPreview');
            preview.innerHTML = `<img src="${e.target.result}">`;
            uploadedPhoto = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function handleEditPhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5000000) {
            alert('⚠️ Image size should be less than 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('editPhotoPreview');
            preview.innerHTML = `<img src="${e.target.result}">`;
            editedPhoto = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

// ============ Create Profile ============
async function createProfile() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const fullName = document.getElementById('fullName').value.trim();
    const goal = document.getElementById('goal').value.trim();
    const school = document.getElementById('school').value.trim();
    const interest = document.getElementById('interest').value.trim();
    const favBook = document.getElementById('favBook').value.trim();

    // Validation
    if (!username || !password || !confirmPassword || !fullName || !goal || !school || !interest || !favBook) {
        showError('createError', 'Please fill all required fields marked with *');
        return;
    }

    if (username.length < 3) {
        showError('createError', 'Username must be at least 3 characters long');
        return;
    }

    if (password.length < 6) {
        showError('createError', 'Password must be at least 6 characters long');
        return;
    }

    if (password !== confirmPassword) {
        showError('createError', 'Passwords do not match! Please check again.');
        return;
    }

    // Show loading
    showLoading('Creating your amazing profile...', 'Setting everything up for you ✨');

    try {
        // Check if username exists
        const snapshot = await get(child(ref(db), `users/${username}`));
        if (snapshot.exists()) {
            hideLoading();
            showError('createError', 'Username already exists! Please choose another.');
            return;
        }

        await simulateLoading();

        // Create user data with new fields
        const userData = {
            username: username,
            password: password,
            fullName: fullName,
            email: document.getElementById('email').value.trim(),
            goal: goal,
            school: school,
            currentClass: document.getElementById('currentClass').value.trim(),
            favSubject: document.getElementById('favSubject').value.trim(),
            studyHours: document.getElementById('studyHours').value || '0',
            interest: interest,
            favBook: favBook,
            bio: document.getElementById('bio').value.trim(),
            roleModel: document.getElementById('roleModel').value.trim(),
            age: document.getElementById('age').value,
            city: document.getElementById('city').value.trim(),
            quote: document.getElementById('quote').value.trim(),
            skills: document.getElementById('skills').value.trim(),
            photo: uploadedPhoto || '',
            // Stats
            streak: Math.floor(Math.random() * 15) + 1,
            totalHours: Math.floor(Math.random() * 200) + 50,
            goalsAchieved: Math.floor(Math.random() * 50) + 10,
            level: 1,
            // Meta
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        // Save to Firebase
        await set(ref(db, 'users/' + username), userData);
        
        // Update loading message
        updateLoading('Profile created successfully! 🎉', 'Logging you in...');
        await simulateLoading();

        currentUser = userData;
        localStorage.setItem('loggedInUser', username);
        
        // Clear form
        clearCreateForm();
        
        hideLoading();
        showProfile(userData);

    } catch (error) {
        hideLoading();
        showError('createError', 'Error creating profile: ' + error.message);
    }
}

function clearCreateForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('fullName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('goal').value = '';
    document.getElementById('school').value = '';
    document.getElementById('currentClass').value = '';
    document.getElementById('favSubject').value = '';
    document.getElementById('studyHours').value = '';
    document.getElementById('interest').value = '';
    document.getElementById('favBook').value = '';
    document.getElementById('bio').value = '';
    document.getElementById('roleModel').value = '';
    document.getElementById('age').value = '';
    document.getElementById('city').value = '';
    document.getElementById('quote').value = '';
    document.getElementById('skills').value = '';
    document.getElementById('photoPreview').innerHTML = '📷';
    document.getElementById('passwordStrength').textContent = '';
    uploadedPhoto = null;
}

// ============ Login ============
async function loginUser() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showError('loginError', 'Please enter both username and password');
        return;
    }

    showLoading('Logging you in...', 'Verifying your credentials 🔐');

    try {
        const snapshot = await get(child(ref(db), `users/${username}`));
        
        if (!snapshot.exists()) {
            hideLoading();
            showError('loginError', 'Username not found!');
            return;
        }

        const userData = snapshot.val();
        
        if (userData.password !== password) {
            hideLoading();
            showError('loginError', 'Incorrect password!');
            return;
        }

        await simulateLoading();

        // Update last login
        await update(ref(db, 'users/' + username), {
            lastLogin: new Date().toISOString()
        });

        updateLoading('Login successful! 🎉', 'Loading your profile...');
        await simulateLoading();

        currentUser = { ...userData, lastLogin: new Date().toISOString() };
        localStorage.setItem('loggedInUser', username);
        
        // Clear login form
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        
        hideLoading();
        showProfile(currentUser);

    } catch (error) {
        hideLoading();
        showError('loginError', 'Error logging in: ' + error.message);
    }
}

// ============ Password Recovery ============
async function showRecoveryInfo() {
    const username = document.getElementById('recoveryUsername').value.trim();
    
    if (!username) {
        alert('Please enter your username');
        return;
    }

    try {
        const snapshot = await get(child(ref(db), `users/${username}`));
        
        if (!snapshot.exists()) {
            alert('Username not found!');
            return;
        }

        const userData = snapshot.val();
        const recoveryInfo = document.getElementById('recoveryInfo');
        recoveryInfo.innerHTML = `
            <p style="margin-bottom: 12px;"><strong>🔐 Recovery Information:</strong></p>
            <p><strong>Goal:</strong> ${userData.goal}</p>
            <p><strong>Interest:</strong> ${userData.interest}</p>
            <p><strong>Favorite Book:</strong> ${userData.favBook}</p>
            <p style="margin-top: 15px; color: var(--warning-color);">💡 If these match your details, try to remember your password!</p>
        `;
        recoveryInfo.classList.remove('hidden');

    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ============ Show Profile (Enhanced with Dynamic Rendering) ============
function showProfile(userData) {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('createSection').style.display = 'none';
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('profileDisplay').style.display = 'block';

    // Show motivation
    document.getElementById('motivationBox').classList.remove('hidden');
    document.getElementById('motivationText').textContent = getMotivationalQuote(userData.goal);

    // Display hero section
    document.getElementById('displayName').textContent = userData.fullName;
    document.getElementById('displayUsername').textContent = `@${userData.username}`;
    document.getElementById('displayGoalBadge').textContent = `🎯 ${userData.goal}`;

    // Display photo
    const displayPhoto = document.getElementById('displayPhoto');
    if (userData.photo) {
        displayPhoto.innerHTML = `<img src="${userData.photo}">`;
    } else {
        displayPhoto.innerHTML = '👤';
    }

    // Display last login
    if (userData.lastLogin) {
        const lastLogin = new Date(userData.lastLogin);
        document.getElementById('lastLoginInfo').textContent = `Last login: ${lastLogin.toLocaleString()}`;
    }

    // Display stats
    document.getElementById('statStreak').textContent = userData.streak || 0;
    document.getElementById('statHours').textContent = userData.totalHours || 0;
    document.getElementById('statGoals').textContent = userData.goalsAchieved || 0;
    document.getElementById('statLevel').textContent = userData.level || 1;

    // Display bio
    const bioSection = document.getElementById('bioSection');
    if (userData.bio) {
        bioSection.style.display = 'block';
        document.getElementById('displayBio').textContent = userData.bio;
    } else {
        bioSection.style.display = 'none';
    }

    // Build Academic Info Grid
    const academicGrid = document.getElementById('academicGrid');
    academicGrid.innerHTML = '';
    
    const academicData = [
        { label: '🎯 Career Goal', value: userData.goal },
        { label: '🏫 Institution', value: userData.school },
        { label: '📚 Current Class', value: userData.currentClass },
        { label: '📖 Favorite Subject', value: userData.favSubject },
        { label: '⏰ Daily Study Hours', value: userData.studyHours ? `${userData.studyHours} hours` : null },
    ];

    academicData.forEach(item => {
        if (item.value) {
            academicGrid.innerHTML += createInfoCard(item.label, item.value);
        }
    });

    // Build Personal Info Grid
    const personalGrid = document.getElementById('personalGrid');
    personalGrid.innerHTML = '';
    
    const personalData = [
        { label: '📧 Email', value: userData.email },
        { label: '🎂 Age', value: userData.age },
        { label: '🏙️ City', value: userData.city },
        { label: '📅 Member Since', value: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : null }
    ];

    personalData.forEach(item => {
        if (item.value) {
            personalGrid.innerHTML += createInfoCard(item.label, item.value);
        }
    });

    // Build Interests Grid
    const interestsGrid = document.getElementById('interestsGrid');
    interestsGrid.innerHTML = '';
    
    const interestsData = [
        { label: '🎨 Main Interest', value: userData.interest },
        { label: '📚 Favorite Book', value: userData.favBook },
        { label: '💪 Skills', value: userData.skills },
        { label: '🌟 Role Model', value: userData.roleModel },
        { label: '💭 Favorite Quote', value: userData.quote }
    ];

    interestsData.forEach(item => {
        if (item.value) {
            interestsGrid.innerHTML += createInfoCard(item.label, item.value);
        }
    });
}

// Helper function to create info cards
function createInfoCard(label, value) {
    return `
        <div class="info-card">
            <div class="detail-label">${label}</div>
            <div class="detail-value">${value}</div>
        </div>
    `;
}

// ============ Edit Profile ============
function enableEdit() {
    document.getElementById('profileDisplay').style.display = 'none';
    document.getElementById('editSection').style.display = 'block';

    // Populate form fields
    document.getElementById('editFullName').value = currentUser.fullName;
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editGoal').value = currentUser.goal;
    document.getElementById('editSchool').value = currentUser.school;
    document.getElementById('editCurrentClass').value = currentUser.currentClass || '';
    document.getElementById('editFavSubject').value = currentUser.favSubject || '';
    document.getElementById('editStudyHours').value = currentUser.studyHours || '';
    document.getElementById('editInterest').value = currentUser.interest;
    document.getElementById('editFavBook').value = currentUser.favBook;
    document.getElementById('editBio').value = currentUser.bio || '';
    document.getElementById('editRoleModel').value = currentUser.roleModel || '';
    document.getElementById('editAge').value = currentUser.age || '';
    document.getElementById('editCity').value = currentUser.city || '';
    document.getElementById('editQuote').value = currentUser.quote || '';
    document.getElementById('editSkills').value = currentUser.skills || '';

    // Display current photo
    const editPhotoPreview = document.getElementById('editPhotoPreview');
    if (currentUser.photo) {
        editPhotoPreview.innerHTML = `<img src="${currentUser.photo}">`;
    } else {
        editPhotoPreview.innerHTML = '📷';
    }
}

async function saveEdit() {
    const newPassword = document.getElementById('editPassword').value;
    
    if (newPassword && newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    showLoading('Updating your profile...', 'Saving your changes ✨');

    const updates = {
        fullName: document.getElementById('editFullName').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        goal: document.getElementById('editGoal').value.trim(),
        school: document.getElementById('editSchool').value.trim(),
        currentClass: document.getElementById('editCurrentClass').value.trim(),
        favSubject: document.getElementById('editFavSubject').value.trim(),
        studyHours: document.getElementById('editStudyHours').value,
        interest: document.getElementById('editInterest').value.trim(),
        favBook: document.getElementById('editFavBook').value.trim(),
        bio: document.getElementById('editBio').value.trim(),
        roleModel: document.getElementById('editRoleModel').value.trim(),
        age: document.getElementById('editAge').value,
        city: document.getElementById('editCity').value.trim(),
        quote: document.getElementById('editQuote').value.trim(),
        skills: document.getElementById('editSkills').value.trim()
    };

    if (newPassword) {
        updates.password = newPassword;
    }

    if (editedPhoto) {
        updates.photo = editedPhoto;
    }

    try {
        await simulateLoading();
        await update(ref(db, 'users/' + currentUser.username), updates);
        
        currentUser = { ...currentUser, ...updates };
        
        updateLoading('Profile updated! 🎉', 'Changes saved successfully');
        await simulateLoading();
        
        document.getElementById('editPassword').value = '';
        editedPhoto = null;
        
        hideLoading();
        showProfile(currentUser);

    } catch (error) {
        hideLoading();
        alert('Error updating profile: ' + error.message);
    }
}

function cancelEdit() {
    document.getElementById('editPassword').value = '';
    editedPhoto = null;
    showProfile(currentUser);
}

// ============ Logout ============
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('loggedInUser');
        
        showMainMenu();
        
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('recoveryUsername').value = '';
        document.getElementById('recoveryInfo').classList.add('hidden');
    }
}

// ============ Error Handler ============
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = '⚠️ ' + message;
    errorElement.classList.remove('hidden');
    
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}