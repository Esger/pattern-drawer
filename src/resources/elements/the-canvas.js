import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { paper } from 'paper';

@inject(EventAggregator, paper)
export class TheCanvas {
    @bindable value;
    constructor() {

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
    }

    attached() {
        this.drawSubscription = this._eventAggregator.subscribe('draw', _ => this.draw());
        this.wormSubscription = this._eventAggregator.subscribe('worm', _ => this.worm());
    detached() {
        this.drawSubscription.dispose();
        this.wormSubscription.dispose();
    }
        const canvas = document.getElementById('patternCanvas');
        paper.setup(canvas);
        this._chain();
        console.log(paper);
    }

    draw() {
        paper.project.activeLayer.removeChildren();

        this.onMouseMove = (event) => {
            if (this._isDrawing) {
                this._path.add(new paper.Point(event.offsetX, event.offsetY));
                this._path.smooth({ type: 'continuous' });
            }
        }

        this.onMouseDown = (event) => {
            if (!this._isDrawing) {
                this._path = new paper.Path({
                    strokeColor: 'crimson',
                    strokeWidth: 20,
                    strokeCap: 'round'
                });
                this._path.fullySelected = true;
                this._path.firstSegment.point = [event.offsetX, event.offsetY];
            }
        }

        this.onMouseUp = (event) => {
            this._path.fullySelected = false;
            this._isDrawing = !this._isDrawing;
            console.log(paper);
        }
    }

    _chain() {
        paper.project.activeLayer.removeChildren();

        // Adapted from the following Processing example:
        // http://processing.org/learning/topics/follow3.html

        // The amount of points in the path:
        const points = 25;

        // The distance between the points:
        this.segmentLength = 35;

        this._path = new paper.Path({
            strokeColor: 'crimson',
            strokeWidth: 20,
            strokeCap: 'round'
        });

        var start = paper.view.center.divide([10, 1]);
        for (var i = 0; i < points; i++)
            this._path.add(start + new paper.Point(i * this.segmentLength, 0));

        this.onMouseMove = (event) => {
            this._path.firstSegment.point = [event.offsetX, event.offsetY];
            for (var i = 0; i < this._path.segments.length - 1; i++) {
                var segment = this._path.segments[i];
                var nextSegment = segment.next;
                var vector = segment.point.subtract(nextSegment.point);
                vector.length = this.segmentLength;
                nextSegment.point = segment.point.subtract(vector);
            }
            this._path.smooth({ type: 'continuous' });
        }

        this.onMouseDown = (event) => {
            this._path.fullySelected = true;
            this._path.strokeColor = '#e08285';
        }

        this.onMouseUp = (event) => {
            this._path.fullySelected = false;
            this._path.strokeColor = '#e4141b';
        }
    }

    _demo() {
        // Create a Paper.js Path to draw a line into it:
        const path = new paper.Path();
        // Give the stroke a color
        path.strokeColor = 'black';
        const start = new paper.Point(100, 100);
        // Move to start and draw a line from there
        path.moveTo(start);
        // Note that the plus operator on Point objects does not work
        // in JavaScript. Instead, we need to call the add() function:
        path.lineTo(start.add([200, -50]));
        // Draw the view now:
        paper.view.draw();
    }

}
