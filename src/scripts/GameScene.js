import * as PIXI from 'pixi.js';
import { config } from './appConfig';
import { BackgroundGraphic, BackgroundImage } from './Background';
import { Card } from './card';
import { DebugCircle } from './DebugCircle';
import { gameData, gameProperties, GAMESTATE, Globals, LEAVESTATE, PlayerPositions, PLAYERSTATE, sceneGlobals, SUIT, tossCardPositions } from './Globals';
import { Label } from './LabelScore';
import { SetOfCards } from './setOfCards';
import { clamp, fetchGlobalPosition, GetMagnitude, getMousePosition, RemoveArrayItem, SubtractVector } from './Utilities';
import * as TWEEN from "@tweenjs/tween.js";
import { Player } from './Player';
import { InGameMessage } from './inGameMessage';
import { Prompt, PromptResponseType } from './prompt';
import { FinalScene } from './FinalScene';
import { GameEndScene } from './GameEndScene';
import { MainScene } from './MainScene';
import { DebugText } from './DebugText';
import { SwitchScene } from './SwitchScene';


export class GameScene
{
    constructor(initPlayers = false, startAuto = false, reconnect = false, aData = undefined)
    {
        
        this.sceneName = "GameScene";

        {//data reset
            
            if(!reconnect)
            {
                gameData.reset();
               
                    if(Object.keys(gameData.players).length > 0)
                    {
                        Object.values(gameData.players).forEach(player => {
                            player.pState = PLAYERSTATE.INGAME;
                         });
                    }
            }
            else
            {
                if(Object.keys(gameData.players).length > 0)
                {
                    for(let i=0; i < gameData.players; i++)
                    {
                        if(gameData.players[i].pState != PLAYERSTATE.WAITING)
                        {
                            player.pState = PLAYERSTATE.INGAME;
                        }
                    }
                }
            }


            // gameData.pushTempData();
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

        this.showMessage("Waiting for others...");
        
        this.addLeaveButton();
        this.addScoreData();
        this.addSwitchBtn();
        


//#region TESTING CODE
        // this.addPlayers();

        // this.scoreLabel.toggleRendering(true);
        // this.addLivesData()
        // this.updateLives(3);

        // this.cardsInitialization();
        // this.onGameStart();

        // this.createSortButton();

        // this.switchBtn.toggleRendering(true);
//#endregion
    



        if(initPlayers)
        {
            this.addPlayers();
        }

        if(startAuto)
            this.onGameStart();

        if(reconnect)
        {
            this.addPlayers();

            this.cardsInitialization(true);
            this.onGameStart(true, aData);

            if( gameData.players[gameData.plId].pState != PLAYERSTATE.DROPPED && this.cardsInHand.allCards.length == 14)
            {
                this.isCardPicked = true;

            } 
        }


            

    }


    onGameStart(isRejoined = false, aData = undefined)
    {





        
        gameData.hasGameStarted = true;
        this.leaveButton.toggleRendering(true);
        
        if(!isRejoined)
            this.showMessage("Toss in process");
        // this.addPlayers();
      
      

        
        if(gameData.players[gameData.plId].pState != PLAYERSTATE.WAITING && gameData.players[gameData.plId].pState != PLAYERSTATE.DROPPED)
        {
            this.switchBtn.toggleRendering(false);
            this.scoreLabel.toggleRendering(true);1
            this.addLivesData();
            this.updateLives(gameData.lives);
        }

        this.createGroupButton();
        this.createDiscardButton();
        this.createDeclareButton();
        this.CreateSubmitButton();
        this.createFinishButton();



        if(isRejoined)
        {
            switch(gameData.gameState)
            {
                case GAMESTATE.FINISHING:
                        this.players[gameData.plId].init();
                        this.enableFinishGame(aData.plId, aData.timeLeft);
                    break;
                case GAMESTATE.SUBMITING:
                        // add validDeclare data to tempWinData


                        this.players[gameData.plId].init();

                        aData.submitCards.forEach(element => {
                            if(element)
                            {
                                gameData.tempWinData[element.plId] = element;
                            }
                               
                        });

                        if(this.finishInterval)
                            clearTimeout(this.finishInterval);
                        
                        if(this.waitInterval)
                            clearTimeout(this.waitInterval);
                        
                        if(aData.plId == gameData.plId || gameData.hasSubmit)
                        {
                            // gameData.hasEndSceneLoaded = true;
                            // Globals.scene.start(new GameEndScene());
                        }
                        else
                        {
                            this.players[aData.plId].declared();
                            
                            if(aData.timeLeft > 30)
                            {
                                gameData.finishTimeLeft = 30;
                                gameData.secTimer = aData.timeLeft - 30;
                            } else
                            {
                                gameData.finishTimeLeft = aData.timeLeft;
                                gameData.secTimer = 0;
                            }

                            this.toggleSubmitMode();
                        } 
                        
                    break;
                case GAMESTATE.RESULT:
                        // if(aData)
                        // {
                        //     gameData.winData = aData;
                        //     gameData.hasEndSceneLoaded = true;
                        //     Globals.scene.start(new GameEndScene(true));
                        // } else
                        // {
                        //     gameData.hasEndSceneLoaded = true;
                        //     Globals.scene.start(new GameEndScene());
                        // }
                    break;
                case GAMESTATE.RESTARTING:
                        // gameData.winData = aData;
                        // gameData.hasEndSceneLoaded = true;
                        // Globals.scene.start(new GameEndScene(true));
                    break;
                case GAMESTATE.INGAME:
                        this.turnChange();
                    break;
            }
        }



    }

    onDestroyCalls()
    {
        if(this.waitInterval)
            clearTimeout(this.waitInterval);
        
        if(this.finishInterval)
            clearTimeout(this.finishInterval);
    }
    

    recievedMessage(msgType, msgParams)
    {

        if(msgType == "pointerUp")
        {
            
            if(this.cardsInHand)
            {
                
                this.cardsInHand.allCards.forEach(card => {
                    card.dragEnd();
                });
            }

        }
        
        if(msgType == "gameStart")
        {
            console.log("GAME STARTED");

            if(msgParams.changedPls.length > 0)
            {
                for(let i = 0; i < msgParams.changedPls.length; i++)
                {
                    const plId = msgParams.changedPls[i];

                    this.players[plId].removeState();
                }
            }

            this.onGameStart();

        } else if(msgType == "waitTimer")
        {
            let btnState = true;

            if(msgParams.data >= 3 && !this.leaveButton.renderable)
            {
                this.leaveButton.toggleRendering(true);
            }

            if(Object.keys(gameData.players).length == 1)
            {
                this.message.textUpdate("Waiting for others... " + msgParams.data);
            }
            else
            {
                this.message.textUpdate("Game starting in... " + msgParams.data);
                
                if(msgParams.data < 3 && this.leaveButton.renderable)
                {
                    this.leaveButton.toggleRendering(false);
                }

                if(msgParams.data <= 3)
                {
					btnState = false;
                }
            }

            if(this.switchBtn.renderable != btnState)
            {
                if(!btnState && gameData.players[gameData.plId].pState == PLAYERSTATE.WAITING)
                {
                    console.log("TOGGLE WAITING");
                } else
                    this.switchBtn.toggleRendering(btnState);
            }

            
        } else if(msgType == "joined")
        {

			// this.tempPlId = msgParams.plId;
            // console.log("")

            this.addPlayers();




            if(msgParams.gameStarted)
            {

                if(gameData.players[gameData.plId].pState == PLAYERSTATE.WAITING)
                {
                    this.switchBtn.toggleRendering(true);
                }

                gameData.hasGameStarted = true;
                this.showMessage("Game in progress");


                if( gameData.gameState != GAMESTATE.RESULT &&  gameData.gameState != GAMESTATE.RESTARTING)
                    this.waitingCardsInit();
            }
            //Add All PLayers

        } else if(msgType == "rejoined")
        {


            
            // gameData.lef
            this.addPlayers();
            this.cardsInitialization(true);

            this.onGameStart(true, msgParams.aData);

            if(this.cardsInHand.allCards.length == 14)
            {
                this.isCardPicked = true;

            } 

            // this.updateLives(gameData.lives);

        } else if(msgType == "playerJoined")
        {

            if(msgParams.exits)
            {
                this.players[msgParams.data.plId].delete();
                delete this.players[msgParams.data.plId];
            }


            if(gameData.leftList.includes(msgParams.data.plId))
                gameData.leftList.splice(gameData.leftList.indexOf(msgParams.data.plId), 1);

            this.addPlayer(msgParams.data);
            logThis("On Joined Player added :" + msgParams.data.pName, "#FF79C6");

            // if(msgParams.gameStarted)
            // {
            //     this.players[msgParams.data.plId].dropped();
            // }


        } else if(msgType == "playerRejoined")
        {

            this.players[msgParams.data.plId].delete();
            delete this.players[msgParams.data.plId];
            
            this.addPlayer(msgParams.data);

            if(gameData.leftList.includes(msgParams.data.plId))
                gameData.leftList.splice(gameData.leftList.indexOf(msgParams.data.plId), 1);

            this.players[msgParams.data.plId].init();
            
            this.players[msgParams.data.plId].turnActivate(msgParams.data.plId == gameData.currentTurn);
            this.players[msgParams.data.plId].mainTimer.text.text = "00"

        } else if(msgType == "playerLeftInMatchmaking")
        {
            if(this.players[msgParams.id])
            {
                this.players[msgParams.id].delete();

                delete this.players[msgParams.id];
            }

            delete gameData.players[msgParams.id];
        } else if(msgType == "addPlayerCards")
        {
           
            setTimeout(() => {
                this.cardsInitialization();
            }, 1500);
           
        } else if(msgType == "addCardsData")
        {
            setTimeout(() => {
                this.waitingCardsInit();
            }, 1500);
        } else if (msgType == "showTossResult")
        {

            Object.keys(msgParams.cards).forEach(plId => {
                
                Globals.soundResources.cardDiscard.play();
                let cardId = msgParams.cards[plId];

                if(cardId == 0)
                    cardId = "JOKER";
                else
                    cardId = cardId + "-S";

                if(gameData.players[plId] && gameData.players[plId].pState == PLAYERSTATE.INGAME)
                    this.players[plId]?.showTossCard(cardId);

            });

            this.showMessage(gameData.players[msgParams.win].pName + " won the toss\nand will play first");
            gameData.currentTurn = msgParams.win;
        } else if(msgType == "cardPick")
        {
            
            Globals.soundResources.cardPick.play();

            if(gameData.currentTurn == gameData.plId)
            {
                this.isCardPicked = true;
                // this.pickedCard = msgParams.card;
                if(this.isOpenCardPicked)
                    this.pickCardFromOpen(msgParams.card);
                else
                    this.pickCardFromCenterDeck(msgParams.card);
            }

        } else if (msgType == "timer")
        {

            // if(gameData.currentTurn == -1)
                gameData.currentTurn = msgParams.playerTurn;
            if(!this.hasStarted)
            {
                console.log("Game STARTED!");
                this.hasStarted = true;



                if(gameData.players[gameData.plId].pState == PLAYERSTATE.WAITING)
                {
                    this.showMessage("Game in progress");
                } else
                    this.removeMessage();

                Object.values(this.players).forEach(player => {
                    player.init();
                });
                this.turnChange();
            }


            
            
            this.players[msgParams.playerTurn].mainTimer.text.text = msgParams.data; 


            this.players[msgParams.playerTurn].secondaryTimer.text.text = msgParams.extraTime;


            // if(msgParams.data + msgParams.extraTime < 4)
            // {
            //     this.players[msgParams.playerTurn].mainTimer.text
            //     this.players[msgParams.playerTurn].secondaryTimer.text
            // }


            if(msgParams.data == 0)
            {
                

                this.players[msgParams.playerTurn].updateTimer(1 - (msgParams.extraTime/90), (msgParams.extraTime < gameData.tickTimer));
            } else
            {
                this.players[msgParams.playerTurn].updateTimer(1 - (msgParams.data/30), ((msgParams.data  < gameData.tickTimer)));
            }






        } else if (msgType == "turnChanged")
        {

            if(msgParams.plId == gameData.plId)
            {
                this.updateLives(gameData.lives);   
            }

            if(msgParams.card)
            {
                if(msgParams.plId == gameData.plId)
                {
                    this.addCardToOpen();
                    this.turnChange();
                } else
                {
                    const playerPos = this.players[msgParams.plId].avatarContainer.position.clone();
                    
                    Globals.soundResources.cardDiscard.play();
                    this.tweenCard(SUIT.Convert(gameData.openCard), playerPos, this.cardPlace.position.clone(), () => {
                        this.addCardToOpen();
                        this.turnChange();
                    }, 0.250);
                }

                this.addCardToOpen();
            } else
            {
                this.turnChange();
            }

        } else if (msgType == "nextPlayerTurnMsg")
        {   

            if(gameData.currentTurn == -1)
            {
                gameData.currentTurn = msgParams.turnId;
                this.addCardToOpen();
                this.turnChange();
            }

            if(gameData.currentTurn == gameData.plId)
            {
                gameData.currentTurn = msgParams.turnId;
                this.addCardToOpen();
                this.turnChange(); 
            } else
            {

                const playerPos = this.players[gameData.currentTurn].avatarContainer.position.clone();
                gameData.currentTurn = msgParams.turnId;
                
                    Globals.soundResources.cardDiscard.play();
                    this.tweenCard(SUIT.Convert(gameData.openCard), playerPos, this.cardPlace.position.clone(), () => {
                    this.addCardToOpen();
                    this.turnChange();
                }, 0.250);
            }


        } else if (msgType == "cardSeqRecieved")
        {
            const sets = this.getCardsInHandSets();

            const UidInValidSeqAr = [...gameData.sequencesArr.pure, ...gameData.sequencesArr.impure];

            let currentUids =[]
            for(let i =0; i < sets.length; i++)
            {
                currentUids.push(sets[i].uid);
            }

            //removing extra invalid uids from the pure and impure sequences
            for(let i =0; i < UidInValidSeqAr.length; i++)
            {
                if(!currentUids.includes(UidInValidSeqAr[i]))
                {
                    //removes from if present in any of these
                    RemoveArrayItem(gameData.sequencesArr.pure,UidInValidSeqAr[i])
                    RemoveArrayItem(gameData.sequencesArr.impure,UidInValidSeqAr[i])
                }
            }

            

            const filteredArr = sets.filter(item => JSON.stringify(item.cardsIdArray)==JSON.stringify(msgParams.cards));

            if(filteredArr.length == 1)
            {
                filteredArr[0].setSequenceInfo(msgParams.seqType);
            }

            this.cardsInHand.refreshSetsInfo();

            this.scoreLabel.text = this.cardsInHand.calculateCurrentScore();

        } else if(msgType == "startSubmitTime")
        {

            this.players[msgParams.plId].declared();

            if(gameData.isDropped)
            {
                gameData.hasEndSceneLoaded = true;
                Globals.scene.start(new GameEndScene());
            } else
            {
                if(this.finishInterval)
                clearTimeout(this.finishInterval);
            
                if(this.waitInterval)
                    clearTimeout(this.waitInterval);

                
                
                

                gameData.finishTimeLeft = 30;
                gameData.secTimer = msgParams.timer - 30;
                this.toggleSubmitMode();
            }



        } else if (msgType == "gameFinish")
        {

            this.addCardToOpen();
            if(gameData.isDropped)
                return;
            
            this.enableFinishGame(msgParams.plId, msgParams.timeLeft);

            
            // if(msgParams.plId == gameData.plId)
            // else
            //     this.toggleSubmitMode();
        } else if(msgType == "cardDiscarded")
        {

            this.isCardPicked = false;
            this.interactiveDiscardButtons(false);
            this.activateDiscardButtons(false);

            if(this.selectedCards.length > 0)
            {
                for(let i = 0; i < this.selectedCards.length; i++)
                {
                    this.selectedCards[i].unSelect();
                }
                
                this.selectedCards = [];
            }
            
            this.pickedCard = undefined;
            

            const card = this.cardsInHand.getCardById(msgParams.cardID);
            console.log(card);
            console.log("Discarded Card");
            const position = card.visual.position.clone();
            position.y += this.cardsInHand.container.y;

            Globals.soundResources.cardDiscard.play();
            
            card.removeFromSource(true);
    
            card.destroyVisual();
            
    
            this.selectedCards = [];
    
            this.tweenCard(SUIT.Convert(msgParams.cardID), position, this.cardPlace.position);
    
            this.cardsInHand.positionCardsInRow();
            
            this.interactiveDiscardButtons(false);
            this.activateDiscardButtons(false);


        } else if(msgType == "canDiscard")
        {
            if(msgParams.val == false)
            {
                this.isCardPicked = false;
                this.interactiveDiscardButtons(false);
                this.activateDiscardButtons(false);
            }
        } else if (msgType == "CardPickedByOtherPlayer")
        {
            if(msgParams.type == "close")
            {

                Globals.soundResources.cardPick.play();

                const card = new PIXI.Sprite(Globals.resources.cardBack.texture);

                this.container.addChild(card);

                card.x = this.centerDeck.x;
                card.y = this.centerDeck.y;

                var endPos = this.players[msgParams.plId].avatarContainer.position;
                const tween = new TWEEN.Tween(card)
                .to({x : endPos.x, y : endPos.y})
                .duration(250)
                .onComplete(() => {
                    setTimeout(() => {
                        card.destroy();

                    }, 0.500);
                })
                // .onComplete(card.destroy())
                .start();
            } else if(msgParams.type == "open")
            {
                Globals.soundResources.cardPick.play();

                const card = new PIXI.Sprite(Globals.resources.cardBack.texture);
                
                this.openCard.destroy();
                this.openCard = null;

                this.container.addChild(card);

                card.x = this.cardPlace.x;
                card.y = this.cardPlace.y;

                var endPos = this.players[msgParams.plId].avatarContainer.position;
        
                const tween = new TWEEN.Tween(card)
                .to({x : endPos.x, y : endPos.y})
                .duration(250)
                .onComplete(() => {
                    setTimeout(() => {
                        card.destroy();

                    }, 0.500);
                })
                .start();
            }
        } else if(msgType == "invalidDeclare")
        {
            // this.prompt.destroy();
            if(this.finishInterval)
                clearTimeout(this.finishInterval);
            
            if(this.waitInterval)
                clearTimeout(this.waitInterval);

            this.removeMessage();

            this.players[msgParams.plId].turnActivate(false);
            this.players[msgParams.plId].dropped();
            this.players[msgParams.plId].mainTimer.text.text = "--";
            this.players[msgParams.plId].secondaryTimer.text.text = "--";


            if(msgParams.plId == gameData.plId)
            {
                gameData.isDropped = true;
                this.cardsInHand.container.destroy();
                this.cardsInHand = null;
                
                this.prompt = new Prompt("Invalid Declare, You're out!", PromptResponseType.CLOSE);

                this.prompt.container.on("removed", () => {
                    this.prompt = undefined;
                });
        
                this.sceneContainer.addChild(this.prompt.container);
            }


        } else if(msgType == "plDropped")
        {
            if(this.finishInterval)
                clearTimeout(this.finishInterval);
        
            if(this.waitInterval)
                clearTimeout(this.waitInterval);

            this.players[msgParams.plId].turnActivate(false);
            this.players[msgParams.plId].dropped();
            this.players[msgParams.plId].mainTimer.text.text = "--";
            this.players[msgParams.plId].secondaryTimer.text.text = "--";


            if(msgParams.plId == gameData.plId)
            {
                gameData.isDropped = true;
                this.cardsInHand.container.destroy();
                this.cardsInHand = null;
                this.sortButton.destroy();

                this.scoreLabel.toggleRendering(false);
            }
        } else if(msgType == "loadEndScene")
        {
            
            if(this.finishInterval)
                clearTimeout(this.finishInterval);
            
            if(this.waitInterval)
                clearTimeout(this.waitInterval);

            gameData.hasEndSceneLoaded = true;
            Globals.scene.start(new GameEndScene());            
        } else if(msgType == "potUpdate")
        {
            this.addTotalBid();
            this.players[msgParams.plId].updateBalance(gameData.players[msgParams.plId].pBal);
        } else if(msgType == "playerLeft")
        {
            if(gameData.players[msgParams.id].pState == PLAYERSTATE.WAITING)
            {
                delete gameData.players[msgParams.id];

                this.players[msgParams.id].delete();

                delete this.players[msgParams.id];
            } else if(this.players[msgParams.id])
            {

                this.players[msgParams.id].destroy(msgParams.state == PLAYERSTATE.LEFT  || msgParams.state !=PLAYERSTATE.INGAME);

                if(!gameData.leftList.includes(msgParams.id))
                    gameData.leftList.push(msgParams.id);

                // if(msgParams.state == PLAYERSTATE.PERMALEFT)
                // {
                //     // delete gameData.players[msgParams.id];
                // }

                // delete this.players[msgParams.id];
            }
        } else if (msgType == "onSwitchFailed")
        {
            if(this.switchBtn && !gameData.hasGameStarted)
            {
                this.switchBtn.toggleClickState(true);
            }
        } else if (msgType == "onSwitchSuccess")
        {

            logThis("onSwitchSuccess");
            logThis(JSON.stringify(msgParams));
            Globals.scene.start(new SwitchScene(msgParams.tId));
        }
    }

    resize()
    {

        this.fullBg.resetGraphic(window.innerWidth, window.innerHeight);
        
        this.container.resetContainer();

        if(this.leaveButton)
            this.leaveButton.scale.set(config.minScaleFactor);

        if(this.switchBtn)
            this.switchBtn.resizeBtn();

        if(this.prompt)
            this.prompt.resizeContainer();

        // this.background.resetGraphic(config.logicalWidth, config.logicalHeight);
    }


    cardsInitialization(isRejoin = false)
    {
        this.removeMessage();
        Object.values(this.players).forEach(player => {
            player.removeTossCard();
        });
        
        if(gameData.players[gameData.plId].pState != PLAYERSTATE.DROPPED)
        {
            this.initRow();
            this.addJokerCard();
        }
        this.addCenterDeck();
        this.addCardToOpen();
        // this.addTotalBid();

        if(!isRejoin)
            this.createSortButton();
        else
        {
            if(gameData.cards.length == 13 && gameData.players[gameData.plId].pState != PLAYERSTATE.DROPPED)
                this.createSortButton();


                if(gameData.potData != undefined && gameData.potData > 0)
                {
                    this.addTotalBid();
                }

        }
        
        this.addDropButton();
    }

    waitingCardsInit()
    {
        if(gameData.jokerCard != undefined)
        {

            Object.values(this.players).forEach(player => {
                if(gameData.players[player.plId].pState == PLAYERSTATE.INGAME)
                    player.removeTossCard();
            });

            this.addJokerCard();
            this.addCenterDeck();
            this.addCardToOpen();

            if(gameData.potData != undefined && gameData.potData > 0)
            {
                this.addTotalBid();
            }
        }

        
    }


    createBackground()
    {
        this.background = new BackgroundImage(Globals.resources.background.texture);

        this.container.addChild(this.background);
        
    }

    initRow(count)
    {
        this.cardsInHand = new CardsInHand();
        this.container.addChild(this.cardsInHand.container);

        this.createCards(count);

        this.scoreLabel.text = this.cardsInHand.calculateCurrentScore();
    }

    turnChange()
    {

        // this.centerTableMsg.text = "Turn Changed " + gameData.currentTurn;


        Object.values(gameData.players).forEach(player => {
            this.players[player.plId].turnActivate(player.plId == gameData.currentTurn);
            this.players[player.plId].mainTimer.text.text = "00"
        });

        if(gameData.currentTurn == gameData.plId)
        {
            Globals.soundResources.turnChange.play();

            if(this.cardsInHand.allCards.length  < 14)
            {
                this.centerDeck.interactive = true;
                this.openCard.interactive = true;
                this.dropButton.interactive = true;
                this.dropButton.renderable = true;
            }

        } else
        {

            if(!gameData.isDropped)
                this.turnDecativate();
        }

        // setTimeout(() => {
        //     this.centerTableMsg = "";
        // }, 2000);
        
    }

    turnDecativate()
    {
        this.pickedCard = undefined;
        // this.players[gameData.plId].turnActivate(false);
        this.isCardPicked = false;
        this.centerDeck.interactive = false;
        this.interactiveDiscardButtons(false);
        this.activateDiscardButtons(false);

        this.dropButton.interactive = false;
        this.dropButton.renderable = false;

        if(this.openCard != null)
            this.openCard.interactive = false;
    }

    enableTimeUpdateMessage()
    {

        if(gameData.finishTimeLeft > 0)
            gameData.finishTimeLeft--;
        else
            gameData.secTimer--;


        // const text = (this.isDeclareMode ? "Declare your Cards" : "Submit your Cards");
        // this.centerTableMsg.text =  text;


        this.players[gameData.plId].mainTimer.text.text = gameData.finishTimeLeft;
        this.players[gameData.plId].secondaryTimer.text.text = gameData.secTimer-1;


        if(gameData.finishTimeLeft == 0)
        {
            this.players[gameData.plId].updateTimer(1 - (gameData.secTimer/90), (gameData.secTimer < gameData.tickTimer));
        } else
        {
            this.players[gameData.plId].updateTimer(1 - (gameData.finishTimeLeft/30), (gameData.finishTimeLeft  < gameData.tickTimer));
        }

        if(gameData.finishTimeLeft == 0 && gameData.secTimer <= 1)
        {
            this.declareButton.interactive = false;
            this.submitButton.interactive = false;
            

            if(this.isDeclareMode)
                this.declareGame();
            else
                this.submitGame();

            clearTimeout(this.finishInterval);
        } else
        {
            this.finishInterval = setTimeout(() => {
                this.enableTimeUpdateMessage();
            }, 1000);
        }
    }

    enableWaitTimeMessage()
    {

        if(gameData.finishedPlayer.finishTimeLeft > 0)
            gameData.finishedPlayer.finishTimeLeft--;
        else
            gameData.finishedPlayer.secTimer--;


        // const text = (this.isDeclareMode ? "Declare your Cards" : "Submit your Cards");
        // this.centerTableMsg.text =  text;


        this.players[gameData.finishedPlayer.plId].mainTimer.text.text = gameData.finishedPlayer.finishTimeLeft;
        this.players[gameData.finishedPlayer.plId].secondaryTimer.text.text = gameData.finishedPlayer.secTimer-1;


        if(gameData.finishedPlayer == 0)
        {
            this.players[gameData.finishedPlayer.plId].updateTimer(1 - (gameData.finishedPlayer.secTimer/90), (gameData.finishedPlayer.secTimer < gameData.tickTimer));
        } else
        {
            this.players[gameData.finishedPlayer.plId].updateTimer(1 - (gameData.finishedPlayer.finishTimeLeft/30), (gameData.finishedPlayer  < gameData.tickTimer));
        }

        if(gameData.finishedPlayer.secTimer <= 1)
        {
            clearTimeout(this.waitInterval);
        } else
        {
            this.waitInterval = setTimeout(() => {
                this.enableWaitTimeMessage();
            }, 1000);
        }
    }

    toggleDeclareMode()
    {

        this.turnDecativate();


        this.addPrompt("Please group your cards\nbefore declare");

        this.players[gameData.plId].mainTimer.text.text = "00";
        this.players[gameData.plId].secondaryTimer.text.text = "00";
        this.isDeclareMode = true;
        this.finishInterval = setTimeout(() => {
            this.enableTimeUpdateMessage();
        }, 1000);


        // this.groupButton.text.x = -this.groupButton.width/2;
        // this.groupButton.anchor.set(1, 0.5);
        // this.groupButton.x = config.logicalWidth - this.groupButton.width - 40;

        this.declareButton.interactive = true;
        this.declareButton.renderable = true;
        

    }

    toggleSubmitMode()
    {
        this.turnDecativate();

        this.addPrompt("Please group your cards\nbefore submit");


        for(let i=0; i < Object.values(this.players).length; i++)
        {
            const player = Object.values(this.players)[i];

            player.turnActivate(false);
            player.mainTimer.text.text = "--";
            player.secondaryTimer.text.text = "--";

        }



        this.isDeclareMode = false;
        this.players[gameData.plId].turnActivate(true);
        this.players[gameData.plId].mainTimer.text.text = "00";
        this.players[gameData.plId].secondaryTimer.text.text = "00";
        this.finishInterval = setTimeout(() => {
            this.enableTimeUpdateMessage();
        }, 1000);


        // this.groupButton.text.x = -this.groupButton.width/2;
        // this.groupButton.anchor.set(1, 0.5);
        // this.groupButton.x = config.logicalWidth - this.groupButton.width - 40;

        this.submitButton.interactive = true;
        this.submitButton.renderable = true;
    }

    toggleWaitMode(name)
    {
        this.turnDecativate();


        this.addPrompt(name + " has finished game\nPlease group your cards");



        this.isDeclareMode = false;


        this.players[gameData.finishedPlayer.plId].mainTimer.text.text = "00";
        this.players[gameData.finishedPlayer.plId].secondaryTimer.text.text = "00";

        this.waitInterval = setTimeout(() => {
            this.enableWaitTimeMessage();
        }, 1000);
    }

    addPrompt(message)
    {

        this.showMessage(message);

        // this.prompt = new Prompt(message, false);
        // this.prompt.container.on("destroy", () => {
        //     this.prompt = undefined;
        // });
        // this.container.addChild(this.prompt.container);
    }

    enableFinishGame(plId, timeLeft)
    {
        this.players[plId].turnActivate(true);

            if(plId == gameData.plId)
            {
                if(timeLeft > 30)
                {
                    gameData.finishTimeLeft = 30;
                    gameData.secTimer = timeLeft - 30;                    
                } else
                {
                    gameData.finishTimeLeft = timeLeft;
                    gameData.secTimer = 0;
                }

                logThis("Assigned timer : " + 30 +  ", " + timeLeft - 30, "#DC6D36");
                this.toggleDeclareMode();
            } else
            {

                gameData.finishedPlayer = {
                    plId : plId,
                    finishTimeLeft : 30,
                    secTimer : timeLeft - 30
                }
                logThis("Wait Timer Assigned : " + 30 +  ", " + timeLeft - 30, "#DC6D36");

                this.toggleWaitMode(gameData.players[plId].pName);
            }
    }

    createCards(count)
    {
        this.selectedCards = [];
        this.cardsOver = [];

        // const mergeCards = [].concat.apply([], gameData.cards);

        // console.log(mergeCards);
        
        for(let i = 0; i < gameData.cards.length; i++ )
        {
                const card = undefined;
                if(Array.isArray(gameData.cards[i]))
                {
                    if(gameData.cards[i].length > 1)
                        this.createGroupOfCards(gameData.cards[i], (i < gameData.cards.length /2  - 1) ? 1 : 0);
                    else
                    {
                        card = this.addCard(gameData.cards[i][0]);
                        this.cardsInHand.addToAllCards(card);
                        this.cardsInHand.addCard(card, (i < gameData.cards.length /2  - 1) ? 1 : 0);
                    }

                } else
                {
                    console.log("ADDING CARD");

                    card = this.addCard(gameData.cards[i]);
                    this.cardsInHand.addToAllCards(card);
                    this.cardsInHand.addCard(card, (i < gameData.cards.length /2  - 1) ? 1 : 0);
                }

        }


        this.cardsInHand.positionCardsInRow();

        this.cardsInHand.sortCards();
        
    }

    createGroupOfCards(sequence, rowIndex)
    {

        const group = new SetOfCards();
        group.seqInfo.zIndex = 20;
        group.seqInfoText.zIndex = 21;
        this.cardsInHand.container.addChild(group.seqInfo);
        this.cardsInHand.container.addChild(group.seqInfoText);

        for(let i = 0; i < sequence.length; i++)
        {
            const card = this.addCard(sequence[i]);
            this.cardsInHand.addToAllCards(card);
            group.addCard(card);
        }

        this.cardsInHand.addCard(group, rowIndex);

        const payload = {
            t:"cardSeqCheckMsg",
            cards: group.cardsIdArray
        }

        if(Globals.socket != undefined)
        {
            Globals.socket.sendMessage(payload);
        }
        
        return group;
    }


    addCard(cardId)
    {

        const card = new Card(cardId, PIXI.utils.uid());
        
        card.visual.on("dragging", () => {

            this.cardsInHand.sortCards();
            // this.row.sortCards();

            if(this.selectedCards.length > 0)
            {
                for(let i = 0; i < this.selectedCards.length; i++)
                {
                    this.selectedCards[i].unSelect();
                }
    


            }

            const mousePosition = getMousePosition();
             this.cardsOver = this.cardsInHand.allCards.filter(itemCard => itemCard != card && itemCard.isInsideBounds(mousePosition));

            
        }, this);

        card.visual.on("dragEnd", () => {

            // logThis(card.visual.zIndex, "green");

            
            this.cardsInHand.changeCardPosition(card, this.cardsOver);

            this.cardsOver = [];
            this.cardsInHand.hoveredCard = undefined;

            this.cardsInHand.positionCardsInRow();

            this.cardsInHand.finalSort();

        

        });

        card.visual.on("selected", () => {
            
            this.selectedCards.push(card);
            
            this.groupButton.renderable = this.selectedCards.length > 1;
            this.groupButton.interactive = this.groupButton.renderable;

            
            this.activateDiscardButtons(this.selectedCards.length == 1 && gameData.currentTurn == gameData.plId && this.isCardPicked);
            this.interactiveDiscardButtons(this.discardButton.renderable && this.isCardPicked);

            this.cardsInHand.positionCardsInRow();
            this.cardsInHand.finalSort();
        });

        card.visual.on("unselect", () => {

            RemoveArrayItem(this.selectedCards, card);

            this.groupButton.renderable = this.selectedCards.length > 1;
            this.groupButton.interactive = this.groupButton.renderable;


            this.activateDiscardButtons(this.selectedCards.length == 1 && gameData.currentTurn == gameData.plId && this.isCardPicked);
            this.interactiveDiscardButtons(this.discardButton.renderable && this.isCardPicked);

            this.cardsInHand.positionCardsInRow();

            this.cardsInHand.finalSort();
        });

        return card;
    }

    

    createGroupButton()
    {
        this.groupButton = new PIXI.Sprite(Globals.resources.groupBtn.texture);
        this.groupButton.anchor.set(0.5);
        this.groupButton.x = config.logicalWidth - this.groupButton.width/2 - 20;
        this.groupButton.y = config.logicalHeight - this.groupButton.height;
        
        this.groupButton.renderable = false;
        this.groupButton.on("pointerdown", () => {

            let checkRowIndex = 0;

            if(!this.cardsInHand.isSpaceAvailable(checkRowIndex))
            {
                checkRowIndex = (checkRowIndex == 0) ? 1 : 0;
            }

            this.groupCards(checkRowIndex);
            this.groupButton.renderable = false;
            this.groupButton.interactive = false;
        }, this);


        this.container.addChild(this.groupButton);
    }

    createSortButton()
    {
        this.sortButton = new PIXI.Sprite(Globals.resources.sortBtn.texture);
        this.sortButton.anchor.set(1, 0.5);
        this.sortButton.x = config.logicalWidth - this.sortButton.width * 2;
        this.sortButton.y = config.logicalHeight - this.sortButton.height * 2.5;
        
        this.sortButton.interactive = true;
        // this.sortButton.renderable = false;
        this.sortButton.on("pointerdown", () => {
            this.sortCardsAuto();
            this.sortButton.destroy();
        }, this);


        this.container.addChild(this.sortButton);
    }

    
    createDiscardButton()
    {
        this.discardButton = new PIXI.Sprite(Globals.resources.discardBtn.texture);
        this.discardButton.anchor.set(0.5);
        this.discardButton.x = config.logicalWidth - this.discardButton.width/2 - 20;
        this.discardButton.y = config.logicalHeight - this.discardButton.height;
        

        this.discardButton.renderable = false;
        this.discardButton.on("pointerdown", () => {
            this.discardCard();
            this.interactiveDiscardButtons(false);
            this.activateDiscardButtons(false);
        }, this);


        this.container.addChild(this.discardButton);
    }

    createDeclareButton()
    {
        this.declareButton = new PIXI.Sprite(Globals.resources.declareBtn.texture);
        this.declareButton.anchor.set(1, 0.5);
        this.declareButton.x = config.logicalWidth - this.declareButton.width * 2;
        this.declareButton.y = config.logicalHeight - this.declareButton.height;
        
        this.declareButton.renderable = false;
        this.declareButton.on("pointerdown", () => {
            this.prompt = new Prompt("Are you sure you want to declare?", PromptResponseType.YESORNO, this.declareButton.declare.bind(this));

            this.prompt.container.on("removed", () => {
                this.prompt = undefined;
            });
    
            this.sceneContainer.addChild(this.prompt.container);
        }, this);


        this.declareButton.declare = () => {
            this.declareButton.interactive = false;
            //Declare Functionality
            this.declareGame();
            this.declareButton.renderable = false;
        };

        this.container.addChild(this.declareButton);
    }

    CreateSubmitButton()
    {
        this.submitButton = new PIXI.Sprite(Globals.resources.submitBtn.texture);
        this.submitButton.anchor.set(1, 0.5);
        this.submitButton.x = config.logicalWidth - this.submitButton.width - 40;
        this.submitButton.y = config.logicalHeight - this.submitButton.height;
        
        this.submitButton.renderable = false;
        this.submitButton.on("pointerdown", () => {

            this.prompt = new Prompt("Are you sure you want to submit?", PromptResponseType.YESORNO, this.submitButton.declare.bind(this));

            this.prompt.container.on("removed", () => {
                this.prompt = undefined;
            });
    
            this.sceneContainer.addChild(this.prompt.container);


        }, this);

        this.submitButton.declare = () => {
            this.submitButton.interactive = false;
            //Declare Functionality
            this.submitGame();
            this.submitButton.renderable = false;
        };


        this.container.addChild(this.submitButton);
    }



    createFinishButton()
    {
        this.finishButton = new PIXI.Sprite(Globals.resources.finishBtn.texture);
        this.finishButton.anchor.set(1, 0.5);
        this.finishButton.x = config.logicalWidth - this.finishButton.width * 2;
        this.finishButton.y = config.logicalHeight - this.finishButton.height;
        

        this.finishButton.renderable = false;
        this.finishButton.on("pointerdown", () => {
            this.finishGame();
            this.interactiveDiscardButtons(false);
            this.activateDiscardButtons(false);
        }, this);


        this.container.addChild(this.finishButton);
    }

    addLeaveButton()
    {
        this.leaveButton = new PIXI.Sprite(Globals.resources.leaveBtn.texture);
        this.leaveButton.scale.set(config.minScaleFactor);
        this.leaveButton.x = 20;
        this.leaveButton.y = 20;
        this.leaveButton.interactive = true;
        this.leaveButton.on("pointerdown", () => {
            this.leaveButton.interactive = false;

            this.prompt = new Prompt("Are you sure you want to leave?", PromptResponseType.YESORNO, this.leaveGame.bind(this));

            this.prompt.container.on("removed", () => {
                this.prompt = undefined;
                this.leaveButton.interactive = true;
            });
    
            this.sceneContainer.addChild(this.prompt.container);



        });

        this.leaveButton.toggleRendering = (val) => {
            this.leaveButton.interactive = val;
            this.leaveButton.renderable = val;
        };

        this.sceneContainer.addChild(this.leaveButton);

    }

    addSwitchBtn()
    {
        this.switchBtn = new PIXI.Sprite(Globals.resources.normalBtn.texture);
        this.switchBtn.scale.set(config.minScaleFactor);
        this.switchBtn.anchor.set(0.5);
        this.switchBtn.x = window.innerWidth - (this.switchBtn.width/2 + 20);
        this.switchBtn.y = this.switchBtn.height/2 + 20;
        this.switchBtn.tint = 0x62cb5c;

        this.switchBtn.labelText = new DebugText("Switch", 0, 0, 0x62cb5c, 108 * config.minScaleFactor, "Luckiest Guy");

        this.switchBtn.addChild(this.switchBtn.labelText);

        this.switchBtn.on("pointerdown", this.onSwitchBtnClick.bind(this));

        this.switchBtn.toggleRendering = (val) => {
            this.switchBtn.interactive = val;
            this.switchBtn.renderable = val;

            console.log("Toggled Switch Button : " + this.switchBtn.interactive + ", " + this.switchBtn.renderable);
        };

        this.switchBtn.toggleClickState = (val) => {
            this.switchBtn.tint = val ? 0x62cb5c : 0x4a4a4a;
            this.switchBtn.labelText.style.fill = val ? 0x62cb5c : 0x4a4a4a;
            this.switchBtn.labelText.text = val ? "Switch" : "Switching...";
            this.switchBtn.interactive = val;
            this.switchBtn.labelText.style.fontSize = val ? 108 * config.minScaleFactor : 108 * config.minScaleFactor * 0.7;
        }

        this.switchBtn.toggleRendering(false);

        this.switchBtn.resizeBtn = () => {
            this.switchBtn.scale.set(config.minScaleFactor);

            this.switchBtn.x = window.innerWidth - (this.switchBtn.width/2 + 20);
            this.switchBtn.y = this.switchBtn.height/2 + 20;
            this.switchBtn.labelText.style.fontSize = 108 * config.minScaleFactor;
        };

        this.sceneContainer.addChild(this.switchBtn);
    }

    onSwitchBtnClick()
	{
        console.log("CLICKED SWITCH " + gameData.plId)

		// if(gameData.plId == -1)
		// 	return;

        
        this.switchBtn.toggleClickState(false);            
        
        const payload = {
            t : "switchGame",
            plId : gameData.plId
        }

        Globals.socket?.sendMessage(payload);
        return;

		this.resetAllData();
        
		Globals.scene.start(new GameScene());
	}
    resetAllData()
    {

    }

    leaveGame()
    {
        this.leaveButton.interactive = false;
        this.leaveButton.renderable = false;
        gameData.leaveState = LEAVESTATE.LEFT;
        // Globals.socket?.socket.close();

        const payload = {
            t : "clickedLeave"
        }

        Globals.socket?.sendMessage(payload);


        Globals.leaveTimer = setTimeout(() => {
            try {
                if (JSBridge != undefined) {

                    JSBridge.sendMessageToNative(JSON.stringify({"t" :"Exit"}));
                }
            } catch {
                console.log("JS Bridge Not Found!");
            }
            Globals.scene.start(new FinalScene("You Left!"));
       }, 3000);
    }

    addDropButton()
    {
        this.dropButton = new PIXI.Sprite(Globals.resources.dropBtn.texture);
        this.dropButton.scale.set(config.minScaleFactor);
        this.dropButton.anchor.set(1, 0);
        this.dropButton.x = window.innerWidth - 20;
        this.dropButton.y = 20;

        this.dropButton.interactive = false;
        this.dropButton.renderable = false;
        this.dropButton.on("pointerdown", () => {
            this.dropButton.interactive = false;
            
            const payload = {
                t : "dropGame",
                cards : this.getCardsInHandAsArray()
            }


            Globals.socket.sendMessage(payload);

            this.dropButton.destroy();

           this.interactiveDiscardButtons(false);
           this.activateDiscardButtons(false);
        });

        this.sceneContainer.addChild(this.dropButton);
    }

    interactiveDiscardButtons(value)
    {
        this.finishButton.interactive = value;
        this.discardButton.interactive = value;
    }

    activateDiscardButtons(value)
    {
        this.finishButton.renderable = value;
        this.discardButton.renderable = value;
    }

    sortCardsAuto()
    {
        Globals.soundResources.cardFan.play();

        const newCardFormation = [[], [], [], [], []];

        this.cardsInHand.allCards.forEach(card => {
            const splitCard = card.cardId.split('-');
            newCardFormation[splitCard[1]].push(splitCard[0]);
        });

        let setsInFirstRow = 0;
        for(let i = 0; i < 5; i++)
        {
            const formation = newCardFormation[i];
            formation.sort(function(a, b) {
                return a - b;
            });

            // if(setsInFirstRow < 4)
            this.populateSelectedCards(formation, i, (setsInFirstRow < 3) ? 0 : 1);
            setsInFirstRow++;
        }
    }


    

    showMessage(msg)
    {
        if(this.message != undefined)
            this.removeMessage();

        this.message = new InGameMessage(msg);

        this.container.addChild(this.message.container);
    }

    removeMessage()
    {

        if(this.message == undefined)
            return;

        this.message.container.destroy();
        this.message = undefined;
    }

    addPlayers()
    {
        this.players = {}; 
        Object.values(gameData.players).forEach(playerData => {
            this.addPlayer(playerData);
            logThis("On Joined Player added :" + playerData.pName, 0x50FA7B);
        });

    }

    addPlayer(playerData)
    {
        let position = null;
        let tossCard = {x : 320, y : -100};

        if(playerData.plId != gameData.plId)
        {
            let seatIndex = playerData.plId - gameData.plId;
            if(seatIndex < 0)
            {
                seatIndex = 5 + seatIndex;
            } else if (seatIndex > 0)
            {
                position = PlayerPositions[gameData.plId];
                tossCard = tossCardPositions[gameData.plId];
                logThis("Placed " + playerData.pName + " at " + gameData.plId);
                seatIndex = seatIndex - 1;
            }
            // kklseatIndex;
            // console.log(playerData.plId + " : seatIndex : " + seatIndex);
            
            position = PlayerPositions[seatIndex];
        }

        const player = new Player(playerData.plId,playerData.pName,playerData.pBal, position, tossCard);

        this.container.addChild(player.container);
        this.players[player.plId] = player;

        if(playerData.pState == PLAYERSTATE.DROPPED)
            player.dropped();
        else if (playerData.pState == PLAYERSTATE.LEFT)
        {
            player.kicked();
            
            if(!gameData.leftList.includes(playerData.plId))
                gameData.leftList.push(playerData.plId);
        }
        else if (playerData.pState == PLAYERSTATE.WAITING)
            player.waiting();
    }

    addScoreData()
    {
        const bg = new PIXI.Graphics();

        bg.beginFill(0xffffff, 0.2);
        bg.drawRoundedRect(0, 0, 230, 100, 25);
        bg.endFill();


        bg.y = config.logicalHeight - bg.height * 2.4;
        bg.x = 200;


        this.scoreLabel = new Label(0, 0, 0, "0", 58, 0xffffff, "BarlowBold");
        this.scoreLabel.style.fontWeight = "Bold";
        this.scoreLabel.anchor.set(1, 0.5);
        this.scoreLabel.x = bg.x + bg.width * 0.85;
        this.scoreLabel.y = bg.y + bg.height/2;
        

        this.scoreLabel.toggleRendering = (value) => {
            this.scoreLabel.renderable = value;
            bg.renderable = value;
        };



        this.container.addChild(bg);
        this.container.addChild(this.scoreLabel);

        this.scoreLabel.toggleRendering(false);
    }

    addLivesData()
    {

        this.lives = [];

        for(let i = 0; i < 3; i++ )
        {
            
            const heart = new PIXI.AnimatedSprite([Globals.resources.heart.texture, Globals.resources.emptyHeart.texture]);
            heart.scale.set(0.2);
            
            heart.y = config.logicalHeight - 130;
            heart.x = 250 + i * heart.width * 1.1;
            
            this.lives.push(heart);
            this.container.addChild(heart);
        }

    }

    updateLives(val)
    {
        console.log("Updated Lives : " + val);

        for(let i = 0; i < this.lives.length; i++)
        {
            if(val < i+1)
                this.lives[i].gotoAndStop(1);
            else
                this.lives[i].gotoAndStop(2);
        }
    }


    addTotalBid()
    {

        if(this.potText != undefined)
        {
            this.potText.text = gameData.potData;
            if(gameData.potData == 0 )
            {
                this.bidBg.destroy();
                this.potText.destroy();
            }

            return;
        }

        this.bidBg = new PIXI.Sprite(Globals.resources.mainChipPot.texture);

        this.bidBg.anchor.set(0.5);
    
        this.bidBg.x = config.logicalWidth/2 ;
        this.bidBg.y = config.logicalHeight/2 - 80;

        this.potText = new Label(this.bidBg.x + 20, this.bidBg.y , 0.5, gameData.potData, 44, 0xffffff);
        
    

        this.container.addChild(this.bidBg);
        this.container.addChild(this.potText);
    }

    addCenterDeck()
    {

        this.centerDeck = new PIXI.Sprite(Globals.resources.cardsDeck.texture);
        this.centerDeck.sortableChildren = true;

        this.centerDeck.anchor.set(0.5, 1);

        this.centerDeck.x = config.logicalWidth/2 - this.centerDeck.width/2 - 40;
        this.centerDeck.y = config.logicalHeight/2 - 200;
        
        const centerDeckLabel = new PIXI.Sprite(Globals.resources.closedDeckText.texture);

        centerDeckLabel.anchor.set(0.5);
        centerDeckLabel.x = this.centerDeck.x;
        centerDeckLabel.y = this.centerDeck.y + centerDeckLabel.height * 0.7;
        this.container.addChild(centerDeckLabel);

        this.container.addChild(this.centerDeck);

        //on Pick Card
        this.centerDeck.on("pointerdown", () => {
            
            this.centerDeck.interactive = false;
            this.openCard.interactive = false;
            this.isOpenCardPicked = false;
            //Send to server
            const payload = {
                t : "cardPickClickMsg",
                plId : gameData.plId,
                type : "close"
            }

            Globals.socket.sendMessage(payload);

        this.dropButton.interactive = false;
        this.dropButton.renderable = false;
            // this.pickCardFromCenterDeck(); //Move it to recievedMessage block

        }, this);


      
        this.cardPlace = new PIXI.Graphics();
        this.cardPlace.beginFill(0x25334d, 1);
        this.cardPlace.drawRoundedRect(-75, -206, 150, 206, 25);
        this.cardPlace.endFill();
        this.cardPlace.x = config.logicalWidth/2 + this.cardPlace.width/2 + 40;
        this.cardPlace.y = config.logicalHeight/2 - 200;
        this.container.addChild(this.cardPlace);

        const openDeckLabel = new PIXI.Sprite(Globals.resources.openDeckText.texture);

        openDeckLabel.anchor.set(0.5);
        openDeckLabel.x = this.cardPlace.x;
        openDeckLabel.y = this.cardPlace.y + openDeckLabel.height * 0.7;
        this.container.addChild(openDeckLabel);
        // this.addJokerCard();

    }



    addJokerCard()
    {
        console.log(gameData.jokerCard); //12-2
        const jokerCard =  new PIXI.Sprite(Globals.resources[SUIT.Convert(gameData.jokerCard)].texture);
        jokerCard.anchor.set(0.5, 1);
        jokerCard.angle = -15;
        jokerCard.y = config.logicalHeight/2 - 200- (jokerCard.height * 0.6);
        jokerCard.x = config.logicalWidth/2 -  (jokerCard.width );
        jokerCard.zIndex = 1;

        const jokerIcon = new PIXI.Sprite(Globals.resources.jokerIcon.texture);
        jokerIcon.x += jokerCard.width/2;
        jokerIcon.y -= jokerCard.height;
        jokerIcon.anchor.set(0.7, 0.3);
        jokerIcon.angle = 15;

        jokerCard.addChild(jokerIcon);
        this.container.addChild(jokerCard);

    }

    pickCardFromCenterDeck(cardName)
    {
        const newCard = this.addCard(cardName);

        this.pickedCard = newCard;


        this.cardsInHand.addCard(newCard, 1);
        this.cardsInHand.addToAllCards(newCard);

        const position = this.centerDeck.position.clone();
        position.x -= this.cardsInHand.container.x;
        position.y -= this.cardsInHand.container.y;
        newCard.visual.x = position.x;
        newCard.visual.y = position.y;



        this.cardsInHand.positionCardsInRow();
        

    }


    pickCardFromOpen(cardName)
    {
        const newCard = this.addCard(cardName);

        this.pickedCard = newCard;

        this.cardsInHand.addCard(newCard, 1);
        this.cardsInHand.addToAllCards(newCard);

        const position = this.cardPlace.position.clone();
        position.x -= this.cardsInHand.container.x;
        position.y -= this.cardsInHand.container.y;
        newCard.visual.x = position.x;
        newCard.visual.y = position.y;



        this.cardsInHand.positionCardsInRow();
        

    }

    
    // update(dt)
    // {
    //     Object.values(this.players).forEach(player => {
    //         player.update(dt);
    //     });
    // }

    get isSelectedCardsFromSameGroup()
    {

        const previousGroup = this.selectedCards[0].groupRef;

        if(previousGroup == undefined)
            return false;

        for(let i=0; i < this.selectedCards.length; i++)
        {
            const card = this.selectedCards[i];

            if(card.groupRef != previousGroup)
                return false;
        }
        
        return true;
    }

    populateSelectedCards(cards, suitId, rowId)
    {

        if(this.noOfSortedGroups == undefined)
            this.noOfSortedGroups = 0;


        this.noOfSortedGroups++;

        if(cards.length <= 1)
        {
            if(cards.length == 1)
            {
                const cardId = cards[0]+'-'+suitId;
                const cardToMove = this.cardsInHand.getCardById(cardId);

                cardToMove.removeFromSource();
                // card.rowIndex
                this.cardsInHand.addCard(cardToMove, rowId);
            }
            
            return;
        }

        if(this.selectedCards.length > 0)
        {
            for(let i = 0; i < this.selectedCards.length; i++)
            {
                this.selectedCards[i].unSelect();
            }



            this.selectedCards = [];
        }


        const cardToLoopThrough = [...new Set(cards)];

        for(let i = 0; i < cardToLoopThrough.length; i++)
        {
            const cardId = cardToLoopThrough[i]+'-'+suitId;
            const arr = this.cardsInHand.getCardsById(cardId);

            for(let j = 0; j < arr.length; j++)
            {
                this.selectedCards.push(arr[j]);
            }
        }

        this.groupCards(rowId, true);

    }

    groupCards(rIndex = null, shouldNotSort = null)
    {
        console.log("Group");
        const group = new SetOfCards();
        group.seqInfo.zIndex = 20;
        group.seqInfoText.zIndex = 21;
        this.cardsInHand.container.addChild(group.seqInfo);
        this.cardsInHand.container.addChild(group.seqInfoText);


        if(shouldNotSort == null)
        {
            this.selectedCards.sort((a, b) => {
                return a.globalPosition.x - b.globalPosition.x;
            });
        }



        let rowIndex = -1; 
        let indexInRow = -1;
        if(this.selectedCards[0].groupRef != undefined)
        {
            rowIndex =this.selectedCards[0].groupRef.rowIndex;
            indexInRow = this.cardsInHand.cards[rowIndex].indexOf(this.selectedCards[0].groupRef);
        } else
        {
            rowIndex = this.selectedCards[0].rowIndex;
            indexInRow = this.cardsInHand.cards[rowIndex].indexOf(this.selectedCards[0]);
        }
        

        if(rIndex != null)
            rowIndex = rIndex;

        this.selectedCards.forEach(card => {
            card.removeFromSource();
            card.rowIndex = rowIndex;
            group.addCard(card);
        });

        this.selectedCards = [];
        this.cardsInHand.addCard(group, rowIndex, indexInRow);


        const payload = {
            t:"cardSeqCheckMsg",
            cards: group.cardsIdArray
        }

        if(Globals.socket != undefined)
        {
            Globals.socket.sendMessage(payload);
        }
          
        this.cardsInHand.positionCardsInRow();

        // setTimeout(() => {
        //     this.cardsInHand.sortCards();

        // }, 500);

        this.cardsInHand.finalSort();

    }

    discardCard(isFinished = false)
    {
        if(this.selectedCards.length != 1)
            return;

        
            Globals.soundResources.cardDiscard.play();


        //Send Discard Message
        const payload = {
            t: undefined,
            plId : gameData.plId,
            card : this.selectedCards[0].cardId,//Card Type update
            cards : undefined
        };

        

        
        const cardId = this.selectedCards[0].cardId;


        
        const position = this.selectedCards[0].visual.position.clone();
        position.y += this.cardsInHand.container.y;

        this.selectedCards[0].removeFromSource(true);

        this.selectedCards[0].visual.interactive = false;
        this.selectedCards[0].visual.destroy();

        this.selectedCards = [];

        this.tweenCard(SUIT.Convert(cardId), position, this.cardPlace.position);


        this.cardsInHand.positionCardsInRow();

        //remove card after tweening it to open
        //call add card to open

        payload.cards = this.getCardsInHandAsArray();


        if(isFinished)
        {
            payload.t = "finishGameMsg";
        } else
        {
            payload.t = "cardDiscMsg";
        }

                
        Globals.socket.sendMessage(payload);


        this.scoreLabel.text = this.cardsInHand.calculateCurrentScore();

      

        
    }

    tweenCard(cardName, startPos, endPos, onCallback = null, completeWaitTime = null)
    {
        const card = new PIXI.Sprite(Globals.resources[cardName].texture);
        card.anchor.set(0.5);
        this.container.addChild(card);

        card.x = startPos.x;
        card.y = startPos.y;

        const tween = new TWEEN.Tween(card)
        .to({x : endPos.x, y : endPos.y})
        .duration(250)
        .onComplete(() => {
            setTimeout(() => {
                card.destroy();

                if(onCallback)
                    onCallback();

            }, (completeWaitTime) ? completeWaitTime : 0.500);
        })
        .start();
    }

    addCardToOpen()
    {
        //Add new Card to open deck


        if(gameData.openCard == undefined || gameData.openCard == null)
            return;

        if(this.openCard != undefined && this.openCard != null)
            this.openCard.destroy();

        this.openCard = new PIXI.Sprite(Globals.resources[SUIT.Convert(gameData.openCard)].texture);

        const cardArr =  gameData.openCard.split('-');
        const jokerArr = gameData.jokerCard.split('-');

        if(cardArr[0] == jokerArr[0])
        {
            const jokerSymbol = new PIXI.Sprite(Globals.resources.jokerIcon.texture);
            jokerSymbol.scale.set(0.8);
            jokerSymbol.anchor.set(0, 0.5);

            jokerSymbol.x -= this.openCard.width/2 - 5;
            jokerSymbol.y += 35;

            this.openCard.addChild(jokerSymbol);
        }


        this.container.addChild(this.openCard);
        this.openCard.anchor.set(0.5);
        this.openCard.width = this.cardPlace.width * 0.99;
        this.openCard.height = this.cardPlace.height * 0.99;

        this.openCard.x = this.cardPlace.x;
        this.openCard.y = this.cardPlace.y - this.cardPlace.height/2;

        // this.openCard.interactive = true;

        // if(gameData.openCard != "0-0")
        {
            this.openCard.once("pointerdown", () => {

                this.centerDeck.interactive = false;
                
                const payload = {
                    t: "cardPickClickMsg",
                    plId : gameData.plId,
                    type : "open"
                }

                this.isOpenCardPicked = true;
    
                Globals.socket.sendMessage(payload);
                this.openCard.destroy();
                this.openCard = null;

                this.dropButton.interactive = false;
                this.dropButton.renderable = false;
            });
        }



        //onCardClick

    }



    declareGame()
    {

        //Add declare functionality
        const payload = {
            t : "declareMsg",
            plId : gameData.plId,
            cards : this.getCardsInHandAsArray()
        };

        Globals.socket.sendMessage(payload);
    }

    finishGame()
    {
        this.discardCard(true);

    }

    getCardsInHandAsArray()
    {
        return this.cardsInHand.getAllCardsAsArray();
    }

    getCardsInHandSets()
    {
        const cardsSet = [];

        this.cardsInHand.cards.forEach(element => {
            element.forEach(group => {
                if(group instanceof SetOfCards)
                {
                    cardsSet.push(group);
                }
            })
        });

        return cardsSet;
    }

    submitGame()
    {
        //Add Submit Functionality

        const payload = {
            t : "submitMsg",
            plId : gameData.plId,
            cards : this.getCardsInHandAsArray()
        }

        Globals.socket.sendMessage(payload);
    }
}


class CardsInHand
{
    constructor()
    {
        this.container = new PIXI.Container();
        this.container.sortableChildren = true;
        
        this.container.y = config.logicalHeight - (600);


        this.allCards = [
        ];

        this.cards = [
            [],
            []
        ];
    }

    

    addCard(card,rowIndex, index = -1)
    {

        if(this.cards[rowIndex].indexOf(card) == -1)
        {
            card.rowIndex = rowIndex;

            if(index != -1)
            {
                this.cards[rowIndex].splice(index, 0, card);
            } else
            {
                this.cards[rowIndex].push(card);
            }

            if(!card.isSet)
                this.container.addChild(card.visual);
            else
                card.setRow(this, rowIndex);


            
            card.handReference = this;

            // this.refreshSetsInfo();
        }
    }


    refreshSetsInfo()
    {
        for(let i = 0; i < this.cards.length; i++)
        {
            const row = this.cards[i];

            for(let j = 0; j < row.length; j++)
            {
                const element = row[j];

                if(element.isSet)
                {
                    element.refreshSequenceInfo();
                }
            }
        }
    }
    

    getAllCardsAsArray()
    {
        const cardsGroup = [];

        this.cards.forEach(element => {
            element.forEach(group => {
                // console.log(group instanceof Card, group instanceof SetOfCards); 
                if(group instanceof Card)
                {
                    const arr = [];
                    arr.push(group.cardId);
                    cardsGroup.push(arr);
                } else if(group instanceof SetOfCards)
                {
                    cardsGroup.push(group.cardsIdArray);
                }
            })
        });

        return cardsGroup;
    }

    calculateCurrentScore()
    {
        let currentScore = 0;

        this.cards.forEach(row => {
            row.forEach(element => {

                if(element.isSet)
                {
                    if(element.seqTypeIndex != 1)
                    {
                        if(element.seqTypeIndex != 3 && gameData.sequencesArr.pure.length > 0 && (gameData.sequencesArr.impure.length + gameData.sequencesArr.pure.length > 1))
                        {
                            //not add
                        } else
                        {
                            element.cards.forEach(card => {
                                const splitStr = card.cardId.split("-");

                                const jokerSplitStr = gameData.jokerCard.split("-");
                                if(jokerSplitStr[0] != splitStr[0])
                                {
                                    const score = parseInt(splitStr[0]);
                                    currentScore += (score == 1 || score == 11 || score == 12 || score == 13) ? 10 : score;
                                } 
                            });
                        }
                    }
                } else
                {
                    const splitStr = element.cardId.split("-");
                    const jokerSplitStr = gameData.jokerCard.split("-");
                    if(jokerSplitStr[0] != splitStr[0])
                    {
                        const score = parseInt(splitStr[0]);
                        currentScore += (score == 1 || score == 11 || score == 12 || score == 13) ? 10 : score;
                    } 


                }
            });
        });


        currentScore = clamp(currentScore, 0, 80);
        return currentScore;
    }
    

    getCardsById(cardId)
    {
        let cardToReturn = this.allCards.filter(card => card.cardId == cardId);
        return cardToReturn;


    }

    getCardById(cardId)
    {
        let cardToReturn = this.allCards.find(card => card.cardId == cardId);
        return cardToReturn;
    }

    addToAllCards(card)
    {
        if(this.allCards.indexOf(card) == -1)
        {
            this.allCards.push(card);
        }

    }

    removeFromAllCards(card)
    {
        RemoveArrayItem(this.allCards, card);
    }

    removeCard(card, removeFromHand = false)
    {
        // const indext = 
        if(this.cards[card.rowIndex].indexOf(card) != -1)
        {
            RemoveArrayItem(this.cards[card.rowIndex], card);
            if(removeFromHand)
            {
                this.container.removeChild(card.visual);
                card.handReference = undefined;
                card.rowIndex = -1;
            }
        }
    }


    sortCards()
    {

        this.allCards.sort((a, b) => {
            return a.globalPosition.x - b.globalPosition.x;
        });
        
        
        for(let j = 0; j < this.allCards.length; j++)
        {
            this.allCards[j].visual.zIndex = j;
        }



    }

    

    finalSort()
    {
        
        for(let i = 0; i < this.cards.length; i++)
        {
            const row = this.cards[i];

            let x = 1;

            for(let j = 0; j < row.length; j++)
            {
                const card = row[j];

                if(card.isSet)
                {
                    for(let k = 0; k < card.cards.length; k++)
                    {
                        const cardInSet = card.cards[k];

                        cardInSet.visual.zIndex = x;
                        x++;
                    }
                } else
                {
                    card.visual.zIndex = x;
                    x++;
                }
            }

        }


      
    }

    changeCardPosition(card, cardsArr)
    {
        //Group Card or Ungroup Card

        let checkRowIndex = card.visual.y < 0 ? 1 : 0;
        const cardsToCheck = this.allCards.filter(item => item == card || item.rowIndex == checkRowIndex);
        const zIndex = cardsToCheck.indexOf(card);
        const endIndex = cardsToCheck.length-1;


        if(cardsArr.length == 0)
        {  


                card.removeFromSource();

                if(!this.isSpaceAvailable(checkRowIndex))
                {
                    checkRowIndex = (checkRowIndex == 0) ? 1 : 0;
                }


                this.addCard(card, checkRowIndex, zIndex);
            // } 
        } else
        {
            card.removeFromSource();

            if(zIndex == 0 || zIndex == endIndex)
            {
                const otherCard = (zIndex == 0) ? cardsToCheck[zIndex + 1] : cardsToCheck[zIndex - 1];

    

                this.addCardToSource(card, otherCard, zIndex, cardsToCheck.indexOf(otherCard));
            } else
            {
                const prevDist = GetMagnitude(SubtractVector(card.globalPosition, cardsToCheck[zIndex-1].globalPosition));
                const nextDist = GetMagnitude(SubtractVector(card.globalPosition, cardsToCheck[zIndex+1].globalPosition));

                // const nearestCard = (prevDist > nextDist) ? this.allCards[zIndex+1] : this.allCards[zIndex-1]; 
                //check distance from prev and next card                
                //-> check if nearestCard is at front

                if(nextDist < prevDist)
                    this.addCardToSource(card, cardsToCheck[zIndex+1], zIndex, zIndex+1);
                else
                    this.addCardToSource(card, cardsToCheck[zIndex-1], zIndex, zIndex-1);
            }
        }
    }



    addCardToSource(card, otherCard, zIndex, otherCardIndex)
    {
        //const otherCardIndex = this.allCards.indexOf(otherCard);
        const payload = {
            t:"cardSeqCheckMsg",
            cards: undefined
        }
        if(otherCard.groupRef != undefined)
        {
            const groupIndex = otherCard.groupRef.cards.indexOf(otherCard);
            card.rowIndex = otherCard.rowIndex;
            otherCard.groupRef.addCard(card, (otherCardIndex > zIndex) ? groupIndex : groupIndex + 1);

            if(!this.isSpaceAvailable(otherCard.rowIndex))
            {
                
            }

            payload.cards = otherCard.groupRef.cardsIdArray;
        } else
        {

            // card.removeFromSource();
            let rowIndex = otherCard.rowIndex;
            const groupIndex = this.cards[rowIndex].indexOf(otherCard);
            otherCard.handReference.removeCard(otherCard);

            const group = new SetOfCards();
            group.seqInfo.zIndex = 20;
            group.seqInfoText.zIndex = 21;
            this.container.addChild(group.seqInfo);
            this.container.addChild(group.seqInfoText);
            // logThis(otherCardIndex + " : " + zIndex);
            if(otherCardIndex > zIndex)
            {
                group.addCard(card);
                group.addCard(otherCard);
            } else
            {
                group.addCard(otherCard);
                group.addCard(card);
            }


            payload.cards = group.cardsIdArray;
            
 
            if(!this.isSpaceAvailable(rowIndex))
            {
                rowIndex = (rowIndex == 0) ? 1 : 0;
            }


            this.addCard(group,rowIndex, groupIndex);
        }

            
        if(Globals.socket != undefined)
            Globals.socket.sendMessage(payload);
    }

    isSpaceAvailable(rowIndex)
    {
        const max = 8;

        const cards = this.allCards.filter(card => card.rowIndex == rowIndex);
        return (cards.length < max);
    }
    
    resetCards()
    {
        this.slideCards.forEach(card => {
            card.visual.x -= card.width/4;
        });

        this.slideCards = [];
    }

    positionCardsInRow()
    {

        this.sortCards();
        const fullWidth = config.logicalWidth * 0.95;
        this.widthToScaleDown = 0;
        let yPos = 110;

        for(let i = 0; i < this.cards.length; i++)
        {
            const row = this.cards[i];

            const cardsWidth = this.cardsWidth(row);
            const whiteSpace = fullWidth - cardsWidth;

            const spacePerItem = (whiteSpace <= 0) ? 5 : whiteSpace * 0.05;
            const totalOccupiedSpace = (spacePerItem * (row.length-1)) + cardsWidth;
    
            const spaceLeft = (config.logicalWidth - totalOccupiedSpace)/2; 

            let xPos = (spaceLeft < config.logicalWidth * 0.05) ? config.logicalWidth * 0.05 : spaceLeft;
            let widthToCompare = 0;
            row.forEach(card => {
                if(!card.isDragging)
                {
                    card.setPosition(xPos + card.width/2, yPos);
                    
                }
                xPos += (card.width );
                xPos += spacePerItem;
                widthToCompare += (card.width + spacePerItem);
            });
    
            
            if(widthToCompare > this.widthToScaleDown)
                this.widthToScaleDown = widthToCompare;


            yPos -= 220;
            
        }


        if(this.widthToScaleDown > fullWidth)
        {   
            this.container.scale.x = fullWidth/this.widthToScaleDown;
        } else
        {
            this.container.scale.set(1);
        }

    }


    

    cardsWidth(row)
    {
        let width = 0;

        row.forEach(card => {
            width  += card.width;
        });

        return width;
    }

}