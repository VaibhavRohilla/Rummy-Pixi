import { Container, Graphics, Sprite } from "pixi.js";
import { config } from "./appConfig";
import { Globals } from "./Globals";
import { Label } from "./LabelScore";



export const PromptResponseType = {
    NONE : 0,
    YESORNO : 1,
    CLOSE : 2
};

export class Prompt
{
    constructor(textToShow, ResponseType, callBackResponse = null)
    {
        this.container = new Container();
        this.container.interactive = true;

        Globals.soundResources.popup.play();

        const bg = new Sprite(Globals.resources.promptBg.texture);
        bg.scale.set(4);

        this.promptBox = new Sprite(Globals.resources.promptBox.texture);
        this.promptBox.anchor.set(0.5);
        this.promptBox.scale.set(config.minScaleFactor);

        this.promptBox.x = window.innerWidth/2;
        this.promptBox.y =  window.innerHeight/2;

        this.label = new Label(0, 0, 0.5, textToShow, 44, 0xffffff);
        this.label.style.align = "center";

        this.container.addChild(bg);
        this.container.addChild(this.promptBox);
        this.promptBox.addChild(this.label);
        
        this.callBackResponse = callBackResponse;
        switch(ResponseType)
        {
            case PromptResponseType.CLOSE:
                    this.addCloseButton();
                break;
            case PromptResponseType.YESORNO:
                    this.addConfirmButton();
                break;
            case PromptResponseType.NONE:
                    this.label.style.fill = 0xcdbd8d;
                    bg.destroy();
                    this.label.y -= 20;

                break;
        }
        
    }


    addButton(btnText, activeState = true, onPointerDownCallback = null)
    {
        const btn = new Sprite(Globals.resources.promptBox.texture);
        btn.anchor.set(0.5);
        btn.scale.set(config.minScaleFactor);
        btn.x = 0;
        btn.y = 130;

        const btnLabel = new Label(0, 0, 0.5, btnText.toUpperCase(), 98, 0x62CB5C, "BarlowBold");

        btn.once("pointerdown", () => {
            
            if(onPointerDownCallback)
                onPointerDownCallback();


            this.container.destroy();
        });

        this.disabledOverlay = new Graphics();
        this.disabledOverlay.beginFill(0,0.4);
        this.disabledOverlay.drawRoundedRect(-btn.width/2, -btn.height/2, btn.width, btn.height, 20);
        this.disabledOverlay.endFill();

        this.disabledOverlay.y =  btn.y;

        this.disabledOverlay.toggleButton = (val) => {
            btn.interactive = val;
            this.disabledOverlay.renderable = !val;
        };

        this.disabledOverlay.toggleButton(activeState);

        this.promptBox.addChild(btn);
        this.promptBox.addChild(this.disabledOverlay);
        btn.addChild(btnLabel);
    
    }

    textUpdate(msg)
    {
        this.label.text = msg;
    }

    addConfirmButton()
    {

        this.label.anchor.set(0.5, 0.5);
        this.label.y = -30;

        const yesBtn = new Sprite(Globals.resources.yesBtn.texture);
        yesBtn.anchor.set(0.5);

        yesBtn.x = -100;
        yesBtn.y =  50;
        yesBtn.interactive = true;
        yesBtn.once("pointerdown", () => {
            this.callBackResponse();
            this.container.destroy();
        });

        this.promptBox.addChild(yesBtn);
    

        const noBtn = new Sprite(Globals.resources.noBtn.texture);
        noBtn.anchor.set(0.5);

        noBtn.x = 100;
        noBtn.y = 50;
        noBtn.interactive = true;


        noBtn.once("pointerdown", () => {
            this.container.destroy();
        });

        this.promptBox.addChild(noBtn);
    }

    addCloseButton()
    {
        const crossBtn = new Sprite(Globals.resources.closeBtn.texture);
        crossBtn.anchor.set(0.5);
        crossBtn.x =  this.label.width/2+90;
        crossBtn.y = -100;

        this.promptBox.addChild(crossBtn);

        crossBtn.interactive = true;

        crossBtn.once("pointerdown", () => {
            this.container.destroy();
        });
    }
    resizeContainer()
    {
        this.promptBox.scale.set(config.minScaleFactor);

        this.promptBox.x = window.innerWidth/2;
        this.promptBox.y = window.innerHeight/2;
    }
}