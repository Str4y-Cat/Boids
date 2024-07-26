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
    }

    initBoids(count,geometry,material)
    {
        this.boidController= new BoidController(count,this.container,this.scene)
        this.boidController.setStandardMesh(geometry,material) 
    }

    initVision()
    {
        this.environmentOctree = new Octree([],boidConfig.vision.far) 
        this.rayController =new RayController(this.environmentOctree)
    }
   
    addEnvironmentObjects(enviromentObjects)
    {
        enviromentObjects.forEach(obj=>{
            obj.geometry.computeBoundingBox();
            obj.geometry.computeBoundsTree();
            // console.log(obj.geometry)
        })

        this.environmentObjects.push(...enviromentObjects)
        console.log(this.scene)
        this.environmentOctree = new Octree(this.environmentObjects,boidConfig.vision.far)
        this.rayController.environmentOctree=this.environmentOctree 
    }

    #slowUpdate(elapsedTime)
    {
        let intersectingEvironmentObjects={}

        let slowTick= Math.round(elapsedTime*100)
        if(slowTick!=this.past){
            intersectingEvironmentObjects= this.rayController.update(this.boidController.boidMeshes,4)
        }
        this.past=slowTick

        return intersectingEvironmentObjects
    }

    update(elapsedTime)
    {
        let intersectingEvironmentObjects={}
        
        

        if(this.boidController)
        {
            if(this.rayController)
                {
                    intersectingEvironmentObjects=this.#slowUpdate(elapsedTime)
                }

            this.boidController.update(intersectingEvironmentObjects)
        }

    }

    addDebug(gui)
    {
        this.boidController.viewDebug(gui)
        this.rayController.setDebug(gui,this.scene)
        this.environmentOctree.debug(gui,this.scene)
    }


}