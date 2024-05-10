import { FinalScene } from "./FinalScene";
import { GameEndScene } from "./GameEndScene";
import { GameScene } from "./GameScene";
import {CheckPlayerStatusAPI, ConvertToCashBalance, ConvertToGameBalance, GetPlayerWalletAPI, getServerFromDistributor ,StartRestartProcess,stopRestartProcess} from "./apiCalls";
import { connectionData, gameData, GAMESTATE, Globals, LEAVESTATE, PLAYERSTATE, updateTableId } from "./Globals";
import { ReconnectScene } from "./ReconnectScene";
import { sleep } from "./utility";




export class Socket {
    constructor(credentials, serverDataForRestart) {

        //gameData.connectionId = uuid;

        console.log("Socket Created");

        console.log(`Credentials: ${JSON.stringify(credentials)}`);

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const servAddress = urlParams.get('debug');


        // url = "wss://rummyserver.cap2.yonzo.io";
        // url = "ws://localhost:9092";

        this.maxServersCount = 5
        this.maxGameWalletCheckCount = 20

        Globals.errorMsg = "";
        Globals.errorCode = 0;

        Globals.connectionData = { ...credentials }


        console.log(Globals.connectionData);

        this.socket = null

        // connectionData.id = parseInt(uuid);
        // connectionData.name = name;
        // connectionData.tableTypeId = parseInt(tableTypeID);
        // connectionData.image = userAvatar;
        // connectionData.entryFee = parseFloat(entryFee);

        // const connectionData = {
        //     playerId : parseInt(uuid),
        //     entryFee : parseFloat(entryFee),
        //     tableTypeId : parseInt(tableTypeID),
        //     name : name,
        // }

        // const requestPayload = {
        //     playerId : connectionData.id,
        //     entryFee : connectionData.entryFee,
        //     tableTypeId : connectionData.tableTypeId,
        //     name : connectionData.name,
        // };


        if (serverDataForRestart) {
            this.restartConnection(serverDataForRestart);
        } else {
            this.startConnectProcess();
        }
        if (oldTableGameId) {
            requestPayload.oldTableGameId = oldTableGameId;
        }

        // console.log("Request Payload : " + JSON.stringify(requestPayload));
        // gameData.entryFee = entryFee;
        // gameData.tableTypeId = tableTypeID;

        // if(url != null)
        // {
        //     this.socket = new WebSocket(url); 
        // }
        // else {


        //     //Fetch URl From API CODE
        //     // const apiUrl = "http://68c3-2405-201-5006-10c7-cc71-5e06-f8e1-dc1c.ngrok.io/api/getserver";
        //     // const apiUrl = "https://apirummy.gamesapp.com/api/getserver";

        //     //TestLink
        //     // const apiUrl = "http://139.59.74.147:8081/api/joinserver";

        //     // const apiUrl = "http://prodrummymaster.gamesapp.co/api/joinserver"
        //     //NORMAL LINK UAT
        //     const apiUrl = "http://139.59.28.242:8081/api/joinserver";


        //     //DevLink

        //     // const apiUrl = "http://165.22.218.189:8081/api/joinserver";



        //     // const apiUrl = "http://localhost:8081/api/joinserver";

        //     // const apiUrl = "https://apirummyuat.gamesapp.com/api/getserver";
        //     // const apiUrl = "http://localhost:8081/api/getserver";

        //     console.log("Fetching Server URL");
        //     console.log(requestPayload);

        //     this.socket = null;
        //     console.log("fetch request made");

        //     fetch(apiUrl, {
        //         method: 'POST', // or 'PUT'
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(requestPayload),
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log(data);
        //         if(data.code != 200)
        //         {
        //             console.log("API ERROR : ")
        //             console.log(data);
        //             Globals.scene.start(new FinalScene(data.result),true);
        //         }

        //         // console.log(data.result);
        //         // data.result.address = "ws://localhost:8082";

        //         this.establishConnection(data.result, requestPayload);

        //     })




        //     // this.socket = new WebSocket() 
        // }



    }

    async restartConnection(serverData) {
        console.log("Restarting connection");
        let gameBalanceResponse = await ConvertToGameBalance(Globals.connectionData.playerId, Globals.connectionData.entryFee);

        if (!gameBalanceResponse.success) {
            Globals.scene.start(new FinalScene(gameBalanceResponse.message, true, 2));
            return;
        }

        try {
            const response = await this.tryServerConnection(serverData.address, Globals.connectionData.tableTypeID, Globals.connectionData.entryFee);
            this.defineSocketEvents();
        } catch (error) {
            console.log(error);
            console.log("Error in connecting to server");
            this.fetchServersAndConnect();
        }
    }

    async fetchServersAndConnect() {

        let data = await getServerFromDistributor(Globals.connectionData);

        if(!data.success) {
            console.log("fetchServersAndConnect",data.message)
            Globals.scene.start(new FinalScene(data.message, true, 2));
            return;
        }

        if(data.servers.length <1) {
            console.log("fetchServersAndConnect",data.servers.length)
            Globals.scene.start(new FinalScene("Game Severs not available.", true, 2));
            return;
        }

        console.log("serverData",data)
        this.loopThroughServers(data.servers);

    }

    async startConnectProcess() {

        let playerStatus = await CheckPlayerStatusAPI(Globals.connectionData.playerId);

        if (playerStatus.success) {
            try {
                let connection = await this.tryServerConnection(playerStatus.data.serverAddress, playerStatus.data.tableType, playerStatus.data.entryFee);

                if (connection) {
                    this.defineSocketEvents();
                }
            } catch (error) {
                console.log(error);
                console.log("Error in connecting to server");
                Globals.scene.start(new FinalScene("Error in reconnecting \n" + error, true, 2));
            }

        } else {

            //{success : boolean, message : string}
            let gameCashResponse = await ConvertToCashBalance(Globals.connectionData.playerId);

            let gameBalanceResponse = await ConvertToGameBalance(Globals.connectionData.playerId, Globals.connectionData.entryFee);

            if (!gameBalanceResponse.success) {
                Globals.scene.start(new FinalScene(gameBalanceResponse.message, true, 2));
                return;
            }

            console.log("Game balance converted");
            // this.fetchServersAndConnect();

            setTimeout(() => {
                this.maxGameWalletCheckCount = 20;
                this.checkGameWalletStatus();
            }, 1000);
        }
    }

    tryServerConnection(serverAddress, tableType, entryFee) {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(serverAddress);

            this.socket.onopen = e => {
                console.log("Connection with socket made");

                const distmsg = {
                    t: "connect",
                    gid: Globals.connectionData.playerId,
                    tableGameId: "",
                    tableTypeID: tableType !== undefined ? tableType : Globals.connectionData.tableTypeID,
                    entryFee: entryFee !== undefined ? entryFee : Globals.connectionData.entryFee,
                    pName: Globals.connectionData.pName,
                    pImage: Globals.connectionData.pImage
                }

                console.log(distmsg)

                this.sendMessage(distmsg);
            };

            this.socket.onclose = e => {
                console.log("Socket closed");
                console.log(e);
                reject("Socket closed");
            };

            this.socket.onerror = e => {
                console.log("Socket error");
                console.log(e);

                reject("Socket error");
            };

            this.socket.onmessage = e => {
                console.log("Message Recieved in tryServerConnection  : " + e.data);

                const msg = JSON.parse(e.data);


                if (msg.t === "joined") {

                    Globals.hasJoinedTable = true;

                    Globals.gameData.tempPlayerData = {};

                    CurrentGameData.tableGameID = msg.tID;
                    Globals.emitter?.Call("updateTableGameID");

                    Globals.gameData.bal = msg.bal;

                    this.pingServer();

                    Object.keys(msg.snap).forEach(key => {
                        const data = msg.snap[key];

                        Globals.gameData.tempPlayerData[data.plId] = data;
                    });

                    // console.log(Globals.emitter);

                    //log in bold red big letters
                    console.log(`%c Calling Emitter`, 'font-weight: bold; font-size: 20px; color: red;');
                    Globals.emitter.Call("joined", { plId: msg.plId });

                    console.log(`Successfully connected to server ${serverAddress}`);

                    resolve(true);



                } else if (msg.t == "rejoined") {

                    this.pingServer();
                    console.log(msg)
							Globals.hasJoinedTable = true;
							CurrentGameData.tableGameID = msg.tID;
							Globals.emitter?.Call("updateTableGameID");

							Globals.gameData.bal = msg.bal;

							Globals.gameData.plId = msg.plId;

							Globals.gameData.players = {};

							msg.snap.forEach(plData => {
								Globals.gameData.players[plData.plId] = plData;
							});

							Globals.potData = msg.pot;

							CurrentGameData.gameRoundId = msg.gameRoundId;
							Globals.emitter?.Call("updateGameRoundID");



                    Globals.emitter.Call("rejoined", { turn: msg.turn, board: msg.board, stats: msg.stats,playerState: msg.state, rollDiceVal: msg.rollDice, movableTokens:  msg.movableTokens});

                    console.log(`Successfully connected to server ${serverAddress}`);
                    resolve(true);


                } else if (msg.t === "error") {
                    let msgtxt = msg.msg
                    let data = msg.data
                    let message = msgtxt ? msgtxt : data
                    console.log("error", msgtxt, data)
                    reject(message);
                }
            };

        });

    }


    async loopThroughServers(servers) {
        if (servers.length === 0) {

            console.log("No servers available");

            if (this.maxServersCount < 1) {
                Globals.scene.start(new FinalScene("No Tables Available", true, 2));
                return;
            }

            this.maxServersCount--;
            getServerFromDistributor(Globals.connectionData)
        }

        const serverDetails = servers[0];
        servers.splice(0, 1);

        // console.log("maxServersCount", this.maxServersCount)

        try {
            let response = await this.tryServerConnection(serverDetails.address, undefined, undefined);

            if (response) {
                console.log("Connected to server");
                console.log(`%c Defining Socket`, 'font-weight: bold; font-size: 20px; color: red;');
                this.defineSocketEvents();

                return;
            }
        } catch (error) {

            console.log(error)
            console.log("Connection failed");
            await sleep(100);
            this.loopThroughServers(servers);
        }
    }
    // Globals.socketAddr = result.address;
    // this.socket = new WebSocket(result.address);
    // console.log("Socket Initiated!");

    // requestPayload.tableGameId = result.tableGameId;



    // requestPayload.entryFee = result.entryFee;

    // this.socket.onopen = e => {
    //     console.log("Connection with socket made");

    //     console.log(requestPayload.oldTableGameId)
    //     if(requestPayload.oldTableGameId != undefined && requestPayload.oldTableGameId != null)
    //         Globals.emitter.Call("matchmakingStart")

    //     // if(gameData.isReconnecting)
    //     // {
    //     //     // gameData.isReconnecting = false;
    //     //     const reconnectMsg = {
    //     //         t : "reconnect",
    //     //         plId : gameData.plId,
    //     //         tableId : gameData.tableId
    //     //     }

    //     //     this.sendMessage(reconnectMsg);
    //     // } else
    //     // {

    //         const distmsg = {
    //             t : "connect",
    //             gid : "" +requestPayload.playerId,
    //             tableGameId : requestPayload.tableGameId,
    //             tableTypeId : requestPayload.tableTypeId,
    //             entryFee : requestPayload.entryFee,
    //             pName : connectionData.name,
    //             pImage : connectionData.image
    //         }

    //         this.sendMessage(distmsg);
    //     // }


    //     this.checkPingResponseTimeout = setTimeout(this.showReconnectScreen.bind(this), 5000);
    //     this.pingTimeout = setTimeout(() => {
    //         this.sendMessage({t : "ping"});
    //     }, 1000);
    // };

    defineSocketEvents() {


        // this.socket.onmessage = e => {



        //     const msg = JSON.parse(e.data);

        //     if(msg.t != "pong")
        //         console.log("Message Received : " + e.data);

        //     if(msg.t == "joined")
        //     {
        //         gameData.gameState = msg.gameState;

        //         gameData.players = {}

        //         gameData.plId = msg.plId;

        //         gameData.tableId  = msg.tId;

        //         for(let i = 0; i < msg.snap.length; i++)
        //         {
        //             const data = msg.snap[i];
        //             gameData.players[data.plId] = data;
        //         }

        //         if(msg.gameStarted && msg.joker)
        //         {
        //             gameData.jokerCard = msg.joker;
        //             gameData.openCard = msg.openCard;
        //             gameData.potData = msg.pot
        //         }

        //         if(msg.gameStarted)
        //             gameData.isDropped = true;

        //         //compare current scene with game scene and if not same then change scene to game scene
        //         if(Globals.scene.currentSceneName != "GameScene")
        //         {
        //             console.log("Changing Scene to Game");
        //             Globals.scene.start(new GameScene(false,false,true, msg.gameStarted));
        //         }

        //         Globals.emitter.Call("joined", {gameStarted : msg.gameStarted});



        //     } else if(msg.t == "rejoined")
        //     {
        //         gameData.players = {};
        //         gameData.plId = msg.plId;

        //         gameData.hasSubmit  = msg.hasSubmit;

        //         for(let i=0; i < msg.snap.length; i++)
        //         {
        //             const data = msg.snap[i];
        //             gameData.players[data.plId] = data;
        //         }

        //         gameData.tableId  = msg.tId;

        //         gameData.jokerCard = msg.joker;
        //         gameData.openCard = msg.openCard;
        //         gameData.potData = msg.pot;

        //         console.log("POT VALUE ON REJOIN : "+ gameData.potData);
        //         gameData.cards = msg.cards;
        //         gameData.lives = 3 - msg.lives;

        //         gameData.gameState = msg.gameState;

        //         if(gameData.players[gameData.plId].pState == PLAYERSTATE.DROPPED)
        //         {
        //             gameData.isDropped = true;
        //         }

        //         if(gameData.isReconnecting)
        //         { 
        //             gameData.isReconnecting = false;

        //             if(gameData.gameState == GAMESTATE.SUBMITING)
        //             {
        //                 if(msg.hasSubmit)
        //                 {
        //                     gameData.hasGameStarted = true;


        //                     msg.aData.submitCards.forEach(element => {
        //                         if(element)
        //                         {
        //                             gameData.tempWinData[element.plId] = element;
        //                         }
        //                     });

        //                     Globals.hasEndSceneLoaded = true;
        //                     Globals.scene.start(new GameEndScene());
        //                 } else
        //                 {
        //                     Globals.scene.start(new GameScene(false, false, true, msg.aData));
        //                 }
        //             } else if (gameData.gameState == GAMESTATE.RESULT)
        //             {
        //                 if(msg.aData)
        //                 {
        //                     gameData.winData = msg.aData;
        //                     gameData.hasEndSceneLoaded = true;
        //                     Globals.scene.start(new GameEndScene(true));
        //                 } else
        //                 {
        //                     gameData.hasEndSceneLoaded = true;
        //                     Globals.scene.start(new GameEndScene());
        //                 }
        //             } else if (gameData.gameState == GAMESTATE.RESTARTING)
        //             {
        //                 gameData.winData = msg.aData;
        //                 gameData.hasEndSceneLoaded = true;
        //                 Globals.scene.start(new GameEndScene(true));
        //             }
        //             else
        //             {
        //                 Globals.scene.start(new GameScene(false, false, true, msg.aData));
        //             }

        //         } else
        //         {

        //             Globals.emitter.Call("rejoined", {aData : msg.aData});
        //             console.log("GAME STATE  :"+gameData.gameState);
        //             console.log("Player STATE  :"+ gameData.gameState);

        //             if(gameData.gameState == GAMESTATE.SUBMITING)
        //             {
        //                 if(msg.hasSubmit)
        //                 {
        //                     gameData.hasGameStarted = true;


        //                     msg.aData.submitCards.forEach(element => {
        //                         if(element)
        //                         {
        //                             gameData.tempWinData[element.plId] = element;
        //                         }
        //                     });

        //                     Globals.hasEndSceneLoaded = true;
        //                     Globals.scene.start(new GameEndScene());
        //                 } else
        //                 {
        //                     Globals.scene.start(new GameScene(false, false, true, msg.aData));
        //                 }
        //             } else if (gameData.gameState == GAMESTATE.RESULT)
        //             {
        //                 if(msg.aData)
        //                 {
        //                     gameData.winData = msg.aData;
        //                     gameData.hasEndSceneLoaded = true;
        //                     Globals.scene.start(new GameEndScene(true));
        //                 } else
        //                 {
        //                     Globals.scene.start(new GameScene(false, false, true,undefined));
        //                 }
        //             } else if (gameData.gameState == GAMESTATE.RESTARTING)
        //             {
        //                 gameData.winData = msg.aData;
        //                 gameData.hasEndSceneLoaded = true;
        //                 Globals.scene.start(new GameEndScene(true));
        //             }
        //             else
        //             {
        //                 Globals.scene.start(new GameScene(false, false, true, msg.aData));
        //             }

        //         }

        this.socket.onmessage = e => {
            console.log("Message Recieved : " + e.data);
            let msg = JSON.parse(e.data);



        if (msg.t == "pAdd") {
            const plData = {
                pName: msg.pName,
                pImage: msg.pImage,
                pBal: msg.bal,
                plId: msg.plId,
                pState: msg.currState,
                pDefaultId: msg.pDefaultId
            };

            let dataAlreadyExisted = false;
            if (gameData.players[msg.plId]) {
                dataAlreadyExisted = true;
            }

            gameData.players[msg.plId] = plData;

            Globals.emitter.Call("playerJoined", { data: plData, gameStarted: msg.gameStarted, exits: dataAlreadyExisted });

        } else if (msg.t == "plRejoin") {
            const plData = {
                pName: msg.pName,
                pImage: msg.pImage,
                pBal: msg.bal,
                plId: msg.plId,
                pState: msg.pState,
                pDefaultId: msg.pDefaultId
            };

            gameData.players[msg.plId] = plData;

            Globals.emitter.Call("playerRejoined", { data: plData });


        } else if (msg.t == "GAMESTARTMSG") {

            const changedPls = [];

            gameData.hasSubmit = false;
            for (let i = 0; i < msg.snap.length; i++) {
                const data = msg.snap[i];

                if (data.pState != gameData.players[data.plId].pState) {
                    gameData.players[data.plId].pState = data.pState;
                    if (data.plId == gameData.plId && data.pState == PLAYERSTATE.INGAME) {
                        gameData.isDropped = false;
                    }
                    changedPls.push(data.plId);
                }

                gameData.players[data.plId].pDefaultId = data.pDefaultId;
            }


            Globals.emitter.Call("gameStart", { changedPls: changedPls });
        } else if (msg.t == "tossResultMsg") {


            Globals.emitter.Call("showTossResult", { cards: msg.cards, win: msg.winner });
        }
        else if (msg.t == "turnSkipped") {

            if (msg.openCard) {
                gameData.openCard = msg.openCard;
            }
            gameData.lives = 3 - msg.lives;
            gameData.currentTurn = msg.nextRoll;
            Globals.emitter.Call("turnChanged", { card: msg.openCard, lives: msg.lives, plId: msg.plId });

        }
        else if (msg.t == "cardPickClickMsg") {

            if (gameData.plId != msg.plId) {
                Globals.emitter.Call("CardPickedByOtherPlayer", { type: msg.type, plId: msg.plId });
            }

        } else if (msg.t == "plCardsMsg") {
            gameData.cards = msg.cards;
            gameData.jokerCard = msg.joker;
            gameData.openCard = msg.openCard;

            Globals.emitter.Call("addPlayerCards");

            //Call Cards Added
        } else if (msg.t == "plGameData") {
            gameData.jokerCard = msg.joker;
            gameData.openCard = msg.openCard;

            Globals.emitter.Call("addCardsData");
        } else if (msg.t == "firstCard") {

        } else if (msg.t == "tossResult") {

            //Show toss result 
            //save next Player turn
        } else if (msg.t == "timer") {
            Globals.emitter.Call("timer", { data: msg.data, extraTime: msg.extraTime, playerTurn: msg.currPlTurn });
            //ping and update timer and what is winner?
        } else if (msg.t == "cardPickRespMsg") {
            Globals.emitter.Call("cardPick", { card: msg.card });
            //add card to deck
        } else if (msg.t == "nextPlayerTurnMsg") {
            gameData.openCard = msg.openDeck;
            Globals.emitter.Call("nextPlayerTurnMsg", { turnId: msg.plId });
            //change turn and show card open card
        } else if (msg.t == "cardSeqCheckMsg") {
            let seqIndex = 3;

            if (msg.isPureSeq == true) {
                seqIndex = 1;
            } else if (msg.isImpureSeq == true) {
                seqIndex = 2;
            } else if (msg.isSet == true) {
                seqIndex = 0;
            }

            console.log(seqIndex);

            Globals.emitter.Call("cardSeqRecieved", { cards: msg.cards, seqType: seqIndex });
        } else if (msg.t == "gameFinishMsg") {
            gameData.openCard = msg.openDeck;
            Globals.emitter.Call("gameFinish", { plId: msg.plId, timeLeft: msg.timeLeft });

        } else if (msg.t == "potUpdate") {
            gameData.potData = msg.amt;
            gameData.players[msg.data.plId].pBal = msg.data.bal;
            console.log(msg.data);
            Globals.emitter.Call("potUpdate", { plId: msg.data.plId });

        } else if (msg.t == "gameEnd") {
            if (!gameData.hasEndSceneLoaded) {
                Globals.emitter.Call("loadEndScene", {});
            }
        } else if (msg.t == "invalidDeclare") {

            const data = {
                plId: msg.plid,
                result: "Lost",
                score: msg.lostPoints,
                amount: msg.amt,
                cards: msg.cards
            }

            gameData.tempWinData[data.plId] = data;


            Globals.emitter.Call("invalidDeclare", data);

            // this.resultMessage(data);

        } else if (msg.t == "validDeclare") {
            const data = {
                plId: msg.plid,
                result: "Won",
                score: 0,
                amount: msg.amt,
                cards: msg.cards
            }
            gameData.tempWinData[data.plId] = data;



            if (msg.plid == gameData.plId) {

                Globals.emitter.Call("loadEndScene", {});


            } else {
                Globals.emitter.Call("startSubmitTime", { timer: msg.timer, plId: msg.plid });
            }




            // this.resultMessage(data);

        } else if (msg.t == "lostpoints") {

            const data = {
                plId: msg.plId,
                result: "Lost",
                score: msg.lostpoints,
                amount: msg.amt,
                cards: msg.cards
            }

            console.log("Adding to tempWinData " + JSON.stringify(data));
            gameData.tempWinData[data.plId] = data;


            if (data.plId == gameData.plId) {
                Globals.emitter.Call("loadEndScene", {});
            } else if (gameData.hasEndSceneLoaded) {
                Globals.emitter.Call("wonData", data);
            }

        } else if (msg.t == "plDropped") {
            const data = {
                plId: msg.plId,
                result: "Dropped",
                score: msg.lostpoints,
                amount: msg.amt,
                cards: msg.cards
            }

            // gameData.tempWinData.push(data);
            gameData.tempWinData[data.plId] = data;


            if (gameData.hasEndSceneLoaded) {
                Globals.emitter.Call("wonData", data);
            } else {
                Globals.emitter.Call("plDropped", data);
            }


        } else if (msg.t == "resultMsg") {

            gameData.winData = msg.result;
            // Globals.scene.start(new GameEndScene());

            setTimeout(() => {
                Globals.emitter.Call("result");
            }, 500);

            // Globals.emitter.Call("result");
            // "Show Result in Game End Scene"
        } else if (msg.t == "waitTimer") {
            Globals.emitter.Call("waitTimer", { data: msg.data });
        } else if (msg.t == "THREESKIPS") {

            gameData.leaveState = LEAVESTATE.THREESKIPS;
            this.socket.close();

            // Globals.scene.start(new FinalScene());
        } else if (msg.t == "pLeft") {

            if (gameData.hasGameStarted) {
                Globals.emitter.Call("playerLeft", { id: msg.data, state: msg.state });
            } else {
                Globals.emitter.Call("playerLeftInMatchmaking", { id: msg.data });
            }

        } else if (msg.t == "cardDiscarded") {
            Globals.emitter.Call("cardDiscarded", { cardID: msg.cardId });
        } else if (msg.t == "canDiscard") {
            Globals.emitter.Call("canDiscard", { val: msg.data });
        } else if (msg.t == "pong") {

            clearTimeout(this.checkPingResponseTimeout);
            this.checkPingResponseTimeout = setTimeout(this.showReconnectScreen.bind(this), 5000);

            this.pingTimeout = setTimeout(() => {
                this.sendMessage({ t: "ping" });
            }, 1000);
        } else if (msg.t == "error") {
            gameData.errorMessage = msg.msg;
            gameData.leaveState = LEAVESTATE.ERROR;

            Globals.scene.start(new FinalScene(msg.msg, true));
        } else if (msg.t == "reconnectAgain") {
            // gameData
            gameData.leaveState = LEAVESTATE.INTERNETDISCONNECTION;
            this.socket.close();

            // this.showReconnectScreen();
        } else if (msg.t == "switchFailed") {
            Globals.emitter.Call("onSwitchFailed");
        } else if (msg.t == "switchSuccess") {
            gameData.leaveState = LEAVESTATE.SWITCHED;
            console.log(msg);
            Globals.emitter.Call("onSwitchSuccess", { tId: msg.oldTableGameId });
        } else if (msg.t == "restart") {
            gameData.leaveState = LEAVESTATE.RESTART;
            Globals.emitter.Call("restart", { tableId: msg.tableId });
        } else if (msg.t == "gId") {
            Globals.scene?.updateGameRoundId(msg.gId);
        }
    };



        this.socket.onclose = e => {
    clearInterval(this.pingTimeout);
    clearTimeout(this.checkPingResponseTimeout);




    if (e.wasClean) {

        console.log(`[close] Connection closed cleanly, code=${e.code} reason=${e.reason}`);
        console.log(e);
    } else {
        console.log(Globals.gameEndState);
        console.log(`[close] Connection Died : code=${e.code}`);
        //1006 : on connection offline server

    }

    // if(!Globals.scene.scene instanceof FinalScene)
    {

        console.log("CLOSE STATE : " + gameData.leaveState);

        if (Globals.gameEndState == GameEndStates.THREESKIPS) {
            clearTimeout(this.showReconnectSceneTimeout);
            setTimeout(() => {
                Globals.scene.start(new FinalScene("You skipped three times!\nGet back.", true, 2));
            }, 2000);
            Globals.gameEndState = GameEndStates.NONE;
        } else if (Globals.gameEndState == GameEndStates.ERROR) {
            clearTimeout(this.showReconnectSceneTimeout);
            Globals.scene.start(new FinalScene(Globals.errorMsg, Globals.errorCode == "Ez0004", 1));
        } else if (Globals.gameEndState == GameEndStates.DISCONNECTED) {
            console.log("disconnected")
        } else if (Globals.gameEndState == GameEndStates.FOCUS_OFF) {
            //Do Nothing
        } else if (Globals.gameEndState == GameEndStates.LEFT) {
            clearTimeout(this.showReconnectSceneTimeout);
            stopRestartProcess();
            Globals.scene.start(new FinalScene("You have left the game! Go back to lobby.", true, 2));
        } else if (Globals.gameEndState == GameEndStates.RESTARTING) {
            clearTimeout(this.showReconnectSceneTimeout);
            //Do Nothing
        }  else {
            // clearTimeout(this.showReconnectSceneTimeout);
            Globals.gameEndState = GameEndStates.DISCONNECTED
            console.log("Internet Disconnected!");
            Globals.scene.start(new ReconnectScene());
        }
    }



};

this.socket.onerror = e => {
    console.log(`[error] ${e.message}`);
};
    }

showReconnectScreen()
{

    console.log("SERVER CLOSSING");

    this.socket.close();

    Globals.scene.start(new ReconnectScene("Internet Disconnected!"));

    // this.pingTimeout = setTimeout(this.pingServer.bind(this), 2000);
}

pingServer() {
    this.showReconnectSceneTimeout = setTimeout(() => {
        Globals.gameEndState = GameEndStates.DISCONNECTED
        console.log("Internet Disconnected!");
        Globals.scene.start(new ReconnectScene());
    }, 5000);

    this.pingIntervalId = setTimeout(() => {
        this.sendMessage({t: "ping"});
    }, 1000);
}


sendMessage(msg) {
    console.log("Message Sent : " + JSON.stringify(msg));
    this.socket.send(JSON.stringify(msg));
}
}

