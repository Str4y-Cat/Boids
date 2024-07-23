export function addBoids(app, boids)
{
    // Create a container to hold all the fish sprites.
    const boidContainer = new Container();

    // Add the boid container to the stage.
    app.stage.addChild(boidContainer);


    const boidCount = 1;
    const boidAssets = ['boid1'];

    // Create a boid sprite for each boid.
    for (let i = 0; i < boidCount; i++)
    {
        // Cycle through the boid assets for each sprite.
        const boidAsset = boidAssets[i % boidAssets.length];

        // Create a boid sprite.
        const boid = Sprite.from(boidAsset);

        // Center the sprite anchor.
        boid.anchor.set(0.5);

        // Assign additional properties for the animation.
        boid.direction = Math.random() * Math.PI * 2;
        boid.speed = 0;
        // boid.turnSpeed = Math.random() - 0.8;

        // Randomly position the boid sprite around the stage.
        boid.position.x = Math.random() * app.screen.width;
        boid.position.y = Math.random() * app.screen.height;

        // Randomly scale the boid sprite to create some variety.
        boid.scale.set(0.2);

        // Add the boid sprite to the boid container.
        boidContainer.addChild(boid);

        // Add the boid sprite to the boid array.
        boids.push(boid);

        console.log(boid.position)
        
    }

    

}


export function animateBoids(app, fishes, time, mousePos)
{
    // Extract the delta time from the Ticker object.
    const delta = time.deltaTime;

    // Define the padding around the stage where fishes are considered out of sight.
    const stagePadding = 10;
    const boundWidth = app.screen.width + stagePadding * 2;
    const boundHeight = app.screen.height + stagePadding * 2;

    // Iterate through each fish sprite.
    fishes.forEach((fish) =>
    {
        // Animate the fish movement direction according to the turn speed.
        const angle= getAngle(mousePos,fish.position)
        // console.log(angle)

        fish.direction = angle;

        // Animate the fish position according to the direction and speed.
        fish.x += -Math.cos(fish.direction) * fish.speed;
        fish.y += -Math.sin(fish.direction) * fish.speed;

        // Apply the fish rotation according to the direction.
        fish.rotation = -fish.direction - Math.PI / 2;

        // Wrap the fish position when it goes out of bounds.
        if (fish.x < -stagePadding)
        {
            fish.x += boundWidth;
        }
        if (fish.x > app.screen.width + stagePadding)
        {
            fish.x -= boundWidth;
        }
        if (fish.y < -stagePadding)
        {
            fish.y += boundHeight;
        }
        if (fish.y > app.screen.height + stagePadding)
        {
            fish.y -= boundHeight;
        }
    });
}
