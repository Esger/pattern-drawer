import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { paper } from 'paper';

@inject(EventAggregator, paper)
export class TheCanvas {
    _drawTool;
    _wormTool;
    _paths = [];
    _xOffsets = [];
    _yOffsets = [];
    _mode = '';

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        paper.install(window);
    }

    attached() {
        this._initCanvas();
        this._worm();
        this._drawSubscription = this._eventAggregator.subscribe('draw', _ => this._draw());
        this._wormSubscription = this._eventAggregator.subscribe('worm', _ => this._worm());
        this._eraseSubscription = this._eventAggregator.subscribe('erase', _ => this._erase());
        this._duplicateSubscription = this._eventAggregator.subscribe('duplicate', data => {
            switch (this._mode) {
                case 'worm':
                    this._duplicateWorm(data.direction);
                    break;
                case 'draw':
                    this._duplicateDraw(data.direction)
                    break;
            }
        });
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

    _draw() {
        this._erase();
        this._mode = 'draw';
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

    _worm() {
        this._erase();
        this._mode = 'worm';
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
                path.name = 'original';
                this._paths.push(path);
                const offset = new paper.Point(0, 0);
                this._xOffsets.push(offset);
                this._yOffsets.push(offset);
            }
        }

        addWormPath();

        this._wormTool = this._wormTool || new paper.Tool();
        this._wormTool.activate();
        this._wormTool.onMouseMove = (event) => {
            this._paths.forEach((path, index) => {
                path.firstSegment.point = event.point.add(this._xOffsets[index]);
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

    _erase() {
        paper.project.activeLayer.removeChildren();
        this._paths = [];
        this._xOffsets = [];
    }

    _addXoffset() {
        this._xOffsets.push(new Point(0, 0));
        const count = this._xOffsets.length;
        const gap = Math.round(paper.view.size.width / count);
        const firstX = gap / 2;
        const offsets = this._xOffsets.map((point, index) => {
            const x = (index - (count / 2)) * gap + firstX;
            point.x = x;
            return point;
        });
        this._xOffsets = offsets;
    }

    _duplicateWorm(direction) {
        if (this._paths.length) {
            if (direction == 'horizontal') {
                this._addXoffset();
                this._yOffsets.forEach((offset, index) => {
                    const clonePath = this._paths[0].clone();
                    // clonePath.name = 'xCopy';
                    // const tempOffset = new Point(offset.x, this._paths[0].position.y);
                    clonePath.position = offset;
                    this._paths.push(clonePath);
                });
            }
            if (direction == 'vertical') {

            }
            const group = new paper.Group({
                children: this._paths,
                position: paper.view.center
            });
        }
        console.log(paper, paper.view.viewSize.width);
    }

}
