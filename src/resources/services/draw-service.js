import { inject } from 'aurelia-framework';
import { AbstractDrawService } from 'services/abstract-draw-service'
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class DrawService extends AbstractDrawService {
    _drawTool;
    _offsetGroups = [];
    _selection = [];
    _drawSettings = {};

    constructor(eventAggregator) {
        super(eventAggregator);
        this._eraseSubscription = this._eventAggregator.subscribe('erase', _ => {
            this._erase();
            this.setGrid(this._drawSettings);
            this.draw(this._drawSettings);
        });
        this._undoSubscribe = this._eventAggregator.subscribe('undo', _ => this._undo());
    }

    detached() {
        this._eraseSubscription.dispose();
    }

    draw(drawSettings) {
        this._drawSettings = drawSettings;
        this._drawTool = this._drawTool || new paper.Tool();
        this._drawTool.activate();
        const makeNewPath = (name) => new paper.Path({
            strokeColor: drawSettings.lineColor || this._drawSettings.lineColor,
            strokeWidth: drawSettings.lineWidth || this._drawSettings.lineWidth,
            strokeCap: 'round',
            name: name
        });
        let newPath, currentPathName;
        let penDown = false;

        this._drawTool.onMouseDown = (event) => {
            penDown = !penDown;
            this._offsetGroups.forEach(offsetgroup => {
                const hitResult = offsetgroup.hitTest(event.point, {
                    fill: false, stroke: true, segments: false, class: Path
                });
                if (hitResult) hitResult.item.fullySelected = !hitResult.item.fullySelected;
            });
            this._offsetGroups.forEach((offsetGroup, index) => {
                currentPathName = ('path-' + event.timeStamp).replace('.', '').substring(0, 12);
                newPath = makeNewPath(currentPathName + index);
                newPath.position = event.point.add(this._flatGrid[index]);
                newPath.add(new paper.Point(newPath.position));
                offsetGroup.addChild(newPath);
            });
        }

        this._drawTool.onMouseMove = (event) => {
            if (penDown) {
                this._offsetGroups.forEach((offsetGroup, index) => {
                    const currentPath = offsetGroup.children[currentPathName + index];
                    const newPoint = new paper.Point(event.point.add(this._flatGrid.flat(1)[index]));
                    currentPath.add(newPoint);
                });
            } else {
                // show selection hovered path
                this._offsetGroups.forEach((offsetgroup, index) => {
                    const hitResult = offsetgroup.hitTest(event.point, {
                        fill: false, stroke: true, segments: false, class: Path
                    });
                    if (hitResult) {
                        hitResult.item.selected = true;
                        this._selection[index].add(hitResult.item);
                    } else {
                        this._selection[index].forEach(path => {
                            if (!path.fullySelected) path.selected = false;
                        });
                        this._selection[index].clear();
                    }
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
        }
    }

    setGrid(settings) {
        super.setGrid(settings);
        this._offsetGroups = [];
        this._flatGrid = this._grid.flat(1);
        this._flatGrid.forEach(offset => {
            const pathGroup = new paper.Group();
            this._offsetGroups.push(pathGroup);
            this._selection.push(new Set());
        });
    }

    _undo() {
        this._offsetGroups.forEach(offsetGroup => {
            const lastPath = offsetGroup.lastChild;
            lastPath?.remove();
        });
    }

    _erase() {
        if (paper.project.selectedItems.length) {
            this._offsetGroups.forEach(offsetGroup => {
                const pathsToHide = offsetGroup.children.filter(path => path.fullySelected);
                pathsToHide.forEach(path => {
                    path.remove();
                });
            });
            // this._drawTool.activate();
        } else {
            super._erase();
        }

    }

}
