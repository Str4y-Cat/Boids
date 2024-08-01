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
    constructor(count=200, box3, scene)
    {
        
        this.scene=scene

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

    getBoidArray()
    {
        return this.boidLogic.boidArray
    }

    getMainBoid()
    {
        return this.boidLogic.boidArray[0]

    }

    /**
     * 
     * @param {int} count 
     */
    addBoids(count)
    {
        //add new boids to boidLogic instance
        this.boidLogic.addBoids(count)
        this.changeModelCount(this.getBoidArray().length)
    }

    /**
     * 
     * @param {int} count 
     */
    removeBoids(count)
    {
        //remove boids from boid logic instance
        this.boidLogic.removeBoids(count)
        this.changeModelCount(this.getBoidArray().length)


    }
    //#endregion

    //#region utils

    /**
     * 
     * @param {[obj]} environmenObjects 
     */
    update(environmenObjects,deltaTime)
    {
        //update the logic
        this.boidLogic.update(environmenObjects,deltaTime)

        if(this.dummy)
        {
            for ( let i = 0; i< this.getBoidArray().length; i++ ) {
                const boid=this.getBoidArray()[i]

    
                for(let n=0; n<this.dummy.length; n++)
                    {
                        this.dummy[n].position.copy(boid.position)

    
                        this.dummy[n].quaternion.setFromRotationMatrix(boid.rotationMatrix)
                        this.dummy[n].updateMatrix();
                        this.boidInstancedMesh[n].setMatrixAt( i, this.dummy[n].matrix );
                        this.boidInstancedMesh[n].instanceMatrix.needsUpdate=true
                        
                    }
                    // this.mixer.setTime(elapsedTime)
                    // this.boidInstancedMesh[1].setMorphAt(i,this.dummy[1])
        }

        }

        //check if debug is active
        if(this.debug)
        {   
            //show protected range visualization
            if(this.debug.protectedRange)
            {
                
                this.debug.protectedRange.position.copy(this.getMainBoid().position)
            }

            //show visual range visualization
            if(this.debug.visualRange)
                {
                    this.debug.visualRange.position.copy(this.getMainBoid().position)
                }
        }
    }

    //#endregion

    //#region 
    
    //createDummyMesh
    createDummyMesh(model)
    {
        this.dummy=[]
        // this.dummy.push(...this.createDummyMesh(model));
        
        //native mesh using geometry
        if(!model.scene)
        {
            this.dummy.push(model);
            return
        }
        //gltf model
        const baseMesh= this.getBaseMesh(model.scene)
        this.dummy.push(...baseMesh.children);
        return 
    }

    getBaseMesh(mesh,parent)
    {
        // console.log(mesh)

        if(mesh.children.length<1)
        {
            return parent
        }
        parent= mesh

        return this.getBaseMesh(mesh.children[0],parent)
    }

    setModels(model,minScale,defaultMaterial)
    {
        // console.log(this.createDummyMesh(model))
        

        this.modelScale=minScale
        // const glb=model
        // console.log('glb',glb)
        this.createDummyMesh(model)


        //expand the boid bounding box
        if(!this.localBoidBoundingBox)
        {
            this.localBoidBoundingBox=new THREE.Box3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0))

        }
        this.dummy.forEach(obj=>{
            this.localBoidBoundingBox.expandByObject(obj)
        })
        
        this.localBoidBoundingBox.min.multiplyScalar(0.1*this.modelScale)
        this.localBoidBoundingBox.max.multiplyScalar(0.1*this.modelScale)
        

        this.boidInstancedMesh=[]

        //create instance of instanced mesh
        

        this.dummy.forEach((dummyMesh,i)=>
        {
            // const materialColor= dummyMesh.material.color
            let material= dummyMesh.material
            // new THREE.MeshLambertMaterial( {color:new THREE.Color(materialColor)} )

            if(defaultMaterial)
            {
                material=defaultMaterial
            }
            
            
            this.boidInstancedMesh[i] = new THREE.InstancedMesh( dummyMesh.geometry, material, this.getBoidArray().length );
        }
        )
        
        //fill instanced mesh
        for ( let i = 0; i < this.getBoidArray().length; i ++ ) {
            const boid=this.boidLogic.boidArray[i]

            const scale= Math.max(Math.random(),this.modelScale)

            for(let n=0; n<this.dummy.length; n++)
                {

                    this.dummy[n].position.copy(boid.position)
                    this.dummy[n].scale.set(0.1*scale,0.1*scale,0.1*scale)
                    this.dummy[n].updateMatrix();

                    this.boidInstancedMesh[n].setMatrixAt( i, this.dummy[n].matrix );

                }
            
        }
        
        for (let i = 0; i < this.boidInstancedMesh.length; i++) {
            this.scene.add( this.boidInstancedMesh[i] );
        }
        

        

        // this.mixer = new THREE.AnimationMixer( glb.scene );
        
        // const action = this.mixer.clipAction( glb.animations[ 0 ] );
        // // console.log(action)
        // action.play();
        
    }

    removeInstancedMesh()
    {
        this.boidInstancedMesh.forEach(obj=>{
            this.scene.remove(obj)
            obj.geometry.dispose()
            obj.material.dispose()
        })
    }

    removeDummyMesh()
    {
        this.dummy.forEach(obj=>{
            this.scene.remove(obj)
            obj.geometry.dispose()
            obj.material.dispose()
        })
    }

    changeModelCount()
    {
        this.removeInstancedMesh()
        
        
        
        this.dummy.forEach((dummyMesh,i)=>
            {
                const materialColor= dummyMesh.material.color
                
                this.boidInstancedMesh[i] = new THREE.InstancedMesh( dummyMesh.geometry, new THREE.MeshLambertMaterial( {
                    color:new THREE.Color(materialColor)
                } ), this.getBoidArray().length );
            }
            )
            
            //fill instanced mesh
            for ( let i = 0; i < this.getBoidArray().length; i ++ ) {
                const boid=this.boidLogic.boidArray[i]
    
                const scale= Math.max(Math.random(),this.modelScale)
    
                for(let n=0; n<this.dummy.length; n++)
                    {
    
                        this.dummy[n].position.copy(boid.position)
                        this.dummy[n].scale.set(0.1*scale,0.1*scale,0.1*scale)
                        this.dummy[n].updateMatrix();
    
                        this.boidInstancedMesh[n].setMatrixAt( i, this.dummy[n].matrix );
    
                    }
                
            }
            
            for (let i = 0; i < this.boidInstancedMesh.length; i++) {
                this.scene.add( this.boidInstancedMesh[i] );
            }

        // console.log(this.boidInstancedMesh)

        // this.mixer = new THREE.AnimationMixer( glb.scene );
        // console.log(glb)
        // const action = this.mixer.clipAction( glb.animations[ 0 ] );
        // // console.log(action)
        // action.play();
    }

    changeModelMesh(newModel,minScale,defaultMaterial){
        this.removeDummyMesh()
        this.removeInstancedMesh()

        this.setModels(newModel,minScale,defaultMaterial)
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
        // this.debug.boidCount= this.boidCount

        //create a gui folder
        this.debug.folder=  gui.addFolder("Boids")
        this.debug.boidCount= this.getBoidArray().length

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

        this.debug.folder.add(this.debug,'boidCount').name("Entity Count"). min(4).max(1000).step(4).onFinishChange((count)=>
        {
            
            if(count>this.getBoidArray().length)
                {
                    this.addBoids(count-this.getBoidArray().length)
                    
                }
            if(count<this.getBoidArray().length)
                {
                    this.removeBoids(this.getBoidArray().length-count)

                }
        })

    }

    /** 
     * Setup boid values tweaks
     */
    #debugValues()
    {
        
        
        this.debug.folder.add(boidConfig.values,"objectAvoidFactor").name("Object Avoid Factor").min(0).max(4).step(0.00001).onChange((num)=>{
            this.boidLogic.objectAvoidFactor=num
        })
        this.debug.folder.add(boidConfig.values,"enviromentVision").name("Object Visual range").min(0).max(2).step(0.00001)
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
        this.debug.folder.add(this.debug,'showBoundingBox').name("Show Bounding Box").onChange(()=>
        {
            if(!this.debug.boundingBoxHelper)
                {
                    this.debug.boundingBoxHelper= new THREE.Box3Helper(this.boundingBox,new THREE.Color('#ff1084'))
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
                transparent:true,
                depthWrite:false
            })
            const geometry= new THREE.SphereGeometry()

            this.debug.protectedRange= new THREE.Mesh(geometry,material)

            const updateScale= new THREE.Vector3(1,1,1).multiplyScalar(boidConfig.values.protectedRange)
            

            this.debug.protectedRange.scale.copy(updateScale)
            this.debug.protectedRange.position.copy(this.getMainBoid().position)

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
                transparent:true,
                depthWrite:false
            })
            const geometry= new THREE.SphereGeometry()

            this.debug.visualRange= new THREE.Mesh(geometry,material)

            const updateScale= new THREE.Vector3(1,1,1).multiplyScalar(boidConfig.values.visualRange)
            this.debug.visualRange.position.copy(this.getMainBoid().position)
            

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
        
        this.debug.folder.add(this.debug,'showProtectedRange').name("Show Protected Range").onChange((bool)=>
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
            if(this.debug.protectedRange&&this.debug.showProtectedRange)
            {
                this.#debugProtectedRange(true)
            }
        })

        this.debug.folder.add(this.debug,'showVisualRange').name("Show Visual Range").onChange((bool)=>
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
            if(this.debug.visualRange && this.debug.showVisualRange)
                {
                    this.#debugVisualRange(true)
                }
        })
        
        
    }   
    //#endregion

}


