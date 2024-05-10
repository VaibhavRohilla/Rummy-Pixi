import * as PIXI from "pixi.js";
import { config } from "./appConfig";
import { BackgroundGraphic, BackgroundImage } from "./Background";
import { GameScene } from "./GameScene";
import { connectionData, gameData, Globals, LEAVESTATE, PLAYERSTATE, SUIT } from "./Globals";
import { Label } from "./LabelScore";
import { Socket } from "./Socket";
import { toTitleCase } from "./Utilities";

var testingCards = [
    [ "1-1","2-1","4-4"],
    [ "1-1","2-1"],
    [ "1-1","2-1"],
    [ "1-1","2-1","4-4"],            
    [ "1-1","2-1","4-4"],           
    [ "1-1","2-1"],

    [ "1-1","2-1","4-4"]            

];
export class GameEndScene
{
    
    constructor(hasResultData = false)
    {
        this.sceneName = "GameEndScene";
        {
            gameData.hasGameStarted = false;

        }

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

        // this.createWaitingScreen();

        this.createResultBoard();
        // this.closeResultBoard();
        // this.createWonModal();



        // this.addResultBox("Player 1", "Submiting", 0, 0, null, 0);

        // this.updateResultBox(0, "Win",80, 8, testingCards);

        
        // this.addResultBox("Player kjsgkjsdgkjskgjskdgjskgjskgj", "Won", 80, 12345, null);
        // this.addResultBox("Player ", "Won", 80, 12345, testingCards);
        // this.addResultBox("Player ", "Won", 80, 12345, testingCards);
        // this.addResultBox("Player ", "Won", 80, 12345, testingCards);
        // this.addResultBox("Player ", "Won", 80, 12345, testingCards);
        // this.addResultBox("Player ", "Won", 80, 12345, testingCards);

        this.isRestarted = false;


        if(hasResultData)
        {
            this.updateResultData();
        }
       
    }

    resize()
    {
        this.fullBg.resetGraphic(window.innerWidth, window.innerHeight);
        
        this.container.resetContainer();

        // this.background.resetGraphic(config.logicalWidth, config.logicalHeight);
    }

    recievedMessage(msgType, msgParams)
    {
        if(msgType == "gameStart")
        {
            console.log("GAME STARTED");
            Globals.scene.start(new GameScene(true, true));

        } else if (msgType == "waitTimer")
        {
            if(!this.isRestarted)
            {   
                this.isRestarted = true;

                gameData.leftList.forEach(leftId => {
                    console.log("Clearing Left Players : " + leftId);
                    delete gameData.players[leftId];
                });


                this.crossBtn.interactive = true;
                this.crossBtn.renderable = true;

            }
        

            {
                if(Object.keys(gameData.players).length == 1)
                    this.waitingResultBox.text = "Waiting for Others.. " + msgParams.data;
                else
                    this.waitingResultBox.text = "Game starting in.. " + msgParams.data;
            }
        } else if (msgType == "joined")
        {


        } else if (msgType == "playerJoined")
        {
            if(gameData.leftList.includes(msgParams.data.plId))
            gameData.leftList.splice(gameData.leftList.indexOf(msgParams.data.plId), 1);
        } else if (msgType == "playerLeftInMatchmaking")
        {
            delete gameData.players[msgParams.id]

        } else if(msgType == "wonData")
        {

            if(this.resultBoxes[msgParams.plId])
                this.updateResultBox(msgParams.plId, msgParams.result, msgParams.score, msgParams.amount, msgParams.cards);
            else
                this.addResultBox(gameData.players[msgParams.plId].pName, msgParams.result, msgParams.score, msgParams.amount, msgParams.cards, msgParams.plId);
            
        } else if (msgType == "result")
        {

            this.updateResultData();

        } else if (msgType == "restart")
        {
            
            //close old ws connection
            Globals.socket.socket.close();

            
            //create new ws connection

            const data = {
                address : Globals.socketAddr,
                tableGameId : msgParams.tableId
            }
            

            const requestPayload = {
                    playerId : connectionData.id,
                    entryFee : connectionData.entryFee,
                    tableTypeId : connectionData.tableTypeId,
                    name : connectionData.name,
            };

            console.log("RESTARTING GAME");
            setTimeout(() => {
                console.log("RESTART");
                Globals.socket.establishConnection(data, requestPayload);
            }, 6000);

        } 
    }

    updateResultData()
    {
        
        Object.values(this.resultBoxes).forEach(resultBox => {
            resultBox.destroy();
        });
        
        this.resultBoxes = {}


        gameData.winData.forEach(result => {
            this.addResultBox(result.name, toTitleCase(result.result), result.points, result.amount, result.cards, result.plId);
        });
    }

    createBackground()
    {
        this.background = new BackgroundImage(Globals.resources.background.texture);

        this.container.addChild(this.background);
    }

    createResultBoard()
    {

        this.resultBoxes = {};

        this.resultContainer = new PIXI.Container();

        this.container.addChild(this.resultContainer);

        const upHead = new PIXI.Sprite(Globals.resources.scoreWin.texture);
        this.resultContainer.addChild(upHead);

        
        
        this.crossBtn = new PIXI.Sprite(Globals.resources.closeBtn.texture);
        this.crossBtn.anchor.set(1, 0);
        this.crossBtn.x = config.logicalWidth - 10;
        this.crossBtn.y = 10;
        this.resultContainer.addChild(this.crossBtn);

        this.crossBtn.interactive = false;
        this.crossBtn.renderable = false;
        this.crossBtn.once("pointerdown", this.closeResultBoard.bind(this));

        this.resultHeader = new PIXI.Sprite(Globals.resources.resultHeader.texture);
        this.resultHeader.y = upHead.height + 30;
        this.resultHeader.x = 100;
        this.resultContainer.addChild(this.resultHeader);


        this.waitingResultBox = new Label(config.logicalWidth/2, upHead.y + upHead.height/2, 0.5, "Score Window", 64, 0x78d0e0, "BarlowBold");
        this.waitingResultBox.style.fontWeight = "Bold";
        this.resultContainer.addChild(this.waitingResultBox);

        Object.values(gameData.players).forEach(playerData => {
            
            if(playerData.pState != PLAYERSTATE.WAITING)
            {
                if(gameData.tempWinData[playerData.plId])
                    this.addResultBox(playerData.pName, gameData.tempWinData[playerData.plId].result, gameData.tempWinData[playerData.plId].score, gameData.tempWinData[playerData.plId].amount, gameData.tempWinData[playerData.plId].cards, playerData.plId);
                else
                    this.addResultBox(playerData.pName, "Submitting", 0, 0, undefined, playerData.plId);
            }
        });

        // gameData.tempWinData.forEach((data) => {
        // });
    }




    closeResultBoard()
    {
        this.crossBtn.interactive = false;
        this.resultContainer.destroy();

        Globals.scene.start(new GameScene(true));
    }

    addResultBox(playerName, result, score, amount, cards, plId)
    {

        const resultBox = new PIXI.Sprite(Globals.resources.resultBox.texture);
        resultBox.anchor.set(0.5, 0);
        resultBox.x = config.logicalWidth/2;
        resultBox.y = 225 + (Object.keys(this.resultBoxes).length) * resultBox.height * 1.08;
        this.resultContainer.addChild(resultBox);

        this.resultBoxes[plId] = resultBox;

        let nameStr = playerName;
        if(nameStr.length > 10)
        {
            nameStr = nameStr.substring(0, 7);
            nameStr = nameStr.trim();
            nameStr += "..."
        }

        const name = new Label(0, 0, 0, nameStr, 32, 0xffffff);
        name.x -= resultBox.width/2 - 20;
        name.y += 20;
        resultBox.addChild(name);


        const colorData = {
            "Win" : 0x36fd02,
            "Lost" : 0xf08b05,
            "Dropped" : 0xf84342,
            "Submiting" : 0xE6D47C
        }

        resultBox.resultText = new Label(0, 0, 0, result, 32, colorData[result]);
        resultBox.resultText.anchor.set(0.5, 0);
        resultBox.resultText.x -= resultBox.width/4 - 130;
        resultBox.resultText.y += 20;
        resultBox.addChild(resultBox.resultText);



        resultBox.scoreText = new Label(0, 0, 0, score, 32, 0xffffff);
        resultBox.scoreText.x += 70;
        resultBox.scoreText.y += 20;
        resultBox.addChild(resultBox.scoreText);

        resultBox.amountText = new Label(0, 0, 0, amount, 32, 0xffffff);
        resultBox.amountText.x += 320;
        resultBox.amountText.y += 20;
        resultBox.addChild(resultBox.amountText);


        if(cards)
            this.addCards(cards, resultBox);
        else
        {
            // this.addWaitText();
            const str = playerName + " is submitting cards.";
            resultBox.submitWaitText = new Label(0, 150, 0.5,str , 64 * 27/str.length , 0xE6D47C, "BarlowBold");

            resultBox.addChild(resultBox.submitWaitText);
        }


    }


    addCards(cards, resultBox)
    {

        if(resultBox.submitWaitText)
            resultBox.submitWaitText.destroy();

        let x =0// -resultBox.width/2 + 100;
        const y = 0;

        const cardsContainer = new PIXI.Container();

        if(cards == null)
        {
            const emptySlot = new PIXI.Sprite(Globals.resources.emptyDeck.texture);
            emptySlot.x = x;
            emptySlot.y = y;

            resultBox.addChild(emptySlot);
        } else
        {

            for(let i = 0; i < cards.length; i++)
            {
                const subCards = cards[i];

                if(Array.isArray(subCards))
                {
                    for(let j = 0; j < subCards.length; j++)
                    {
                        const card = new PIXI.Sprite(Globals.resources[SUIT.Convert(subCards[j])].texture);
                        card.scale.set(0.6);
                        card.anchor.set(0, 0.5);
                        card.x = x;
                        card.y = y;
                        x += (card.width/3);
                        cardsContainer.addChild(card);
                    }
                    x += 100;
                } else
                {
                    const card = new PIXI.Sprite(Globals.resources[SUIT.Convert(subCards)].texture);
                    card.scale.set(0.6);
                    card.anchor.set(0, 0.5);
                    card.x = x;
                    card.y = y;
                    x += (card.width/3);
                    cardsContainer.addChild(card);
                }
                

                
            }
        }
        const compareWidth = resultBox.width - 100;

        cardsContainer.x = -resultBox.width/2 + 50;
        cardsContainer.y = 170;


        if(cardsContainer.width > compareWidth)
        {
            cardsContainer.scale.set(compareWidth/cardsContainer.width);
        } 
        
        cardsContainer.x += (compareWidth - cardsContainer.width)/2;

        resultBox.addChild(cardsContainer);
    }

    updateResultBox(plId, result, score, amount, cards)
    {

        const resultBox = this.resultBoxes[plId];
        

        const colorData = {
            "Win" : 0x36fd02,
            "Lost" : 0xf08b05,
            "Dropped" : 0xf84342,
            "Submiting" : 0xE6D47C
        }

        resultBox.resultText.text = result;
        resultBox.resultText.style.fill = colorData[result];

        resultBox.scoreText.text = score;

        resultBox.amountText.text = amount;

        this.addCards(cards, resultBox)
    }


}