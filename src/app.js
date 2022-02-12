export class App {
    message = 'Pattern Creator';

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
