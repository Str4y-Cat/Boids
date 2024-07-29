import * as THREE from 'three'
import GUI from 'lil-gui'
import {  OrbitControls } from 'three/examples/jsm/Addons.js'
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as BACKGROUND from './showCase scripts/background'

import Boids from './boids/Boids';


// Add the extension functions

// import RayController from './rayScripts/RayController';



//set up debug
const gui = new GUI({container:document.getElementById('gui1'),title:'Simulation Controls',closeFolders:true})
const gui2 = new GUI({container:document.getElementById('gui2'),title:'Aesthetic Presets',closeFolders:true})
const debug= {}


const textureLoader= new THREE.TextureLoader()
const matCapTexture= textureLoader.load('/textures/matCap1.png')
const matCapTexture2= textureLoader.load('/textures/matCap2.png')
const matCapTexture3= textureLoader.load('/textures/matCap3.png')
const matCapTexture4= textureLoader.load('/textures/matCap4.png')
const matCapTexture5= textureLoader.load('/textures/matCap5.png')



//axis helper

//create canvas
const canvas = document.querySelector('.webgl')

//create scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
scene.background = new THREE.Color("#fff8f0");
// scene.background = new THREE.Color("#25231f");
// scene.background = new THREE.Color("#0f1f58");

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




/**
 * objects to avoid
 */


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
const stats = new Stats();

debug.showStats=false
const addStats=()=>
{
    document.body.appendChild( stats.dom );
}
const removeStats=()=>
    {
        document.body.removeChild( stats.dom );
    }

gui.add(debug,'showStats').name('View FPS').onChange(bool=>{
    if(bool)
    {
        addStats()
    }
    else
    {
        removeStats()
    }
})
/**
 * mouse events
 */



//#endregion



//#region boids
/**
 * BOIDS
 */
const envSizes={width:5, length:10,height:5}
let environmentObjects=[]


const box = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0,0,0),new THREE.Vector3(envSizes.length,envSizes.width,envSizes.width))
const boids= new Boids(scene, box)

boids.initBoids(400)
boids.initVision()


const gltfLoader= new GLTFLoader()
// gltfLoader.load('./models/paper_plane/scene.gltf',(gltf)=>{
//     console.log("loaded")
//     console.log(gltf)
//     // scene.add(gltf.scene)
//     boids.setModelMesh(gltf,4)
// })
let fishModel
let planeModel
gltfLoader.load('./models/fish/Fish.gltf',(gltf)=>{
    fishModel=gltf
    // scene.add(gltf.scene)
    boids.setModelMesh(gltf,0.6)

})
gltfLoader.load('./models/paper_plane/paper_plane.gltf',(gltf)=>{
    planeModel=gltf
    // planeModel.children[0].rotateX(90)
    console.log(planeModel)

})
boids.addDebug(gui)



//#endregion






const addBackground=(environmentObjects,callback)=>
    {
        BACKGROUND.removeBackground(environmentObjects,scene)
        
        environmentObjects=  callback(envSizes.length,envSizes.width,envSizes.height)
        boids.addEnvironmentObjects(environmentObjects,true)
        scene.add(...environmentObjects )
        boids.resetDebug(gui)
        return environmentObjects
    }
    environmentObjects=addBackground(environmentObjects,BACKGROUND.createRandom)
    const aestheticPresets= {}
aestheticPresets.backgroundColor="#fff8f0"
aestheticPresets.randomObj=()=>{environmentObjects=addBackground(environmentObjects,BACKGROUND.createRandom)}
aestheticPresets.gridObj=()=>{environmentObjects=addBackground(environmentObjects,BACKGROUND.createGrid)}
aestheticPresets.wallObj=()=>{environmentObjects=addBackground(environmentObjects,BACKGROUND.createWall)}

const testMesh= new THREE.Mesh(new THREE.SphereGeometry(0.1),new THREE.MeshBasicMaterial({color:'red'}))
const planeMaterial= new THREE.MeshLambertMaterial({color:'#efc46d',side:THREE.DoubleSide})

aestheticPresets.nativeGeometry=()=>{boids.changeModelMesh(testMesh,2)}
aestheticPresets.fishGeomery=()=>
    {if(fishModel)
    {
        boids.changeModelMesh(fishModel,0.6)
    }
    else{
        console.log('fish model doesnt exitst')
    }}

aestheticPresets.planeGeometry=()=>{
    if(planeModel)
    {
        boids.changeModelMesh(planeModel,0.6,planeMaterial)
    }
    else{
        console.log('plane Model doesnt exitst')
    }}


const envObjFolder= gui2.addFolder('Environment Objects')
const bmFolder= gui2.addFolder('Boid Models')
const bgFolder= gui2.addFolder('Background')

envObjFolder.add(aestheticPresets,"randomObj").name("Random Objects")
envObjFolder.add(aestheticPresets,"gridObj").name("Grid")
envObjFolder.add(aestheticPresets,"wallObj").name("Wall")

bmFolder.add(aestheticPresets,"nativeGeometry").name("Native Geometry")
bmFolder.add(aestheticPresets,"fishGeomery").name("Fish Model")
bmFolder.add(aestheticPresets,"planeGeometry").name("Plane Model")

bgFolder.addColor(aestheticPresets,"backgroundColor").name('Background').onChange(color=>{
    scene.background= new THREE.Color(color);
})





// const environmentObjects= BACKGROUND.createGrid()
// environment.objects= environmentObjects

const floor = BACKGROUND.addFloor(envSizes.length,envSizes.width,envSizes.height)
// console.log(environmentObjects)
scene.add(floor)



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
const sun= new THREE.DirectionalLight('#ffffff',3)
const general= new THREE.AmbientLight('#ffffff',1)
// hemiLight.color.setHSL( 57, 16, 92 );
// hemiLight.groundColor.setHSL( 57, 21, 46 );
// hemiLight.position.set( 0, 50, 0 );
scene.add( sun,general );



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
        let deltaTime= elapsedTime-past
        past= elapsedTime

        boids.update(elapsedTime,((deltaTime/0.16)*10))
        // console.log((deltaTime/0.16)*10)
        // stats.update()
        controls.update()
        // controls.update(delta)


        //for expensive computations, offset slowtick so that heavy computations are spread
        stats.begin();
        
        stats.end();

        

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