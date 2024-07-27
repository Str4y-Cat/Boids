import * as THREE from 'three'
import GUI from 'lil-gui'
import {  OrbitControls } from 'three/examples/jsm/Addons.js'
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


import Boids from './boids/Boids';


// Add the extension functions

// import RayController from './rayScripts/RayController';



//set up debug
const gui = new GUI()
const debug= {}


const textureLoader= new THREE.TextureLoader()
const matCapTexture= textureLoader.load('/textures/matCap1.png')
const matCapTexture2= textureLoader.load('/textures/matCap2.png')



//axis helper

//create canvas
const canvas = document.querySelector('.webgl')

//create scene
const scene = new THREE.Scene()
scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
// scene.fog = new THREE.Fog( scene.background, 1, 10 );

// const axisHelper= new THREE.AxesHelper(0.3)
// scene.add(axisHelper)
/**
 * Handle sizes and resize
 */
const sizes= 
{
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize',()=>
    {
        sizes.width=window.innerWidth
        sizes.height=window.innerHeight

        //update camera
        camera.aspect= sizes.width/sizes.height
        camera.updateProjectionMatrix()
        
        //update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(2,window.devicePixelRatio))


    })

//#region world objects
/**
 * floor
 */
debug.floorWidth=5
debug.floorLength=10
const floorGeometry= new THREE.PlaneGeometry(debug.floorWidth,debug.floorLength,5,10)
floorGeometry.computeBoundingBox();
floorGeometry.computeBoundsTree();
const floorMaterial= new THREE.MeshBasicMaterial(
    {
        color:"red",
        wireframe:true
    })
const floor= new THREE.Mesh(
    floorGeometry,
    floorMaterial
)
floor.rotation.x=-Math.PI/2
floor.position.y-=debug.floorWidth/2
floor.layers.enable( 1 );

// floor.position.x=1
scene.add(floor)




/**
 * objects to avoid
 */

const dragMaterial= new THREE.MeshPhongMaterial({color:"#ff5733"})
const dragGeometry1= new THREE.BoxGeometry(1,1,1)


// const dragGeometry1= new THREE.TorusGeometry(1)
const environmentObjects=[]

const createRandom=()=>
    {
        
        for(let i=0; i<5; i++)
            {
                const mesh= new THREE.Mesh(dragGeometry1,dragMaterial )
                mesh.scale.x=Math.max(Math.random(),0.4)
                mesh.scale.y=Math.max(Math.random(),0.4)
                mesh.scale.z=Math.max(Math.random(),0.4)
                // mesh.rotation.set(new THREE.Vector3((Math.random()-0.5)*2*Math.PI,(Math.random()-0.5)*2*Math.PI,(Math.random()-0.5)*2*Math.PI)) 
                mesh.rotation.x=(Math.random()-0.5)*2*Math.PI
                mesh.rotation.y=(Math.random()-0.5)*2*Math.PI
                mesh.rotation.z=(Math.random()-0.5)*2*Math.PI
        
                // console.log(mesh.rotation.x)
                
                // mesh.position.set(new THREE.Vector3((Math.random()-0.5)*2*10,(Math.random()-0.5)*2*10,(Math.random()-0.5)*2*10)) 
                mesh.position.x=(Math.random()-0.5)*debug.floorWidth
                mesh.position.y=(Math.random()-0.5)*debug.floorWidth
                mesh.position.z=(Math.random()-0.5)*debug.floorLength
                
                mesh.layers.enable( 1 );
               
                scene.add(mesh)
                environmentObjects.push(mesh)
            }

        const geometry2= new THREE.TorusGeometry(1)
        for(let i=0; i<5; i++)
            {
                const mesh= new THREE.Mesh(geometry2,dragMaterial )
                const random= Math.max(Math.random(),0.4)
                mesh.scale.x=random
                mesh.scale.y=random
                mesh.scale.z=random
                // mesh.rotation.set(new THREE.Vector3((Math.random()-0.5)*2*Math.PI,(Math.random()-0.5)*2*Math.PI,(Math.random()-0.5)*2*Math.PI)) 
                mesh.rotation.x=(Math.random()-0.5)*2*Math.PI
                mesh.rotation.y=(Math.random()-0.5)*2*Math.PI
                mesh.rotation.z=(Math.random()-0.5)*2*Math.PI
        
                // console.log(mesh.rotation.x)
                
                // mesh.position.set(new THREE.Vector3((Math.random()-0.5)*2*10,(Math.random()-0.5)*2*10,(Math.random()-0.5)*2*10)) 
                mesh.position.x=(Math.random()-0.5)*debug.floorWidth
                mesh.position.y=(Math.random()-0.5)*debug.floorWidth
                mesh.position.z=(Math.random()-0.5)*debug.floorLength
                
                mesh.layers.enable( 1 );
                
                scene.add(mesh)
                environmentObjects.push(mesh)
            }
        
    }


const createGrid=()=>{
    for(let y=-2; y<=2; y++)
        {
            for(let x = -2 ; x<=2;x++)
                {
                    for (let z = -2 ; z<=2;z++ )
                        {
                            const mesh= new THREE.Mesh(dragGeometry1,dragMaterial )
                            mesh.scale.x=0.3
                            mesh.scale.y=0.3
                            mesh.scale.z=0.3
                            // // mesh.rotation.set(new THREE.Vector3((Math.random()-0.5)*2*Math.PI,(Math.random()-0.5)*2*Math.PI,(Math.random()-0.5)*2*Math.PI)) 
                            // mesh.rotation.x=(Math.random()-0.5)*2*Math.PI
                            // mesh.rotation.y=(Math.random()-0.5)*2*Math.PI
                            // mesh.rotation.z=(Math.random()-0.5)*2*Math.PI
                    
                            // console.log(mesh.rotation.x)
                            
                            // mesh.position.set(new THREE.Vector3((Math.random()-0.5)*2*10,(Math.random()-0.5)*2*10,(Math.random()-0.5)*2*10)) 
                            mesh.position.x=x
                            mesh.position.y=y
                            mesh.position.z=z
                            
                            mesh.layers.enable( 1 );
                           
                            scene.add(mesh)
                            environmentObjects.push(mesh)
                        }
                }
        }
}

const createWall=()=>{
    const mesh= new THREE.Mesh(dragGeometry1,dragMaterial )
        mesh.scale.x=Math.abs(Math.random()-0.5)
    mesh.scale.y=2.5
    mesh.position.y=-1.25
        mesh.scale.z=5
    mesh.layers.enable( 1 );
    scene.add(mesh)

    environmentObjects.push(mesh,floor)
    }

createRandom()

// createGrid()
//#endregion




//#region Camera
/**
 * add a camera
 */

const camera= new THREE.PerspectiveCamera(75,sizes.width/sizes.height, 0.1 , 100)
camera.position.x = 2
camera.position.y = 2.5
camera.position.z = 5
camera.lookAt(new THREE.Vector3(0,0,0))
scene.add(camera)
//#endregion

//#region misc
/**
 * stats
 */
let stats = new Stats();
document.body.appendChild( stats.dom );
/**
 * mouse events
 */
debug.keyDown

window.addEventListener('keydown',(e)=>
{

    // console.log(e)
    const currentKey=e.key

    debug.keyDown=currentKey

})


//#endregion




//#region boids
/**
 * BOIDS
 */
const geometry = new THREE.ConeGeometry( 0.027, 0.132,3 ); 
const material = new THREE.MeshMatcapMaterial( {matcap:matCapTexture} );

const box = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0,0,0),new THREE.Vector3(debug.floorWidth,debug.floorWidth,debug.floorLength))
const boids= new Boids(scene, box)

boids.initBoids(400)
// boids.setStandardMesh(geometry,material)
boids.initVision()
boids.addEnvironmentObjects(environmentObjects)
// boids.

const gltfLoader= new GLTFLoader()
// gltfLoader.load('./models/paper_plane/scene.gltf',(gltf)=>{
//     console.log("loaded")
//     console.log(gltf)
//     // scene.add(gltf.scene)
//     boids.setModelMesh(gltf,4)
// })

gltfLoader.load('./models/fish/Fish.gltf',(gltf)=>{
    
    // scene.add(gltf.scene)
    boids.setModelMesh(gltf,0.6)
})
boids.addDebug(gui)



//#endregion






//#region Raycasting
/**
 * RAYCASTING
 */


//#endregion

/**
 * Lights
 */


//#region three.js essentials
const hemiLight = new THREE.HemisphereLight( "#fdfdf4", "#515149", 3 );
// hemiLight.color.setHSL( 57, 16, 92 );
// hemiLight.groundColor.setHSL( 57, 21, 46 );
// hemiLight.position.set( 0, 50, 0 );
scene.add( hemiLight );



/**
 * add controls
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping=true


/**
 * add renderer
 */
const renderer= new THREE.WebGLRenderer({
    canvas:canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio))
//#endregion


/**
 * annimaiton loop
 */

const clock= new THREE.Clock()
let past=0
let intersectingEvironmentObjects={}
const tick =()=>
    {

        let elapsedTime= clock.getElapsedTime()
        boids.update(elapsedTime)

        // stats.update()
        controls.update()
        // controls.update(delta)


        //for expensive computations, offset slowtick so that heavy computations are spread
        stats.begin();
        let slowTick= Math.round(elapsedTime*100)
        if(slowTick!=past){
            // perform.timer('check environment')
            
            // intersectingEvironmentObjects=rayController.update(boidController.boidMeshes,4)

            // perform.timer('check environment')
        }
        stats.end();

        past=slowTick

        // perform.timer('boid Update',true)
        // boidController.update(intersectingEvironmentObjects)
        // perform.timer('boid Update',true)

        intersectingEvironmentObjects={}

        //key controller
        // console.log(debug.key)
        






        //renderer
      
        // ra
        renderer.render(scene,camera)
        //tick
        window.requestAnimationFrame(tick)
    }

    tick()