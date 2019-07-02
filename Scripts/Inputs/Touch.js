export class Touch {
	constructor() {}
	
	TouchStartListener(evt) {

	}
	TouchEndListener(evt) {

	}
	TouchMoveListener(evt) {

	}
	TouchEnterListener(evt) {

	}
	TouchLeaveListener(evt) {

	}
	TouchCancelListener(evt) {

	}
}

Touch.prototype.AddEvent = function() {
    if (document.addEventListener) {
        document.addEventListener("touchstart", this.TouchStartListener, false);
		document.addEventListener("touchend", this.TouchEndListener, false);
		document.addEventListener("touchmove", this.TouchMoveListener, false);
		document.addEventListener("touchenter", this.TouchEnterListener, false);
		document.addEventListener("touchleave", this.TouchLeaveListener, false);
		document.addEventListener("touchcancel", this.TouchCancelListener, false);
    }
};