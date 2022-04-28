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
        this.settings = this._mySettingsService.getSettings();
        this.isDrawing = this.settings?.draw.mode === 'draw';
        this.repetitionsYvisible = this.settings.visibility.repetitionsY;
        this._eventAggregator.publish(this.settings.draw.mode);
    }

    detached() {
        this._drawSubscription.dispose();
        this._wormSubscription.dispose();
        this._lineColorSubscription.dispose();
        this._lineWidthSubscription.dispose();
        this._repetitionsSubscription.dispose();
    }

    toggleVisibility(item) {
        this.settings.visibility[item] = !this.settings.visibility[item];
        this.settings.draw.repetitions.forEach((value, index, repetitions) => {
            repetitions[index] = parseInt(value, 10);
        });
        this._mySettingsService.saveSettings(this.settings);
    }

    repetitionsYvisibleChanged(newValue) {
        this.settings.visibility['repetitionsY'] = newValue;
        this.setGrid();
    }

    draw() {
        this.isDrawing = true;
        this.settings.draw.mode = 'draw';
        this._mySettingsService.saveSettings(this.settings);
        this._eventAggregator.publish('restart');
    }

    worm() {
        this.isDrawing = false;
        this.settings.draw.mode = 'worm';
        this._mySettingsService.saveSettings(this.settings);
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
            this.settings.draw.repetitions[1] = this.settings.draw.repetitions[0];
        }
        this._mySettingsService.saveSettings(this.settings);
        this._eventAggregator.publish('restart');
    }

    setRotation() {
        this._mySettingsService.saveSettings(this.settings);
        this._eventAggregator.publish('restart');
    }

    setLineLength() {
        this._mySettingsService.saveSettings(this.settings);
        this._eventAggregator.publish('restart');
    }

    setLineColor() {
        this._mySettingsService.saveSettings(this.settings);
        this._eventAggregator.publish('lineColor', this.settings.draw.lineColor);
    }

    setLineWidth() {
        this._mySettingsService.saveSettings(this.settings);
        this._eventAggregator.publish('lineWidth', this.settings.draw.lineWidth);
    }

}
