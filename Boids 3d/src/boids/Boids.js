import * as THREE from 'three'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import BoidController from './logic/BoidController'
import RayController from './vision/RayController';
import Octree from './octree/Octree'
import boidConfig from './boid.config';

// Add the extension functions
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export default class Boids
{
    constructor(scene,container)
    {   
        this.scene=scene
        this.container=container
        this.environmentObjects=[]

        this.past=0
        // this.debug
        // this.pauseSimulation
    }

    initBoids(count)
    {
        this.boidController= new BoidController(count,this.container,this.scene)
    }

    setStandardMesh(geometry,material)
    {
        this.boidController.setStandardMesh(geometry,material) 
    }

    setModelMesh(model,scale)
    {
        // this.boidController.setModelMesh(model)
        this.boidController.setModels(model,scale)
    }

    initVision()
    {
        this.environmentOctree = new Octree(this.environmentObjects,boidConfig.vision.far) 
        this.rayController =new RayController(this.environmentOctree)
    }
   
    addEnvironmentObjects(enviromentObjects)
    {
        enviromentObjects.forEach(obj=>{
            obj.geometry.computeBoundingBox();
            obj.geometry.computeBoundsTree();
        })

        this.environmentObjects.push(...enviromentObjects)
        this.environmentOctree = new Octree(this.environmentObjects,boidConfig.vision.far)
        this.rayController.environmentOctree=this.environmentOctree 
    }

    #slowUpdate(elapsedTime)
    {
        let intersectingEvironmentObjects={}

        let slowTick= Math.round(elapsedTime*100)
        if(slowTick!=this.past){
            //TODO
            intersectingEvironmentObjects= this.rayController.update(this.boidController.getBoidArray(),this.boidController.localBoidBoundingBox,4)
        }
        this.past=slowTick

        return intersectingEvironmentObjects
    }

    update(elapsedTime)
    {
        let intersectingEvironmentObjects={}
        
        

        if(this.boidController && !this.debug.pause)
        {
            if(this.rayController)
                {
                    intersectingEvironmentObjects=this.#slowUpdate(elapsedTime)
                }

            this.boidController.update(intersectingEvironmentObjects,elapsedTime)
            // console.log(elapsedTime)
        }

    }

    addDebug(gui)
    {
        this.debug={pause:false}
        gui.add(this.debug,'pause').name('Pause Simulation')
        this.boidController.viewDebug(gui)
        this.rayController.setDebug(gui,this.scene,this.boidController.getMainBoid())
        this.environmentOctree.debug(gui,this.scene)
    }


}