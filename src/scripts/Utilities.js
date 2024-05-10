import { Globals } from "./Globals";
import * as PIXI from 'pixi.js';


export const Vector = function(xVal, yVal){
  return { x : xVal, y : yVal }
};

export const getMousePosition = () => Globals.App.app.renderer.plugins.interaction.eventData.data.global; //change eventData.data to mouse to only get mouse pointers

export const SubtractVector = (v1, v2) => Vector(v1.x - v2.x, v1.y - v2.y);

export const GetMagnitude = (v1) => Math.sqrt(v1.x * v1.x + v1.y * v1.y);

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const fetchGlobalPosition = (component) => {
    let point = new PIXI.Point();
    
    component.getGlobalPosition(point, false);
    return point;
};

export const getRandomColor = () => {
  return Math.floor(Math.random()*16777215);
};

export const RemoveArrayItem = (arr, itemToRemove) => {
    const index = arr.indexOf(itemToRemove);

    if(index != -1)
    {
      arr.splice(index, 1);
    }
}

export const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}


export function utf8_to_b64( str ) {
  return window.btoa(encodeURIComponent( str ));
}


globalThis.logThis = (message, color = null, isObject = false) => {

    const Style = {
        base: [
          "color: #fff",
          "background-color: #444",
          "padding: 2px 4px",
          "border-radius: 2px"
        ]
      }



    let extra = [];

    if(color != null)
    {
        extra = ["background-color: " + color]
    }
    
    let style = Style.base.join(';') + ';';
    
    style += extra.join(';'); // Add any additional styles
      

    console.log(`%c${(isObject) ? JSON.stringify(message) : message}`, style);
};

const maxDimension = 512;

function calculateSize(img)
{
  let width = img.width;
  let height = img.height;
  // calculate the width and height, constraining the proportions
  if (width > height) {
    if (width > maxDimension) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    }
  } else {
    if (height > maxDimension) {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }
  return [width, height];
}
export function GetResizedTexture(imgUrl)
{
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imgUrl;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      if(img.width > maxDimension || img.height > maxDimension)
      {
        const [width, height] = calculateSize(img);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        console.log("Resized image: " + width + "x" + height);
        const dataUrl = canvas.toDataURL("image/png");
        const texture = PIXI.Texture.from(dataUrl);
        resolve(texture);
      } else
      {
        const texture = PIXI.Texture.from(imgUrl);
        resolve(texture);
      }
    }
  });
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}








