import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class ToolsCustomElement {
    lineColor = undefined;
    lineWidth = undefined;
    repetitions = {};

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this.visibility = {
            tools: false,
            repetitions: false,
            repetitionsY: false,
            lineWidth: false,
        }
        this.lineColor = undefined;
        this.lineWidth = undefined;
    }

    attached() {
        this.hideTools();
        this._drawSubscription = this._eventAggregator.subscribe('draw', () => this.step = 2);
        this._wormSubscription = this._eventAggregator.subscribe('worm', () => this.step = 1);
        const settings = JSON.parse(localStorage.getItem('pattern-creator'));
        this.lineColor = settings.lineColor;
        this.lineWidth = settings.lineWidth;
        this.repetitions.x = settings.repetitions[0];
        this.repetitions.y = settings.repetitions[1];
        this.isDrawing = settings.mode === 'draw' || false;
    }

    detached() {
        this._drawSubscription.dispose();
        this._wormSubscription.dispose();
        this._lineColorSubscription.dispose();
        this._lineWidthSubscription.dispose();
        this._repetitionsSubscription.dispose();
    }

    toggleVisibility(item) {
        this.visibility[item] = !this.visibility[item];
    }

    hideTools() {
        this.visibility.tools = false;
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

    undo() {
        this._eventAggregator.publish('undo');
    }

    setrepetitions() {
        const repetitions = {
            x: parseInt(this.repetitions.x, 10),
            y: parseInt(this.visibility.repetitionsY ? this.repetitions.y : this.repetitions.x, 10)
        }
        this._eventAggregator.publish('repetitions', repetitions);
    }

    setLineColor() {
        this._eventAggregator.publish('lineColor', this.lineColor);
    }

    setLineWidth() {
        this._eventAggregator.publish('lineWidth', this.lineWidth);
    }

}
