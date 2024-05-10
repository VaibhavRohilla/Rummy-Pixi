import * as PIXI from 'pixi.js';
import { config } from './appConfig';
import { BackgroundGraphic } from './Background';
import { Globals } from './Globals';


export class TestScene
{
    constructor()
    {
        this.sceneName = "TestScene";
        this.sceneContainer = new PIXI.Container();

        this.container = new PIXI.Container();
        this.container.scale.set(config.minScaleFactor);
        this.container.x = config.minLeftX;
        this.container.y = config.minTopY;

        this.sceneContainer.addChild(this.container);



        // this.createRounding(config.logicalWidth/2, config.logicalHeight/2, 10, 200, 30);
    }

    
}