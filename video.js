const player = document.getElementById('player');
const videoFrame = document.getElementById('videoFrame');
const playerTitle = document.getElementById('playerTitle');
const menuDropdown = document.getElementById('menuDropdown');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');

function playVideo(videoId, title) {
  videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  playerTitle.textContent = title;
  player.classList.add('active');
  player.classList.add('mode-horizontal');
  document.body.style.overflow = 'hidden';
}

function closePlayer() {
  videoFrame.src = '';
  player.classList.remove('active');
  player.classList.remove('mode-horizontal', 'mode-vertical', 'mode-normal');
  document.body.style.overflow = 'auto';
  menuDropdown.classList.remove('show');
}

function toggleMenu() {
  menuDropdown.classList.toggle('show');
}

function setMode(mode) {
  player.classList.remove('mode-horizontal', 'mode-vertical', 'mode-normal');
  player.classList.add(`mode-${mode}`);
  
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });
  event.target.classList.add('active');
  
  menuDropdown.classList.remove('show');
}

function toggleSearch() {
  searchContainer.classList.toggle('show');
  if (searchContainer.classList.contains('show')) {
    searchInput.focus();
  }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.player-menu')) {
    menuDropdown.classList.remove('show');
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (!player.classList.contains('active')) return;
  
  if (e.key === 'Escape') {
    closePlayer();
  }
  if (e.key === 'h' || e.key === 'H') {
    setMode('horizontal');
  }
  if (e.key === 'n' || e.key === 'N') {
    setMode('normal');
  }
  if (e.key === 'v' || e.key === 'V') {
    setMode('vertical');
  }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('.video-card').forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const badge = card.querySelector('.badge').textContent.toLowerCase();
    if (title.includes(query) || badge.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});

// Smooth scroll for navigation
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});