import * as PIXI from "pixi.js";

export class DebugCircle extends PIXI.Graphics
{
    constructor(x, y, radius = 5, container = null, color = 0xDE3249)
    {
        super();

        let point = new PIXI.Point(x, y);
        
        // component.getGlobalPosition(point, false);



        this.lineStyle(0); 
        this.beginFill(color, 1);
        this.drawCircle(point.x, point.y, radius);
        this.endFill();


        if(container)
            container.addChild(this);
    }
}