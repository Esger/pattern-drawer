import { inject } from 'aurelia-framework';
import { AbstractDrawService } from 'services/abstract-draw-service'
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class DrawService extends AbstractDrawService {
    _drawTool;
    _offsetGroups = [];

    constructor(eventAggregator) {
        super(eventAggregator);
        this._eraseSubscription = this._eventAggregator.subscribe('erase', _ => {
            this._erase();
            this.setRepetitions(this._repetitions);
            this.draw(this._settings);
        });
        this._undoSubscribe = this._eventAggregator.subscribe('undo', _ => this._undo());
    }

    detached() {
        this._eraseSubscription.dispose();
    }

    draw(settings) {
        this._settings = settings;
        this._drawTool = this._drawTool || new paper.Tool();
        this._drawTool.activate();
        const makeNewPath = (name) => new paper.Path({
            strokeColor: settings.color || this._settings.color,
            strokeWidth: settings.lineWidth || this._settings.lineWidth,
            strokeCap: 'round',
            name: name
        });
        let newPath, currentPathName;
        let penDown = false;

        this._drawTool.onMouseDown = (event) => {
            penDown = !penDown;
            if (penDown) {
                this._offsetGroups.forEach((offsetGroup, index) => {
                    currentPathName = ('path-' + event.timeStamp).replace('.', '').substring(0, 12);
                    newPath = makeNewPath(currentPathName + index);
                    newPath.position = event.point.add(this._offsetsFlat[index]);
                    newPath.add(new paper.Point(newPath.position));
                    offsetGroup.addChild(newPath);
                });
            }
        }

        this._drawTool.onMouseMove = (event) => {
            if (penDown) {
                // path.fullySelected = true;
                this._offsetGroups.forEach((offsetGroup, index) => {
                    const currentPath = offsetGroup.children[currentPathName + index];
                    const newPoint = new paper.Point(event.point.add(this._offsetsFlat.flat(1)[index]));
                    currentPath.add(newPoint);
                });
            }
        }

        this._drawTool.onMouseUp = (event) => {
            // overeenkomende paden in andere groepen/offsets ook
            penDown = !penDown;
            this._offsetGroups.forEach((offsetGroup, index) => {
                const currentPath = offsetGroup.children[currentPathName + index];
                currentPath.simplify();
            })
            // path.fullySelected = false;
        }
    }

    setRepetitions(repetitions) {
        super.setRepetitions(repetitions);
        this._offsetGroups = [];
        this._offsetsFlat = this._offsets.flat(1);
        this._offsetsFlat.forEach(offset => {
            const pathGroup = new paper.Group();
            this._offsetGroups.push(pathGroup);
        });
    }

    _undo() {
        this._offsetGroups.forEach(offsetGroup => {
            const lastPath = offsetGroup.lastChild;
            lastPath?.remove();
        });
    }

    _erase() {
        super._erase();
    }

}
