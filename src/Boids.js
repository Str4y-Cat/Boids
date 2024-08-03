import * as THREE from 'three'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import BoidController from './logic/BoidController'
import RayController from './vision/RayController';
import Octree from './octree/Octree'
import boidConfig from './boid.config';



export default class Boids
{
    constructor(scene,container)
    {   
        // Add the extension functions
        THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
        THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
        THREE.Mesh.prototype.raycast = acceleratedRaycast;
        
        this.scene=scene
        this.container=container
        this.environmentObjects=[]

        this.past=0
        this.debug={}
        // this.pauseSimulation
    }

    /**
     * Start the boid simulation
     * @param {int} boidCount 
     */
    initBoids(boidCount)
    {
        this.boidController= new BoidController(boidCount,this.container,this.scene)
    }

    /**
     * Sets the start up parameters. Call this method before initBoids()
     * 
     * @param {Object} params 
     */
    setParams(params)
    {
        for(const key in params)
        {
            
            if(boidConfig.values[key])
            {
                boidConfig.values[key]= params[key]
            }

        }
        
    }

    /**
     * @param {int} count 
     */
    addBoids(count)
    {
        this.boidController.addBoids(count)
    }

    /**
     * 
     * @param {*} count 
     */
    removeBoids(count)
    {
        this.boidController.removeBoids(count)
    }

    /**
     * Set up the boid meshes
     * 
     * @param {THREE.Object3D} model 
     * @param {int} scale 
     * @param {THREE.Material} customMaterial defaults to the model material if left blank
     */
    setModelMesh(model,scale,customMaterial)
    {
        this.boidController.setModels(model,scale,customMaterial)
    }

    /**
     * 
     * @param {THREE.Object3D} model 
     * @param {int} scale 
     * @param {THREE.Material} customMaterial defaults to the model material if left blank
     */
    changeModelMesh(model,scale,customMaterial)
    {
        this.boidController.changeModelMesh(model,scale,customMaterial)
    }

    /**
     * Allows boids to be aware of their enviroment
     */
    initVision()
    {
        this.environmentOctree = new Octree(this.environmentObjects,boidConfig.vision.far) 
        this.rayController =new RayController(this.environmentOctree)
    }
   
    /**
     * Adds new objects for boids to see
     * 
     * @param {[THREE.Object3D]} enviromentObjects 
     * @param {bool} reset clears past environment objects
     */
    addEnvironmentObjects(enviromentObjects,reset)
    {
        enviromentObjects.forEach(obj=>{
            obj.geometry.computeBoundingBox();
            obj.geometry.computeBoundsTree();
        })
        if(reset)
        {
            this.environmentObjects=[]
            this.environmentOctree.hideOctree(this.scene)

        }

        this.environmentObjects.push(...enviromentObjects)
        

        // if(this.environmentObjects.length>0)
        // {
        //     this.environmentOctree.hideOctree(this.scene)
        // }

        this.environmentOctree = new Octree(this.environmentObjects,boidConfig.vision.far)
        
        this.rayController.environmentOctree=this.environmentOctree 
    }

    /**
     * Slower update cycle for cpu intensive tasks
     * @param {Number} elapsedTime 
     * @returns 
     */
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

    /**
     * Steps the boid simulation forward in time
     * 
     * @param {Number} elapsedTime 
     * @param {Number} deltaTime 
     */
    update(elapsedTime,deltaTime)
    {
        if (!document.hidden) 
            {
                let intersectingEvironmentObjects={}
            
            

                if(this.boidController && !this.debug.pause)
                {
                    if(this.rayController)
                        {
                            intersectingEvironmentObjects=this.#slowUpdate(elapsedTime)
                        }

                    this.boidController.update(intersectingEvironmentObjects,(deltaTime/0.16666)*10)
                    // console.log(elapsedTime)
                }
            }
        

    }

    /**
     * Adds a debug panel to the scene. uses Lil-gui
     * @param {} gui 
     */
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

    }


}