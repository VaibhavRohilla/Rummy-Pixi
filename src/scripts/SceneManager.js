import * as PIXI from "pixi.js";
import TWEEN from "@tweenjs/tween.js";
import { Background } from "./Background";
import { Globals } from "./Globals";
import { DebugText } from "./DebugText";
import { Label } from "./LabelScore";
import { config } from "./appConfig";

export class SceneManager {
    constructor() {
        this.container = new PIXI.Container();
        this.scene = null;
        const ver = new Label(10, 0, 0, "v0.13.25", 12, 0xffffff);
        ver.zIndex = 99;
        this.container.addChild(ver);

        this.gameRoundId= new Label(window.innerWidth - 10, window.innerHeight- 5, 1, "", 50, 0x47536b);
        this.gameRoundId.zIndex = 99;
        this.gameRoundId.style.fontWeight = "bold";
        this.container.addChild(this.gameRoundId);

        this.currentSceneName = null;

        
        // Globals.gameRoundId = new Label(10, window.innerHeight, 0, "", window.innerWidth/window.innerHeight * 24, 0x25334d);
        // Globals.gameRoundId.anchor.set(0,1);
        // Globals.gameRoundId.zIndex = 99;
        // this.container.addChild(Globals.gameRoundId);

        // this.updateGameRoundId("Game Round ID:jkasfjksjfklhasfjklhasklfhkashfk")

    }

    updateGameRoundId(id)
    {
        this.gameRoundId.text = id;
        this.gameRoundId.style.fontSize = config.minScaleFactor*48;


    }

    start(scene) {
        if (this.scene) {
            
            if(this.scene.onDestroyCalls)
                this.scene.onDestroyCalls();
            
            this.scene.sceneContainer.destroy();
        }
        this.container.sortableChildren = true;
        
        //console in color
        
        this.scene = scene;
        // console.log(scene.sceneName);
        this.currentSceneName = scene.sceneName;
        // console.log("%c" + "Starting scene: " + this.currentSceneName, "color: #00ff00; font-size: 16px;");
        this.container.addChild(this.scene.sceneContainer);


        if( window.orientation == 90 || window.orientation == -90)
            {
                
                this.drawImageAbove();
            }
    }

    update(dt) {
        TWEEN.update();
        
        if (this.scene && this.scene.update) {
            this.scene.update(dt);
        }

        // Globals.stats.update();
        // Globals.fpsStats.update();

        // Globals.stats.begin();

        // // monitored code goes here

        // Globals.stats.end();
    }

    resize()
    {
        if (this.scene && this.scene.resize) {
            this.scene.resize();
        }

        this.gameRoundId.style.fontSize = config.minScaleFactor*48;
        this.gameRoundId.x = window.innerWidth - 10;
        this.gameRoundId.y = window.innerHeight- 5;

    }

    recievedMessage(msgType, msgParams)
    {
		if(this.scene && this.scene.recievedMessage)
        {
            this.scene.recievedMessage(msgType, msgParams);
        }
    }

    drawImageAbove()
    {
        return;
        this.aboveBackground = new Background(Globals.resources.cover.texture,Globals.resources.cover.texture);
        this.labelText = new DebugText("Move Back To Portrait Mode", window.innerWidth/2, window.innerHeight/2, "#FFF");
        this.container.addChild(this.aboveBackground.container);
        this.container.addChild(this.labelText);
    }

    removeImageAbove()
    {
        return;
        if(this.aboveBackground)
        {
            this.aboveBackground.container.destroy();
            this.labelText.destroy();
            this.labelText = null;
            this.aboveBackground = null;
        }
    }
}