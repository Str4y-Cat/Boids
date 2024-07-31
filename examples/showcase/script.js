import * as THREE from 'three'
import GUI from 'lil-gui'
import {  OrbitControls } from 'three/examples/jsm/Addons.js'
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import * as BACKGROUND from './background'
import Boids from '../../src/Boids';


// Add the extension functions

// import RayController from './rayScripts/RayController';



//set up debug
const checkMobile = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

const gui = new GUI({container:document.getElementById('gui1'),title:'Simulation Controls',closeFolders:true})
const gui2 = new GUI({container:document.getElementById('gui2'),title:'Aesthetic Presets',closeFolders:true})
const debug= {}
if(checkMobile())
{
    gui.close()
    gui2.close()
}


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

const testGeometry=new THREE.ConeGeometry(0.2,0.9,3)
testGeometry.rotateX(-Math.PI * 0.5);
const testMesh= new THREE.Mesh(testGeometry,new THREE.MeshLambertMaterial({color:"blue"}))


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