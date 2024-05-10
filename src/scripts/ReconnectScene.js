import * as PIXI from 'pixi.js';
import { config } from './appConfig';
import { BackgroundGraphic, BackgroundImage } from './Background';
import { gameData, Globals } from './Globals';
import { InGameMessage } from './inGameMessage';
import { Label } from './LabelScore';
import { Prompt, PromptResponseType } from './prompt';
import { Socket } from './Socket';


export class ReconnectScene
{
    constructor(msg)
    {
        this.sceneName = "ReconnectScene";   
        this.messageToShow = msg;
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
        this.showMessage(msg);
        // this.addReconnectBtn();

        this.waitTimer = 5;
        this.currentTimer = this.waitTimer;

        setTimeout(this.pingCheckConnection.bind(this), 2000);

        // this.startTimer();
    }
    
    resize()
    {
        this.fullBg.resetGraphic(window.innerWidth, window.innerHeight);
        
        this.container.resetContainer();
        
        if(this.inGameMsg)
            this.inGameMsg.resizeContainer();
    }

    createBackground()
    {
        this.background = new BackgroundImage(Globals.resources.background.texture);

        this.container.addChild(this.background);
        
    }


    showMessage()
    {
        this.inGameMsg = new Prompt(`${this.messageToShow}\nReconnect in 5..`, PromptResponseType.NONE);
        this.inGameMsg.addButton("Reconnect", false, this.onReconnect.bind(this));
        this.sceneContainer.addChild(this.inGameMsg.container);
    }

    onReconnect()
    {
        this.inGameMsg.disabledOverlay.toggleButton(false);
        this.inGameMsg.textUpdate(`${this.messageToShow}\nReconnecting...`);

        gameData.isReconnecting = true;

        Globals.socket = new Socket(gameData.connectionId, gameData.players[gameData.plId].pName, gameData.tableTypeId, gameData.players[gameData.plId].pImage, gameData.entryFee);

        
    }


    pingCheckConnection()
    {
        if(window.navigator.onLine)
        {
            this.startTimer();
        } else
        {
            setTimeout(this.pingCheckConnection.bind(this), 2000);
        }
    }

    startTimer()
    {

        this.timerTimeout = setTimeout(() => {
            this.currentTimer--;

            if(this.currentTimer == 0)
            {
                this.inGameMsg.textUpdate(`${this.messageToShow}\nReconnect Now`);
                this.inGameMsg.disabledOverlay.toggleButton(true);
            } else
            {
                this.inGameMsg.textUpdate(`${this.messageToShow}\nReconnect in ${this.currentTimer}..`);
                this.startTimer();
            }
        }, 1000);
    }

    

    
}