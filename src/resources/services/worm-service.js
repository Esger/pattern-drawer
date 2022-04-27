import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { AbstractDrawService } from 'services/abstract-draw-service'
@inject(EventAggregator)
export class WormService extends AbstractDrawService {
    _wormTool;

    constructor(eventAggregator) {
        super(eventAggregator);
        this._lineColorSubscription = this._eventAggregator.subscribe('lineColor', color => {
            this._paths.forEach(path => path.strokeColor = color);
        });
        this._lineWidthSubscription = this._eventAggregator.subscribe('lineWidth', width => {
            this._paths.forEach(path => path.strokeWidth = width)
        });
    }

    detached() {
        this._lineColorSubscription.dispose();
        this._lineWidthSubscription.dispose();
    }

    worm(wormSettings) {
        this._erase();
        this._distance = new paper.Point([0, 0]);
        this._previousPoint = wormSettings.rotation == '0' ?
            new paper.Point([0, 0]) :
            new paper.Point(paper.view.size.width / 2, paper.view.size.height / 2);

        const patternWidth = paper.view.size.width / (wormSettings.repetitions[0] + 1);
        // The amount of points in the path:
        const points = this.isMobile ? 15 : 25;
        // The distance between the points:
        const segmentLength = (patternWidth / points) * wormSettings.lineLength;

        let path;

        const addWormPath = () => {
            if (!path) {
                path = new paper.Path({
                    strokeColor: wormSettings.lineColor,
                    strokeWidth: wormSettings.lineWidth,
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

        addWormPath();

        this._wormTool = this._wormTool || new paper.Tool();
        this._wormTool.activate();

        this._wormTool.onMouseMove = (event) => {
            let delta = event.point.subtract(this._previousPoint);

            const offsetsFlat = this._grid.flat(1);
            offsetsFlat.forEach((offset, index) => {
                let newPoint = new paper.Point(offset.distance);
                const circular = offset.rotation !== undefined;

                if (circular) {
                    const rotatedDelta = delta.rotate(offset.rotation, 0, 0);
                    newPoint = newPoint.add(rotatedDelta);
                } else {
                    newPoint = newPoint.add(delta);
                }

                offset.distance = [newPoint.x, newPoint.y];

                const path = this._paths[index];
                path.firstSegment.point = offset.add(offset.distance);
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
    }

    setGrid(settings) {
        super.setGrid(settings);

        // position paths
        const offsetsFlat = this._grid.flat(1);
        offsetsFlat.forEach((offset, index) => {
            if (index < this._paths.length) {
                this._paths[index].position = offset;
            } else {
                // Er zijn nog geen paden bij drawService
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
    }
}
