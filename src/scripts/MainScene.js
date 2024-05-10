import * as PIXI from 'pixi.js';
import { config } from './appConfig';
import { BackgroundGraphic, BackgroundImage } from './Background';
import { GameScene } from './GameScene';
import { gameData, Globals } from './Globals';
import { Label } from './LabelScore';
import { MainSceneButtons } from './PrototypeTesting';



export class MainScene
{
    constructor()
    {
        this.sceneName = "MainScene";
        this.sceneContainer = new PIXI.Container();


        
        this.fullBg = new BackgroundGraphic(window.innerWidth, window.innerHeight, 0x131A27);
        this.sceneContainer.addChild(this.fullBg);

        this.container = new PIXI.Container();

        this.container.resetContainer = () => {
            this.container.x = config.minLeftX;
            this.container.y = config.minTopY;
            this.container.scale.set(config.minScaleFactor);
        };

        this.container.resetContainer();

        this.sceneContainer.addChild(this.container);

        this.createBackground();


        // //TESTING
        // this.testingButtons = new MainSceneButtons(6);
        // this.testingButtons.buttonContainer.x = config.logicalWidth * 0.1;
        // this.testingButtons.buttonContainer.y = config.logicalHeight * 0.1;
        // this.container.addChild(this.testingButtons.buttonContainer);

        // this.startMatchmaking();



        gameData.plId = -1;
        gameData.players = {};  

       



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
        this.fullBg.resetGraphic(window.innerWidth, window.innerHeight);
        
        this.container.resetContainer();

        // this.background.resetGraphic(config.logicalWidth, config.logicalHeight);
    }

    createBackground()
    {
        this.background = new BackgroundImage(Globals.resources.background.texture);

        this.container.addChild(this.background);
    }

    






}