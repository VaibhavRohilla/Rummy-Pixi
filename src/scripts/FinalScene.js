import * as PIXI from "pixi.js";
import {  config } from "./appConfig";
import { BackgroundGraphic } from "./Background";
import { gameData, Globals, LEAVESTATE } from "./Globals";
import { Label } from "./LabelScore";
import { Prompt, PromptResponseType } from "./prompt";



export class FinalScene
{
    constructor(textToShow = null, showBtn = false) {
        this.sceneName = "FinalScene";
        this.sceneContainer = new PIXI.Container();

        
        this.fullBg = new BackgroundGraphic(window.innerWidth, window.innerHeight, 0x131A27);
        this.sceneContainer.addChild(this.fullBg);

        this.container = new PIXI.Container();
        this.container.x = config.minLeftX;
        this.container.y = config.minTopY;
        this.container.scale.set(config.minScaleFactor);
        this.sceneContainer.addChild(this.container);



        const prompt = new Prompt("You've been disconnected", PromptResponseType.NONE);

        this.sceneContainer.addChild(prompt.container);


        if(textToShow != null)
            prompt.textUpdate(textToShow);




        if(showBtn)
        {
            prompt.addButton("Leave Game", true, this.onButtonPress.bind(this));
        }

    }

    onButtonPress()
    {
        gameData.leaveState = LEAVESTATE.LEFT;

        if(Globals.socket && Globals.socket.socket)
            Globals.socket.socket?.close();

        try {
            if (JSBridge != undefined) {

                JSBridge.sendMessageToNative(JSON.stringify({"t" :"Exit"}));
            }
        } catch {
            console.log("JS Bridge Not Found!");
        }
    }

}