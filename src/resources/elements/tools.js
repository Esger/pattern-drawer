import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class ToolsCustomElement {
    lineColor = 'crimson';

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this.isDrawing = false;
        this.visibility = {
            tools: false,
            repetitions: false,
            repetitionsY: false,
        }
        this.repetitions = {
            x: 1,
            y: 1
        }
    }

    attached() {
        this.hideTools();
        this._drawSubscription = this._eventAggregator.subscribe('draw', () => this.step = 2);
        this._wormSubscription = this._eventAggregator.subscribe('worm', () => this.step = 1);
        this._lineColorSubscription = this._eventAggregator.subscribe('lineColor', color => this.lineColor = color);
        this._repetitionsSubscription = this._eventAggregator.subscribe('repetitions', repetitions => this.repetitions = repetitions);
    }

    detached() {
        this._drawSubscription.dispose();
        this._wormSubscription.dispose();
        this._lineColorSubscription.dispose();
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

    setrepetitions() {
        const repetitions = {
            x: parseInt(this.repetitions.x, 10),
            y: parseInt(this.visibility.repetitionsY ? this.repetitions.y : this.repetitions.x, 10)
        }
        this._eventAggregator.publish('repetitions', repetitions);
    }

    changeLineColor() {
        this._eventAggregator.publish('lineColor', this.lineColor);
    }

}
