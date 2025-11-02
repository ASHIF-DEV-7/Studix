// Enhanced Universal Settings Manager
(function() {
    'use strict';

    // Enhanced Default Settings with new options
    const DEFAULT_SETTINGS = {
        // Existing settings
        darkTheme: false,
        fontSize: 14,
        fontFamily: "'Google Sans', sans-serif",
        accentColor: '#ffb74d',
        animations: true,
        compactView: false,
        borderRadius: 2,
        highContrast: false,
        reduceMotion: false,
        focusIndicators: true,
        autoSave: true,
        
        // New enhanced settings
        backgroundStyle: 'solid', // gradient, solid, pattern, image
        backgroundColor: 'rgba(255, 107, 53, 0.1);',
        backgroundPattern: 'dots', // dots, lines, grid, waves
        customBackground: '',
        textShadow: false,
        boxShadow: true,
        cardStyle: 'elevated', // flat, elevated, outlined
        iconStyle: 'filled', // filled, outlined
        cursorStyle: 'default', // default, pointer, custom
        scrollBehavior: 'smooth', // smooth, auto
        hoverEffects: true,
        soundEffects: false,
        notifications: true,
        autoNightMode: false,
        nightModeStart: '20:00',
        nightModeEnd: '06:00',
        pageTransitions: true,
        customCSS: '',
        contentWidth: 'normal', // narrow, normal, wide, full
        lineHeight: 1.6,
        letterSpacing: 'normal', // tight, normal, wide
        textAlign: 'left', // left, center, justify
        language: 'en', // en, hi, others
        rtlMode: false,
        colorBlindMode: 'none', // none, protanopia, deuteranopia, tritanopia
        dyslexiaFriendly: false,
        readingMode: false,
        mouseTrail: false,
        particleEffects: false,
        timeFormat: '12h', // 12h, 24h
        dateFormat: 'DD/MM/YYYY', // DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
        showClock: false,
        showWeather: false,
        weatherLocation: 'auto'
    };

    class EnhancedUniversalSettings {
        constructor() {
            this.settings = { ...DEFAULT_SETTINGS };
            this.isSettingsPage = this.checkIfSettingsPage();
            this.observers = [];
            this.weatherData = null;
            this.clockInterval = null;
            this.loadSettings();
            this.init();
        }

        checkIfSettingsPage() {
            return document.querySelector('.section') !== null || 
                   document.querySelector('.settings-container') !== null;
        }

        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.applySettings();
                    this.initializeEnhancements();
                    if (this.isSettingsPage) {
                        this.initSettingsPage();
                    }
                });
            } else {
                this.applySettings();
                this.initializeEnhancements();
                if (this.isSettingsPage) {
                    this.initSettingsPage();
                }
            }
        }

        loadSettings() {
            try {
                const saved = localStorage.getItem('universal_settings');
                if (saved) {
                    this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
                }
            } catch (e) {
                console.warn('Failed to load settings:', e);
            }
        }

        saveSettings() {
            try {
                localStorage.setItem('universal_settings', JSON.stringify(this.settings));
                if (this.isSettingsPage) {
                    this.showToast('Settings saved!');
                }
                this.notifyObservers();
            } catch (e) {
                console.error('Failed to save settings:', e);
            }
        }

        updateSetting(key, value) {
            this.settings[key] = value;
            this.applySettings();
            if (this.settings.autoSave) {
                this.saveSettings();
            }
            this.updatePreview();
        }

        // Enhanced apply methods
        applySettings() {
            this.applyTheme();
            this.applyFont();
            this.applyLayout();
            this.applyAccessibility();
            this.applyColors();
            this.applyBackground();
            this.applyEffects();
            this.applyCustomizations();
        }

        applyTheme() {
            // Auto night mode check
            if (this.settings.autoNightMode) {
                const currentTime = new Date().toTimeString().slice(0, 5);
                const startTime = this.settings.nightModeStart;
                const endTime = this.settings.nightModeEnd;
                
                const isNightTime = this.isTimeBetween(currentTime, startTime, endTime);
                this.settings.darkTheme = isNightTime;
            }

            if (this.settings.darkTheme) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        }

        isTimeBetween(current, start, end) {
            const currentMinutes = this.timeToMinutes(current);
            const startMinutes = this.timeToMinutes(start);
            const endMinutes = this.timeToMinutes(end);
            
            if (startMinutes <= endMinutes) {
                return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
            } else {
                return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
            }
        }

        timeToMinutes(time) {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        }

        applyFont() {
            document.body.style.fontFamily = this.settings.fontFamily;
            document.body.style.fontSize = this.settings.fontSize + 'px';
            document.body.style.lineHeight = this.settings.lineHeight;
            
            // Letter spacing
            const letterSpacingValue = {
                'tight': '-0.025em',
                'normal': '0',
                'wide': '0.025em'
            };
            document.body.style.letterSpacing = letterSpacingValue[this.settings.letterSpacing];
            
            // Text align
            if (this.settings.textAlign !== 'left') {
                document.body.style.textAlign = this.settings.textAlign;
            }
            
            // Dyslexia friendly font
            if (this.settings.dyslexiaFriendly) {
                document.body.style.fontFamily = 'OpenDyslexic, Comic Sans MS, ' + this.settings.fontFamily;
            }
        }

        applyLayout() {
            const root = document.documentElement;
            root.style.setProperty('--border-radius', this.settings.borderRadius + 'px');
            
            // Content width
            const widthValues = {
                'narrow': '600px',
                'normal': '1200px',
                'wide': '1600px',
                'full': '100%'
            };
            root.style.setProperty('--max-content-width', widthValues[this.settings.contentWidth]);
            
            // Compact view
            if (this.settings.compactView) {
                document.body.classList.add('compact-view');
            } else {
                document.body.classList.remove('compact-view');
            }
            
            // RTL mode
            if (this.settings.rtlMode) {
                document.body.setAttribute('dir', 'rtl');
            } else {
                document.body.setAttribute('dir', 'ltr');
            }
            
            // Reading mode
            if (this.settings.readingMode) {
                document.body.classList.add('reading-mode');
            } else {
                document.body.classList.remove('reading-mode');
            }
        }

        applyAccessibility() {
            // Existing accessibility code
            if (this.settings.highContrast) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }

            if (this.settings.reduceMotion) {
                document.body.classList.add('reduce-motion');
            } else {
                document.body.classList.remove('reduce-motion');
            }

            if (!this.settings.animations || this.settings.reduceMotion) {
                document.body.classList.add('no-animations');
            } else {
                document.body.classList.remove('no-animations');
            }
            
            // Color blind mode
            if (this.settings.colorBlindMode !== 'none') {
                document.body.classList.add('colorblind-' + this.settings.colorBlindMode);
            } else {
                document.body.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
            }
            
            this.updateAccessibilityStyles();
        }

        applyColors() {
            const root = document.documentElement;
            root.style.setProperty('--accent-color', this.settings.accentColor);
            
            this.updateColorStyles();
        }

        applyBackground() {
            const body = document.body;
            
            switch (this.settings.backgroundStyle) {
                case 'solid':
                    body.style.background = this.settings.backgroundColor;
                    break;
                case 'gradient':
                    body.style.background = `linear-gradient(135deg, ${this.settings.backgroundColor}, ${this.settings.accentColor}20)`;
                    break;
                case 'pattern':
                    this.applyBackgroundPattern();
                    break;
                case 'image':
                    if (this.settings.customBackground) {
                        body.style.backgroundImage = `url(${this.settings.customBackground})`;
                        body.style.backgroundSize = 'cover';
                        body.style.backgroundPosition = 'center';
                        body.style.backgroundAttachment = 'fixed';
                    }
                    break;
            }
        }

        applyBackgroundPattern() {
            const patterns = {
                dots: `radial-gradient(circle, ${this.settings.accentColor}20 1px, transparent 1px)`,
                lines: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${this.settings.accentColor}10 10px, ${this.settings.accentColor}10 20px)`,
                grid: `linear-gradient(${this.settings.accentColor}10 1px, transparent 1px), linear-gradient(90deg, ${this.settings.accentColor}10 1px, transparent 1px)`,
                waves: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${this.settings.accentColor.replace('#', '%23')}' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            };
            
            document.body.style.backgroundImage = patterns[this.settings.backgroundPattern];
            document.body.style.backgroundColor = this.settings.backgroundColor;
            document.body.style.backgroundSize = '60px 60px';
        }

        applyEffects() {
            const body = document.body;
            
            // Hover effects
            if (this.settings.hoverEffects) {
                body.classList.add('hover-effects');
            } else {
                body.classList.remove('hover-effects');
            }
            
            // Page transitions
            if (this.settings.pageTransitions) {
                body.classList.add('page-transitions');
            } else {
                body.classList.remove('page-transitions');
            }
            
            // Mouse trail
            if (this.settings.mouseTrail) {
                this.initMouseTrail();
            } else {
                this.removeMouseTrail();
            }
            
            // Particle effects
            if (this.settings.particleEffects) {
                this.initParticleEffects();
            } else {
                this.removeParticleEffects();
            }
            
            this.updateEffectStyles();
        }

        applyCustomizations() {
            // Apply custom CSS
            if (this.settings.customCSS) {
                this.applyCustomCSS();
            }
            
            // Scroll behavior
            document.documentElement.style.scrollBehavior = this.settings.scrollBehavior;
            
            // Text shadow
            if (this.settings.textShadow) {
                document.body.style.textShadow = '0 1px 2px rgba(0,0,0,0.1)';
            } else {
                document.body.style.textShadow = 'none';
            }
        }

        // New enhancement methods
        initializeEnhancements() {
            this.initClock();
            this.initWeather();
            this.initSoundEffects();
            this.initNotifications();
            this.initAutoNightMode();
        }

        initClock() {
            if (this.settings.showClock) {
                this.createClockWidget();
                this.startClock();
            }
        }

        createClockWidget() {
            if (document.getElementById('settings-clock')) return;
            
            const clock = document.createElement('div');
            clock.id = 'settings-clock';
            clock.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 15px;
                border-radius: 20px;
                font-family: monospace;
                font-size: 14px;
                z-index: 1000;
                backdrop-filter: blur(10px);
            `;
            document.body.appendChild(clock);
        }

        startClock() {
            if (this.clockInterval) clearInterval(this.clockInterval);
            
            this.clockInterval = setInterval(() => {
                const clock = document.getElementById('settings-clock');
                if (clock) {
                    const now = new Date();
                    const timeString = this.settings.timeFormat === '12h' 
                        ? now.toLocaleTimeString('en-US', { hour12: true })
                        : now.toLocaleTimeString('en-US', { hour12: false });
                    const dateString = now.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                    });
                    clock.innerHTML = `${timeString}<br><small>${dateString}</small>`;
                }
            }, 1000);
        }

        initWeather() {
            if (this.settings.showWeather && !this.weatherData) {
                this.fetchWeather();
            }
        }

        async fetchWeather() {
            // This would require an actual weather API key in production
            // For demo purposes, we'll show a placeholder
            this.createWeatherWidget();
        }

        createWeatherWidget() {
            if (document.getElementById('settings-weather')) return;
            
            const weather = document.createElement('div');
            weather.id = 'settings-weather';
            weather.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 15px;
                border-radius: 20px;
                font-size: 14px;
                z-index: 1000;
                backdrop-filter: blur(10px);
            `;
            weather.innerHTML = '🌤️ 24°C<br><small>Sunny</small>';
            document.body.appendChild(weather);
        }

        initSoundEffects() {
            if (this.settings.soundEffects) {
                this.setupSoundEvents();
            }
        }

        setupSoundEvents() {
            // Add click sound effects
            document.addEventListener('click', (e) => {
                if (e.target.matches('button, .card, .switch, select')) {
                    this.playSound('click');
                }
            });
        }

        playSound(type) {
            // Create audio context and play sound
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                const frequencies = {
                    'click': 800,
                    'success': 880,
                    'error': 400
                };
                
                oscillator.frequency.value = frequencies[type] || 600;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (e) {
                console.warn('Sound effects not available');
            }
        }

        initNotifications() {
            if (this.settings.notifications) {
                this.requestNotificationPermission();
            }
        }

        async requestNotificationPermission() {
            if ('Notification' in window && Notification.permission === 'default') {
                await Notification.requestPermission();
            }
        }

        showNotification(title, message) {
            if (this.settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: '/favicon.ico'
                });
            }
        }

        initAutoNightMode() {
            if (this.settings.autoNightMode) {
                // Check every minute
                setInterval(() => {
                    this.applyTheme();
                }, 60000);
            }
        }

        initMouseTrail() {
            if (document.getElementById('mouse-trail')) return;
            
            const trail = document.createElement('div');
            trail.id = 'mouse-trail';
            document.body.appendChild(trail);
            
            let particles = [];
            
            document.addEventListener('mousemove', (e) => {
                particles.push({
                    x: e.clientX,
                    y: e.clientY,
                    life: 20
                });
                
                if (particles.length > 10) {
                    particles.shift();
                }
                
                this.updateMouseTrail(particles);
            });
        }

        updateMouseTrail(particles) {
            const trail = document.getElementById('mouse-trail');
            if (!trail) return;
            
            trail.innerHTML = particles.map((p, i) => 
                `<div style="position: fixed; left: ${p.x}px; top: ${p.y}px; width: ${20 - i * 2}px; height: ${20 - i * 2}px; background: ${this.settings.accentColor}; border-radius: 50%; opacity: ${(20 - p.life) / 20}; pointer-events: none; z-index: 9999;"></div>`
            ).join('');
        }

        removeMouseTrail() {
            const trail = document.getElementById('mouse-trail');
            if (trail) trail.remove();
        }

        initParticleEffects() {
            // Simple particle system for background
            if (document.getElementById('particle-canvas')) return;
            
            const canvas = document.createElement('canvas');
            canvas.id = 'particle-canvas';
            canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -1;
                opacity: 0.3;
            `;
            document.body.appendChild(canvas);
            
            this.setupParticleAnimation(canvas);
        }

        setupParticleAnimation(canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const particles = [];
            const particleCount = 50;
            
            // Create particles
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 3 + 1
                });
            }
            
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = this.settings.accentColor + '40';
                
                particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    if (particle.x < 0) particle.x = canvas.width;
                    if (particle.x > canvas.width) particle.x = 0;
                    if (particle.y < 0) particle.y = canvas.height;
                    if (particle.y > canvas.height) particle.y = 0;
                    
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                });
                
                requestAnimationFrame(animate);
            };
            
            animate();
        }

        removeParticleEffects() {
            const canvas = document.getElementById('particle-canvas');
            if (canvas) canvas.remove();
        }

        applyCustomCSS() {
            let customStyle = document.getElementById('custom-user-css');
            if (!customStyle) {
                customStyle = document.createElement('style');
                customStyle.id = 'custom-user-css';
                document.head.appendChild(customStyle);
            }
            customStyle.textContent = this.settings.customCSS;
        }

        // Update all dynamic styles
        updateAccessibilityStyles() {
            let style = document.getElementById('accessibility-styles');
            if (!style) {
                style = document.createElement('style');
                style.id = 'accessibility-styles';
                document.head.appendChild(style);
            }
            
            style.textContent = `
                .high-contrast * { border-color: #000 !important; }
                .high-contrast .section { box-shadow: 0 0 0 2px #000; }
                .reduce-motion *, .no-animations * { 
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
                .compact-view .setting-row { min-height: 48px; padding: 12px 24px; }
                .compact-view .section { margin-bottom: 12px; }
                .compact-view .container { padding: 16px; }
                .reading-mode { max-width: 800px; margin: 0 auto; line-height: 2; font-size: 18px; }
                .colorblind-protanopia { filter: url(#protanopia); }
                .colorblind-deuteranopia { filter: url(#deuteranopia); }
                .colorblind-tritanopia { filter: url(#tritanopia); }
                ${this.settings.focusIndicators ? `
                    *:focus { 
                        outline: 3px solid ${this.settings.accentColor} !important; 
                        outline-offset: 2px !important;
                    }
                ` : ''}
            `;
        }

        updateColorStyles() {
            let style = document.getElementById('color-styles');
            if (!style) {
                style = document.createElement('style');
                style.id = 'color-styles';
                document.head.appendChild(style);
            }
            
            style.textContent = `
                :root { 
                    --accent-color: ${this.settings.accentColor}; 
                    --max-content-width: var(--max-content-width, 1200px);
                }
                .btn-primary { background: ${this.settings.accentColor} !important; border-color: ${this.settings.accentColor} !important; }
                .switch.active { background: ${this.settings.accentColor} !important; }
                input[type="range"]::-webkit-slider-thumb { background: ${this.settings.accentColor} !important; }
                input[type="range"]::-moz-range-thumb { background: ${this.settings.accentColor} !important; }
                *:focus { outline-color: ${this.settings.accentColor} !important; }
                * { border-radius: ${this.settings.borderRadius}px; }
                .section, .btn, select, input[type="color"], .preview-box { border-radius: ${this.settings.borderRadius}px !important; }
                .container, .main-content { max-width: var(--max-content-width); }
            `;
        }

        updateEffectStyles() {
            let style = document.getElementById('effect-styles');
            if (!style) {
                style = document.createElement('style');
                style.id = 'effect-styles';
                document.head.appendChild(style);
            }
            
            style.textContent = `
                .hover-effects *:hover { 
                    transform: translateY(-2px); 
                    transition: transform 0.2s ease; 
                }
                .page-transitions { 
                    transition: opacity 0.3s ease; 
                }
                ${this.settings.boxShadow ? `
                    .card, .section { 
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08) !important; 
                    }
                ` : `
                    .card, .section { 
                        box-shadow: none !important; 
                    }
                `}
                .card.flat { box-shadow: none !important; border: 1px solid #e5e5e5; }
                .card.outlined { background: transparent !important; border: 2px solid ${this.settings.accentColor}; }
            `;
        }

        // Enhanced Settings Page Methods
        initSettingsPage() {
            this.bindControls();
            this.addNewSettingsSections();
            this.updateUI();
            this.updatePreview();
        }

        addNewSettingsSections() {
            // This would add the new settings sections to the HTML
            // In a real implementation, you'd add these to your settings.html
        }

        bindControls() {
            // Existing controls
            this.bindToggle('darkTheme');
            this.bindToggle('animations');
            this.bindToggle('compactView');
            this.bindToggle('highContrast');
            this.bindToggle('reduceMotion');
            this.bindToggle('focusIndicators');
            this.bindToggle('autoSave');

            // New toggle controls
            this.bindToggle('textShadow');
            this.bindToggle('boxShadow');
            this.bindToggle('hoverEffects');
            this.bindToggle('soundEffects');
            this.bindToggle('notifications');
            this.bindToggle('autoNightMode');
            this.bindToggle('pageTransitions');
            this.bindToggle('dyslexiaFriendly');
            this.bindToggle('readingMode');
            this.bindToggle('mouseTrail');
            this.bindToggle('particleEffects');
            this.bindToggle('showClock');
            this.bindToggle('showWeather');
            this.bindToggle('rtlMode');

            // Range inputs
            this.bindRange('fontSize');
            this.bindRange('borderRadius');
            this.bindRange('lineHeight');

            // Select controls
            this.bindSelect('fontFamily');
            this.bindSelect('backgroundStyle');
            this.bindSelect('backgroundPattern');
            this.bindSelect('cardStyle');
            this.bindSelect('iconStyle');
            this.bindSelect('cursorStyle');
            this.bindSelect('scrollBehavior');
            this.bindSelect('contentWidth');
            this.bindSelect('letterSpacing');
            this.bindSelect('textAlign');
            this.bindSelect('language');
            this.bindSelect('colorBlindMode');
            this.bindSelect('timeFormat');
            this.bindSelect('dateFormat');

            // Color inputs
            this.bindColor('accentColor');
            this.bindColor('backgroundColor');

            // Time inputs
            this.bindTime('nightModeStart');
            this.bindTime('nightModeEnd');

            // Text area for custom CSS
            this.bindTextArea('customCSS');

            // Buttons
            this.bindButton('resetBtn', () => this.resetSettings());
            this.bindButton('exportBtn', () => this.exportSettings());
            this.bindButton('importBtn', () => this.importSettings());
        }

        bindToggle(id) {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', () => {
                    const isActive = element.classList.contains('active');
                    if (isActive) {
                        element.classList.remove('active');
                    } else {
                        element.classList.add('active');
                    }
                    this.updateSetting(id, !isActive);
                });
            }
        }

        bindRange(id) {
            const element = document.getElementById(id);
            const valueElement = document.getElementById(id + 'Value');
            if (element) {
                element.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.updateSetting(id, value);
                    if (valueElement) {
                        const unit = id === 'lineHeight' ? '' : 'px';
                        valueElement.textContent = value + unit;
                    }
                });
            }
        }

        bindSelect(id) {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.updateSetting(id, e.target.value);
                });
            }
        }

        bindColor(id) {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.updateSetting(id, e.target.value);
                });
            }
        }

        bindTime(id) {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.updateSetting(id, e.target.value);
                });
            }
        }

        bindTextArea(id) {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.updateSetting(id, e.target.value);
                });
            }
        }

        bindButton(id, callback) {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', callback);
            }
        }

        updateUI() {
            // Update toggles
            Object.keys(this.settings).forEach(key => {
                const element = document.getElementById(key);
                if (element && element.classList.contains('switch')) {
                    if (this.settings[key]) {
                        element.classList.add('active');
                    } else {
                        element.classList.remove('active');
                    }
                }
            });

            // Update ranges
            const rangeFields = ['fontSize', 'borderRadius', 'lineHeight'];
            rangeFields.forEach(field => {
                const element = document.getElementById(field);
                const valueElement = document.getElementById(field + 'Value');
                if (element) {
                    element.value = this.settings[field];
                    if (valueElement) {
                        const unit = field === 'lineHeight' ? '' : 'px';
                        valueElement.textContent = this.settings[field] + unit;
                    }
                }
            });

            // Update selects
            const selectFields = ['fontFamily', 'backgroundStyle', 'backgroundPattern', 'cardStyle', 
                                'iconStyle', 'cursorStyle', 'scrollBehavior', 'contentWidth', 
                                'letterSpacing', 'textAlign', 'language', 'colorBlindMode', 
                                'timeFormat', 'dateFormat'];
            selectFields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = this.settings[field];
                }
            });

            // Update colors
            const colorFields = ['accentColor', 'backgroundColor'];
            colorFields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = this.settings[field];
                }
            });

            // Update time inputs
            const timeFields = ['nightModeStart', 'nightModeEnd'];
            timeFields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = this.settings[field];
                }
            });

            // Update text areas
            const textAreaFields = ['customCSS'];
            textAreaFields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = this.settings[field];
                }
            });
        }

        updatePreview() {
            const preview = document.getElementById('previewBox');
            if (preview) {
                preview.style.fontFamily = this.settings.fontFamily;
                preview.style.fontSize = this.settings.fontSize + 'px';
                preview.style.lineHeight = this.settings.lineHeight;
                preview.style.borderRadius = this.settings.borderRadius + 'px';
                preview.style.borderColor = this.settings.accentColor;
                preview.style.backgroundColor = this.settings.backgroundColor;
                
                if (this.settings.textShadow) {
                    preview.style.textShadow = '0 1px 2px rgba(0,0,0,0.1)';
                } else {
                    preview.style.textShadow = 'none';
                }
                
                if (this.settings.boxShadow) {
                    preview.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                } else {
                    preview.style.boxShadow = 'none';
                }
                
                if (this.settings.darkTheme) {
                    preview.style.background = '#303134';
                    preview.style.color = '#e8eaed';
                } else {
                    preview.style.background = this.settings.backgroundColor;
                    preview.style.color = '#202124';
                }
                
                // Letter spacing
                const letterSpacingValue = {
                    'tight': '-0.025em',
                    'normal': '0',
                    'wide': '0.025em'
                };
                preview.style.letterSpacing = letterSpacingValue[this.settings.letterSpacing];
                
                // Text align
                preview.style.textAlign = this.settings.textAlign;
            }
        }

        resetSettings() {
            if (confirm('Reset all settings to default? This will remove all customizations.')) {
                // Clear any dynamic elements
                this.removeMouseTrail();
                this.removeParticleEffects();
                const clock = document.getElementById('settings-clock');
                if (clock) clock.remove();
                const weather = document.getElementById('settings-weather');
                if (weather) weather.remove();
                   // Clear intervals
                if (this.clockInterval) {
                    clearInterval(this.clockInterval);
                    this.clockInterval = null;
                }
                
                // Reset settings
                this.settings = { ...DEFAULT_SETTINGS };
                this.saveSettings();
                this.applySettings();
                
                if (this.isSettingsPage) {
                    this.updateUI();
                    this.updatePreview();
                }
                
                this.showToast('Settings reset to default!');
                this.playSound('success');
            }
        }

        exportSettings() {
            const settingsData = {
                version: '2.0',
                timestamp: new Date().toISOString(),
                settings: this.settings,
                userAgent: navigator.userAgent
            };
            
            const data = JSON.stringify(settingsData, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Studix-settings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('Settings exported successfully!');
            this.playSound('success');
        }

        importSettings() {
            const input = document.getElementById('importFile');
            if (!input) {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.json';
                fileInput.style.display = 'none';
                fileInput.id = 'importFile';
                document.body.appendChild(fileInput);
                input = fileInput;
            }
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const imported = JSON.parse(e.target.result);
                            
                            // Validate imported data
                            if (imported.settings && typeof imported.settings === 'object') {
                                // Merge with defaults to ensure all properties exist
                                this.settings = { ...DEFAULT_SETTINGS, ...imported.settings };
                                this.saveSettings();
                                this.applySettings();
                                this.initializeEnhancements();
                                
                                if (this.isSettingsPage) {
                                    this.updateUI();
                                    this.updatePreview();
                                }
                                
                                this.showToast('Settings imported successfully!');
                                this.playSound('success');
                                
                                // Show import details
                                if (imported.timestamp) {
                                    const importDate = new Date(imported.timestamp).toLocaleDateString();
                                    this.showNotification('Settings Imported', `Settings from ${importDate} have been applied.`);
                                }
                            } else {
                                throw new Error('Invalid settings format');
                            }
                        } catch (err) {
                            console.error('Import error:', err);
                            this.showToast('Invalid settings file!');
                            this.playSound('error');
                        }
                    };
                    reader.readAsText(file);
                }
                // Reset file input
                input.value = '';
            };
            input.click();
        }

        showToast(message, type = 'info', duration = 3000) {
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = message;
                toast.className = `toast show ${type}`;
                setTimeout(() => {
                    toast.classList.remove('show');
                }, duration);
            } else {
                // Create toast if it doesn't exist
                this.createToast(message, type, duration);
            }
        }

        createToast(message, type = 'info', duration = 3000) {
            const toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = `toast show ${type}`;
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#323232'};
                color: white;
                padding: 12px 24px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 10000;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, duration);
        }

        // Observer pattern for settings changes
        addObserver(callback) {
            this.observers.push(callback);
        }

        removeObserver(callback) {
            this.observers = this.observers.filter(obs => obs !== callback);
        }

        notifyObservers() {
            this.observers.forEach(callback => {
                try {
                    callback(this.settings);
                } catch (e) {
                    console.error('Observer callback error:', e);
                }
            });
        }

        // Utility methods
        hexToRgba(hex, alpha = 1) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? 
                `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : 
                hex;
        }

        debounce(func, wait) {
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

        // Performance monitoring
        measurePerformance(name, fn) {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            console.log(`${name} took ${end - start} milliseconds`);
            return result;
        }

        // Cleanup method
        destroy() {
            // Remove event listeners, intervals, and dynamic elements
            if (this.clockInterval) {
                clearInterval(this.clockInterval);
            }
            
            this.removeMouseTrail();
            this.removeParticleEffects();
            
            const dynamicElements = ['settings-clock', 'settings-weather', 'mouse-trail', 'particle-canvas'];
            dynamicElements.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.remove();
            });
            
            this.observers = [];
        }

        // Public API methods
        get(key) {
            return this.settings[key];
        }

        set(key, value) {
            this.updateSetting(key, value);
            return this;
        }

        getAll() {
            return { ...this.settings };
        }

        reset() {
            this.resetSettings();
            return this;
        }

        export() {
            this.exportSettings();
            return this;
        }

        import() {
            this.importSettings();
            return this;
        }

        // Theme methods
        setTheme(theme) {
            if (typeof theme === 'object') {
                Object.keys(theme).forEach(key => {
                    if (key in this.settings) {
                        this.updateSetting(key, theme[key]);
                    }
                });
            }
            return this;
        }

        getTheme() {
            return {
                darkTheme: this.settings.darkTheme,
                accentColor: this.settings.accentColor,
                backgroundColor: this.settings.backgroundColor,
                fontFamily: this.settings.fontFamily,
                fontSize: this.settings.fontSize
            };
        }

        // Preset themes
        applyPreset(preset) {
            const presets = {
                default: { ...DEFAULT_SETTINGS },
                dark: {
                    ...DEFAULT_SETTINGS,
                    darkTheme: true,
                    accentColor: '#bb86fc',
                    backgroundColor: '#121212'
                },
                minimal: {
                    ...DEFAULT_SETTINGS,
                    borderRadius: 0,
                    boxShadow: false,
                    cardStyle: 'flat',
                    animations: false
                },
                accessibility: {
                    ...DEFAULT_SETTINGS,
                    highContrast: true,
                    focusIndicators: true,
                    dyslexiaFriendly: true,
                    fontSize: 18,
                    lineHeight: 2
                },
                performance: {
                    ...DEFAULT_SETTINGS,
                    animations: false,
                    reduceMotion: true,
                    particleEffects: false,
                    mouseTrail: false,
                    soundEffects: false
                }
            };
            
            if (presets[preset]) {
                this.settings = { ...presets[preset] };
                this.saveSettings();
                this.applySettings();
                this.initializeEnhancements();
                
                if (this.isSettingsPage) {
                    this.updateUI();
                    this.updatePreview();
                }
                
                this.showToast(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied!`);
            }
            
            return this;
        }
    }

    // Initialize Enhanced Settings
    window.UniversalSettings = new EnhancedUniversalSettings();

    // Enhanced Global API
    window.getSetting = (key) => window.UniversalSettings.get(key);
    window.setSetting = (key, value) => window.UniversalSettings.set(key, value);
    window.getAllSettings = () => window.UniversalSettings.getAll();
    window.resetSettings = () => window.UniversalSettings.reset();
    window.exportSettings = () => window.UniversalSettings.export();
    window.importSettings = () => window.UniversalSettings.import();
    window.applyPreset = (preset) => window.UniversalSettings.applyPreset(preset);
    window.setTheme = (theme) => window.UniversalSettings.setTheme(theme);
    window.getTheme = () => window.UniversalSettings.getTheme();
    window.addSettingsObserver = (callback) => window.UniversalSettings.addObserver(callback);

    // Auto-save settings on page unload
    window.addEventListener('beforeunload', () => {
        if (window.UniversalSettings.settings.autoSave) {
            window.UniversalSettings.saveSettings();
        }
    });

    // Clean up on page unload
    window.addEventListener('unload', () => {
        window.UniversalSettings.destroy();
    });

})();