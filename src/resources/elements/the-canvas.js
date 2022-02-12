import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { paper } from 'paper';

@inject(EventAggregator, paper)
export class TheCanvas {
    _drawTool;
    _wormTool;
    _paths = [];
    _offsets = [];
    _toroid = {
        horizontal: false, vertical: false
    }

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        paper.install(window);
    }

    attached() {
        this._initCanvas();
        this.worm();
        this._drawSubscription = this._eventAggregator.subscribe('draw', _ => this.draw());
        this._wormSubscription = this._eventAggregator.subscribe('worm', _ => this.worm());
        this._eraseSubscription = this._eventAggregator.subscribe('erase', _ => this.erase());
        this._duplicateSubscription = this._eventAggregator.subscribe('duplicate', data => this.duplicate(data.direction));
    }

    detached() {
        this._drawSubscription.dispose();
        this._wormSubscription.dispose();
        this._eraseSubscription.dispose();
        this._duplicateSubscription.dispose();
    }

    _initCanvas() {
        const canvas = document.getElementById('patternCanvas');
        paper.setup(canvas);
        console.log(paper);
    }

    draw() {
        this._drawTool = this._drawTool || new paper.Tool();
        this._drawTool.activate();
        const newPath = _ => new paper.Path({
            strokeColor: 'crimson',
            strokeWidth: 20,
            strokeCap: 'round'
        });
        let path;
        let penDown = false;

        this._drawTool.onMouseDown = (event) => {
            penDown = !penDown;
            if (penDown) {
                path = newPath();
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

    worm() {
        // Adapted from the following Processing example:
        // http://processing.org/learning/topics/follow3.html


        // The distance between the points:
        const segmentLength = 35;

        let path;

        const addWormPath = () => {
            // The amount of points in the path:
            const points = 25;
            if (!path) {
                path = new paper.Path({
                    strokeColor: 'crimson',
                    strokeWidth: 20,
                    strokeCap: 'round'
                });
                var start = paper.view.center.divide([10, 1]);
                for (var i = 0; i < points; i++)
                    path.add(start + new paper.Point(i * segmentLength, 0));
                this._paths.push(path);
                this._offsets.push(new paper.Point(0, 0));
            }
        }

        addWormPath();

        this._wormTool = this._wormTool || new paper.Tool();
        this._wormTool.activate();
        this._wormTool.onMouseMove = (event) => {
            this._paths.forEach((path, index) => {
                path.firstSegment.point = event.point.add(this._offsets[index]);
                for (let i = 0; i < path.segments.length - 1; i++) {
                    const segment = path.segments[i];
                    const nextSegment = segment.next;
                    const vector = segment.point.subtract(nextSegment.point);
                    vector.length = segmentLength;
                    nextSegment.point = segment.point.subtract(vector);
                }
                path.smooth({ type: 'continuous' });
            })
        }

        this._wormTool.onMouseDown = _ => {
            if (this._paths.length) {
                this._paths.forEach(path => {
                    path.fullySelected = true;
                    path.strokeColor = '#e08285';
                })
            } else {
                addWormPath();
            }
        }

        this._wormTool.onMouseUp = _ => {
            if (this._paths.length) {
                this._paths.forEach(path => {
                    path.fullySelected = false;
                    path.strokeColor = '#e4141b';
                })
            }
        }
    }

    erase() {
        paper.project.activeLayer.removeChildren();
        this._paths = [];
    }

    duplicate(direction) {
        const clonePath = this._paths[0].clone();
        if (direction == 'horizontal') {
            const offset = new paper.Point(Math.round(paper.view.viewSize.width / 2), 0);
            clonePath.position = offset;
            this._offsets.push(offset);
            if (!this._toroid.horizontal) {
                const clonePath = this._paths[0].clone();
                const offset = new paper.Point(- Math.round(paper.view.viewSize.width / 2), 0);
                clonePath.position = offset;
                this._offsets.push(offset);
                this._paths.push(clonePath);
                this._toroid.horizontal = true;
            }
        }
        this._paths.push(clonePath);
        console.log(paper, paper.view.viewSize.width);
    }

}
