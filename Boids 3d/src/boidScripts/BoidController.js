import BoidLogic from "./BoidLogic";
import boidConfig from "./boid.config";
import Performance from "../performance/Performance";
import * as THREE from 'three'

export default class BoidController
{

    /**
     *  
     * 
     * 
     * 
     */

    /** constructor()
     * 
     *  
     *  boidObject arr = setUp (boidArray)
     *  
     * 
     */
    constructor(count, size, scene)
    {
        
        this.scene=scene

        this.boundingBox= new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0,0,0),new THREE.Vector3(size,size,size))
        this.boidMeshes= []
        this.boidCount=null
        
        this.setBoidLogic(count)

        this.performance= new Performance()
    }

    //#region boids
    setBoidLogic(count)
    {
        this.boidLogic=new BoidLogic(count, this.boundingBox)
    }

    setStandardMesh(geometry,material,rotateX=true)
    {
        //set global geometry
        this.material= material
        //set global material
        this.geometry= geometry

        if(rotateX){
            geometry.rotateX(-Math.PI * 0.5);
        }

        //addMeshes()
        this.addMeshes(this.boidLogic.boidArray)
    }

    addMeshes(arr)
    {

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
        
       
        arr.forEach((boid) => {
            this.createMesh(boid)
        });

        this.boidCount=this.boidMeshes.length
        
        
        
 
    }

    createMesh({x,y,z})
    {
        const boidMesh= new THREE.Mesh(this.geometry,this.material)
        boidMesh.position.set(x,y,z)
        this.scene.add(boidMesh)

        this.boidMeshes.push(boidMesh)
    }

    removeMesh()
    {
        const mesh= this.boidMeshes.pop()

        this.scene.remove(mesh)
        mesh.geometry.dispose()
        mesh.material.dispose()     
    }

    addBoids(count)
    {
        this.boidLogic.addBoids(count)
        const iStart=this.boidLogic.boidArray.length-count
        const iEnd= this.boidLogic.boidArray.length

        for(let i= iStart; i<iEnd;i++){
            this.createMesh([this.boidLogic.boidArray[i]])
        }
    }

    removeBoids(count)
    {
        // console.log(`Removing-----------------`)
        // console.log(`count is ${count}\nBefore pos: ${this.boidLogic.boidArray.length}\nBefore mesh: ${this.boidMeshes.length}`)

        this.boidLogic.removeBoids(count)

        const iStart=this.boidLogic.boidArray.length
        const iEnd= this.boidLogic.boidArray.length+count
        for(let i=iStart; i<iEnd;i++){
            this.removeMesh()
        }
        // console.log(`After pos: ${this.boidLogic.boidArray.length}\nAfter mesh: ${this.boidMeshes.length}`)


        // this.boidLogic.needsUpdate=true

    }
    //#endregion

    //#region utils
    
    //#endregion

    /** Update()
     * 
     * Updates the movement of the boid objects
     * 
     */
    update(environmenObjects)
    {
        this.performance.timer('boidLogic',true)
        this.boidLogic.update(environmenObjects)
        this.performance.timer('boidLogic',true)

        // this.performance.timer('boid Draw')
        this.boidMeshes.forEach((boidMesh,i)=>
        {
            const boid= this.boidLogic.boidArray[i]

            boidMesh.position.copy(boid)
           
            boidMesh.lookAt(new THREE.Vector3(boid.targetX,boid.targetY,boid.targetZ))
        })
        // this.performance.timer('boid Draw')

        if(this.debug)
        {
            if(this.debug.protectedRange)
            {
                this.debug.protectedRange.position.copy(this.boidMeshes[0].position)
            }
            if(this.debug.visualRange)
                {
                    this.debug.visualRange.position.copy(this.boidMeshes[0].position)
                }
        }

        // if(this.followBoid)
        // {
        //     // const position= this.boidMeshes[this.followBoid.index].position.clone()
        //     // this.camera.position.copy(position.multiplyScalar(2))
        //     this.camera.lookAt(this.boidMeshes[this.followBoid.index].position)
        // }
    }


    //#region DEBUG
    viewDebug(gui)
    {
        this.debug= {}
        this.debug.boidCount= this.boidCount

        //create a gui folder
        this.debug.folder=  gui.addFolder("Boids")


        
        //add count tweak
        this.debugCount()
        //parameters tweaks
        this.debugValues()

        this.debugSolidBorderBox()

        this.debugVisionRange()
    }

    /** addControls
     * 
     * adds gui controls
     * 
     */
    debugCount()
    {
        this.debug.folder.add(this.debug,'boidCount'). min(1).max(1500).step(1).onChange((count)=>
        {
            this.boidCount=count
            if(count>this.boidMeshes.length)
                {
                    this.addBoids(count-this.boidMeshes.length)
                }
            if(count<this.boidMeshes.length)
                {
                    this.removeBoids(this.boidMeshes.length-count)
                }
        })

    }

    debugValues()
    {
        
        this.debug.folder.add(boidConfig.values,"visualRange").min(0.5).max(3).step(0.00001).onChange((num)=>{
            this.boidLogic.visualRange=num
            if(this.debug.visualRange)
                {
                    this.debugVisualRange(true)
                }
        })
        this.debug.folder.add(boidConfig.values,"protectedRange").min(0.1).max(2).step(0.00001).onChange((num)=>{
            this.boidLogic.protectedRange=num
            if(this.debug.protectedRange)
            {
                this.debugProtectedRange(true)
            }
        })
        this.debug.folder.add(boidConfig.values,"objectAvoidFactor").min(0).max(10).step(0.00001).onChange((num)=>{
            this.boidLogic.objectAvoidFactor=num
        })
        this.debug.folder.add(boidConfig.values,"enviromentVision").min(0).max(5).step(0.00001)
        this.debug.folder.add(boidConfig.values,"cohesionFactor").min(0).max(0.05).step(0.00001).onChange((num)=>{
            this.boidLogic.cohesionFactor=num
        })
        this.debug.folder.add(boidConfig.values,"matchingFactor").min(0).max(0.1).step(0.00001).onChange((num)=>{
            this.boidLogic.matchingFactor=num
        })
        this.debug.folder.add(boidConfig.values,"seperationFactor").min(0).max(0.5).step(0.00001).onChange((num)=>{
            this.boidLogic.seperationFactor=num
        })
        this.debug.folder.add(boidConfig.values,"turnFactor").min(0).max(1).step(0.0001).onChange((num)=>{
            this.boidLogic.turnFactor=num/100
        })
        this.debug.folder.add(boidConfig.values,"minSpeed").min(0).max(10).step(0.001).onChange((num)=>{
            this.boidLogic.minSpeed=num/100
        })
        this.debug.folder.add(boidConfig.values,"maxSpeed").min(0).max(10).step(0.001).onChange((num)=>{
            this.boidLogic.maxSpeed=num/100
        })
        
    }

    //debug border box
    debugSolidBorderBox()
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

    debugProtectedRange(needsUpdate=false)
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

    debugVisualRange(needsUpdate=false)
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

    debugVisionRange()
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
                
                this.debugProtectedRange()
                
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
                    this.debugVisualRange()
                }
            })
        
    }   
    //#endregion

}


