
import * as PIXI from 'pixi.js';
import { config } from './appConfig';
import { clamp } from './Utilities';

// export const Globals = {
//     resources: {},
//     emitter : null,
//     scene : null,
//     soundResources : {},
//     sound : true,
//     get isMobile() {
//       //  return true;
//         return PIXI.utils.isMobile.any;
//     },
//     leaveTimer : undefined,
//     socketAddr : undefined,
// };

export const GameEndStates = {
    NONE : 0,
    ALLTOKENSIN : 1,
    THREESKIPS : 2,
    ERROR : 3,
    DISCONNECTED:4,
    FOCUS_OFF:5,
    LEFT:6,
    RESTARTING:7,
};
// new
let gameRestartTimeout = undefined;

export function StartRestartProcess(serverData) {

    Globals.gameEndState = GameEndStates.RESTARTING
    if(gameRestartTimeout !== undefined) 
        clearTimeout(gameRestartTimeout);
    
    gameRestartTimeout = setTimeout(() => {
        Globals.socket = new Socket(Globals.connectionData, serverData);
    }, 5000); 

    console.log("Restarting in 5 seconds");
}

export function stopRestartProcess() {
    if(gameRestartTimeout !== undefined) {

        clearTimeout(gameRestartTimeout);
        console.log("Restarting stopped");
    }
}

export const Globals = {
    resources: {},
    soundResources : {},
    gridPoints : {},
    pawns : {},
    gameData : {
        players : {
            // 0 : {pName : "Abhishek", pDefaultId : 0,  pImage : "https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"},
            // 1 : {pName : "TestName2", pDefaultId : 1,  pImage : "https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"},
            // 2 : {pName : "TestName3", pDefaultId : 2,  pImage : "https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"},
            // 3 : {pName : "TestName3", pDefaultId : 2,  pImage : "https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"},
        },
        isCut : false,
        cutPawn : {},
        winData : [],
        // plId : 0,
    },
    connectionData : {
        playerId : -1,
        pName : '',
        pImage : '',
        tableTypeID : -1,
        entryFee : -1,
    },
    debug :
    {
        sound : true
    },
    gameEndState : GameEndStates.NONE,
    potData :[],
    turnTimerVal : 8,
    hasJoinedTable : false,
    errorMsg : "",
	errorCode : 0
};

export const LEAVESTATE = {
    INTERNETDISCONNECTION : 0,
    THREESKIPS : 1,
    LEFT : 2,
    ERROR : 3,
    SWITCHED : 4,
    RESTART : 5
};


export const connectionData = {
    playerId : -1,
    pName : '',
    pImage : '',
    tableTypeID : -1,
    entryFee : -1,
}




export const gameData = {
    tickTimer : 9,
    plId : -1,
    tableId : -1,
    isReconnecting : false,
    isDropped : false,
    currentTurn : -1,
    players : {},
    potData : undefined,
    cards : [],
    jokerCard : undefined,
    openCard : undefined,
    seqCheckRequests : [],
    winData : [],
    tempWinData : {},
    hasEndSceneLoaded : false,
    finishedPlayer : undefined,
    tableTypeId : -1,
    entryFee : -1,
    hasSubmit : false,
    sequencesArr : {
        pure : [],
        impure : [],
        set : []
    },
    errorMessage : undefined,
    lives : 3,
    get sequenceLength() {
        let count = 0;

        for(let i = 0; i < Object.values(this.sequencesArr).length; i++)
        {
            const seq = Object.values(this.sequencesArr)[i];

            for(let j = 0; j < seq.length; j++)
            {
                count++;
            }
        }

        return count;
    },
    leftList : [],
    hasGameStarted :false,
    leaveState : LEAVESTATE.INTERNETDISCONNECTION,
    reset : function()
    {
        this.lives = 3;
        this.errorMessage = undefined;
        this.currentTurn = -1;
        this.potData = undefined;
        this.cards = [];
        this.jokerCard = undefined;
        this.openCard = undefined;
        this.seqCheckRequests = [];
        this.winData = [];
        this.tempWinData = {};
        this.hasEndSceneLoaded = false;
        this.finishedPlayer = undefined;
        this.sequencesArr = {
            pure : [],
            impure : [],
            set : []
        };
        this.leftList = [];
        this.hasGameStarted = false;
        this.isDropped = false;
        this.leaveState = LEAVESTATE.INTERNETDISCONNECTION;
    },

    pushTempData : function() 
    {
        this.players = {
                0: {
                    plId : 0,
                    pImage : "https://cccdn.b-cdn.net/1584464368856.png",
                    pName : "Aaaa"
                },
                1 : {
                    plId : 1,
                    pImage : "https://cccdn.b-cdn.net/1584464368856.png",
                    pName : "Aaaa"
        
                },
                2 : {
                    plId : 2,
                    pImage : "https://cccdn.b-cdn.net/1584464368856.png",
                    pName : "Aaaa"
                },
                3: {
                    plId : 3,
                    pImage : "https://cccdn.b-cdn.net/1584464368856.png",
                    pName : "Aaaa"
                },
                4 : {
                    plId : 4,
                    pImage : "https://cccdn.b-cdn.net/1584464368856.png",
                    pName : "Aaaa"
        
                },
                5 : {
                    plId : 5,
                    pImage : "https://cccdn.b-cdn.net/1584464368856.png",
                    pName : "Aaaa"
                }
            };

        this.cards = [
                "1-1","2-1","4-4","8-1","11-3","1-1","2-1","4-4","8-1",
                "11-3","1-1","2-1","1-3"
            ];

        // this.cards = [
        //     ["1-1","2-1","4-4"],["8-1","11-3","1-1","2-1"],["4-4","8-1"],
        //     ["11-3","1-1","2-1"],"1-3"
        // ];

        this.jokerCard = "1-1";
        this.openCard = "2-1";
    }
};



export const PLAYERSTATE = {
    INGAME : 0,
    WAITING : 1,
    DROPPED : 2,
    LEFT : 3,
    PERMALEFT : 4
};

export const GAMESTATE = {
    MATCHMAKING : 0,
	TOSS : 1,
	INGAME : 2,
	FINISHING : 3,
	SUBMITING : 4,
	RESULT : 5,
	RESTARTING : 6
};


export const PlayerPositions = [

    {x : 135, y : config.logicalHeight/2 - 200},
    {x : 135, y : config.logicalHeight/2 - 600},
    {x : config.logicalWidth/2 - 5, y : 200},
    {x : config.logicalWidth - 135, y : config.logicalHeight/2 - 600},
    {x : config.logicalWidth - 135, y : config.logicalHeight/2 - 200},
];

export const tossCardPositions = [
    {x : 0, y : 220},
    {x : 220, y : -30},
    {x : -220, y : -30},
    {x : 220, y : -30},
    {x : -220, y : -30},
];

export const SUIT = {
    0 : "JOKER",
    1 : "S",
    2 : "C",
    3 : "H",
    4 : "D",

    Convert(cardId)
    {
        let cardName = "";
        if(cardId == "0-0")
            cardName = this[0];
        else
            cardName = cardId.substring(0, cardId.length-1) + this[cardId[cardId.length-1]];

        return cardName;
    },
};

export const SequenceType = [
    "Set",
    "Pure Sequence",
    "Impure Sequence",
    "Invalid"
];

export const getSequenceType = (index, uid) => {
    let type = SequenceType[index];

    if(index == 0)
    {
        if(gameData.sequencesArr.pure.length == 0)
        {
            type = "1st Life Needed";
        } else if(gameData.sequenceLength <= 1)
        {
            type = "2nd Life Needed";
        }
    }

    if(index == 2)
    {

        console.log(gameData.sequencesArr.impure.length , "Length of impure");
        console.log(gameData.sequencesArr.impure[0] , uid);
        if(gameData.sequencesArr.pure.length == 0)
        {
            type = "1st Life Needed";
        } else if (gameData.sequencesArr.impure.length > 0 && gameData.sequencesArr.impure[0] == uid)
        {
            type = "2nd Life";
        }
    }
    
    if(index == 1)
    {
        console.log(gameData.sequencesArr.pure.length , "Length of pure");
        console.log(gameData.sequencesArr.pure[0] , uid);

        if(gameData.sequencesArr.pure.length > 0 && gameData.sequencesArr.pure[0] == uid)
        {
            type = "1st Life";
        } else if (gameData.sequencesArr.impure.length == 0 && gameData.sequencesArr.pure.length > 0 && gameData.sequencesArr.pure[1] == uid)
        {
            type = "2nd Life";
        }
    }

    return type;
};


export const sceneGlobals = {
    hoveredGroup : null
}

export const gameProperties = {
    cardDimensions : {
        width : 140,
        height : 190,
        get offset()
        {
            return this.width * 0.53
        },
        get spacing()
        {
            return this.width * 1.25
        },
        yPos(index)
        {
            return config.logicalHeight - (this.height * 1.25 * index);
        }
    },
    nearestPoint(x)
    {
        const posX = {
            index : Math.floor(x / this.cardDimensions.spacing), 
            x : 0
        };
        posX.index = clamp(posX.index, 0, 12);
        
        posX.x = posX.index * this.cardDimensions.spacing;
        posX.x = posX.x + this.cardDimensions.offset;

        return posX;
    }
};
