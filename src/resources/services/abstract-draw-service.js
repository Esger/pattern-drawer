import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class AbstractDrawService {
    _paths = [];
    _offsets = [];
    _defaultColor = 'crimson';
    _minStrokeWidth = 1;

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this._isMobile = sessionStorage.getItem('isMobile') == 'true';
        this._baseLineWidth = this.isMobile ? 15 : 20;
        this._lineColorSubscription = this._eventAggregator.subscribe('lineColor', color => {
            this._defaultColor = color;
            this._paths.forEach(path => path.strokeColor = color);
        });
        this._eraseSubscription = this._eventAggregator.subscribe('erase', _ => this._erase());
    }

    detached() {
        this._lineColorSubscription.dispose();
        this._eraseSubscription.dispose();
    }

    _erase() {
        paper.project.activeLayer.removeChildren();
        this._paths = [];
        this._xOffsets = [];
        this._yOffsets = [];
    }

    setRepetitions(repetitions) {
        // two extra repetitions for 0 and max
        const extraRepetitions = new paper.Point(repetitions).add(2);
        const spaces = extraRepetitions.subtract(1);
        const canvasWidth = new paper.Point(paper.view.size);
        const offsetSize = canvasWidth.divide(spaces);
        const relativeSize = new paper.Point([1, 1]).divide(spaces);
        const yOffsets = [];

        // calculate offsets array
        for (let y = 0; y < extraRepetitions.y; y++) {
            const xOffsets = [];
            for (let x = 0; x < extraRepetitions.x; x++) {
                let point = relativeSize.clone();
                point = point.multiply([x, y])
                point = point.subtract(1 / 2);
                point = point.multiply(canvasWidth);
                xOffsets.push(point);
            }
            yOffsets.push(xOffsets);
        }

        // position paths
        const offsetsFlat = yOffsets.flat(1);
        offsetsFlat.forEach((offset, index) => {
            if (index < this._paths.length) {
                this._paths[index].position = offset;
            } else {
                const clonePath = this._paths[0].clone();
                clonePath.position = offset;
                this._paths.push(clonePath);
            }
        });

        // remove extraneous paths
        while (this._paths.length > offsetsFlat.length) {
            const lastPath = this._paths.pop();
            lastPath.remove();
        }

        // adjust path widths
        const newStrokeWidth = Math.max(this._baseLineWidth - this._paths.flat().length / 2, this._minStrokeWidth);
        this._paths.forEach(path => path.strokeWidth = newStrokeWidth);

        this._offsets = yOffsets;

        console.table(yOffsets);
    }
}
