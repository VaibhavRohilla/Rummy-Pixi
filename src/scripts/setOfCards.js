import { Container, Sprite, utils } from "pixi.js";
import { gameData, getSequenceType, Globals, SequenceType } from "./Globals";
import { Label } from "./LabelScore";
import { fetchGlobalPosition, RemoveArrayItem, Vector } from "./Utilities";


export class SetOfCards
{
    constructor()
    {
        this.uid = utils.uid();
        this.cards = [];
        this.isSet = true;
        this.position = Vector(0, 0);

        this.seqTypeIndex = 3;

        this.createSequenceInfo();
        this.setSequenceInfo(3);
        this.refreshSequenceInfo();
    }

    get cardsIdArray()
    {
        const arr = [];

        this.cards.forEach(element => {
            arr.push(element.cardId);
        });

        return arr;
    }

    addCard(card, i = -1)
    {
        if(this.cards.indexOf(card) == -1)
        {
            if(i != -1)
                this.cards.splice(i, 0, card);
            else
                this.cards.push(card);

            card.groupRef = this;

            // card.unSelect();
            card.visual.isSelected = false;
            card.visual.tint = 0xffffff;
    
        }
    }

    createSequenceInfo()
    {


        const textureArr = [];
        const sequence = [
            "set",
            "sequence",
            "sequence",
            "invalid"
        ];

        this.seqInfo = new Container();
        this.seqInfo.arr = [];
        
        const green = this.createSeqInfo("green", 333);
        const red = this.createSeqInfo("red", 333);
        const orange = this.createSeqInfo("orange", 333);

        this.seqInfo.arr.push(green);
        this.seqInfo.arr.push(red);
        this.seqInfo.arr.push(orange);

        this.seqInfo.addChild(green);
        this.seqInfo.addChild(red);
        this.seqInfo.addChild(orange);


        this.seqInfoText = new Label(0, 0, 0.5, "Invalid", 22, 0);
        this.seqInfoText.y = -25;
        this.seqInfo.addChild(this.seqInfoText);

    }

    setSeqInfo(index)
    {
        for(let i=0; i < this.seqInfo.arr.length; i++)
        {
            const seq = this.seqInfo.arr[i];

            if(i == index)
                seq.renderable = true;
            else
                seq.renderable = false;
        }
        
    }

    createSeqInfo(spriteName, width)
    {
        
        const seqContainer = new Container();

        width -= 45;
        const centerPart = new Sprite(Globals.resources[spriteName+"C"].texture);
        centerPart.anchor.set(0.5, 1);

        centerPart.x = 0;
        centerPart.width = width;
        seqContainer.addChild(centerPart);

        const lPart = new Sprite(Globals.resources[spriteName+ "L"].texture);
        lPart.anchor.set(0.5, 1);
        lPart.x -= centerPart.width/2 + lPart.width/2;
        seqContainer.addChild(lPart);


        const rPart = new Sprite(Globals.resources[spriteName+"R"].texture);
        rPart.anchor.set(0.5, 1);
        rPart.x += centerPart.width/2 + rPart.width/2;
        seqContainer.addChild(rPart);

        seqContainer.reposition = (w) => {
            w -= 45;
            centerPart.width = w;
            lPart.x = -(centerPart.width/2 + lPart.width/2);
            rPart.x = (centerPart.width/2 + rPart.width/2);
        };

        

        return seqContainer;
        
        
    }

    removeFromSequenceArr()
    {
        let index;
        switch(this.seqTypeIndex)
        {
            case 1:
                index = gameData.sequencesArr.pure.indexOf(this.uid);

                if(index != -1)
                {
                   gameData.sequencesArr.pure.splice(index, 1);
                }
                break;
            case 2:
                index = gameData.sequencesArr.impure.indexOf(this.uid);

                if(index != -1)
                {
                    gameData.sequencesArr.impure.splice(index, 1);

                }
                break;
        }
    }

    addToSequenceArr()
    {
        switch(this.seqTypeIndex)
        {
            case 1:
                gameData.sequencesArr.pure.push(this.uid);
                break;
            case 2:
                gameData.sequencesArr.impure.push(this.uid);
                break;
        }
    }
    

    setSequenceInfo(index = this.seqTypeIndex)
    {

        if(this.seqTypeIndex == index)
            return;


        this.removeFromSequenceArr();

        this.seqTypeIndex = index;

        this.addToSequenceArr();

        

    }

    refreshSequenceInfo()
    {
        this.seqInfoText.text = getSequenceType(this.seqTypeIndex, this.uid);

        let i = (this.seqTypeIndex == 3 ? 1 : 0);

        if(this.seqTypeIndex == 0)
        {
            if(gameData.sequencesArr.pure.length == 0 || gameData.sequenceLength <= 1)
            {
                i = 2;
            }
        }
    
        if(this.seqTypeIndex == 2)
        {
            if(gameData.sequencesArr.pure.length == 0)
            {
                i = 2;
            }
        } 

        this.setSeqInfo(i);
    }

    repositionSeqInfo(x, y)
    {


        for(let i = 0; i < this.seqInfo.arr.length; i++)
        {
            const seq = this.seqInfo.arr[i];
            
            seq.reposition(this.width);

        }

        this.seqInfo.x = x ;
        this.seqInfo.y = y + this.height/2;
        


        this.seqInfoText.x = this.seqInfo.x;
        this.seqInfoText.y = this.seqInfo.y - 22;
    }

    setRow(row, index)
    {
        this.cards.forEach(card => {
            if(!card.handReference)
            {
               // card.handReference.removeCard(card);
               row.container.addChild(card.visual);
               card.handReference = row;
               // row.addCard(card, index);
            }

            card.rowIndex = index;
        });
    }

    get globalPosition()
    {
        let point = fetchGlobalPosition(this.handReference.container);
        
        return Vector(point.x + this.position.x, point.y + this.position.y);
    }

    get width()
    {
        if(this.cards.length > 0)
        {
            const cardWidth = this.cards[0].width;
            return cardWidth + cardWidth * 0.5 * (this.cards.length-1);

        } else
            return 0;
    }
    
    get height()
    {        
        if(this.cards.length > 0)
            return this.cards[0].height;
        else
            return 0;
    }
    setPosition(x, y)
    {
        this.position.x = x;
        this.position.y = y;

        this.repositionSeqInfo(x, y)


        this.positionCards();
    }

    removeCard(card)
    {
        
        if(this.cards.indexOf(card) != -1)
        {
            RemoveArrayItem(this.cards, card);
            card.groupRef = undefined;
            
            if(this.cards.length == 1)
            {
               
                const lastCard = this.cards[0];

                RemoveArrayItem(this.cards, lastCard);

                
                lastCard.groupRef = undefined;
                
              
                const index = this.handReference.cards[this.rowIndex].indexOf(this);
                this.handReference.addCard(lastCard,this.rowIndex, index);
                this.handReference.removeCard(this);
                this.seqInfo.destroy();
                this.seqInfoText.destroy();

                this.removeFromSequenceArr();


            } else
            {
                const payload = {
                    t:"cardSeqCheckMsg",
                    cards: this.cardsIdArray
                }

                
                Globals.socket?.sendMessage(payload);
            }
        }
    }

    positionCards()
    {

        let i = -(this.cards.length/2 - 0.5);

        this.cards.forEach(card => {
            if(!card.isDragging)
            {
                card.setPosition(this.position.x + (i * card.width/2), this.position.y);
            }

                i++;
            
        });



    }

}