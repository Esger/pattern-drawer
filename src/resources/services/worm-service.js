import { AbstractDrawService } from 'services/abstract-draw-service';
export class WormService extends AbstractDrawService {
    _wormTool;

    worm() {
        this._erase();
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
        super.setRepetitions(repetitions);
        // position paths
        const offsetsFlat = this._offsets.flat(1);
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
