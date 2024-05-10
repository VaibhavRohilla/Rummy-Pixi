import * as PIXI from "pixi.js";
import {config } from "./appConfig";
import { Globals } from "./Globals";

export class Background extends PIXI.TilingSprite {
    constructor(topImage,width = config.logicalWidth, height= config.logicalHeight, scaleSize = null) {

        super(topImage);


        this.width = width;
        this.height = height;

        if(scaleSize != null)
        {
            this.width *= scaleSize;
            this.height *= scaleSize;
        }
    }
}

export class BackgroundImage extends PIXI.Sprite {
    constructor(texture,width = config.logicalWidth, height= config.logicalHeight, scaleSize = null) {

        super(texture);


        this.width = width;
        this.height = height;

        if(scaleSize != null)
        {
            this.width *= scaleSize;
            this.height *= scaleSize;
        }
    }

}

export class BackgroundGraphic extends PIXI.Graphics
{
    constructor(width, height, color)
    {
        super();
        this.defaultProperties = { 
            width : width, 
            height : height,
            color : color
        };

        this.createGraphic();
    }

    createGraphic()
    {
        this.clear();
        this.beginFill(this.defaultProperties.color, 1);
        this.drawRect(0, 0, this.defaultProperties.width, this.defaultProperties.height);
        this.endFill();
    }

    resetGraphic(width = null, height = null, color = null)
    {
        if(width != null)
            this.defaultProperties.width = width;
        
        if(height != null)
            this.defaultProperties.height = height;

        if(color != null)
            this.defaultProperties.color = color;
        
        this.createGraphic();
    }
}