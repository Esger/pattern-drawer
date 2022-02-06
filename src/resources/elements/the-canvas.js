import { bindable, inject } from 'aurelia-framework';
import { paper } from 'paper';
@inject(paper)
export class TheCanvas {
    @bindable value;
    constructor(paper) {
        this._paper = paper;
        // this._element = element;
    }

    attached() {
        this._paper = paper;
        const canvas = document.getElementById('patternCanvas');
        this._paper.setup(canvas);
        this._demo();
        this._chain();
        console.log(this._paper);
    }

    _demo() {
        // Create a Paper.js Path to draw a line into it:
        const path = new this._paper.Path();
        // Give the stroke a color
        path.strokeColor = 'black';
        const start = new this._paper.Point(100, 100);
        // Move to start and draw a line from there
        path.moveTo(start);
        // Note that the plus operator on Point objects does not work
        // in JavaScript. Instead, we need to call the add() function:
        path.lineTo(start.add([200, -50]));
        // Draw the view now:
        this._paper.view.draw();
    }

    _chain() {
        // Adapted from the following Processing example:
        // http://processing.org/learning/topics/follow3.html

        // The amount of points in the path:
        const points = 25;

        // The distance between the points:
        const length = 35;

        this._path = new this._paper.Path({
            strokeColor: '#e4141b',
            strokeWidth: 20,
            strokeCap: 'round'
        });

        var start = this._paper.view.center / [10, 1];
        for (var i = 0; i < points; i++)
            this._path.add(start + new this._paper.Point(i * length, 0));
    }

    onMouseMove(event) {
        this._path.firstSegment.point = event.point;
        for (var i = 0; i < this._path.points - 1; i++) {
            var segment = this._path.segments[i];
            var nextSegment = segment.next;
            var vector = segment.point - nextSegment.point;
            vector.length = length;
            nextSegment.point = segment.point - vector;
        }
        this._path.smooth({ type: 'continuous' });
    }

    onMouseDown(event) {
        this._path.fullySelected = true;
        this._path.strokeColor = '#e08285';
    }

    onMouseUp(event) {
        this._path.fullySelected = false;
        this._path.strokeColor = '#e4141b';
    }

    valueChanged(newValue, oldValue) {
        //
    }
}
