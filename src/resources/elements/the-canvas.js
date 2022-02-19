import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { paper } from 'paper';

@inject(EventAggregator, paper)
export class TheCanvas {
    _drawTool;
    _wormTool;
    _paths = [];
    _offsets = [];
    _mode = '';
    _defaultColor = 'crimson';

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        paper.install(window);
    }

    attached() {
        this._isMobile = sessionStorage.getItem('isMobile') == 'true';
        this._initCanvas();
        this._worm();
        // this._duplicateWorms('horizontal');
        this._drawSubscription = this._eventAggregator.subscribe('draw', _ => this._draw());
        this._wormSubscription = this._eventAggregator.subscribe('worm', _ => this._worm());
        this._eraseSubscription = this._eventAggregator.subscribe('erase', _ => this._erase());
        this._duplicateSubscription = this._eventAggregator.subscribe('duplicate', data => {
            switch (this._mode) {
                case 'worm':
                    this._duplicateWorms(data.direction);
                    break;
                case 'draw':
                    this._duplicateDraw(data.direction)
                    break;
            }
        });
        this._duplicates = 0;
        this._maxDuplicates = {
            x: this._isMobile ? 5 : 4,
            y: this._isMobile ? 3 : 4,
        };
        this._orientatation = Math.max(window.innerWidth / window.innerHeight) > 1 ? 'horizontal' : 'vertical';
        const temp = this._maxDuplicates.x;
        this._maxDuplicates.x = this._maxDuplicates.y;
        this._maxDuplicates.y = temp;
        this._autoDuplicate();
    }

    detached() {
        this._drawSubscription.dispose();
        this._wormSubscription.dispose();
        this._eraseSubscription.dispose();
        this._duplicateSubscription.dispose();
    }

    _autoDuplicate() {
        for (let i = 0; i < this._maxDuplicates.y; i++) {
            setTimeout(_ => {
                this._duplicateWorms('vertical');
            }, i * 100);
        }
        for (let i = 0; i < this._maxDuplicates.x; i++) {
            setTimeout(() => {
                this._duplicateWorms('horizontal');
            }, i * 100 + 50);
        }
    }

    _initCanvas() {
        const canvas = document.getElementById('patternCanvas');
        paper.setup(canvas);
        // console.log(paper);
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
                    strokeWidth: this._isMobile ? 10 : 15,
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
                this._offsets.push([new paper.Point(0, 0)]);
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

    _erase() {
        paper.project.activeLayer.removeChildren();
        this._paths = [];
        this._xOffsets = [];
        this._yOffsets = [];
    }

    _addOffset(direction) {
        const offsets = [
            [0],
            [0],
            [-1 / 4, 1 / 4],
            [-1 / 4, 0, 1 / 4],
            [-1 / 2, -1 / 6, 1 / 6, 1 / 2],
            [-1 / 2, -1 / 4, 0, 1 / 4, 1 / 2],
            [-5 / 8, - 3 / 8, -1 / 8, 1 / 8, 3 / 8, 5 / 8],
            [-6 / 9, - 4 / 9, -2 / 9, 0, 2 / 9, 4 / 9, 6 / 9],
            [-7 / 11, - 5 / 11, -3 / 11, -1 / 11, 1 / 11, 3 / 11, 5 / 11, 7 / 11],
        ];
        const maxCopies = offsets[offsets.length - 1].length;
        const oldCountX = this._offsets[0].length;
        const oldCountY = this._offsets.length;
        const increaseX = direction == 'horizontal' ? 1 : 0;
        const increaseY = direction == 'vertical' ? 1 : 0;
        const countX = Math.min(maxCopies, oldCountX + increaseX);
        const countY = Math.min(maxCopies, oldCountY + increaseY);
        const maxX = paper.view.size.width;
        const maxY = paper.view.size.height;
        const yOffsets = [];
        for (let y = 0; y < countY; y++) {
            const xOffsets = [];
            for (let x = 0; x < countX; x++) {
                const newX = offsets[countX][x] * maxX;
                const newY = offsets[countY][y] * maxY;
                xOffsets.push(new paper.Point(newX, newY));
            }
            yOffsets.push(xOffsets);
        }
        this._offsets = yOffsets;
    }

    _duplicateWorms(direction) {
        if (this._paths.length) {
            this._addOffset(direction);
            const offsetsFlat = this._offsets.flat(1);
            offsetsFlat.forEach((offset, index) => {
                if (index < this._paths.length) {
                    this._paths[index].position = offset;
                } else {
                    const clonePath = this._paths[0].clone();
                    clonePath.position = offset;
                    this._paths.push(clonePath);
                }
            });
        }
    }

    _duplicateDraw() { }

}
