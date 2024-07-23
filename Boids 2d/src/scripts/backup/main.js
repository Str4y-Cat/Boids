import GUI from "lil-gui"
// import { Application, Assets } from 'pixi.js';
import * as PIXI from 'pixi.js';
import * as ANIMATE from './animate';
import BOID from "./boids";


const gui= new GUI()

const debug={
    boidCount:50,
    minDistance:50,

}

const sizes={
    width:window.innerWidth,
    height:window.innerHeight,

}


// Create a PixiJS application.
const app = new PIXI.Application();

// Store an array of fish sprites for animation.
const boidSprites = [];


const boidClass= new BOID(debug.boidCount,sizes,debug.minDistance)

// gui.add(debug,'boidCount').min(1).max(100).step(1)

async function setup()
{
    await app.init({ background: '#1099bb', resizeTo: window });
    document.body.appendChild(app.canvas);
    // Enable interactivity!
    app.stage.eventMode = 'static';

    // Make sure the whole canvas area is interactive, not just the circle.
    app.stage.hitArea = app.screen;
}

async function preload()
{
    const assets = [
        { alias: 'boid1', src: '/img/pointy.png' },

    ];
    await PIXI.Assets.load(assets);
}


// Async "MAIN"
(async () =>
    {
 
    
    const values={
        mousePos: {x:0, y:0}
    }
    
        await setup();
        await preload();

        

        ANIMATE.addBoidsToScene(app, boidSprites,boidClass.boidArray);

        const mainBoid=boidSprites[0]

        let mainBoidHalo=ANIMATE.setUpBoidMain(boidClass,app, mainBoid)

        gui.add(debug,'minDistance').min(0).max(200).onChange((size)=>{
            // console.log(mainBoidHalo)
            boidClass.minDistance=size
            mainBoidHalo=ANIMATE.updateHaloSize(app,mainBoidHalo,size)
            // console.log(mainBoidHalo)

        })
        

        
        app.ticker.add((time) =>
            {   
                boidClass.update()
                // 

                ANIMATE.animateBoids(app, boidSprites, time, boidClass.boidArray)
                ANIMATE.updateMainBoid(mainBoid,mainBoidHalo)
                
                // console.log(boid.boidArray)
            } );
    
    })();




    //UTILS
    function enableUserInput(app){
        const mousePos={}
        app.stage.addEventListener('pointermove', (e) =>
            {
                mousePos=e.global
            });
        return mousePos
    }