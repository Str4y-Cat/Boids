import GUI from "lil-gui"
// import { Application, Assets } from 'pixi.js';
import * as PIXI from 'pixi.js';
import * as ANIMATE from './animate';
import BOID from "./boids2";


const gui= new GUI()
const debug={
    hideDebug:false,
}
const tweaks={
    boidCount:500,
    // minDistance:50,

    visualRange:75,
    
    protectedRange:20,
    cohesionFactor:0.00206,
    matchingFactor:0.05,
    seperationFactor:0.08648,
    turnFactor:0.2,
    solidPadding:20,

    minSpeed:3,
    maxSpeed:7,
    wallTransparent:false
}

const sizes={
    width:window.innerWidth,
    height:window.innerHeight,
}

const boids= new BOID(tweaks.boidCount,sizes,tweaks)

gui.add(tweaks,"cohesionFactor").min(0).max(0.05).step(0.00001).onChange((num)=>{
    boids.cohesionFactor=num
})
gui.add(tweaks,"matchingFactor").min(0).max(0.1).step(0.00001).onChange((num)=>{
    boids.matchingFactor=num
})
gui.add(tweaks,"seperationFactor").min(0).max(0.1).step(0.00001).onChange((num)=>{
    boids.seperationFactor=num
})
gui.add(tweaks,"turnFactor").min(0).max(5).step(0.001).onChange((num)=>{
    boids.turnFactor=num
})
gui.add(tweaks,"minSpeed").min(0).max(10).step(0.001).onChange((num)=>{
    boids.minSpeed=num
})
gui.add(tweaks,"maxSpeed").min(0).max(10).step(0.001).onChange((num)=>{
    boids.maxSpeed=num
})
gui.add(tweaks,"wallTransparent").onChange((bool)=>{
    boids.wallTransparent=bool
})



// Create a PixiJS application.
const app = new PIXI.Application();

// Store an array of fish sprites for animation.
const boidSprites = [];




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

        

        ANIMATE.addBoidsToScene(app, boidSprites,boids.boidArray);

        let debugBox=debugBounding()
        // console.log(debugBox)
        gui.add(tweaks,'solidPadding').min(0).max(300).step(1).onChange((padding)=>
        {
            boids.updateSolidBoundingBox(padding)

            debugBox= ANIMATE.updateDebugBoundingBox(app, debugBox, padding,sizes )
        })
        // gui.add()

        const halos=debugHalos()
        const mainBoid=boids.getMain()
        gui.add(debug,"hideDebug").onChange((bool)=>{
            ANIMATE.setHaloVisability(halos,bool)
            ANIMATE.setBoxVisability(debugBox,bool)
        })

        let past=false

        // values.mousePos= enableUserInput(app)
        // app.stage.addEventListener('pointermove', (e) =>
        //     {
        //         values.mousePos=e.global
        //     });
        
        app.ticker.add((time) =>
            {   
                boids.update()
                // 

                ANIMATE.animateBoids(app, boidSprites, time, boids.boidArray,values.mousePos)
                ANIMATE.updateMainBoid(mainBoid,halos,debug.hideHalos)
                // console.log(values.mousePos)
                // if(time.lastTime%5000<50&&!past){
                //     past=true
                //     console.log(boids.boidArray)

                // }
                // else if(past){
                //     past=false
                // }
                // console.log(time.lastTime%1000<50)
                // console.log(time)
                
                // console.log(boid.boidArray)
            } );
    
    })();




    //UTILS
    function enableUserInput(app){
        let mousePos={}
        app.stage.addEventListener('pointermove', (e) =>
            {
                mousePos=e.global
            });
        
        return mousePos
    }

function debugHalos()
{
    // const mainBoid=boidSprites[0]
    let halos=ANIMATE.setUpDebugTools(app,tweaks.visualRange,tweaks.protectedRange)

    gui.add(tweaks,'visualRange').min(0).max(400).onChange((size)=>{
        boids.visualRange=size
        halos.visCircle=ANIMATE.updateDebugRange(app,halos.visCircle,size,"#42ff33")
    })
    gui.add(tweaks,'protectedRange').min(0).max(200).onChange((size)=>{
        boids.protectedRange=size
        halos.avoidCircle=ANIMATE.updateDebugRange(app,halos.avoidCircle,size,"#FF0000")
    })

    return halos
}

function debugBounding()
{
    let box=ANIMATE.setUpDebugBoundingBox(app,tweaks.solidPadding,sizes)
    return box
    
}