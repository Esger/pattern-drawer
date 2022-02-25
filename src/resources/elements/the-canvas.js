import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { WormService } from 'services/worm-service';
import { DrawService } from 'services/draw-service';
import { paper } from 'paper';

@inject(EventAggregator, WormService, DrawService, paper)
export class TheCanvas {
    _mode = 'worm';

    constructor(eventAggregator, wormService, drawService) {
        this._eventAggregator = eventAggregator;
        this._wormService = wormService;
        this._drawService = drawService;
        this._repetitions = [1, 1];
        paper.install(window);
    }

    attached() {
        this._isMobile = sessionStorage.getItem('isMobile') == 'true';
        this._initCanvas();
        this._wormService.worm();
        this._drawSubscription = this._eventAggregator.subscribe('draw', _ => {
            this._mode = 'draw';
            this._drawService.draw();
            this._drawService.setRepetitions(this._repetitions);
        });
        this._wormSubscription = this._eventAggregator.subscribe('worm', _ => {
            this._mode = 'worm';
            this._wormService.worm();
            this._wormService.setRepetitions(this._repetitions);
        });
        this._distanceSubscription = this._eventAggregator.subscribe('repetitions', repetitions => {
            this._repetitions = repetitions;
            switch (this._mode) {
                case 'worm':
                    this._wormService.setRepetitions(repetitions);
                    break;
                case 'draw':
                    this._drawService.setRepetitions(repetitions);
                    break;
            }
        });
        this._orientatation = Math.max(window.innerWidth / window.innerHeight) > 1 ? 'horizontal' : 'vertical';
    }

    detached() {
        this._drawSubscription.dispose();
        this._wormSubscription.dispose();
        this._distanceSubscription.dispose();
        this._lineColorSubscription.dispose();
    }

    _initCanvas() {
        const canvas = document.getElementById('patternCanvas');
        paper.setup(canvas);
        // console.log(paper);
    }
}
