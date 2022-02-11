import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class ToolsCustomElement {
    @bindable value;
    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this.isDrawing = false;
    }

    draw() {
        this.isDrawing = true;
        this._eventAggregator.publish('draw');
    }

    worm() {
        this.isDrawing = false;
        this._eventAggregator.publish('worm');
    }

    valueChanged(newValue, oldValue) {
        //
    }
}
