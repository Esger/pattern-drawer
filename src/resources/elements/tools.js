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
        }
        this.repetitions = {
            x: 1,
            y: 1
        }
    }

    attached() {
        this.hideTools();
        this.setrepetitions();
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
            y: parseInt(this.repetitions.y, 10)
        }
        this._eventAggregator.publish('repetitions', repetitions);
    }

    changeLineColor() {
        this._eventAggregator.publish('lineColor', this.lineColor);
    }

}
