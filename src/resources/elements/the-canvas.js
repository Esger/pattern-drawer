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
        paper.install(window);
    }

    attached() {
        this._isMobile = sessionStorage.getItem('isMobile') == 'true';
        this._initCanvas();
        this._wormService.worm();
        this._drawSubscription = this._eventAggregator.subscribe('draw', _ => this._draw());
        this._wormSubscription = this._eventAggregator.subscribe('worm', _ => this._worm());
        this._eraseSubscription = this._eventAggregator.subscribe('erase', _ => this._erase());
        this._distanceSubscription = this._eventAggregator.subscribe('repetitions', repetitions => {
            switch (this._mode) {
                case 'worm':
                    this._wormService.setRepetitions(repetitions);
                    break;
                case 'draw':
                    this._duplicateDraw(data.direction)
                    break;
            }
        });
        this._orientatation = Math.max(window.innerWidth / window.innerHeight) > 1 ? 'horizontal' : 'vertical';
    }

    detached() {
        this._drawSubscription.dispose();
        this._wormSubscription.dispose();
        this._eraseSubscription.dispose();
        this._distanceSubscription.dispose();
        this._lineColorSubscription.dispose();
    }

    _initCanvas() {
        const canvas = document.getElementById('patternCanvas');
        paper.setup(canvas);
        // console.log(paper);
    }
}
