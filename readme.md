# 3D Boids Simulation Tool

![Boid Simulation](./static/img/Capture8.PNG)
## Description
three-boids-js is a JavaScript library designed to help developers easily create and customize boid simulations directly in the browser. Inspired by Craig Reynolds' "Boids" algorithm, this tool aims to provide a straightforward API to create, control, and visualize flocks of boids with minimal setup.

## Features
- **Easy Setup:** Quickly initialize boid simulations with a simple configuration.
- **Customizable Behavior:** Take controll over a variety parameters to tweak the boid behavior, update parameters in real time using the debug panel.
-  **Performance Optimized:** Efficiently handles large numbers of boids with smooth animations.
-  - _Instanced Meshes_ All boid meshes are dynamically instanced, resulting in only 1 draw call
-  - _Octree and BVH Optimized raycasting_ takes advantage of special datastructures to effectively nullify cost
- **Object Avoidance:** Easily add objects for boids to avoid. Uses Optimized raycasting algorithms with tweakable parameters



## Instructions
1. Clone or download the repository to your local machine.
2. Run `npm install` to install dependencies.
3. In the command line, run `npm run dev` to start the development server.

## API Reference
| Method | Description | Default |
|----------|----------|----------|
| initBoids(_count_) | Creates a new Boids instance, setting up the logic and setting the simulation running  | 200 |
| setModelMesh(_model,scale,defaultMaterial_) | Create mesh for every boid and add to scene |  |
| changeModelMesh(_model,scale,defaultMaterial_) | Changes the mesh for every boid | |
| initVision() | Creates a new raycasting instance | |
| addEnvironmentObjects(_enviromentObjects,needsUpdate_) | Adds new objects for boids to see | needsUpdate=false |
| update(_elapsedTime,deltaTime_) | Updates the Simulation | |
| addDebug(_gui_) | Adds debug panel to the scene | |
| resetDebug(_gui_) | Resets the debug panel | |



    

## Controls
### General Controls:
- **View FPS:** Toggles "Frames Per Second" display
- **Pause Simulation:** Pauses Simulation

### Boid Controls:
- **Show Bounding Box:** Toggles the confinment visualization
- **Entity Count:** The Amount of boids currently on screen
- **Object Avoid Factor:** The force at which boids avoid world objects
- **Object Visual Range:** The distance at which boids see world objects
- **Cohesion Factor:** Adjust how strongly boids are attracted to the center of the flock.
- **Alignment Factor:** Control how much boids try to match the velocity of neighbor boids within their _visual range_
- **Separation Factor:** The force at which boids avoid neighbor boids within their _protected range_
- **Matching Factor:** The force at which boids align velociy with neighbor boids within their _visual range_
- **Turn Factor:** The force at which boids turn around when out of bounds
- **Min Speed:** Set the minimum speed of boids.
- **Max Speed:** Set the maximum speed of boids.
- **Visual Range:** Adjust the range in which boids detect and react to nearby flockmates.
- **Protected Range:** Define the area in which boids are protected from external disturbances.

### Environment Vision Controls:
- **Show Rays:** Toggles display of ray targets. This represents the angle that the boid can see
- **Ray Count:** How many rays the boid casts per environment check
- **Ray Angle:** The angle at which the boid casts rays
- **Ray Distance:** The distance at which a collision is counted


## Future Goals
- Move the boid logic onto the gpu, using THREE.js/webGL GPGPU
- Add support for attraction/repulsion objects



## Performance 
This implementation of the boids algorithm runs on the cpu. As such it has a O(N<sup>2</sup>) time complexity. 
FPS does take a hit once you pass 500 entities. Onced moved onto the gpu, we should be able to handle orders of magnitude more


## References
- [Cornell University Lab](https://people.ece.cornell.edu/land/courses/ece4760/labs/s2021/Boids/Boids.html)
- [Original Paper by C.W.Reynolds](https://www.cs.toronto.edu/~dt/siggraph97-course/cwr87/)
- [distributing n points on a sphere](https://stackoverflow.com/questions/9600801/evenly-distributing-n-points-on-a-sphere)
- [Measurement of areas on a sphere using Fibonacci and latitude–longitude lattices](https://arxiv.org/pdf/0912.4540)
