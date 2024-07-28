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

    setModelMesh(model,scale,defaultMaterial)
    {
        // this.boidController.setModelMesh(model)
        this.boidController.setModels(model,scale,defaultMaterial)
    }

    changeModelMesh(model,scale,defaultMaterial)
    {
        this.boidController.changeModelMesh(model,scale,defaultMaterial)
    }

    initVision()
    {
        this.environmentOctree = new Octree(this.environmentObjects,boidConfig.vision.far) 
        this.rayController =new RayController(this.environmentOctree)
    }
   
    addEnvironmentObjects(enviromentObjects,needsUpdate)
    {
        enviromentObjects.forEach(obj=>{
            obj.geometry.computeBoundingBox();
            obj.geometry.computeBoundsTree();
        })
        if(needsUpdate)
        {
            console.log('removeing')
            this.environmentObjects=[]
        }

        this.environmentObjects.push(...enviromentObjects)
        // console.log(enviromentObjects)
        if(this.environmentObjects)
        {
            this.environmentOctree.hideOctree(this.scene)

        }
        this.environmentOctree = new Octree(this.environmentObjects,boidConfig.vision.far)
        // console.log(this.environmentOctree)
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

    resetDebug(gui)
    {
        console.log("folders",gui.folders)
        console.log(gui)
        gui.folders.forEach(folder=>{
            // console.log(folder)
            if(folder._title=='Enviroment Optimizations')
            {
                folder.destroy()
                this.environmentOctree.debug(gui,this.scene)
            }

        })
        
       

        // this.environmentOctree.resetDebug(gui)
        // this.addDebug(gui)

    }


}