import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class ToolsCustomElement {
    drawSettings = {
        lineColor: undefined,
        lineWidth: undefined,
        lineLength: undefined,
        repetitions: {}
    };
    visibility = {
        tools: false,
        repetitions: false,
        repetitionsY: false,
        lineWidth: false,
        lineLength: false,
    };

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
    }

    attached() {
        this.hideTools();
        this._drawSubscription = this._eventAggregator.subscribe('draw', () => this.step = 2);
        this._wormSubscription = this._eventAggregator.subscribe('worm', () => this.step = 1);
        this.drawSettings = JSON.parse(localStorage.getItem('pattern-creator'));
        this.isDrawing = this.drawSettings?.mode === 'draw' || false;
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
        const repetitions = [
            parseInt(this.drawSettings.repetitions[0], 10),
            parseInt(this.visibility.repetitionsY ? this.drawSettings.repetitions[1] : this.drawSettings.repetitions[0], 10)
        ];
        this._eventAggregator.publish('repetitions', repetitions);
    }

    setLineColor() {
        this._eventAggregator.publish('lineColor', this.drawSettings.lineColor);
    }

    setLineWidth() {
        this._eventAggregator.publish('lineWidth', this.drawSettings.lineWidth);
    }

    setLineLength() {
        this._eventAggregator.publish('lineLength', this.drawSettings.lineLength);
    }

}
