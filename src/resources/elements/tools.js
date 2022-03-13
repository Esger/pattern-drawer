import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { MySettingsService } from 'services/my-settings-service';
@inject(EventAggregator, MySettingsService)
export class ToolsCustomElement {

    constructor(eventAggregator, mySettingsService) {
        this._eventAggregator = eventAggregator;
        this._mySettingsService = mySettingsService;
    }

    attached() {
        this.mySettings = this._mySettingsService.loadSettings();
        this._drawSubscription = this._eventAggregator.subscribe('draw', () => this.step = 2);
        this._wormSubscription = this._eventAggregator.subscribe('worm', () => this.step = 1);
        this.isDrawing = this.mySettings?.draw.mode === 'draw' || false;
    }

    detached() {
        this._drawSubscription.dispose();
        this._wormSubscription.dispose();
        this._lineColorSubscription.dispose();
        this._lineWidthSubscription.dispose();
        this._repetitionsSubscription.dispose();
    }

    toggleVisibility(item) {
        this.mySettings.visibility[item] = !this.mySettings.visibility[item];
        this.mySettings.draw.repetitions.forEach((value, index, repetitions) => {
            repetitions[index] = parseInt(value, 10);
        });
        this.mySettings.draw.mode = this.isDrawing ? 'draw' : 'worm';
        this._mySettingsService.saveSettings(this.mySettings);
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
            parseInt(this.mySettings.draw.repetitions[0], 10),
            parseInt(this.mySettings.visibility.repetitionsY ? this.mySettings.draw.repetitions[1] : this.mySettings.draw.repetitions[0], 10)
        ];
        this._eventAggregator.publish('repetitions', repetitions);
    }

    setLineColor() {
        this._eventAggregator.publish('lineColor', this.mySettings.draw.lineColor);
    }

    setLineWidth() {
        this._eventAggregator.publish('lineWidth', this.mySettings.draw.lineWidth);
    }

    setLineLength() {
        this._eventAggregator.publish('lineLength', this.mySettings.draw.lineLength);
    }

}
