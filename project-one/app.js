/**
 * ROMANTIC APP - Gallery Parallax System
 * =====================================
 * Sistem gallery interaktif dengan efek parallax profesional
 * Menggunakan arsitektur Class-Based OOP dengan Clean Code principles
 */

// =============================================
// UTILITY CLASS - Logger untuk debug & error handling
// =============================================
class Logger {
    static LEVELS = {
        INFO: 'INFO',
        WARNING: 'WARNING',
        ERROR: 'ERROR',
        DEBUG: 'DEBUG'
    };

    static log(message, level = this.LEVELS.INFO, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${level}]`;
        
        if (data) {
            console.log(`${prefix}`, message, data);
        } else {
            console.log(`${prefix}`, message);
        }
    }

    static info(message, data = null) {
        this.log(message, this.LEVELS.INFO, data);
    }

    static warning(message, data = null) {
        this.log(message, this.LEVELS.WARNING, data);
    }

    static error(message, data = null) {
        this.log(message, this.LEVELS.ERROR, data);
    }

    static debug(message, data = null) {
        if (true) { // Set ke false untuk disable debug
            this.log(message, this.LEVELS.DEBUG, data);
        }
    }
}

// =============================================
// CONFIGURATION CLASS
// =============================================
class Config {
    static GALLERY_DATA = [
        {
            id: 1,
            title: 'you are my favorite person in the world',
            description: 'satu detik bersamamu, seribu alasan untuk tersenyum',
            image: './image/1.jpeg',
            parallaxIntensity: 0.5
        },
        {
            id: 2,
            title: 'little things i love about you',
            description: 'akuu sukaa semuaa tentangg kamuuu, makasihh yaa syaanag sudah bertahaan',
            image: './image/2.jpeg',
            parallaxIntensity: 0.6
        },
        {
            id: 3,
            title: 'simply because you are you',
            description: 'aku beruuntungg bisa kenall kamuu lebih darii orangg lainn, you make everything better just by being there',
            image: './image/3.jpeg',
            parallaxIntensity: 0.4
        },
        {
            id: 4,
            title: 'see you in our next chapter',
            description: 'jangaan berhentii jadi diri kamu sendiri, karenaa kamu itu spesiall banggettttt buat akuu ',
            image: './image/4.jpeg',
            parallaxIntensity: 0.55
        }
    ];

    static PARALLAX_SETTINGS = {
        scrollMultiplier: 0.5,
        mouseMultiplier: 10,
        maxParallaxOffset: 30,
        transitionDuration: 150
    };

    static ANIMATION_SETTINGS = {
        debounceDelay: 16,
        throttleDelay: 16
    };
}

// =============================================
// PARALLAX EFFECT ENGINE
// =============================================
class ParallaxEngine {
    constructor() {
        this.imageElements = new Map();
        this.scrollY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.animationFrameId = null;
        this.isEnabled = true;

        this.init();
    }

    init() {
        this.attachEventListeners();
        Logger.info('ParallaxEngine initialized');
    }

    attachEventListeners() {
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
    }

    handleScroll() {
        if (!this.isEnabled) return;
        
        this.scrollY = window.scrollY;
        this.updateParallax();
    }

    handleMouseMove(event) {
        if (!this.isEnabled) return;
        
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        this.updateParallax();
    }

    registerImage(imageElement, intensity = 0.5) {
        if (!imageElement) {
            Logger.warning('Attempted to register null image element');
            return;
        }

        this.imageElements.set(imageElement, {
            element: imageElement,
            intensity: intensity,
            rect: imageElement.getBoundingClientRect()
        });
    }

    updateParallax() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        this.animationFrameId = requestAnimationFrame(() => {
            this.imageElements.forEach((config) => {
                this.applyParallaxTransform(config);
            });
        });
    }

    applyParallaxTransform(config) {
        try {
            const { element, intensity, rect } = config;
            const elementY = element.parentElement.getBoundingClientRect().top;
            
            // Calculate parallax based on scroll
            const scrollOffset = -this.scrollY * intensity * Config.PARALLAX_SETTINGS.scrollMultiplier;
            
            // Calculate parallax based on mouse position (subtle effect)
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const mouseOffsetY = (this.mouseY / windowHeight - 0.5) * intensity * 5;
            const mouseOffsetX = (this.mouseX / windowWidth - 0.5) * intensity * 3;

            // Combine effects
            const totalOffsetY = scrollOffset + mouseOffsetY;
            const totalOffsetX = mouseOffsetX;

            // Clamp to max offset
            const clampedY = Math.max(
                -Config.PARALLAX_SETTINGS.maxParallaxOffset,
                Math.min(Config.PARALLAX_SETTINGS.maxParallaxOffset, totalOffsetY)
            );
            const clampedX = Math.max(
                -Config.PARALLAX_SETTINGS.maxParallaxOffset * 0.5,
                Math.min(Config.PARALLAX_SETTINGS.maxParallaxOffset * 0.5, totalOffsetX)
            );

            // Apply transform
            element.style.transform = `translate(${clampedX}px, ${clampedY}px) scale(1.05)`;
        } catch (error) {
            Logger.error('Error applying parallax transform', error);
        }
    }

    disable() {
        this.isEnabled = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    enable() {
        this.isEnabled = true;
    }

    destroy() {
        this.disable();
        this.imageElements.clear();
        Logger.info('ParallaxEngine destroyed');
    }
}

// =============================================
// GALLERY ITEM CLASS
// =============================================
class GalleryItem {
    constructor(data, index) {
        this.data = data;
        this.index = index;
        this.element = null;
        this.imageElement = null;
        this.coverElement = null;
        this.isLoaded = false;
        this.loadError = false;
        this.isRevealed = false;
    }

    createElement() {
        try {
            this.element = document.createElement('div');
            this.element.className = 'gallery-item';
            this.element.dataset.itemId = this.data.id;
            this.element.style.animationDelay = `${this.index * 0.1}s`;

            // Parallax container
            const parallaxContainer = document.createElement('div');
            parallaxContainer.className = 'gallery-item__parallax-container';

            // Image element
            this.imageElement = document.createElement('img');
            this.imageElement.className = 'gallery-item__image';
            this.imageElement.src = this.data.image;
            this.imageElement.alt = this.data.title;
            this.imageElement.loading = 'lazy';

            // Error handling for image load
            this.imageElement.addEventListener('error', () => this.handleImageError());
            this.imageElement.addEventListener('load', () => this.handleImageLoad());

            this.coverElement = document.createElement('div');
            this.coverElement.className = 'gallery-item__cover';

            parallaxContainer.appendChild(this.imageElement);
            this.element.appendChild(parallaxContainer);
            this.element.appendChild(this.coverElement);

            return this.element;
        } catch (error) {
            Logger.error('Error creating gallery item element', error);
            throw new Error(`Failed to create gallery item for ID: ${this.data.id}`);
        }
    }

    handleImageLoad() {
        this.isLoaded = true;
        this.element.classList.add('gallery-item--loaded');
        Logger.debug(`Image loaded: ${this.data.title}`);
    }

    handleImageError() {
        this.loadError = true;
        this.element.classList.add('gallery-item--error');
        Logger.error(`Failed to load image: ${this.data.image}`);
        
        // Fallback background
        this.imageElement.style.backgroundColor = '#ccc';
        this.imageElement.style.backgroundImage = 'repeating-linear-gradient(45deg, #999, #999 10px, #ccc 10px, #ccc 20px)';
    }

    attachClickListener(callback) {
        if (this.element) {
            this.element.addEventListener('click', () => {
                if (!this.isRevealed) {
                    this.revealPhoto();
                    return;
                }
                callback(this.data);
            });
        }
    }

    revealPhoto() {
        if (this.isRevealed) return;

        this.isRevealed = true;
        this.element?.classList.add('gallery-item--revealed');

        if (this.imageElement) {
            this.imageElement.style.opacity = '1';
            this.imageElement.style.filter = 'blur(0)';
        }

        if (this.coverElement) {
            this.coverElement.style.opacity = '0';
            this.coverElement.style.visibility = 'hidden';
            this.coverElement.style.pointerEvents = 'none';
        }

        this.element?.dispatchEvent(new CustomEvent('photoRevealed', {
            bubbles: true,
            detail: { message: 'Dimass sayang Ziaa ajaaa semuanyaaa' }
        }));
    }

}

// =============================================
// GALLERY PARALLAX CLASS (MAIN)
// =============================================
class GalleryParallax {
    constructor(containerId = 'galleryParallax') {
        this.containerId = containerId;
        this.container = null;
        this.wrapper = null;
        this.items = [];
        this.parallaxEngine = null;
        this.loadingIndicator = null;
        this.errorMessage = null;
        this.infoPanel = null;
        this.isInitialized = false;

        Logger.info('GalleryParallax instance created');
    }

    async initialize() {
        try {
            Logger.info('Initializing GalleryParallax...');
            
            if (this.isInitialized) {
                Logger.warning('GalleryParallax already initialized');
                return;
            }

            this.cacheElements();
            this.validateElements();
            this.showLoading(true);

            // Simulate loading time for demo
            await this.delay(500);

            this.parallaxEngine = new ParallaxEngine();
            this.renderGalleryItems();
            this.setupEventListeners();

            this.showLoading(false);
            this.isInitialized = true;

            Logger.info('GalleryParallax initialized successfully', {
                itemsCount: this.items.length
            });
        } catch (error) {
            this.handleInitializationError(error);
        }
    }

    cacheElements() {
        this.container = document.getElementById(this.containerId);
        this.wrapper = this.container?.querySelector('.gallery-parallax__wrapper');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.infoPanel = document.getElementById('galleryInfo');
    }

    validateElements() {
        if (!this.container) {
            throw new Error(`Gallery container not found: ${this.containerId}`);
        }
        if (!this.wrapper) {
            throw new Error('Gallery wrapper not found');
        }
        Logger.debug('All required elements validated');
    }

    renderGalleryItems() {
        try {
            const fragment = document.createDocumentFragment();

            Config.GALLERY_DATA.forEach((itemData, index) => {
                const galleryItem = new GalleryItem(itemData, index);
                const itemElement = galleryItem.createElement();

                // Register parallax effect
                const imageElement = itemElement.querySelector('.gallery-item__image');
                if (imageElement && this.parallaxEngine) {
                    this.parallaxEngine.registerImage(imageElement, itemData.parallaxIntensity);
                }

                // Attach click listener for info panel
                galleryItem.attachClickListener((data) => this.showItemInfo(data));
                this.items.push(galleryItem);
                fragment.appendChild(itemElement);
            });

            this.wrapper.appendChild(fragment);
            Logger.info(`Rendered ${this.items.length} gallery items`);
        } catch (error) {
            Logger.error('Error rendering gallery items', error);
            throw new Error('Failed to render gallery items');
        }
    }

    setupEventListeners() {
        const closeButton = document.getElementById('closeInfo');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hideItemInfo());
        }

        // Close info panel on background click
        if (this.infoPanel) {
            this.infoPanel.addEventListener('click', (e) => {
                if (e.target === this.infoPanel) {
                    this.hideItemInfo();
                }
            });
        }

        Logger.debug('Event listeners attached');
    }

    showItemInfo(itemData) {
        try {
            if (!this.infoPanel) return;

            document.getElementById('infoTitle').textContent = itemData.title;
            document.getElementById('infoDescription').textContent = itemData.description;

            this.infoPanel.style.display = 'flex';
            this.parallaxEngine?.disable();

            Logger.debug(`Displayed info for item: ${itemData.id}`);
        } catch (error) {
            Logger.error('Error showing item info', error);
        }
    }

    hideItemInfo() {
        try {
            if (!this.infoPanel) return;

            this.infoPanel.style.display = 'none';
            this.parallaxEngine?.enable();

            Logger.debug('Hidden item info panel');
        } catch (error) {
            Logger.error('Error hiding item info', error);
        }
    }

    showLoading(show) {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        try {
            if (!this.errorMessage) return;

            const errorText = document.getElementById('errorText');
            if (errorText) {
                errorText.textContent = message;
            }

            this.errorMessage.style.display = 'block';

            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.errorMessage.style.display = 'none';
            }, 5000);

            Logger.error(`Error shown to user: ${message}`);
        } catch (error) {
            Logger.error('Error showing error message', error);
        }
    }

    handleInitializationError(error) {
        Logger.error('Initialization failed', error);
        this.showLoading(false);
        this.showError(`Gagal menginisialisasi galeri: ${error.message}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    destroy() {
        try {
            this.items.forEach(item => {
                item.element?.remove();
            });
            this.items = [];

            this.parallaxEngine?.destroy();
            this.parallaxEngine = null;

            this.isInitialized = false;
            Logger.info('GalleryParallax destroyed');
        } catch (error) {
            Logger.error('Error destroying GalleryParallax', error);
        }
    }

    reload() {
        try {
            this.destroy();
            this.initialize();
            Logger.info('GalleryParallax reloaded');
        } catch (error) {
            Logger.error('Error reloading GalleryParallax', error);
        }
    }
}

// =============================================
// ROMANTIC APP CLASS (MAIN APP)
// =============================================
class RomanticApp {
    constructor() {
        this.gallery = null;
        this.musicButton = null;
        this.backgroundMusic = null;
        this.commentInput = null;
        this.commentSubmitButton = null;
        this.commentList = null;
        this.introOverlay = null;
        this.openGalleryButton = null;
        this.toastMessage = null;
        this.activeCommentItem = null;
        this.isReady = false;

        Logger.info('RomanticApp instance created');
    }

    async initialize() {
        try {
            Logger.info('Initializing RomanticApp...');

            // Initialize gallery parallax system
            this.gallery = new GalleryParallax('galleryParallax');
            await this.gallery.initialize();

            this.setupAppEventListeners();
            this.setupMusicControls();
            this.setupIntroOverlay();
            this.setupGlobalCommentSection();
            this.setupToastMessage();
            this.isReady = true;

            Logger.info('RomanticApp fully initialized');
            this.logSystemInfo();
        } catch (error) {
            Logger.error('Fatal error during app initialization', error);
            this.handleFatalError(error);
        }
    }

    setupAppEventListeners() {
        // Handle visibility change to pause/resume parallax
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.gallery.parallaxEngine?.disable();
                Logger.debug('App hidden - parallax disabled');
            } else {
                this.gallery.parallaxEngine?.enable();
                Logger.debug('App visible - parallax enabled');
            }
        });

        // Handle global photo revealed events for toast messages
        document.addEventListener('photoRevealed', (event) => {
            const message = event?.detail?.message || 'Foto terbuka untuk Ziaa';
            this.showToastMessage(message);
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            Logger.debug('Window resized');
        }, { passive: true });
    }

    setupIntroOverlay() {
        this.introOverlay = document.getElementById('introOverlay');
        this.openGalleryButton = document.getElementById('openGalleryButton');

        if (!this.introOverlay || !this.openGalleryButton) {
            Logger.warning('Intro overlay elements not found');
            return;
        }

        this.openGalleryButton.addEventListener('click', () => this.openGallery());
    }

    setupToastMessage() {
        this.toastMessage = document.getElementById('toastMessage');
    }

    setupGlobalCommentSection() {
        this.commentInput = document.getElementById('globalCommentInput');
        this.commentSubmitButton = document.getElementById('globalCommentSubmit');
        this.commentList = document.getElementById('commentList');

        if (!this.commentInput || !this.commentSubmitButton || !this.commentList) {
            Logger.warning('Global comment section not found');
            return;
        }

        this.commentSubmitButton.addEventListener('click', () => this.submitGlobalComment());
    }

    submitGlobalComment() {
        if (!this.commentInput || !this.commentList) return;

        const text = this.commentInput.value.trim();
        if (!text) {
            this.showError('Komentar tidak boleh kosong');
            return;
        }

        const commentBubble = document.createElement('div');
        commentBubble.className = 'gallery-item__comment';
        commentBubble.textContent = text;
        this.commentList.appendChild(commentBubble);

        this.commentInput.value = '';
        this.showToastMessage('Komentar berhasil dikirim untuk Ziaa');
    }

    showToastMessage(message) {
        if (!this.toastMessage) return;

        this.toastMessage.textContent = message;
        this.toastMessage.style.display = 'block';

        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            if (this.toastMessage) {
                this.toastMessage.style.display = 'none';
            }
        }, 3500);
    }

    openGallery() {
        if (this.introOverlay) {
            this.introOverlay.classList.add('hidden');
        }
        const mainContent = document.querySelector('.romantic-app__main');
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }

        Logger.info('Gallery revealed after opening letter');
    }

    handleFatalError(error) {
        const errorMsg = `Aplikasi mengalami error: ${error.message}`;
        if (this.gallery) {
            this.gallery.showError(errorMsg);
        }
    }

    cacheMusicElements() {
        this.musicButton = document.getElementById('musicButton');
        this.backgroundMusic = document.getElementById('backgroundMusic');
    }

    setupMusicControls() {
        this.cacheMusicElements();

        if (!this.musicButton || !this.backgroundMusic) {
            Logger.warning('Music controls or audio element not found');
            return;
        }

        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.55;

        this.musicButton.addEventListener('click', () => this.toggleMusicPlayback());
        this.updateMusicButton(this.backgroundMusic && !this.backgroundMusic.paused);

        this.backgroundMusic.addEventListener('play', () => this.updateMusicButton(true));
        this.backgroundMusic.addEventListener('pause', () => this.updateMusicButton(false));
        this.backgroundMusic.addEventListener('error', () => this.handleMusicError());
        this.backgroundMusic.addEventListener('canplaythrough', () => Logger.info('Music ready to play'));
    }

    toggleMusicPlayback() {
        if (!this.backgroundMusic) return;

        if (this.backgroundMusic.paused) {
            this.backgroundMusic.play().catch((error) => {
                Logger.warning('Music play blocked by browser', error);
                this.gallery?.showError('Audio tidak dapat diputar otomatis. Klik tombol musik lagi untuk memulai.');
            });
        } else {
            this.backgroundMusic.pause();
        }
    }

    updateMusicButton(isPlaying) {
        if (!this.musicButton) return;
        this.musicButton.textContent = isPlaying ? 'Pause Music' : 'Play Music';
    }

    handleMusicError() {
        Logger.error('Failed to load or play music');
        if (this.musicButton) {
            this.musicButton.textContent = 'Music unavailable';
            this.musicButton.disabled = true;
        }
        this.gallery?.showError('Audio tidak tersedia. Periksa file "music/bestpart.mp3".');
    }

    logSystemInfo() {
        const info = {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        Logger.debug('System Information', info);
    }

    getGallery() {
        return this.gallery;
    }

    destroy() {
        try {
            this.gallery?.destroy();
            this.gallery = null;
            this.isReady = false;
            Logger.info('RomanticApp destroyed');
        } catch (error) {
            Logger.error('Error destroying RomanticApp', error);
        }
    }

    reload() {
        this.destroy();
        this.initialize();
    }
}

// =============================================
// APP INITIALIZATION
// =============================================
let romanticApp = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        romanticApp = new RomanticApp();
        await romanticApp.initialize();
    } catch (error) {
        Logger.error('Critical error during app startup', error);
        console.error('Failed to initialize app:', error);
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    romanticApp?.destroy();
});

// Global error handler
window.addEventListener('error', (event) => {
    Logger.error('Global error caught', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection', event.reason);
});

// Export for testing/debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RomanticApp, GalleryParallax, ParallaxEngine, Config, Logger };
}
