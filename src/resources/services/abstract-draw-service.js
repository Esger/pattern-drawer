import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class AbstractDrawService {
    _paths = [];
    _grid = [];

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

    setGrid(settings) {
        const rotation = parseInt(settings.rotation, 10) || 0;
        // two extra repetitions for 0 and max
        const extraRepetitions = new paper.Point(settings.repetitions || [1, 1]).add(2); // minimal 3 x 3 grid
        const spaces = extraRepetitions.subtract(1);
        const canvasWidth = new paper.Point(paper.view.size);
        console.log(canvasWidth);
        const relativeSize = new paper.Point([1, 1]).divide(spaces);
        const yOffsets = [];
        const getXoffsets = y => {
            const xOffsets = [];
            for (let x = 0; x < extraRepetitions.x; x++) {
                let point = relativeSize.clone();
                point = point.multiply([x, y]);
                point = point.add(-.5, 0);
                point = point.multiply(canvasWidth);
                xOffsets.push(point);
            }
            return xOffsets;
        }
        const getRotations = yBase => {
            const rotations = [];
            for (let angle = -180; angle < 180; angle += rotation) {
                const angleRad = this._deg2radians(angle);
                let point = relativeSize.clone();
                const x = yBase * Math.cos(angleRad);
                const y = yBase * Math.sin(angleRad);
                point = point.multiply([x, y]);
                point = point.add(0);
                point = point.multiply(canvasWidth);
                point.rotation = angle;
                point.distance = [canvasWidth.x / 2, canvasWidth.y / 2]; // center of rotation
                rotations.push(point);
            }
            return rotations;
        }

        // calculate offsets array
        const endY = Math.round(extraRepetitions.y / 2);
        const startY = -endY;
        console.log(startY, endY);
        for (let y = startY; y < endY; y++) {
            let offsets;
            if (rotation > 0) {
                offsets = getRotations(y);
            } else {
                offsets = getXoffsets(y);
            }
            yOffsets.push(offsets);
        }

        this._grid = yOffsets;
    }
}
