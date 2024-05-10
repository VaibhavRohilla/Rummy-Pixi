import { Label } from "./LabelScore";

export class Timer
{

    constructor(x, y, container)
    {
        this.createTimer(x, y, container);
    }

    createTimer(x, y, container) {

		// const timerBlock = new PIXI.Sprite(Globals.resources.timerBlock.texture);
		// const timerIcon = new PIXI.Sprite(Globals.resources.timerIcon.texture);
		
		// timerBlock.anchor.set(0.5, 0);
		// timerBlock.scale.set(0.66);
		// timerBlock.x = config.logicalWidth/2;
		// timerBlock.y = timerBlock.height;

		// timerIcon.anchor.set(0.5);
		// timerIcon.scale.set(0.66);
		// timerIcon.x = config.logicalWidth/2 - timerBlock.width * 0.6;
		// timerIcon.y = timerBlock.y + timerBlock.height * 0.4;
		

		this.label = new Label(x, y, 0.5, "00:00", 34, 0xffffff);
		this.label.style.fontWeight = 10;
		this.label.anchor.set(1, 0.5);
		// this.container.addChild(timerBlock);
		// this.container.addChild(timerIcon);
		container.addChild(this.label);
		
	}


	updateTimer(time) {
		const seconds = Math.floor(time % 60);
		const minutes = Math.floor(time / 60);
		let timeString = ((minutes < 10) ? minutes.toString().padStart(2,0) : minutes)
		timeString += ":"
		timeString += (seconds < 10) ? seconds.toString().padStart(2,0) : seconds;
		this.label.text = timeString;
	}
}