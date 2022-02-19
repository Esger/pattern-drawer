export class App {
    message = 'Pattern Creator';

    constructor(eventAggregator, keyInputService) {
        this._detectTouchDevice();
        const googleFont = document.querySelectorAll('.googleFont')[0];
        googleFont.addEventListener('load', _ => this._showTitle(), { once: true });
    }

    _detectTouchDevice() {
        const isTouchDevice =
            (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
        const isSmallScreen = Math.min(window.innerHeight, window.innerWidth) < 800;
        this.isMobile = isTouchDevice && isSmallScreen;
        sessionStorage.setItem('isMobile', this.isMobile);
        if (this.isMobile) {
            document.body.style.setProperty('--maxWidth', 100 + "vmin");
            document.body.classList.add('isMobile');
        }
    }

    attached() {
        this.hideTitle();
        if (this.isMobile) {
            this.showTitle();
            document.querySelectorAll('body')[0].addEventListener('touchmove', _ => {
                this.hideTitle();
                clearTimeout(this._hideTitleTimeoutHandle);
                this.showTitle();
            })
        }
    }

    showTitle() {
        if (this.isMobile) {
            this._hideTitleTimeoutHandle = setTimeout(_ => this.titleIsVisible = true, 5000)
        } else {
            this.titleIsVisible = true;
            this.hideTitle();
        }
    }

    hideTitle() {
        if (this.isMobile) {
            this.titleIsVisible = false;
        } else {
            setTimeout(() => {
                this.titleIsVisible = false;
            }, 5000);
        }
    }
}
