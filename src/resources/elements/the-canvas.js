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
        this._mySettingsService = mySettingsService;
        this._wormService = wormService;
        this._drawService = drawService;
        paper.install(window);
        this._getSettings();
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
        this._initCanvas();
        this._restartSubscription = this._eventAggregator.subscribe('restart', _ => {
            this._getSettings();
            this._restart();
        });
        this._lineColorSubscription = this._eventAggregator.subscribe('lineColor', color => {
            this._getSettings();
        });
        this._lineWidthSubscription = this._eventAggregator.subscribe('lineWidth', width => {
            this._getSettings();
        });
    }

    detached() {
        this._restartSubscription.dispose();
        this._lineColorSubscription.dispose();
        this._lineWidthSubscription.dispose();
    }

    _getSettings() {
        this._settings = this._mySettingsService.getSettings();
    }

    _initCanvas() {
        const canvas = document.getElementById('patternCanvas');
        paper.setup(canvas);
    }
}
