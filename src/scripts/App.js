import * as PIXI from "pixi.js";
import { Loader } from "./Loader";
import { Globals } from "./Globals";
import { CalculateScaleFactor, config} from "./appConfig";
import { SceneManager } from "./SceneManager";
import { MyEmitter } from "./MyEmitter";
import { MainScene } from "./MainScene";
// import { GameScene } from "./GameScene";
// import { FinalScene } from "./FinalScene";
// import { GameEndScene } from "./GameEndScene";
// import { TestScene } from "./TestScene";
// import { ReconnectScene } from "./ReconnectScene";
// import { SwitchScene } from "./SwitchScene";



export class App {
    run() {
        // create canvas

        PIXI.settings.RESOLUTION = window.devicePixelRatio || 1;

        this.app = new PIXI.Application({width : window.innerWidth, height : window.innerHeight});
        document.body.appendChild(this.app.view);
        // document.body.appendChild( Globals.fpsStats.dom );
        // document.body.appendChild( Globals.stats.dom );

        CalculateScaleFactor();

        this.app.renderer.view.style.width = `${window.innerWidth}px`;
		this.app.renderer.view.style.height = `${window.innerHeight}px`;
		this.app.renderer.resize(window.innerWidth, window.innerHeight);

        this.app.view.oncontextmenu = (e) => {
            e.preventDefault();

        };

        //Setting Up Window On Resize Callback
        window.onresize = (e) => {
            
            CalculateScaleFactor();

            this.app.renderer.view.style.width = `${window.innerWidth}px`;
            this.app.renderer.view.style.height = `${window.innerHeight}px`;
            this.app.renderer.resize(window.innerWidth, window.innerHeight);

            Globals.scene.resize();
            
        }

        this.setupInputCallbacks();
        
        //Created Emitter
        Globals.emitter = new MyEmitter();

        //Create Scene Manager
        Globals.scene = new SceneManager();
        this.app.stage.addChild(Globals.scene.container);
        this.app.ticker.add(dt => Globals.scene.update(dt));


        // loader for loading data
        const loaderContainer = new PIXI.Container();
        this.app.stage.addChild(loaderContainer);
        
        this.loader = new Loader(this.app.loader, loaderContainer);
        

        this.loader.preload().then(() => {
            setTimeout(() => {
                loaderContainer.destroy();

                Globals.scene.start(new MainScene());
                // Globals.scene.start(new GameEndScene());
                // Globals.scene.start(new GameScene());
                // Globals.scene.start(new ReconnectScene());
                // Globals.scene.start(new TestScene());
                // Globals.scene.start(new FinalScene("Test", true));
                // Globals.scene.start(new SwitchScene());

				try {
					if (JSBridge != undefined) {

						JSBridge.showMessageInNative("loadSuccess");
					}
				} catch {
					console.log("JS Bridge Not Found!");
				}


                // fetch(`http://139.59.74.147:8081/api/getPlayerId`, {
                //     method: 'GET', // or 'PUT'
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //  //   body: ``,
                // }).then(response => response.json())
                //    .then(data => {
                //         console.log(data);
                //         if (data.code != 200) {
                //             console.log("API ERROR : ")
                //             console.log(data);
                //         }
                //         else {
                //             console.log("API SUCCESS : " + data.result)
                //             updateFromNative("{\"token\":{\"playerID\":\"" + data.result + "\",\"tableTypeID\":\"15\"},\"username\":\"Player1\",\"entryFee\":\"20.00\",\"useravatar\":\"https://cccdn.b-cdn.net/1584464368856.png\"}");
                //         }
                //     });
                

            }, 1000);
        });

       this.loader.preloadSounds();
    }

    setupInputCallbacks()
    {
        this.app.view.onmouseup = (e) => {
            Globals.emitter.Call("pointerUp");
        }


        this.app.view.ontouchend = (e) => {
            if(e.changedTouches[0].pointerId == 0)
            {
                Globals.emitter.Call("pointerUp");
            }
        };

        this.app.view.ontouchcancel = (e) => {
            if(e.changedTouches[0].pointerId == 0)
            {
                Globals.emitter.Call("pointerUp");
            }
        }
    }


}