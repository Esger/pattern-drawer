import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class ToolsCustomElement {
    lineColor = 'crimson';

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this.isDrawing = false;
    }

    attached() {
        this.showTools();
        this.hideTools(5000);
        $('.tools__button').on('mouseenter', _ => this.showTools());
        $('.tools__button').on('mouseleave', _ => this.hideTools(500));
    }

    hideTools(timeout) {
        this.hideTimeoutHandle = setTimeout(() => {
            this.toolsVisible = false;
        }, timeout);
    }

    showTools() {
        clearTimeout(this.hideTimeoutHandle);
        this.toolsVisible = true;
    }

    draw() {
        this.isDrawing = true;
        this._eventAggregator.publish('draw');
    }

    worm() {
        this.isDrawing = false;
        this._eventAggregator.publish('worm');
    }

    erase() {
        this._eventAggregator.publish('erase');
    }

    duplicate(direction) {
        this._eventAggregator.publish('duplicate', { direction: direction });
    }

    changeLineColor() {
        this._eventAggregator.publish('lineColor', this.lineColor);
    }

}
