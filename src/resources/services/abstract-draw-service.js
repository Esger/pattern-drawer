import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class AbstractDrawService {
    _paths = [];
    _offsets = [];

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this._isMobile = sessionStorage.getItem('isMobile') == 'true';
    }

    _erase() {
        paper.project.activeLayer.removeChildren();
        this._paths = [];
    }

    _deg2radians(deg) {
        return deg * (Math.PI / 180);
    }

    setRepetitions(settings) {
        const rotation = parseInt(settings.rotation, 10) || 0;
        // two extra repetitions for 0 and max
        const extraRepetitions = new paper.Point(settings.repetitions || [1, 1]).add(2); // Left, Right, Top, Bottom
        const spaces = extraRepetitions.subtract(1);
        const canvasWidth = new paper.Point(paper.view.size);
        const relativeSize = new paper.Point([1, 1]).divide(spaces);
        const yOffsets = [];
        const getXoffsets = y => {
            const xOffsets = [];
            for (let x = 0; x < extraRepetitions.x; x++) {
                let point = relativeSize.clone();
                point = point.multiply([x, y]);
                // point = point.subtract(1 / 2);
                point = point.multiply(canvasWidth);
                xOffsets.push(point);
            }
            return xOffsets;
        }
        const getRotations = yBase => {
            const rotations = [];
            for (let angle = 0; angle < 360; angle += rotation) {
                const angleRad = this._deg2radians(angle);
                let point = relativeSize.clone();
                const x = yBase * Math.cos(angleRad);
                const y = yBase * Math.sin(angleRad);
                point = point.multiply([x, y]);
                point = point.multiply(canvasWidth);
                point.rotation = angle;
                point.distance = [0, 0];
                rotations.push(point);
            }
            return rotations;
        }

        // calculate offsets array
        for (let y = 0; y < extraRepetitions.y; y++) {
            let xOffsets;
            if (rotation > 0) {
                xOffsets = getRotations(y);
            } else {
                xOffsets = getXoffsets(y);
            }
            yOffsets.push(xOffsets);
        }

        this._offsets = yOffsets;
    }
}
