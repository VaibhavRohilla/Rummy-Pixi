import { Container, Graphics } from "pixi.js";
import { config } from "./appConfig";
import { Globals } from "./Globals";
import { Label } from "./LabelScore";
import { Socket } from "./Socket";


export class MainSceneButtons
{
    constructor(noOfButtons)
    {
        this.buttonContainer = new Container();
        
        let x = 0;
        let y = -400;    
        let connectionId = 226340;
        for(let i = 0; i < noOfButtons; i++)
        {
            if(i % 2 == 0)
            {
                x = 0;
                y += 300;
            } else
                x += config.logicalWidth * 0.6;
                
            this.createButton(i, connectionId, x, y, 200, 200);

            connectionId++;
        }
    }

    createButton(i, connectionId, x, y, width, height)
    {
        const button = new Graphics();
        
        button.beginFill(0xDE3249);
        button.drawRect(0, 0, width, height);
        button.endFill();
        button.x = x;
        button.y = y;
        button.textComponent = new Label(x + width/2, y + height/2, 0.5, "Player "+i+"\n"+connectionId,24,0xffffff);

        button.interactive = true;

        button.on("pointerdown", () => {
            Globals.soundResources.click.play();
            Globals.socket = new Socket(connectionId, "Player "+i, "20", "https://cccdn.b-cdn.net/1584464368856.png", "400.00");
            Globals.emitter.Call("matchmakingStart");
        }, this);

        this.buttonContainer.addChild(button);
        this.buttonContainer.addChild(button.textComponent);

    }
}