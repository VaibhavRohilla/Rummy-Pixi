import * as PIXI from "pixi.js";
import { config } from "./appConfig";
import { BackgroundGraphic } from "./Background";
import { GameScene } from "./GameScene";
import { connectionData, gameData, Globals } from "./Globals";
import { Prompt, PromptResponseType } from "./prompt";
import { Socket } from "./Socket";


export class SwitchScene
{

    constructor(oldTableGameId)
    {
        this.sceneName = "SwitchScene";
        this.sceneContainer = new PIXI.Container();

        this.fullBg = new BackgroundGraphic(window.innerWidth, window.innerHeight, 0x131A27);

        this.sceneContainer.addChild(this.fullBg);

        this.container = new PIXI.Container();
        this.container.x = config.minLeftX;
        this.container.y = config.minTopY;
        this.container.scale.set(config.minScaleFactor);
        this.sceneContainer.addChild(this.container);

        this.oldTableGameId = oldTableGameId;


        this.prompt = new Prompt("Switching to new table....\nPlease Wait", PromptResponseType.NONE);

        this.sceneContainer.addChild(this.prompt.container);

        console.log("Switching to new table....");
        logThis(this.oldTableGameId);

        Globals.socket = new Socket(connectionData.id.toString(),
            connectionData.name,
            connectionData.tableTypeId.toString(),
            connectionData.image,
            connectionData.entryFee.toString(),
            null,
            this.oldTableGameId
            );
    }

    recievedMessage(msgType, msgParams)
    {
        if(msgType == "matchmakingStart")
        {
            Globals.scene.start(new GameScene());
        }
    }

    resize()
    {
        if(this.prompt)
        {
            this.prompt.resizeContainer();
        }
    }
    
}