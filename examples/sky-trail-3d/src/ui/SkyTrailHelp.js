import { InputHelpPanel } from 'gameforgejs/2d';
export class SkyTrailHelp {
    Draw(draw, visible = true) {
        this.view ??= new InputHelpPanel(draw,{title:'Sky Trail / Controls'});
        this.view.visible=visible;this.view.OnDrawn();
    }
    Dispose() {this.view?.Dispose();}
}
