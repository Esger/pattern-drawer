import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { WormService } from 'services/worm-service';
import { DrawService } from 'services/draw-service';
import { MySettingsService } from 'services/my-settings-service';
import { paper } from 'paper';

@inject(EventAggregator, WormService, DrawService, MySettingsService, paper)
export class TheCanvas {

    constructor(eventAggregator, wormService, drawService, mySettingsService) {
        this._eventAggregator = eventAggregator;
        this._wormService = wormService;
        this._mySettingsService = mySettingsService;
        this._drawService = drawService;
        paper.install(window);
    }

    _restart() {
        switch (this._settings.draw.mode) {
            case 'worm':
                this._wormService.worm(this._settings.draw);
                this._wormService.setGrid(this._settings.draw);
                break;
            case 'draw':
                this._drawService.draw(this._settings.draw);
                this._drawService.setGrid(this._settings.draw);
                break;
        }
    }

    attached() {
        this._isMobile = sessionStorage.getItem('isMobile') == 'true';
        this._settings = this._mySettingsService.loadSettings();
        this._initCanvas();
        this._drawSubscription = this._eventAggregator.subscribe('draw', _ => {
            this._settings.draw.mode = 'draw';
            this._drawService.draw(this._settings.draw);
            this._drawService.setGrid(this._settings.draw);
            this._mySettingsService.saveSettings(this._settings);
        });
        this._wormSubscription = this._eventAggregator.subscribe('worm', _ => {
            this._settings.draw.mode = 'worm';
            this._wormService.worm(this._settings.draw);
            this._wormService.setGrid(this._settings.draw);
            this._mySettingsService.saveSettings(this._settings);
        });
        this._distanceSubscription = this._eventAggregator.subscribe('repetitions', repetitions => {
            this._settings.draw.repetitions = repetitions;
            this._mySettingsService.saveSettings(this._settings);
            this._restart();
        });
        this._rotationSubscription = this._eventAggregator.subscribe('rotation', rotation => {
            this._settings.draw.rotation = rotation;
            this._mySettingsService.saveSettings(this._settings);
            this._restart();
        });
        this._lineColorSubscription = this._eventAggregator.subscribe('lineColor', color => {
            this._settings.draw.lineColor = color;
            this._mySettingsService.saveSettings(this._settings);
        });
        this._lineWidthSubscription = this._eventAggregator.subscribe('lineWidth', width => {
            this._settings.draw.lineWidth = width;
            this._mySettingsService.saveSettings(this._settings);
        });
        this._lineWidthSubscription = this._eventAggregator.subscribe('lineLength', length => {
            this._settings.draw.lineLength = length;
            this._mySettingsService.saveSettings(this._settings);
            this._restart();
        });
        this._eventAggregator.publish(this._settings.draw.mode);
    }

    detached() {
        this._drawSubscription.dispose();
        this._wormSubscription.dispose();
        this._distanceSubscription.dispose();
        this._rotationSubscription.dispose();
        this._lineColorSubscription.dispose();
        this._lineWidthSubscription.dispose();
    }

    _initCanvas() {
        const canvas = document.getElementById('patternCanvas');
        paper.setup(canvas);
    }
}
