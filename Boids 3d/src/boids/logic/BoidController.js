import BoidLogic from "./BoidLogic";
import boidConfig from "../boid.config";
import * as THREE from 'three'

export default class BoidController
{

    /** constructor()
     * 
     *  
     *  boidObject arr = setUp (boidArray)
     *  
     * 
     */
    constructor(count, box3, scene)
    {
        
        this.scene=scene


        // this.boundingBox= new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0,0,0),new THREE.Vector3(size,size,size))
        this.boundingBox= box3
        this.boidMeshes= []
        this.boidCount=null
        
        this.#setBoidLogic(count)
    }

    //#region boids

    /**
     * inititate the boid logic
     * 
     * @param {int} count 
     */
    #setBoidLogic(count)
    {
        this.boidLogic=new BoidLogic(count, this.boundingBox)
    }

    /**
     * Sets a native geometry mesh for each boid
     * 
     * @param {*} geometry - THREE.js geometry
     * @param {*} material - THREE.js material
     * @param {bool} rotateX 
     */
    setStandardMesh(geometry,material,rotateX=true)
    {
        //set global geometry
        this.material= material
        //set global material
        this.geometry= geometry

        if(rotateX){
            geometry.rotateX(-Math.PI * 0.5);
        }

        //#addMeshes()
        this.#addMeshes(this.boidLogic.boidArray)
    }

    /**
     * Adds all positions in array to mesh array and add to scene
     * 
     * @param {*} boidLogicArray 
     * @returns 
     */
    #addMeshes(boidLogicArray)
    {

        //check if mat and geo has been set
        if(!this.material)
        {
            console.log('No material has been set')
            return
        }
        if(!this.geometry)
        {
            console.log('No geometry has been set')
            return
        }
        
       //create mesh for each boid position
        boidLogicArray.forEach((boid) => {
            this.#createMesh(boid)
        });

        //update boidcount
        this.boidCount=this.boidMeshes.length
        
        
        
 
    }

    /**
     * creates the three.js mesh for boidLogic object
     * 
     * @param {object} boidPosition 
     */
    #createMesh({x,y,z})
    {
        //create mesh
        const boidMesh= new THREE.Mesh(this.geometry,this.material)
        //set position of mesh
        boidMesh.position.set(x,y,z)

        //add to scene
        this.scene.add(boidMesh)

        //push to array of boid meshes
        this.boidMeshes.push(boidMesh)
    }

    /**
     * removes last mesh in boidmesh array
     */
    #removeMesh()
    {
        //remove last mesh from array
        const mesh= this.boidMeshes.pop()

        //remove from scene and free up memory
        this.scene.remove(mesh)
        mesh.geometry.dispose()
        mesh.material.dispose()     
    }

    /**
     * 
     * @param {int} count 
     */
    #addBoids(count)
    {
        //add new boids to boidLogic instance
        this.boidLogic.addBoids(count)

        //instanciate start and end index values
        const iStart=this.boidLogic.boidArray.length-count
        const iEnd= this.boidLogic.boidArray.length

        //create mesh based on each new boid added
        for(let i= iStart; i<iEnd;i++){
            this.#createMesh([this.boidLogic.boidArray[i]])
        }
    }

    /**
     * 
     * @param {int} count 
     */
    #removeBoids(count)
    {
        //remove boids from boid logic instance
        this.boidLogic.removeBoids(count)

        //instanciate start and end indicies
        const iStart=this.boidLogic.boidArray.length
        const iEnd= this.boidLogic.boidArray.length+count

        //remove meshes
        for(let i=iStart; i<iEnd;i++){
            this.#removeMesh()
        }
        // console.log(`After pos: ${this.boidLogic.boidArray.length}\nAfter mesh: ${this.boidMeshes.length}`)


        // this.boidLogic.needsUpdate=true

    }
    //#endregion

    //#region utils

    /**
     * 
     * @param {[obj]} environmenObjects 
     */
    update(environmenObjects)
    {
        //update the logic
        this.boidLogic.update(environmenObjects)

        //update the meshes
        this.boidMeshes.forEach((boidMesh,i)=>
        {
            const boid= this.boidLogic.boidArray[i]

            boidMesh.position.copy(boid)
           
            //rotate correctly
            boidMesh.lookAt(new THREE.Vector3(boid.targetX,boid.targetY,boid.targetZ))
        })

        //check if debug is active
        if(this.debug)
        {   
            //show protected range visualization
            if(this.debug.protectedRange)
            {
                this.debug.protectedRange.position.copy(this.boidMeshes[0].position)
            }

            //show visual range visualization
            if(this.debug.visualRange)
                {
                    this.debug.visualRange.position.copy(this.boidMeshes[0].position)
                }
        }
    }

    //#endregion

    


    //#region DEBUG
    /**
     * Set up the debug panel
     * 
     * @param {*} gui lil-gui instance
     */
    viewDebug(gui)
    {
        this.debug= {}
        this.debug.boidCount= this.boidCount

        //create a gui folder
        this.debug.folder=  gui.addFolder("Boids")

        //bounding box visualization
        this.#debugSolidBorderBox()
        //add count tweak
        this.#debugCount()
        //parameters tweaks
        this.#debugValues()
        //boid vision visualization
        this.#debugVisionRange()
    }

    /** 
     * Setup boid Count tweak
     */
    #debugCount()
    {   
        this.debug.folder.add(this.debug,'boidCount'). min(4).max(1000).step(4).onChange((count)=>
        {
            this.boidCount=count
            if(count>this.boidMeshes.length)
                {
                    this.#addBoids(count-this.boidMeshes.length)
                }
            if(count<this.boidMeshes.length)
                {
                    this.#removeBoids(this.boidMeshes.length-count)
                }
        })

    }

    /** 
     * Setup boid values tweaks
     */
    #debugValues()
    {
        
        
        this.debug.folder.add(boidConfig.values,"objectAvoidFactor").name("Environment Avoid Factor").min(0).max(10).step(0.00001).onChange((num)=>{
            this.boidLogic.objectAvoidFactor=num
        })
        this.debug.folder.add(boidConfig.values,"enviromentVision").name("Environment Visual range").min(0).max(5).step(0.00001)
        this.debug.folder.add(boidConfig.values,"cohesionFactor").name("Cohesion Factor").min(0).max(0.05).step(0.00001).onChange((num)=>{
            this.boidLogic.cohesionFactor=num
        })
        this.debug.folder.add(boidConfig.values,"matchingFactor").name("Matching Factor").min(0).max(0.1).step(0.00001).onChange((num)=>{
            this.boidLogic.matchingFactor=num
        })
        this.debug.folder.add(boidConfig.values,"seperationFactor").name("Seperation Factor").min(0).max(0.5).step(0.00001).onChange((num)=>{
            this.boidLogic.seperationFactor=num
        })
        this.debug.folder.add(boidConfig.values,"turnFactor").name("Turn Factor").min(0).max(1).step(0.0001).onChange((num)=>{
            this.boidLogic.turnFactor=num/100
        })
        this.debug.folder.add(boidConfig.values,"minSpeed").name("Min Speed").min(0).max(10).step(0.001).onChange((num)=>{
            this.boidLogic.minSpeed=num/100
        })
        this.debug.folder.add(boidConfig.values,"maxSpeed").name("Max Speed").min(0).max(10).step(0.001).onChange((num)=>{
            this.boidLogic.maxSpeed=num/100
        })
        
    }

    /** 
     * set up border box tweak
     */
    #debugSolidBorderBox()
    {
        this.debug.showBoundingBox=false
        this.debug.folder.add(this.debug,'showBoundingBox').onChange(()=>
        {
            if(!this.debug.boundingBoxHelper)
                {
                    this.debug.boundingBoxHelper= new THREE.Box3Helper(this.boundingBox)
                    this.scene.add(this.debug.boundingBoxHelper)
                }
            else{
                this.scene.remove(this.debug.boundingBoxHelper)
                this.debug.boundingBoxHelper.dispose()
                this.debug.boundingBoxHelper=null
            }
        })
        
    }

    /** 
     * Setup protected range visualization
     */
    #debugProtectedRange(needsUpdate=false)
    {
        if(!needsUpdate)
        {
            const material= new THREE.MeshBasicMaterial({
                color:'red',
                opacity:0.5,
                transparent:true
            })
            const geometry= new THREE.SphereGeometry()

            this.debug.protectedRange= new THREE.Mesh(geometry,material)

            const updateScale= new THREE.Vector3(1,1,1).multiplyScalar(boidConfig.values.protectedRange)
            

            this.debug.protectedRange.scale.copy(updateScale)

            this.scene.add(this.debug.protectedRange)
        }
        else
        {
            const updateScale= new THREE.Vector3(1,1,1).multiplyScalar(boidConfig.values.protectedRange)
            
            this.debug.protectedRange.scale.copy(updateScale)
            this.scene.add(this.debug.protectedRange)
        }

        
    }

    /** 
     * Setup visual range visualization
     */
    #debugVisualRange(needsUpdate=false)
    {
        if(!needsUpdate)
        {
            const material= new THREE.MeshBasicMaterial({
                color:'#5bff33',
                opacity:0.5,
                transparent:true
            })
            const geometry= new THREE.SphereGeometry()

            this.debug.visualRange= new THREE.Mesh(geometry,material)

            const updateScale= new THREE.Vector3(1,1,1).multiplyScalar(boidConfig.values.visualRange)
            

            this.debug.visualRange.scale.copy(updateScale)

            this.scene.add(this.debug.visualRange)
        }
        else
        {
            const updateScale= new THREE.Vector3(1,1,1).multiplyScalar(boidConfig.values.visualRange)
            
            this.debug.visualRange.scale.copy(updateScale)
            this.scene.add(this.debug.visualRange)
        }

        
    }

    /** 
     * Setup vision teak
     */
    #debugVisionRange()
    {
        this.debug.showProtectedRange=false
        this.debug.showVisualRange=false
        
        this.debug.folder.add(this.debug,'showProtectedRange').onChange((bool)=>
            {
                if(!bool)
                {
                    this.scene.remove(this.debug.protectedRange)
                    this.debug.protectedRange.material.dispose()
                    this.debug.protectedRange.geometry.dispose()
    
                }
                else
                {
                    
                    this.#debugProtectedRange()
                    
                }
            })
    
        this.debug.folder.add(boidConfig.values,"protectedRange").name("Protected range").min(0.1).max(2).step(0.00001).onChange((num)=>{
            this.boidLogic.protectedRange=num
            if(this.debug.protectedRange)
            {
                this.#debugProtectedRange(true)
            }
        })

        this.debug.folder.add(this.debug,'showVisualRange').onChange((bool)=>
            {
                if(!bool)
                {
                    this.scene.remove(this.debug.visualRange)
                    this.debug.visualRange.material.dispose()
                    this.debug.visualRange.geometry.dispose()
    
                }
                else
                {
                    this.#debugVisualRange()
                }
            })
        
        this.debug.folder.add(boidConfig.values,"visualRange").name("Visual range").min(0.5).max(3).step(0.00001).onChange((num)=>{
            this.boidLogic.visualRange=num
            if(this.debug.visualRange)
                {
                    this.#debugVisualRange(true)
                }
        })
        
        
    }   
    //#endregion

}


