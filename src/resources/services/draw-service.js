import { inject } from 'aurelia-framework';
import { AbstractDrawService } from 'services/abstract-draw-service'
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class DrawService extends AbstractDrawService {
    _drawTool;

    constructor(eventAggregator) {
        super(eventAggregator);
        this._eraseSubscription = this._eventAggregator.subscribe('erase', _ => {
            this.draw();
        });
    }

    detached() {
        this._eraseSubscription.dispose();
    }

    draw() {
        this._erase();
        this._mode = 'draw';
        this._drawTool = this._drawTool || new paper.Tool();
        this._drawTool.activate();
        const newPath = _ => new paper.Path({
            strokeColor: 'crimson',
            strokeWidth: 20,
            strokeCap: 'round'
        });
        let path;
        this._pathsGroup = new paper.Group();
        this._paths.push(this._pathsGroup);
        let penDown = false;

        this._drawTool.onMouseDown = (event) => {
            penDown = !penDown;
            if (penDown) {
                path = newPath();
                this._pathsGroup.addChild(path);
                path.add(new paper.Point(event.point));
            }
        }

        this._drawTool.onMouseMove = (event) => {
            if (penDown) {
                // path.fullySelected = true;
                path.add(new paper.Point(event.point));
            }
        }

        this._drawTool.onMouseUp = (event) => {
            path.simplify();
            // path.fullySelected = false;
            // console.log(paper);
        }
    }

    _erase() {
        this._pathsGroup && this._pathsGroup.removeChildren();
        super._erase();
    }
}
