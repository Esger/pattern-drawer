import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { WormService } from 'services/worm-service';
import { DrawService } from 'services/draw-service';
import { paper } from 'paper';

@inject(EventAggregator, WormService, DrawService, paper)
export class TheCanvas {
    _settings = {};

    constructor(eventAggregator, wormService, drawService) {
        this._eventAggregator = eventAggregator;
        this._wormService = wormService;
        this._drawService = drawService;
        paper.install(window);
    }

    _restart() {
        switch (this._settings.mode) {
            case 'worm':
                this._wormService.worm(this._settings);
                this._wormService.setRepetitions(this._settings.repetitions);
                break;
            case 'draw':
                this._drawService.draw(this._settings);
                this._drawService.setRepetitions(this._settings.repetitions);
                break;
        }
    }

    attached() {
        this._isMobile = sessionStorage.getItem('isMobile') == 'true';
        this._loadSettings();
        this._initCanvas();
        this._drawSubscription = this._eventAggregator.subscribe('draw', _ => {
            this._settings.mode = 'draw';
            this._drawService.draw(this._settings);
            this._drawService.setRepetitions(this._settings.repetitions);
            this._saveSettings();
        });
        this._wormSubscription = this._eventAggregator.subscribe('worm', _ => {
            this._settings.mode = 'worm';
            this._wormService.worm(this._settings);
            this._wormService.setRepetitions(this._settings.repetitions);
            this._saveSettings();
        });
        this._distanceSubscription = this._eventAggregator.subscribe('repetitions', repetitions => {
            this._settings.repetitions = repetitions;
            this._saveSettings();
            this._restart();
        });
        this._lineColorSubscription = this._eventAggregator.subscribe('lineColor', color => {
            this._settings.lineColor = color;
            this._saveSettings();
        });
        this._lineWidthSubscription = this._eventAggregator.subscribe('lineWidth', width => {
            this._settings.lineWidth = width;
            this._saveSettings();
        });
        this._lineWidthSubscription = this._eventAggregator.subscribe('lineLength', length => {
            this._settings.lineLength = length;
            this._saveSettings();
            this._restart();
        });
        this._eventAggregator.publish(this._settings.mode);
    }

    detached() {
        this._drawSubscription.dispose();
        this._wormSubscription.dispose();
        this._distanceSubscription.dispose();
        this._lineColorSubscription.dispose();
        this._lineWidthSubscription.dispose();
    }

    _saveSettings() {
        localStorage.setItem('pattern-creator', JSON.stringify(this._settings));
    }

    _loadSettings() {
        const version = 'v1.2'; // increase when settings object changes
        const defaultSettings = () => {
            return {
                version: version,
                mode: 'worm',
                lineColor: '#DC143C', // 'crimson',
                lineWidth: this._isMobile ? 15 : 20,
                lineLength: 1,
                repetitions: [1, 1],
            }
        }
        const settings = JSON.parse(localStorage.getItem('pattern-creator'));
        if (settings) {
            this._settings = settings;
            if (settings.version !== version) {
                this._settings = defaultSettings();
            }
        }
        else {
            this._settings = defaultSettings();
            this._saveSettings();
        }
    }

    _initCanvas() {
        const canvas = document.getElementById('patternCanvas');
        paper.setup(canvas);
    }
}
