export class WormService {
    _wormTool;
    _paths = [];
    _offsets = [];
    _defaultColor = 'crimson';

    constructor() {
        this._isMobile = sessionStorage.getItem('isMobile') == 'true';
        this._maxDuplicates = {
            x: this._isMobile ? 3 : 4,
            y: this._isMobile ? 5 : 4,
        };
        // dit alleen doen bij orientation-change
        // const temp = this._maxDuplicates.x;
        // this._maxDuplicates.x = this._maxDuplicates.y;
        // this._maxDuplicates.y = temp;
    }

    _erase() {
        paper.project.activeLayer.removeChildren();
        this._paths = [];
        this._xOffsets = [];
        this._yOffsets = [];
    }

    worm() {
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
        const offsetSize = new paper.Point(paper.view.size.width / repetitions.x, paper.view.size.height / repetitions.y);
        const relativeSize = new paper.Point([1 / repetitions.x, 1 / repetitions.y]);
        // two extra repetitions for 0 and max
        const extraRepetitions = new paper.Point(repetitions).add(2);
        // extra offset to center even amounts of copies around cursor
        const relativeShiftX = repetitions.x % 2 == 0 ? -relativeSize.x / 2 : 0;
        const relativeShiftY = repetitions.y % 2 == 0 ? -relativeSize.y / 2 : 0;
        const yOffsets = [];
        for (let y = 0; y < extraRepetitions.y; y++) {
            const xOffsets = [];
            for (let x = 0; x < extraRepetitions.x; x++) {
                const point = new paper.Point([
                    (x * relativeSize.x + relativeShiftX - 1) * offsetSize.x / 2,
                    (y * relativeSize.y + relativeShiftY - 1) * offsetSize.y / 2
                ]);
                xOffsets.push(point);
            }
            yOffsets.push(xOffsets);
        }
        const offsetsFlat = yOffsets.flat(1);
        offsetsFlat.forEach((offset, index) => {
            if (index < this._paths.length) {
                this._paths[index].position = offset;
            } else {
                const clonePath = this._paths[0].clone();
                clonePath.position = offset;
                this._paths.push(clonePath);
            }
        });
        this._offsets = yOffsets;

        console.table(yOffsets);
    }
}
