import { inject, observable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { MySettingsService } from 'services/my-settings-service';
@inject(EventAggregator, MySettingsService)
export class ToolsCustomElement {

    @observable repetitionsYvisible;

    constructor(eventAggregator, mySettingsService) {
        this._eventAggregator = eventAggregator;
        this._mySettingsService = mySettingsService;
    }

    attached() {
        this.mySettings = this._mySettingsService.getSettings();
        this.isDrawing = this.mySettings?.draw.mode === 'draw' || false;
        this.repetitionsYvisible = this.mySettings.visibility.repetitionsY;
        this._eventAggregator.publish(this.mySettings.draw.mode);
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
        this._mySettingsService.saveSettings(this.mySettings);
    }

    repetitionsYvisibleChanged(newValue) {
        this.mySettings.visibility['repetitionsY'] = newValue;
        this.setGrid();
    }

    draw() {
        this.isDrawing = true;
        this.mySettings.draw.mode = 'draw';
        this._mySettingsService.saveSettings(this.mySettings);
        this._eventAggregator.publish('restart');
    }

    worm() {
        this.isDrawing = false;
        this.mySettings.draw.mode = 'worm';
        this._mySettingsService.saveSettings(this.mySettings);
        this._eventAggregator.publish('restart');
    }

    erase() {
        this._eventAggregator.publish('erase');
    }

    undo() {
        this._eventAggregator.publish('undo');
    }

    setGrid() {
        if (!this.repetitionsYvisible) {
            this.mySettings.draw.repetitions[1] = this.mySettings.draw.repetitions[0];
        }
        this._mySettingsService.saveSettings(this.mySettings);
        this._eventAggregator.publish('restart');
    }

    setRotation() {
        this._mySettingsService.saveSettings(this.mySettings);
        this._eventAggregator.publish('restart');
    }

    setLineLength() {
        this._mySettingsService.saveSettings(this.mySettings);
        this._eventAggregator.publish('restart');
    }

    setLineColor() {
        this._mySettingsService.saveSettings(this.mySettings);
        this._eventAggregator.publish('lineColor', this.mySettings.draw.lineColor);
    }

    setLineWidth() {
        this._mySettingsService.saveSettings(this.mySettings);
        this._eventAggregator.publish('lineWidth', this.mySettings.draw.lineWidth);
    }

}
