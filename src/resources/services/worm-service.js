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
            this._paths.forEach(path => path.strokeWidth = width);
        });
    }

    detached() {
        this._lineColorSubscription.dispose();
        this._lineWidthSubscription.dispose();
    }

    worm(wormSettings) {
        this._erase();
        this._distance = new paper.Point([0, 0]);

        const center = new paper.Point(paper.view.size.width, paper.view.size.height).divide(2);

        // The amount of points in the path:
        const points = this.isMobile ? 15 : 25;
        // The distance between the points:
        const segmentLength = wormSettings.lineLength;

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
                for (var i = 0; i < points; i++)
                    path.add(new paper.Point(i * segmentLength, 0));
                path.name = 'original';
                this._paths.push(path);
            }
        }

        addWormPath();

        this._wormTool = this._wormTool || new paper.Tool();
        this._wormTool.activate();
        let restarted = true;
        this._wormTool.onMouseMove = (event) => {
            let delta = restarted ? event.lastPoint.subtract(center) : event.delta;
            restarted = false;

            const offsetsFlat = this._grid.flat(1);
            offsetsFlat.forEach((offset, index) => {
                let newPoint = new paper.Point(offset.distance);
                const circular = offset.rotation > 0;

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
