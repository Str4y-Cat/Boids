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
        boidSprite.scale.set(0.2);
        boidSprite.speed = 1;

        // Assign additional properties for the animation.
        boidSprite.direction = boid_Obj.direction;
        boidSprite.position.copyFrom(boid_Obj.position) ;
        boidSprite.position.copyFrom(boid_Obj.position) ;
        // boidSprite.rotation=8;


        boidContainer.addChild(boidSprite);
        boidSprites.push(boidSprite);
        
    }

    

}

export function animateBoids(app, boidSprites, time , boidPositions)
{
    // Extract the delta time from the Ticker object.
    const delta = time.deltaTime;

    //Parameters
    const stagePadding = 10;
    const boundWidth = app.screen.width + stagePadding * 2;
    const boundHeight = app.screen.height + stagePadding * 2;

    // Iterate through each fish sprite.
    boidSprites.forEach((boidSprite,i) =>
    {
        

        boidSprite.direction = boidPositions[i].direction;

        
        boidSprite.position.copyFrom(boidPositions[i].position)

        
        boidSprite.rotation = boidSprite.direction - Math.PI / 2;

     
      
    });
}

export function setUpBoidMain(boidClass,app, mainBoid, )
{
    mainBoid.eventMode = 'static';
    mainBoid.cursor = 'pointer';
    mainBoid.on('pointerdown', ()=>{
       console.log(boidClass.arra(0))
       console.log(boidClass.getCloseBoids(0))
    });

    let circle = new Graphics()
    .circle(0, 0, 50)
    .stroke({ width: 2, color: 0xfeeb77 });

    app.stage.addChild(circle);
    console.log(app)

    return circle
}

export function updateMainBoid( mainBoid, circle)
{
  circle.position.copyFrom(mainBoid.position)
//   circle.position.x+=10
//   circle.position.y=0

//   console.log(mainBoid.position)
 

}

export function updateHaloSize(app,halo, size){
    halo.destroy()
    let circle = new Graphics()
    .circle(0, 0, size)
    .stroke({ width: 2, color: 0xfeeb77 });
    app.stage.addChild(circle);

    return circle
}



