

import { App } from "./App";
import { Globals } from "./Globals";
import Stats from "stats.js";
import { Socket } from "./Socket";



//SpineParser.registerLoaderPlugin();




//Globals.socket = new Socket();

// Globals.fpsStats = new Stats();
// Globals.fpsStats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// Globals.fpsStats.domElement.style.cssText = "position:absolute;top:25px;left:40px;";


// Globals.stats = new Stats();
// Globals.stats.showPanel( 2 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// Globals.stats.domElement.style.cssText = "position:absolute;top:25px;left: 125px;";

global.updateFromNative = function updateFromNative(message)
{
    const jsonData = JSON.parse(message);

    if(Globals.socket == undefined || Globals.socket == null)
    {
        Globals.socket = new Socket(jsonData.token.playerID, jsonData.username, jsonData.token.tableTypeID, jsonData.useravatar, jsonData.entryFee);
        Globals.emitter.Call("matchmakingStart", {});
    }

}

//Sample Request
// updateFromNative("{\"token\":{\"playerID\":\"230775\",\"tableTypeID\":\"15\"},\"username\":\"Player1\",\"entryFee\":\"20.00\",\"useravatar\":\"https://cccdn.b-cdn.net/1584464368856.png\"}");




Globals.App = new App();
Globals.App.run();
//Globals.App.addOrientationCheck();



