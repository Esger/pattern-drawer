export class App {
    message = 'Pattern Creator';

    constructor(eventAggregator, keyInputService) {
        this._detectTouchDevice();
    }

    _detectTouchDevice() {
        const isTouchDevice =
            (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
        const isSmallScreen = Math.min(window.innerHeight, window.innerWidth) < 800;
        const isMobile = isTouchDevice && isSmallScreen;
        sessionStorage.setItem('isMobile', isMobile);
        if (isMobile) {
            document.body.style.setProperty('--maxWidth', 100 + "vmin");
            document.body.classList.add('isMobile');
        }
    }

    attached() {
        this.showTitle();
        this.hideTitle();
    }

    showTitle() {
        this.titleIsVisible = true;
        this.hideTitle();
    }

    hideTitle() {
        setTimeout(() => {
            this.titleIsVisible = false;
        }, 5000);
    }
}
