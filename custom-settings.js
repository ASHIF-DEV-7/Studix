// Custom Settings Manager - Universal Settings Handler
class SettingsManager {
    constructor() {
        this.settings = {
            // Appearance
            darkMode: false,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: 16,
            backgroundColor: '#1E1E2F',
            textColor: '#FFFFFF',
            cardColor: '#1E253D',
            accentColor: '#ffb74d',
            
            // Interface
            animations: true,
            hoverEffects: true,
            borderRadius: 12,
            contentWidth: '1400px',
            
            // Performance
            reduceMotion: false,
            lazyLoading: true,
            
            // Accessibility
            highContrast: false,
            focusIndicators: true,
            
            // Data
            autoSave: true
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.applySettings();
        
        // Only initialize settings page controls if we're on settings page
        if (this.isSettingsPage()) {
            this.initializeSettingsPage();
        }
        
        // Apply settings immediately on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.applySettings();
        });
    }
    
    isSettingsPage() {
        return document.querySelector('.settings-container') !== null;
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('Studix_settings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('Studix_settings', JSON.stringify(this.settings));
            if (this.settings.autoSave) {
                this.showSuccessMessage('Settings saved successfully!');
            }
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
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
    
    applySettings() {
        this.applyAppearanceSettings();
        this.applyInterfaceSettings();
        this.applyPerformanceSettings();
        this.applyAccessibilitySettings();
    }
    
    applyAppearanceSettings() {
        const root = document.documentElement;
        const body = document.body;
        
        // Apply CSS custom properties
        root.style.setProperty('--font-family', this.settings.fontFamily);
        root.style.setProperty('--font-size', this.settings.fontSize + 'px');
        root.style.setProperty('--bg-color', this.settings.backgroundColor);
        root.style.setProperty('--text-color', this.settings.textColor);
        root.style.setProperty('--card-color', this.settings.cardColor);
        root.style.setProperty('--accent-color', this.settings.accentColor);
        root.style.setProperty('--border-radius', this.settings.borderRadius + 'px');
        
        // Apply font family to body
        body.style.fontFamily = this.settings.fontFamily;
        body.style.fontSize = this.settings.fontSize + 'px';
        
        // Dark mode toggle
        if (this.settings.darkMode) {
            body.classList.add('dark-mode');
            this.applyDarkMode();
        } else {
            body.classList.remove('dark-mode');
            this.applyLightMode();
        }
        
        // Apply custom colors
        this.applyCustomColors();
    }
    
    applyDarkMode() {
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.backgroundColor === 'rgb(255, 255, 255)' || 
                computedStyle.backgroundColor === 'white') {
                el.style.backgroundColor = this.settings.cardColor;
            }
            if (computedStyle.color === 'rgb(0, 0, 0)' || 
                computedStyle.color === 'black') {
                el.style.color = this.settings.textColor;
            }
        });
        
        document.body.style.backgroundColor = this.settings.backgroundColor;
        document.body.style.color = this.settings.textColor;
    }
    
    applyLightMode() {
        // Reset to original colors for light mode
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            if (el.style.backgroundColor === this.settings.cardColor) {
                el.style.backgroundColor = '';
            }
            if (el.style.color === this.settings.textColor) {
                el.style.color = '';
            }
        });
    }
    
    applyCustomColors() {
        // Apply custom colors to common elements
        const style = document.getElementById('dynamic-settings-style') || document.createElement('style');
        style.id = 'dynamic-settings-style';
        
        style.textContent = `
            :root {
                --primary-bg: ${this.settings.backgroundColor};
                --primary-text: ${this.settings.textColor};
                --card-bg: ${this.settings.cardColor};
                --accent: ${this.settings.accentColor};
                --border-radius: ${this.settings.borderRadius}px;
                --font-family: ${this.settings.fontFamily};
                --font-size: ${this.settings.fontSize}px;
                --content-width: ${this.settings.contentWidth};
            }
            
            body {
                font-family: var(--font-family) !important;
                font-size: var(--font-size) !important;
                ${this.settings.darkMode ? `
                    background-color: var(--primary-bg) !important;
                    color: var(--primary-text) !important;
                ` : ''}
            }
            
            .card, .settings-section, .study-card, .dashboard-card {
                ${this.settings.darkMode ? `background-color: var(--card-bg) !important;` : ''}
                border-radius: var(--border-radius) !important;
                ${this.settings.darkMode ? `color: var(--primary-text) !important;` : ''}
            }
            
            .btn-primary, .primary-button, .accent-button {
                background-color: var(--accent) !important;
                border-radius: var(--border-radius) !important;
            }
            
            .container, .main-container, .content-container {
                max-width: var(--content-width) !important;
            }
            
            input, textarea, select {
                ${this.settings.darkMode ? `
                    background-color: var(--card-bg) !important;
                    color: var(--primary-text) !important;
                    border-color: rgba(255,255,255,0.2) !important;
                ` : ''}
                border-radius: var(--border-radius) !important;
            }
            
            ${this.settings.highContrast ? `
                * {
                    border: 1px solid #fff !important;
                }
                .card, .settings-section {
                    box-shadow: 0 0 10px rgba(255,255,255,0.5) !important;
                }
            ` : ''}
            
            ${this.settings.focusIndicators ? `
                *:focus {
                    outline: 3px solid var(--accent) !important;
                    outline-offset: 2px !important;
                }
            ` : ''}
            
            ${!this.settings.animations || this.settings.reduceMotion ? `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            ` : ''}
            
            ${!this.settings.hoverEffects ? `
                *:hover {
                    transform: none !important;
                    box-shadow: none !important;
                }
            ` : ''}
        `;
        
        if (!document.head.contains(style)) {
            document.head.appendChild(style);
        }
    }
    
    applyInterfaceSettings() {
        const containers = document.querySelectorAll('.container, .main-container, .content-container');
        containers.forEach(container => {
            container.style.maxWidth = this.settings.contentWidth;
        });
        
        if (!this.settings.animations || this.settings.reduceMotion) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }
    }
    
    applyPerformanceSettings() {
        if (this.settings.lazyLoading) {
            this.enableLazyLoading();
        }
    }
    
    applyAccessibilitySettings() {
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }
    
    enableLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Settings Page Specific Methods
    initializeSettingsPage() {
        this.bindSettingsControls();
        this.updateSettingsUI();
        this.updatePreview();
    }
    
    bindSettingsControls() {
        // Bind all setting controls
        const controls = {
            // Toggle switches
            darkMode: 'checkbox',
            animations: 'checkbox',
            hoverEffects: 'checkbox',
            reduceMotion: 'checkbox',
            lazyLoading: 'checkbox',
            highContrast: 'checkbox',
            focusIndicators: 'checkbox',
            autoSave: 'checkbox',
            
            // Select dropdowns
            fontFamily: 'select',
            contentWidth: 'select',
            
            // Range sliders
            fontSize: 'range',
            borderRadius: 'range',
            
            // Color pickers
            backgroundColor: 'color',
            textColor: 'color',
            cardColor: 'color',
            accentColor: 'color'
        };
        
        Object.keys(controls).forEach(setting => {
            const element = document.getElementById(setting);
            if (element) {
                const type = controls[setting];
                
                if (type === 'checkbox') {
                    element.addEventListener('change', (e) => {
                        this.updateSetting(setting, e.target.checked);
                    });
                } else if (type === 'range') {
                    element.addEventListener('input', (e) => {
                        this.updateSetting(setting, parseInt(e.target.value));
                        this.updateRangeValue(setting, e.target.value);
                    });
                } else {
                    element.addEventListener('change', (e) => {
                        this.updateSetting(setting, e.target.value);
                    });
                }
            }
        });
        
        // Bind action buttons
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
        
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetToDefault();
            });
        }
        
        const clearCacheBtn = document.getElementById('clearCache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }
        
        const exportBtn = document.getElementById('exportSettings');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSettings();
            });
        }
        
        const importInput = document.getElementById('importSettings');
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                this.importSettings(e.target.files[0]);
            });
        }
    }
    
    updateSettingsUI() {
        // Update all UI controls to reflect current settings
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else if (element.type === 'range') {
                    element.value = this.settings[key];
                    this.updateRangeValue(key, this.settings[key]);
                } else {
                    element.value = this.settings[key];
                }
            }
        });
    }
    
    updateRangeValue(setting, value) {
        const valueElement = document.getElementById(setting + 'Value');
        if (valueElement) {
            valueElement.textContent = value + (setting === 'fontSize' || setting === 'borderRadius' ? 'px' : '');
        }
    }
    
    updatePreview() {
        const preview = document.getElementById('themePreview');
        if (preview) {
            preview.style.backgroundColor = this.settings.cardColor;
            preview.style.color = this.settings.textColor;
            preview.style.fontFamily = this.settings.fontFamily;
            preview.style.fontSize = this.settings.fontSize + 'px';
            preview.style.borderRadius = this.settings.borderRadius + 'px';
            preview.style.border = `2px solid ${this.settings.accentColor}`;
        }
    }
    
    resetToDefault() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            // Reset settings object
            this.settings = {
                darkMode: false,
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                fontSize: 16,
                backgroundColor: '#1E1E2F',
                textColor: '#FFFFFF',
                cardColor: '#1E253D',
                accentColor: '#ffb74d',
                animations: true,
                hoverEffects: true,
                borderRadius: 12,
                contentWidth: '1400px',
                reduceMotion: false,
                lazyLoading: true,
                highContrast: false,
                focusIndicators: true,
                autoSave: true
            };
            
            this.saveSettings();
            this.updateSettingsUI();
            this.applySettings();
            this.updatePreview();
            this.showSuccessMessage('Settings reset to default!');
        }
    }
    
    clearCache() {
        if (confirm('Are you sure you want to clear all cached data?')) {
            localStorage.removeItem('Studix_cache');
            sessionStorage.clear();
            this.showSuccessMessage('Cache cleared successfully!');
        }
    }
    
    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Studix_settings.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage('Settings exported successfully!');
    }
    
    importSettings(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target.result);
                this.settings = { ...this.settings, ...importedSettings };
                this.saveSettings();
                this.updateSettingsUI();
                this.applySettings();
                this.updatePreview();
                this.showSuccessMessage('Settings imported successfully!');
            } catch (error) {
                alert('Error importing settings: Invalid file format');
            }
        };
        reader.readAsText(file);
    }
    
    showSuccessMessage(message) {
        const messageEl = document.getElementById('successMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.classList.add('show');
            setTimeout(() => {
                messageEl.classList.remove('show');
            }, 3000);
        }
    }
    
    // Public API for other scripts
    getSetting(key) {
        return this.settings[key];
    }
    
    getSettings() {
        return { ...this.settings };
    }
    
    setSetting(key, value) {
        this.updateSetting(key, value);
    }
    
    onSettingChange(callback) {
        // Allow other scripts to listen for setting changes
        document.addEventListener('settingChanged', callback);
    }
    
    triggerSettingChange(key, value) {
        document.dispatchEvent(new CustomEvent('settingChanged', {
            detail: { key, value, settings: this.settings }
        }));
    }
}

// Initialize the settings manager
window.SettingsManager = new SettingsManager();

// Make it globally accessible
window.getSettings = () => window.SettingsManager.getSettings();
window.getSetting = (key) => window.SettingsManager.getSetting(key);
window.setSetting = (key, value) => window.SettingsManager.setSetting(key, value);

// Auto-apply settings when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.SettingsManager.applySettings();
    });
} else {
    window.SettingsManager.applySettings();
}