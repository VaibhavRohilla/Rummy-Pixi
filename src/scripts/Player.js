import { Container, Graphics, Sprite } from "pixi.js";
import { config } from "./appConfig";
import { gameData, Globals } from "./Globals";
import { Label } from "./LabelScore";
import * as TWEEN from "@tweenjs/tween.js";
import{ GetResizedTexture} from "./Utilities.js";


export class Player
{
    constructor(plId, pName, pBal, position, tossCardPosition)
    {
        this.isMine = (position == null);
        this.plId = plId;
        this.container = new Container();
        this.tossCardPosition = tossCardPosition;
        this.name = pName;

        this.addPlayerAvatar(position);
        this.addTimer();
        this.addBalance(pBal);
        this.addName(this.name);
        const ratio = 0.9;
        this.createRounding(
            this.avatarBackground.x - this.avatarBackground.width/2 + this.avatarBackground.width * (1 -ratio)/2,
            this.avatarBackground.y - this.avatarBackground.height/2 + this.avatarBackground.height * (1 - ratio)/2,
            12,
            this.avatarBackground.width*ratio,
            this.avatarBackground.height*ratio, 30
        );

        this.lastValues = {
            ratio : 1
        };


        this.turnActivate(false);



        // this.updateBox(0.1);
        // this.showTossCard("1-S");

        // this.kicked();

        // this.disconnected();

    }

    // update(dt)
    // {
    //     // if(this.pre == undefined)
    //     //     this.pre = 0;
        
    //     // this.pre += 0.001;
    //     // this.updateBox(this.pre);
    // }

    updateTimer(per, boolValue)
    {
        
        const tween = new TWEEN.Tween(this.lastValues)
        .to({ratio : per}, 999)
        .onUpdate(
            (value) => {
                if(this.roundingContainer.renderable)
                this.updateBox(value.ratio, boolValue);
            }
        )
        .onComplete((value) => {
            this.lastValues.ratio = value.ratio;
        })
        .start();

        if(boolValue && this.plId == gameData.plId)
        {
            Globals.soundResources.tick.play();

            try
            {
                navigator.vibrate(300);
            }
            catch
            {
                console.log("Navigator blocked by device.");
            }
        }

    }


    addPlayerAvatar(avatarPos)
    {
        this.avatarContainer = new Container();
        this.avatarContainer.sortableChildren = true;
        this.container.addChild(this.avatarContainer);

        

        if(avatarPos != null)
        {
            this.avatarContainer.x = avatarPos.x;
            this.avatarContainer.y = avatarPos.y;
            this.avatarContainer.scale.set(0.7);

        } else
        {
            this.avatarContainer.y = config.logicalHeight - 200;
            this.avatarContainer.x = 150;
            this.avatarContainer.scale.set(0.8);

        }



        this.avatarBackground = new Sprite(Globals.resources.avatarBg.texture);
        this.avatarBackground.anchor.set(0.5);
        this.avatarBackground.zIndex = 2;

        // this.avatarBackground.scale.set(0.8);

        this.avatarBox = new Sprite(Globals.resources.avatarBox.texture);
        this.avatarBox.anchor.set(0.5);
        this.avatarBackground.addChild(this.avatarBox);

        this.avatarBackground.interactive = true;

        this.avatarBackground.on("pointerdown", () => {

            console.log("CLICKED PROFILE :" + gameData.players[this.plId].pDefaultId);
            try {
                if (JSBridge != undefined) {
                    JSBridge.sendMessageToNative(JSON.stringify({"t" :"pClicked", "data":gameData.players[this.plId].pDefaultId}));
                }
            } catch {
                console.log("JS Bridge Not Found!");
            }
        });

        // const avatar = new Sprite(Globals.resources.avatar1.texture);
        // if(!gameData.players[this.plId].pImage)
        //     gameData.players[this.plId].pImage = "https://cccdn.b-cdn.net/1584464368856.png";


        GetResizedTexture(gameData.players[this.plId].pImage).then((texture)=>{this.resizeAvatar(texture);})

        this.playerDeactive = new Sprite(Globals.resources.playerDeactive.texture);
        this.playerDeactive.anchor.set(0.5);
        this.playerDeactive.renderable = false;
        this.avatarContainer.addChild(this.avatarBackground);
        this.avatarBackground.addChild(this.playerDeactive);

    }

    resizeAvatar(texture)
    {
        const avatarMask = new Sprite(Globals.resources.avatarMask.texture);
        avatarMask.anchor.set(0.5);
        // avatarMask.tint = 0x00ff00;

        avatarMask.y = this.avatarBox.height * 0.45 - avatarMask.height/2;

        this.avatarBox.addChild(avatarMask);

        const avatar = Sprite.from(texture);

        avatar.anchor.set(0.5);

        avatar.width = avatarMask.width * 1.1;
        avatar.height = avatarMask.height * 1.1;


        avatar.x = avatarMask.x;
        avatar.y = avatarMask.y;

        avatar.mask = avatarMask;
        this.avatarBox.addChild(avatar);
    }

    init()
    {
        if(gameData.isDropped) 
            return;

        this.mainTimer.renderable = true;
        this.secondaryTimer.renderable = true;
    }

    turnActivate(value)
    {
        this.roundingContainer.renderable = value;

        if(!value)
            this.lastValues.ratio = 1;
    }

    dropped()
    {

        if(this.playerDeactive.renderable)
            return;

        this.playerDeactive.renderable = true;

        this.drop = new Sprite(Globals.resources.playerDropped.texture);

        this.drop.anchor.set(0.5);

        this.avatarBackground.addChild(this.drop);
    }

    disconnected()
    {

        if(this.playerDeactive.renderable)
            return;

        this.playerDeactive.renderable = true;

        this.discon = new Sprite(Globals.resources.playerDisconnect.texture);
        this.discon.scale.set
        this.discon.anchor.set(0.5);

        this.avatarBackground.addChild(this.discon);
    }

    kicked()
    {
        this.removeState();
        if(this.playerDeactive.renderable)
            this.avatarBackground.removeChild()

        this.playerDeactive.renderable = true;

        this.kick = new Sprite(Globals.resources.playerLeft.texture);

        this.kick.anchor.set(0.5);

        this.avatarBackground.addChild(this.kick);
    }

    waiting()
    {   
        if(this.playerDeactive.renderable)
            return;

        this.playerDeactive.renderable = true;

        this.wait = new Sprite(Globals.resources.playerWaiting.texture);

        this.wait.anchor.set(0.5);

        this.avatarBackground.addChild(this.wait);
    }

    declared()
    {   
        if(this.playerDeactive.renderable)
            return;

        this.playerDeactive.renderable = true;

        this.declare = new Sprite(Globals.resources.playerDeclared.texture);

        this.declare.anchor.set(0.5);

        this.avatarBackground.addChild(this.declare);
    }

    removeState()
    {
        if(!this.playerDeactive.renderable)
            return;

        this.playerDeactive.renderable = false;


        if(this.discon)
        {
            this.discon.destroy();
            this.discon = undefined;
        }

        if(this.wait)
        {
            this.wait.destroy();
            this.wait = undefined;
        }

        if(this.drop)
        {
            this.drop.destroy();
            this.drop = undefined;
        }

        if(this.declare)
        {
            this.declare.destroy();
            this.declare = undefined;
        }

        if(this.kick)
        {
            this.kick.destroy();
            this.kick = undefined;
        }


    }

    addTimer()
    {



        this.mainTimer = new Sprite(Globals.resources.playerTimerBg.texture);


        this.secondaryTimer = new Sprite(Globals.resources.playerSecTimerBg.texture);

        
        this.mainTimer.text = new Label(0, 0, 0.5, "00", 32, 0);
        this.secondaryTimer.text = new Label(0, 0, 0.5, "90", 28, 0);

        if(this.isMine)
        {
            this.mainTimer.anchor.set(0.2, 0.5);
            this.mainTimer.x = this.avatarBackground.width/2;
            this.mainTimer.y -= 20;

            this.secondaryTimer.anchor.set(0.15, 0.5);
            this.secondaryTimer.x = this.avatarBackground.width/2;
            this.secondaryTimer.y += 40;

            this.mainTimer.text.x += this.mainTimer.width * 0.3;
            this.secondaryTimer.text.x += this.secondaryTimer.width * 0.35;
        } else
        {
            this.mainTimer.anchor.set(0.5);
            this.mainTimer.x += 30;
            this.mainTimer.y -= this.avatarBackground.height/2 + this.mainTimer.height * 0.3;

            this.secondaryTimer.anchor.set(0.5);
            this.secondaryTimer.x -= 40;
            this.secondaryTimer.y -= this.avatarBackground.height/2 + this.secondaryTimer.height * 0.35;

        }




        this.avatarContainer.addChild(this.mainTimer);
        this.avatarContainer.addChild(this.secondaryTimer);

        this.mainTimer.addChild(this.mainTimer.text);
        this.secondaryTimer.addChild(this.secondaryTimer.text);

        this.mainTimer.renderable = false;
        this.secondaryTimer.renderable = false;

    }


    showTossCard(cardId)
    {
        this.tossCard = new Sprite(Globals.resources[cardId].texture);
        this.tossCard.anchor.set(0.5, 0);
        this.tossCard.x = this.tossCardPosition.x;
        this.tossCard.y = this.tossCardPosition.y;

        this.avatarContainer.addChild(this.tossCard);
    }



    removeTossCard()
    {
        if(this.tossCard != undefined)
            this.tossCard.destroy();
    }

    addBalance(bal)
    {
        // if(gameData.plId != this.plId)
        //     return;

        const scoreBg = new Sprite(Globals.resources.playerChipBg.texture);
        scoreBg.anchor.set(0.5);

        // scoreBg.x = this.avatarContainer.x;
        scoreBg.y = this.avatarBackground.height/2 + scoreBg.height * 0.6;

        if(bal == null)
            bal = "0000";
            
        scoreBg.circle = new Sprite(Globals.resources.playerChip.texture);
        scoreBg.circle.anchor.set(0, 0.5);
        scoreBg.circle.x = scoreBg.x - scoreBg.width * 0.4;
        scoreBg.circle.y = scoreBg.y;

        this.balanceText = new Label(scoreBg.circle.position.x +scoreBg.circle.width + 20, scoreBg.circle.position.y, 0.5, bal, 38, 0xffffff);
        this.balanceText.anchor.x = 0;

        this.avatarContainer.addChild(scoreBg);
        this.avatarContainer.addChild(this.balanceText);
        this.avatarContainer.addChild(scoreBg.circle);
        
    }

    updateBalance(bal)
    {
        // if(gameData.plId == this.plId)
            this.balanceText.text = bal;
    }

    addName(name)
    {

        if(name.length > 12)
        {
            name = name.substring(0, 10);
            name += "..."
        }

        const nameText = new Label(0, -this.avatarBox.height * 0.45, 0.5 , name, 32, 0xffffff, 'BarlowBold');
        nameText.anchor.set(0.5, 0);
        this.avatarBox.addChild(nameText);     
    }


    createRounding(x, y, lineSize, width, height, arcRadius)
    {
        this.roundingContainer = new Container();
        this.roundingContainer.x = x;
        this.roundingContainer.y = y;
        this.roundingContainer.zIndex = 3;
        this.avatarContainer.addChild(this.roundingContainer);

        const edge1 = new Graphics();
        edge1.lineStyle(lineSize, 0x61cc5f, 1);
        edge1.drawRoundedRect(0, 0, width, height, arcRadius);
        edge1.endFill();

        const edge2 = new Graphics();
        edge2.lineStyle(lineSize, 0xfb6163, 1);
        edge2.drawRoundedRect(0, 0, width, height, arcRadius);
        edge2.endFill();
        
    
        // Mask in this example works basically the same way as in example 1. Except it is reversed and calculates the mask in straight lines in edges.
        const mask = new Graphics();
        mask.position.set(width / 2, height / 2);
        edge1.mask = mask;
        edge2.mask = mask;

        this.roundingContainer.addChild(edge1);
        this.roundingContainer.addChild(edge2);
        this.roundingContainer.addChild(mask);

        edge2.renderable = false;
    
        this.updateBox = (percentage, boolVal) => {

            edge1.renderable = !boolVal;
            edge2.renderable = boolVal;



            const phase = percentage * (Math.PI * 2);
            // Calculate target point.
            const x = Math.cos(phase - Math.PI / 2) * width;
            const y = Math.sin(phase - Math.PI / 2) * height;
            // Line segments
            const segments = [
                [-width / 2 + lineSize, -height / 2 + lineSize, width / 2 - lineSize, -height / 2 + lineSize], // top segment
                [width / 2 - lineSize, -height / 2 + lineSize, width / 2 - lineSize, height / 2 - lineSize], // right
                [-width / 2 + lineSize, height / 2 - lineSize, width / 2 - lineSize, height / 2 - lineSize], // bottom
                [-width / 2 + lineSize, -height / 2 + lineSize, -width / 2 + lineSize, height / 2 - lineSize], // left
            ];
            // To which dir should mask continue at each segment
            let outDir = [
                [0, -1],
                [1, 0],
                [0, 1],
                [-1, 0],
            ];
    
            // Find the intersecting segment.
            let intersection = null;
            let winding = 0;
            // What direction should the line continue after hit has been found before hitting the line size
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                const hit = this.intersect(0, 0, x, y, segment[0], segment[1], segment[2], segment[3]);
                if (hit) {
                    intersection = hit;
                    if (i === 0) winding = hit.x < 0 ? 0 : 4;
                    else winding = 4 - i;
                    outDir = outDir[i];
                    break;
                }
            }
    
            const corners = [
                -width / 2 - lineSize, -height / 2 - lineSize, // Top left,
                -width / 2 - lineSize, height / 2 + lineSize, // Bottom left
                width / 2 + lineSize, height / 2 + lineSize, // Bottom right
                width / 2 + lineSize, -height / 2 - lineSize, // Top right
            ];
    
            // Redraw mask
            mask.clear();
            mask.lineStyle(2,  0xfb6163, 1);
            mask.beginFill(0xff0000, 1);
    
            mask.moveTo(0, 0);
            mask.moveTo(0, -height / 2 - lineSize);
    
            // fill the corners
            for (let i = 0; i < winding; i++) {
                mask.lineTo(corners[i * 2], corners[i * 2 + 1]);
            }
    
            mask.lineTo(intersection.x + outDir[0] * lineSize * 2, intersection.y + outDir[1] * lineSize * 2);
            mask.lineTo(intersection.x, intersection.y);
            mask.lineTo(0, 0);
    
            mask.endFill();
        };

    }



    intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return false;
        }
    
        const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    
        // Lines are parallel
        if (denominator === 0) {
            return false;
        }
    
        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
    
        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false;
        }
    
        // Return a object with the x and y coordinates of the intersection
        const x = x1 + ua * (x2 - x1);
        const y = y1 + ua * (y2 - y1);
    
        return { x, y };
    }

    destroy(isLeft)
    {
        this.mainTimer.text.text = "--";
        this.secondaryTimer.text.text = "--";


        console.log("Left is " + isLeft)

        if(isLeft)
        this.kicked();
        else
        this.disconnected();

    }

    delete()
    {
        this.container.destroy();
    }
    
}