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
        const rotation = parseInt(settings.rotation, 10);
        // two extra repetitions for 0 and max
        const extraRepetitions = new paper.Point(settings.repetitions).add(1); // minimal 2 x 2 grid
        const minSize = Math.min(paper.view.size.width, paper.view.size.height);
        const maxSquareCanvas = new paper.Point(minSize, minSize);
        const relativeSize = new paper.Point([1, 1]).divide(extraRepetitions);
        const yOffsets = [];
        const landscape = paper.view.size.width > paper.view.size.height;
        const centerXcorrection = landscape ? (paper.view.size.width / 2) - (paper.view.size.height / 2) : 0;
        const centerYcorrection = landscape ? 0 : (paper.view.size.height / 2) - (paper.view.size.width / 2);
        const getXoffsets = y => {
            const xOffsets = [];
            const endX = Math.round(extraRepetitions.x / 2);
            const startX = -endX;

            for (let x = startX; x <= endX; x++) {
                let point = relativeSize.clone();
                point = point.multiply([x, y]);
                point = point.add(.5);
                point = point.multiply(maxSquareCanvas);
                point = point.add(centerXcorrection, centerYcorrection);
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
                point = point.multiply(maxSquareCanvas);
                point = point.add(centerXcorrection, centerYcorrection);
                point.rotation = angle;
                point.distance = maxSquareCanvas.divide(2); // center of rotation
                rotations.push(point);
            }
            return rotations;
        }

        // build grid around [0, 0]
        const circularGrid = rotation > 0;
        const endY = Math.round(extraRepetitions.y / 2);
        const startY = -endY;
        console.log(startY, endY);
        for (let y = startY; y <= endY; y++) {
            const offsets = circularGrid ? getRotations(y) : getXoffsets(y);
            yOffsets.push(offsets);
        }

        this._grid = yOffsets;
    }
}
