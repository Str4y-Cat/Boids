import { Container, Sprite, Graphics } from 'pixi.js';


export function addBoidsToScene(app, boidSprites, boidPositions)
{
    // Create a container to hold all the sprites.
    const boidContainer = new Container();

    // Add the boid container to the stage.
    app.stage.addChild(boidContainer);

    const boidAsset = 'boid1';

    // Create a boid sprite for each boid.
    for (const boid_Obj of boidPositions)
    {
        

        // Create a boid sprite.
        const boidSprite = Sprite.from(boidAsset);

        // Center the sprite anchor.
        boidSprite.anchor.set(0.5);
        boidSprite.scale.set(0.1);

        // Assign additional properties for the animation.
        boidSprite.x=boid_Obj.x ;
        boidSprite.y=boid_Obj.y ;
        // boidSprite.rotation=8;


        boidContainer.addChild(boidSprite);
        boidSprites.push(boidSprite);
        
    }

    

}

export function animateBoids(app, boidSprites, time , boidPositions,mousePos)
{
    // Extract the delta time from the Ticker object.
    const delta = time.deltaTime;

    //Parameters
    

    // Iterate through each fish sprite.
    boidSprites.forEach((boidSprite,i) =>
    {
        

        // boidSprite.direction = boidPositions[i].direction;

        const boid=boidPositions[i]
        

        boidSprite.x=boid.x
        boidSprite.y=boid.y
        boidSprite.rotation= Math.atan2((boid.targetY)-boid.y,(boid.targetX)-boid.x)
        // boidSprite.rotation= 0
        // console.log(  boidSprite.rotation)
        
        // boidSprite.rotation = boidSprite.direction - Math.PI / 2;
        // boidSprite.rotation =  Math.PI / 2;

     
      
    });
}

export function setUpDebugTools(app, visRange, avoidRange )
{
    //vis range circle
    let visCircle = new Graphics()
        .circle(0, 0, visRange)
        .stroke({ width: 2, color: "#42ff33" });

    app.stage.addChild(visCircle);

    //avoid range circle

    let avoidCircle = new Graphics()
        .circle(0, 0, avoidRange)
        .stroke({ width: 2, color: "#ff0000" });

    app.stage.addChild(avoidCircle);
    
    const temp=
    {
        visCircle,
        avoidCircle
    }

    return temp
}
export function setUpDebugBoundingBox(app, boundingBox,sizes )
{
    //vis range circle
    let box = new Graphics()
        .rect(boundingBox, boundingBox, sizes.width-boundingBox*2, sizes.height-boundingBox*2)
        .stroke({ width: 2, color: "#42ff33" });

    app.stage.addChild(box);
    return box
}
export function updateDebugBoundingBox(app, box, boundingBox,sizes )
{
    // console.log(box)
    box.destroy()
    //vis range circle
     box= new Graphics()
        .rect(boundingBox, boundingBox, sizes.width-boundingBox*2, sizes.height-boundingBox*2)
        .stroke({ width: 2, color: "#42ff33" });

    app.stage.addChild(box);
    return box
}

export function updateMainBoid( mainBoid, halos,hide)
{
//   circle.position.copyFrom(mainBoid.position)


            halos.visCircle.x=mainBoid.x
            halos.visCircle.y=mainBoid.y
        
            halos.avoidCircle.x=mainBoid.x
            halos.avoidCircle.y=mainBoid.y
        
 



//   circle.position.x+=10
//   circle.position.y=0

//   console.log(mainBoid.position)
 

}

export function setHaloVisability(halos,hide){
    if(!hide)
        {
            halos.visCircle.visible=true
            halos.avoidCircle.visible=true
        }
    else
    {
        halos.visCircle.visible=false
        halos.avoidCircle.visible=false
    }
}
export function setBoxVisability(box,hide){
    if(!hide)
        {
            box.visible=true
        }
    else
    {
        box.visible=false
    }
}

export function updateDebugRange(app,halo, size, colour){
    halo.destroy()
    let circle = new Graphics()
    .circle(0, 0, size)
    .stroke({ width: 2, color: colour});
    app.stage.addChild(circle);

    return circle
}



