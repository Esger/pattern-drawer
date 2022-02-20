import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class WormService {
    _wormTool;
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
    }

    detached() {
        this._lineColorSubscription.dispose();
    }

    _erase() {
        paper.project.activeLayer.removeChildren();
        this._paths = [];
        this._xOffsets = [];
        this._yOffsets = [];
    }

    worm() {
        this._erase();
        this._mode = 'worm';
        this._distance = new Point([0, 0]);
        this._previousPoint = new Point([0, 0]);
        // The distance between the points:
        const segmentLength = this._isMobile ? 20 : 35;

        let path;

        const addWormPath = () => {
            // The amount of points in the path:
            const points = this.isMobile ? 15 : 25;
            if (!path) {
                path = new paper.Path({
                    strokeColor: this._defaultColor,
                    strokeWidth: this._baseLineWidth,
                    strokeCap: 'round',
                    // shadowColor: '#00ff00cc',
                    // shadowBlur: 10,
                    // opacity: .71,
                    // shadowBlur: 20,
                    // set a fill color to make sure that the shadow is displayed
                    // fillColor: 'white',
                    // use blendmode to hide the fill and only see the shadow
                    // blendMode: 'multiply',
                });
                var start = paper.view.center.divide([11, 1]);
                for (var i = 0; i < points; i++)
                    path.add(start + new paper.Point(i * segmentLength, 0));
                path.name = 'original';
                this._paths.push(path);
            }
        }

        const toggleActivation = (selected) => {
            this._paths.forEach(path => {
                path.fullySelected = selected;
                path.opacity = selected ? 0.5 : 0.9;
            });
        }

        addWormPath();

        this._wormTool = this._wormTool || new paper.Tool();
        this._wormTool.activate();

        this._wormTool.onMouseMove = (event) => {
            const delta = event.point.subtract(this._previousPoint);
            this._distance = this._distance.add(delta);

            const offsetsFlat = this._offsets.flat(1);
            offsetsFlat.forEach((offset, index) => {
                const path = this._paths[index];
                path.firstSegment.point = offset.add(this._distance);
                for (let i = 0; i < path.segments.length - 1; i++) {
                    const segment = path.segments[i];
                    const nextSegment = segment.next;
                    const vector = segment.point.subtract(nextSegment.point);
                    vector.length = segmentLength;
                    nextSegment.point = segment.point.subtract(vector);
                }
                path.smooth({ type: 'continuous' });
            });

            this._previousPoint = event.point;
        }

        this._wormTool.onMouseDown = (event) => {
            if (this._isMobile) {
                // create trackpad like experience.
                this._previousPoint = event.point;
            } else {
                if (this._paths.length) {
                    toggleActivation(true);
                }
            }
        }

        this._wormTool.onMouseUp = (event) => {
            if (!this._isMobile && this._paths.length) {
                toggleActivation(false);
            }
        }
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
