import { display, Graphics, Sprite } from "pixi.js";
import { config } from "./appConfig";
import { gameData, gameProperties, Globals, sceneGlobals, SUIT } from "./Globals";
import { fetchGlobalPosition, GetMagnitude, getRandomColor, SubtractVector, Vector } from "./Utilities";
import * as TWEEN from '@tweenjs/tween.js';
import { Label } from "./LabelScore";

export class Card
{
    constructor(cardId, i)
    {
        this.cardId = cardId;
        this.name = "card" + i;

        const cardArr =  this.cardId.split('-');
        const jokerArr = gameData.jokerCard.split('-');
        this.isJoker = (cardArr[0] == jokerArr[0]);


        this.createVisual();
        



        

        this.addInterectivity();
    }

    createVisual()
    {

        this.visual = new Sprite(Globals.resources[SUIT.Convert(this.cardId)].texture);
        this.visual.anchor.set(0.5);
        this.visual.parentCard = this;
        

        if(this.isJoker)
        {
            const jokerSymbol = new Sprite(Globals.resources.jokerIcon.texture);
            jokerSymbol.scale.set(0.8);
            jokerSymbol.anchor.set(0, 0.5);

            jokerSymbol.x -= this.visual.width/2 - 5;
            jokerSymbol.y += 35;

            this.visual.addChild(jokerSymbol);
        }

        // this.visual.nameText = new Label(0, 0, 0.5, this.name, 23, 0x00ff00);
        // this.visual.addChild(this.visual.nameText);
    }



    getRandomCardName()
    {
        let result = "c";
        const cat = "CDHS";
        const card = "234567890AKJQ";

        result += cat.charAt(Math.floor(Math.random() * cat.length));
        let x =  card.charAt(Math.floor(Math.random() * card.length));

        if(x == "0")
            x = "10";
        
        result += x;

        return result;
    }
    
    onPointerDown(event)
    {
        this.visual.data = event.data;
 
        this.visual.dragging = true;
        
        this.visual.scale.x *= 1.1;
        this.visual.scale.y *= 1.1;

        this.visual.dragPoint = event.data.getLocalPosition(this.visual.parent);

        this.visual.dragPoint.x -= this.visual.x;
        this.visual.dragPoint.y -= this.visual.y;

        this.visual.startPoint = Vector(this.visual.x, this.visual.y);

    }

   onPointerMove(event)
    {
        const newPosition = this.visual.data.getLocalPosition(this.visual.parent);
        this.visual.x = newPosition.x - this.visual.dragPoint.x;
        this.visual.y = newPosition.y - this.visual.dragPoint.y;


        if(!this.visual.isDragged)
        {
            const difference = SubtractVector(this.visual.startPoint, this.visual.position);
            
            this.visual.isDragged = GetMagnitude(difference) > 16;
            
            if(this.visual.isSelected && this.visual.isDragged)
            {
                this.unSelect();
            } 
        }

        if(this.visual.isDragged)                
            this.visual.emit("dragging");
    }
   
   
  addInterectivity()
    {
        this.visual.interactive = true;


        this.visual.on('touchstart', (event) => {

            // console.log(event);
            if(!this.visual.dragging && event.data.pointerId == 0)
            {
                this.onPointerDown(event);

            }
        }, this);

        this.visual.on("mousedown", (event) => {
            if(!this.visual.dragging)
            {
                this.onPointerDown(event);
            }
        });

        // this.visual.on('mouseup', (event) => {
        //     if(event.data.pointerId == 0)
        //         this.dragEnd(event);
        // }, this);

        // this.visual.on('mouseupoutside', (event) => {
        //     if(event.data.pointerId == 0)
        //         this.dragEnd(event);
        // }, this);

        this.visual.on('touchmove', (event) => {
            if(this.visual.dragging && event.data.pointerId == 0)
            {
                this.onPointerMove(event);
            }
        }, this);

        this.visual.on('mousemove', (event) => {
            if(this.visual.dragging)
            {
                this.onPointerMove(event);
            }
        });
    }

 
    get isDragging()
    {
        return this.visual.dragging;
    }

    select()
    {
        this.visual.isSelected = true;
        this.visual.tint = 0xA8D1DF;
        this.visual.emit("selected");
    }

    unSelect()
    {
        this.visual.isSelected = false;
        this.visual.tint = 0xffffff;
        this.visual.emit("unselect");
    }

    removeFromSource(removeAll = false)
    {
        if(this.groupRef != undefined)
        {
            this.groupRef.removeCard(this);

        } else
        {
            this.handReference.removeCard(this);
        }

        if(removeAll)
            this.handReference.removeFromAllCards(this);
    }



    dragEnd(event)
    {
        if(this.visual.dragging)
        {
            this.visual.dragging = false;
            this.visual.scale.x /= 1.1;
            this.visual.scale.y /= 1.1;

            this.visual.data = null;
            

            // if(sceneGlobals.hoveredGroup == null)
            //     this.visual.emit("dragUp");
            // else
            //     this.visual.emit("dragEnd");

            if(this.visual.isDragged)
            {
                this.visual.emit("dragEnd");
                this.visual.isDragged = false;

            } else
            {
                if(!this.visual.isSelected)
                {
                    this.select();
                }else
                {
                    this.unSelect();
                }
            }
        }
    }

    setPosition(x, y)
    {
        // this.visual.x = x;
        // this.visual.y = y;

        if(!this.visual)
            return;

        if(this.visual.moveTween != undefined)
        {
            this.visual.moveTween.stop();
            this.visual.moveTween = undefined;
        }

        this.visual.moveTween = new TWEEN.Tween(this.visual)
        .to({x : x, y : y})
        .duration(250)
        .start();

        // this.visual.x = x;
        // this.visual.y = y;
    }

    get width()
    {
        return this.visual.width;
    }

    get height()
    {
        return this.visual.height;
    }

    get right()
    {
        return this.visual.x + this.visual.width;
    }

    get globalPosition()
    {
        return fetchGlobalPosition(this.visual);
    }

    get gLeft()
    {
        return this.globalPosition.x - (this.visual.width/2) * config.minScaleFactor;
    }

    get gRight()
    {
        return this.globalPosition.x + (this.visual.width/2) * config.minScaleFactor;
    }

    get gTop()
    {
        return this.globalPosition.y - (this.visual.height/2) * config.minScaleFactor;
    }

    get gBottom()
    {
        return this.globalPosition.y + (this.visual.height/2) * config.minScaleFactor;
    }

    isInsideBounds(point)
    {
        return (this.gLeft < point.x && this.gRight > point.x
                &&
                this.gTop < point.y && this.gBottom > point.y);
    }

 

    // checkInteraction(mousePosition)
    // {
    //     if( mousePosition.x > this.gLeft && mousePosition.x < this.gRight
    //         &&
    //         mousePosition.y < this.gBottom && mousePosition.y > this.gTop)
    //     {
    //         this.visual.tint = 0xc500c5;
    //         return true;
    //     } else
    //     {
    //         if(this.isSelected)
    //             this.visual.tint = 0x00ff00;
    //         else
    //             this.visual.tint = 0xffffff;

    //         return false;
    //     }

    // }

    destroyVisual()
    {
        if(this.visual.moveTween != undefined && this.visual.moveTween.isPlaying())
        {
            this.visual.moveTween.stop();
        }

        this.visual.interactive = false;
        this.visual.destroy();
    }

}