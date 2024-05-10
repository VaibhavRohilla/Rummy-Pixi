import * as PIXI from 'pixi.js';

import { config } from "./appConfig";
import { Globals } from "./Globals";
import { Label } from "./LabelScore";


export class Avatars
{
    constructor(count, container)
    {
        this.list = [];

        let j = 0;
		for (let i = 1; i <= count; i++) {
            
            this.createAvatar(i, j,  4, container);

            if(i == 3)
                j = 1;
			// this.activateAvatarImage("https://cccdn.b-cdn.net/1584464368856.png", avatar);
		}

		// const logo = new PIXI.Sprite(Globals.resources.logo.texture);
		// logo.scale.set(0.66);
		// logo.anchor.set(0.5);
		// logo.x = config.logicalWidth / 2;
		// logo.y = config.logicalHeight * 0.38;

        this.parentContainer = container;
        
		// container.addChild(logo);
    }

    createAvatar(i,j, divideValue, container)
    {
        const avatar = new PIXI.Sprite(Globals.resources.avatarBox.texture);


        avatar.anchor.set(0.5);

        avatar.scale.set(0.8);
        // avatar.scale.set(1.55);
        if(j == 1)
            i -= 3;
        avatar.x = (i * (config.logicalWidth / divideValue))// + config.logicalWidth/10;
        avatar.y = config.logicalHeight / 2  //- 340 + j *(440);

        avatar.y += (avatar.height * 1.5) * (j == 0 ? 1: -1);

        const searchingText = new Label(avatar.x, avatar.y, 0.5, "Searching..",18, 0xffffff);

        this.list.push(avatar);

        container.addChild(avatar);
        container.addChild(searchingText);
    }

    activateAvatarImage(url, avatarParent)
    {
        url = "https://cccdn.b-cdn.net/1584464368856.png";
        avatarParent.plImage = PIXI.Sprite.from(url);
        avatarParent.plImage.anchor.set(0.5);
        avatarParent.plImage.x = avatarParent.x;
        avatarParent.plImage.y = avatarParent.y;
        avatarParent.plImage.width = avatarParent.width;
        avatarParent.plImage.height = avatarParent.height;


        const maskGraphic = new PIXI.Graphics();
        maskGraphic.beginFill(0xFF3300);

        const widthPadding = (avatarParent.width * 0.07);
        const heightPadding = (avatarParent.height * 0.07);


        maskGraphic.drawRect(avatarParent.plImage.x - avatarParent.plImage.width/2  + widthPadding, (avatarParent.y - avatarParent.height/2) + heightPadding, avatarParent.width - widthPadding*2, avatarParent.height - heightPadding*2);
        maskGraphic.endFill();

        avatarParent.plImage.mask = maskGraphic;

        this.parentContainer.addChild(avatarParent.plImage);    
        this.parentContainer.addChild(maskGraphic);

    }

    removePlayerAvatar(index) {
		if (this.list[index] != undefined && this.list[index] != null) {
			const avatar = this.list[index];

			avatar.plImage.destroy();
		}
	}
}