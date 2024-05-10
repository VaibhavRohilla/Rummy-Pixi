import { Container, Sprite } from "pixi.js";
import { config } from "./appConfig";
import { Globals } from "./Globals";
import { Label } from "./LabelScore";


export class InGameMessage
{
    constructor(messageToShow, isCenter = false)
    {
        this.container = new Container();

        const bg = new Sprite(Globals.resources.messageBox.texture);
        bg.anchor.set(0);
        bg.y = config.logicalHeight/2 - bg.height/4;
        
        this.container.addChild(bg);

        this.label = new Label(config.logicalWidth/2, bg.y + bg.height/2, 0.5, messageToShow, 55, 0xffffff);
        this.label.style.align = "center";


        if(isCenter)
        {
            // bg.y -= bg.height/2;
            // this.label.y = ;
        }

        
        
        this.container.addChild(this.label); 

    }

    textUpdate(text)
    {
        this.label.text = text;
    }
    
}