import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { paper } from 'paper';

@inject(EventAggregator, paper)
export class TheCanvas {
    @bindable value;
    _drawTool;
    _wormTool;

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

        const addWormPath = () => {
            // The amount of points in the path:
            const points = 25;
            if (!this._wormPath) {
                this._wormPath = new paper.Path({
                    strokeColor: 'crimson',
                    strokeWidth: 20,
                    strokeCap: 'round'
                });
                var start = paper.view.center.divide([10, 1]);
                for (var i = 0; i < points; i++)
                    this._wormPath.add(start + new paper.Point(i * segmentLength, 0));
            }
        }

        addWormPath();

        this._wormTool = this._wormTool || new paper.Tool();
        this._wormTool.activate();
        this._wormTool.onMouseMove = (event) => {
            if (this._wormPath) {
                this._wormPath.firstSegment.point = event.point;
                for (let i = 0; i < this._wormPath.segments.length - 1; i++) {
                    const segment = this._wormPath.segments[i];
                    const nextSegment = segment.next;
                    const vector = segment.point.subtract(nextSegment.point);
                    vector.length = segmentLength;
                    nextSegment.point = segment.point.subtract(vector);
                }
                this._wormPath.smooth({ type: 'continuous' });
            }
        }

        this._wormTool.onMouseDown = (event) => {
            if (this._wormPath) {
                this._wormPath.fullySelected = true;
                this._wormPath.strokeColor = '#e08285';
            } else {
                addWormPath();
            }
        }

        this._wormTool.onMouseUp = (event) => {
            if (this._wormPath) {
                this._wormPath.fullySelected = false;
                this._wormPath.strokeColor = '#e4141b';
            }
        }
    }

    erase() {
        paper.project.activeLayer.removeChildren();
        this._wormPath = undefined;
    }

    duplicate(direction) {
        console.log(paper);
    }

}
