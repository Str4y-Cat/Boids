import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import BOIDS from 'three-boids'
// import * as THREE from 'three'
import GUI from "lil-gui"
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const box = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0,0,0),new THREE.Vector3(5,5,5))
const boids = new BOIDS(scene,box)

boids.initBoids(200)
boids.initVision()

const testGeometry=new THREE.ConeGeometry(0.2,0.9,3)
testGeometry.rotateX(-Math.PI * 0.5);

const light= new THREE.AmbientLight('#ffffff',2)
scene.add(light)

const testMesh= new THREE.Mesh(testGeometry,new THREE.MeshBasicMaterial({color:"blue"}))
boids.setModelMesh(testMesh,2)

const gui= new GUI()
boids.addDebug(gui)

/**
 * Animate
 */
const clock = new THREE.Clock()
let past=0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    let deltaTime= elapsedTime-past
        past= elapsedTime
    boids.update(elapsedTime,(deltaTime))

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()