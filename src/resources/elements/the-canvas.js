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
        // this.draw();
        this.drawSubscription = this._eventAggregator.subscribe('draw', _ => this.draw());
        this.wormSubscription = this._eventAggregator.subscribe('worm', _ => this.worm());
    }

    detached() {
        this._killCanvas();
        this.drawSubscription.dispose();
        this.wormSubscription.dispose();
    }

    _initCanvas() {
        const canvas = document.getElementById('patternCanvas');
        paper.setup(canvas);
        console.log(paper);
    }

    draw() {
        this._drawTool = this._drawTool || new paper.Tool();
        this._drawTool.activate();
        let path;
        const newPath = _ => new paper.Path({
            strokeColor: 'crimson',
            strokeWidth: 20,
            strokeCap: 'round'
        });

        this._drawTool.onMouseDown = (event) => {
            path = newPath();
            path.fullySelected = true;
            path.add(new paper.Point(event.point));
        }

        this._drawTool.onMouseMove = (event) => {
            path.add(new paper.Point(event.point));
            path.smooth({ type: 'continuous' });
        }

        this._drawTool.onMouseUp = (event) => {
            path.fullySelected = false;
            this.isDrawing = !this.isDrawing;
            console.log(paper);
        }
    }

    worm() {
        // Adapted from the following Processing example:
        // http://processing.org/learning/topics/follow3.html

        // The amount of points in the path:
        const points = 25;

        // The distance between the points:
        const segmentLength = 35;

        const path = new paper.Path({
            strokeColor: 'crimson',
            strokeWidth: 20,
            strokeCap: 'round'
        });

        this._wormTool = this._wormTool || new paper.Tool();
        this._wormTool.activate();

        var start = paper.view.center.divide([10, 1]);
        for (var i = 0; i < points; i++)
            path.add(start + new paper.Point(i * segmentLength, 0));

        this._wormTool.onMouseMove = (event) => {
            path.firstSegment.point = event.point;
            for (let i = 0; i < path.segments.length - 1; i++) {
                const segment = path.segments[i];
                const nextSegment = segment.next;
                const vector = segment.point.subtract(nextSegment.point);
                vector.length = segmentLength;
                nextSegment.point = segment.point.subtract(vector);
            }
            path.smooth({ type: 'continuous' });
        }

        this._wormTool.onMouseDown = (event) => {
            path.fullySelected = true;
            path.strokeColor = '#e08285';
        }

        this._wormTool.onMouseUp = (event) => {
            path.fullySelected = false;
            path.strokeColor = '#e4141b';
        }
    }

}
