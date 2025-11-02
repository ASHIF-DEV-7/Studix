/**
 * Content Settings - Working script for content section styling
 * Add this to pages where you want content section customization
 * Usage: <script src="content-settings.js" defer></script>
 */

(function() {
    'use strict';
    
    const SETTINGS_KEY = 'Studix-settings';
    const UPDATE_KEY = 'settings-updated';
    
    // Default content settings
    const defaultContentSettings = {
        contentBgColor: '#ffffff',
        contentFontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        contentTextColor: '#333333'
    };
    
    // Load and apply content settings
    function loadContentSettings() {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_KEY);
            
            if (!savedSettings) {
                console.log('Content Settings: No settings found');
                return;
            }
            
            const settings = JSON.parse(savedSettings);
            const contentSettings = {
                contentBgColor: settings.contentBgColor || defaultContentSettings.contentBgColor,
                contentFontFamily: settings.contentFontFamily || defaultContentSettings.contentFontFamily,
                contentTextColor: settings.contentTextColor || defaultContentSettings.contentTextColor
            };
            
            applyContentSettings(contentSettings);
            console.log('Content Settings: Applied successfully', contentSettings);
            
        } catch (error) {
            console.error('Content Settings: Error loading', error);
        }
    }
    
    // Apply content settings to page
    function applyContentSettings(settings) {
        // Remove existing content styles
        const existingStyle = document.getElementById('content-settings-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Create new style element
        const style = document.createElement('style');
        style.id = 'content-settings-style';
        
        // CSS for content areas - targeting multiple possible content classes
        const css = `
            /* Content Section Styling */
            .content-area,
            .content-section,
            .main-content,
            .post-content,
            .article-content,
            .study-content,
            .lesson-content,
            .chapter-content,
            .content-wrapper,
            .content-container,
            .text-content,
            .page-content,
            .body-content,
            .article-body,
            .post-body,
            .lesson-body,
            .study-area,
            .reading-area {
                background-color: ${settings.contentBgColor} !important;
                font-family: ${settings.contentFontFamily} !important;
                color: ${settings.contentTextColor} !important;
                padding: 20px !important;
                border-radius: 8px !important;
                margin: 10px 0 !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
                line-height: 1.6 !important;
            }
            
            /* Content text elements */
            .content-area *,
            .content-section *,
            .main-content *,
            .post-content *,
            .article-content *,
            .study-content *,
            .lesson-content *,
            .chapter-content *,
            .content-wrapper *,
            .content-container *,
            .text-content *,
            .page-content *,
            .body-content *,
            .article-body *,
            .post-body *,
            .lesson-body *,
            .study-area *,
            .reading-area * {
                font-family: ${settings.contentFontFamily} !important;
                color: ${settings.contentTextColor} !important;
            }
            
            /* Headings in content areas */
            .content-area h1, .content-area h2, .content-area h3, .content-area h4, .content-area h5, .content-area h6,
            .content-section h1, .content-section h2, .content-section h3, .content-section h4, .content-section h5, .content-section h6,
            .main-content h1, .main-content h2, .main-content h3, .main-content h4, .main-content h5, .main-content h6,
            .post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6,
            .article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6,
            .study-content h1, .study-content h2, .study-content h3, .study-content h4, .study-content h5, .study-content h6 {
                color: ${settings.contentTextColor} !important;
                font-family: ${settings.contentFontFamily} !important;
                margin: 15px 0 10px 0 !important;
            }
            
            /* Links in content areas */
            .content-area a, .content-section a, .main-content a, .post-content a, .article-content a, .study-content a,
            .lesson-content a, .chapter-content a, .content-wrapper a, .content-container a, .text-content a {
                color: ${settings.contentTextColor} !important;
                opacity: 0.8;
                text-decoration: underline;
            }
            
            .content-area a:hover, .content-section a:hover, .main-content a:hover, .post-content a:hover, 
            .article-content a:hover, .study-content a:hover, .lesson-content a:hover, .chapter-content a:hover,
            .content-wrapper a:hover, .content-container a:hover, .text-content a:hover {
                opacity: 1;
            }
            
            /* Paragraphs in content areas */
            .content-area p, .content-section p, .main-content p, .post-content p, .article-content p, .study-content p,
            .lesson-content p, .chapter-content p, .content-wrapper p, .content-container p, .text-content p {
                margin: 10px 0 !important;
                line-height: 1.7 !important;
            }
            
            /* Lists in content areas */
            .content-area ul, .content-area ol, .content-section ul, .content-section ol, 
            .main-content ul, .main-content ol, .post-content ul, .post-content ol,
            .article-content ul, .article-content ol, .study-content ul, .study-content ol {
                margin: 10px 0 !important;
                padding-left: 25px !important;
            }
            
            .content-area li, .content-section li, .main-content li, .post-content li,
            .article-content li, .study-content li, .lesson-content li, .chapter-content li {
                margin: 5px 0 !important;
                line-height: 1.6 !important;
            }
            
            /* Code blocks in content areas */
            .content-area code, .content-section code, .main-content code, .post-content code,
            .article-content code, .study-content code, .lesson-content code, .chapter-content code {
                background-color: rgba(0,0,0,0.1) !important;
                padding: 2px 4px !important;
                border-radius: 3px !important;
                font-family: 'Courier New', monospace !important;
            }
            
            .content-area pre, .content-section pre, .main-content pre, .post-content pre,
            .article-content pre, .study-content pre, .lesson-content pre, .chapter-content pre {
                background-color: rgba(0,0,0,0.1) !important;
                padding: 10px !important;
                border-radius: 5px !important;
                overflow-x: auto !important;
                margin: 10px 0 !important;
            }
            
            /* Tables in content areas */
            .content-area table, .content-section table, .main-content table, .post-content table,
            .article-content table, .study-content table, .lesson-content table, .chapter-content table {
                border-collapse: collapse !important;
                width: 100% !important;
                margin: 15px 0 !important;
            }
            
            .content-area td, .content-area th, .content-section td, .content-section th,
            .main-content td, .main-content th, .post-content td, .post-content th,
            .article-content td, .article-content th, .study-content td, .study-content th {
                border: 1px solid rgba(0,0,0,0.2) !important;
                padding: 8px !important;
                text-align: left !important;
            }
            
            .content-area th, .content-section th, .main-content th, .post-content th,
            .article-content th, .study-content th, .lesson-content th, .chapter-content th {
                background-color: rgba(0,0,0,0.1) !important;
                font-weight: bold !important;
            }
        `;
        
        style.textContent = css;
        document.head.appendChild(style);
        
        // Also apply to any existing content elements immediately
        const contentElements = document.querySelectorAll(`
            .content-area, .content-section, .main-content, .post-content, 
            .article-content, .study-content, .lesson-content, .chapter-content,
            .content-wrapper, .content-container, .text-content, .page-content,
            .body-content, .article-body, .post-body, .lesson-body, .study-area, .reading-area
        `);
        
        contentElements.forEach(element => {
            element.style.backgroundColor = settings.contentBgColor;
            element.style.fontFamily = settings.contentFontFamily;
            element.style.color = settings.contentTextColor;
        });
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('contentSettingsApplied', { 
            detail: settings 
        }));
    }
    
    // Listen for settings updates from other tabs
    function setupStorageListener() {
        window.addEventListener('storage', function(e) {
            if (e.key === UPDATE_KEY) {
                console.log('Content Settings: Update detected, reloading...');
                setTimeout(loadContentSettings, 100);
            }
        });
    }
    
    // Listen for same-tab updates
    function setupSameTabListener() {
        window.addEventListener('StudixSettingsChanged', function(e) {
            console.log('Content Settings: Same tab update detected');
            loadContentSettings();
        });
    }
    
    // Initialize content settings
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadContentSettings);
        } else {
            loadContentSettings();
        }
        
        setupStorageListener();
        setupSameTabListener();
        
        console.log('Content Settings: System initialized');
    }
    
    // Auto-initialize
    initialize();
    
    // Expose utility functions globally
    window.ContentSettings = {
        reload: loadContentSettings,
        apply: applyContentSettings,
        get: function() {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (saved) {
                const settings = JSON.parse(saved);
                return {
                    contentBgColor: settings.contentBgColor,
                    contentFontFamily: settings.contentFontFamily,
                    contentTextColor: settings.contentTextColor
                };
            }
            return null;
        },
        applyToElement: function(element) {
            const settings = this.get();
            if (settings && element) {
                element.style.backgroundColor = settings.contentBgColor;
                element.style.fontFamily = settings.contentFontFamily;
                element.style.color = settings.contentTextColor;
            }
        }
    };
    
})();

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Save this file as 'content-settings.js' in your project
 * 
 * 2. Add this line to HTML pages where you want content styling:
 *    <script src="content-settings.js" defer></script>
 * 
 * 3. Add appropriate content classes to your content divs:
 *    <div class="content-area">Your main content here</div>
 *    <div class="study-content">Study material here</div>
 *    <div class="lesson-content">Lesson content here</div>
 * 
 * 4. Supported content classes (automatically detected):
 *    - .content-area, .content-section, .main-content
 *    - .post-content, .article-content, .study-content
 *    - .lesson-content, .chapter-content, .content-wrapper
 *    - .content-container, .text-content, .page-content
 *    - .body-content, .article-body, .post-body
 *    - .lesson-body, .study-area, .reading-area
 * 
 * 5. Manual application to specific elements:
 *    ContentSettings.applyToElement(document.getElementById('myContent'));
 * 
 * FEATURES:
 * - Comprehensive content styling (backgrounds, fonts, colors)
 * - Supports all common content element types
 * - Real-time sync with settings page
 * - Cross-tab synchronization
 * - Immediate application to existing elements
 * - Utility functions for manual control
 * - Auto-detects multiple content class patterns
 * - Handles text, headings, links, lists, tables, code blocks
 * - No external dependencies
 * - Lightweight and fast
 */