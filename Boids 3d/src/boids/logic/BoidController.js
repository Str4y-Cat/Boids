import BoidLogic from "./BoidLogic";
import boidConfig from "../boid.config";
import * as THREE from 'three'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

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

        // [ ] convert to boundning sphere
       
        
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
     * Sets a native geometry mesh for each boid
     * 
     * @param {*} geometry - THREE.js geometry
     * @param {*} material - THREE.js material
     * @param {bool} rotateX 
     */
    setModelMesh(model,rotateX=true)
    {
        // //set global geometry
        // this.material= material
        // //set global material
        // this.geometry= geometry

        // if(rotateX){
        //     geometry.rotateX(-Math.PI * 0.5);
        // }

        this.model= model.scene
        this.model.scale.set(0.1, 0.1, 0.1);

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
        // if(!this.material)
        // {
        //     console.log('No material has been set')
        //     return
        // }
        // if(!this.geometry)
        // {
        //     console.log('No geometry has been set')
        //     return
        // }
        
       //create mesh for each boid position
        // boidLogicArray.forEach((boid) => {
        //     this.#createMesh(boid)
        // });

        // //update boidcount
        // this.boidCount=this.boidMeshes.length
        
        
        
 
    }

    

    /**
     * creates the three.js mesh for boidLogic object
     * 
     * @param {object} boidPosition 
     */
    #createMesh({x,y,z})
    {
        let boidMesh
        //create mesh
        if(this.model)
        {
            boidMesh=SkeletonUtils.clone(this.model)
        }
        else{
            boidMesh= new THREE.Mesh(this.geometry,this.material)
        }
        
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
        console.log(this.boidLogic.boidArray.length)
        //instanciate start and end index values
        // const iStart=this.boidLogic.boidArray.length-count
        // const iStart=0
        // const iEnd= this.boidLogic.boidArray.length

        //create mesh based on each new boid added
        // for(let i= iStart; i<iEnd;i++){
        //     this.#createMesh([this.boidLogic.boidArray[i]])
        // }
    }

    /**
     * 
     * @param {int} count 
     */
    #removeBoids(count)
    {
        //remove boids from boid logic instance
        this.boidLogic.removeBoids(count)
        console.log(this.getBoidArray().length)
        //instanciate start and end indicies
        // const iStart=this.boidLogic.boidArray.length
        // const iEnd= this.boidLogic.boidArray.length+count

        // //remove meshes
        // for(let i=iStart; i<iEnd;i++){
        //     this.#removeMesh()
        // }
        // console.log(`After pos: ${this.boidLogic.boidArray.length}\nAfter mesh: ${this.boidMeshes.length}`)


        // this.boidLogic.needsUpdate=true

    }
    //#endregion

    //#region utils

    /**
     * 
     * @param {[obj]} environmenObjects 
     */
    update(environmenObjects,elapsedTime)
    {
        //update the logic
        this.boidLogic.update(environmenObjects)

        if(this.dummy)
        {
            for ( let i = 0; i< this.getBoidArray().length; i++ ) {
                // let dummy= new THREE.Object3D()
                const boid=this.getBoidArray()[i]
                // const target=new THREE.Vector3(boid.targetX,boid.targetY,boid.targetZ)
    
                for(let n=0; n<3; n++)
                    {
                        // this.dummy[n].position.x=boid.x
                        this.dummy[n].position.copy(boid.position)
                        // this.dummy[n].position.y=boid.y
                        // this.dummy[n].position.z=boid.z
    
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
    // updateModels(elapsedTime)
    // {
    //      // console.log(this.dummy)
    //      for ( let i = 0; i< this.boidLogic.boidCount; i++ ) {
    //         // let dummy= new THREE.Object3D()
    //         const boid=this.boidLogic.boidArray[i]
    //         // const target=new THREE.Vector3(boid.targetX,boid.targetY,boid.targetZ)

    //         for(let n=0; n<3; n++)
    //             {
    //                 // this.dummy[n].position.x=boid.x
    //                 this.dummy[n].position.copy(boid.position)
    //                 // this.dummy[n].position.y=boid.y
    //                 // this.dummy[n].position.z=boid.z

    //                 this.dummy[n].quaternion.setFromRotationMatrix(boid.rotationMatrix)
    //                 this.dummy[n].updateMatrix();
    //                 this.boidInstancedMesh[n].setMatrixAt( i, this.dummy[n].matrix );
    //                 this.boidInstancedMesh[n].instanceMatrix.needsUpdate=true
                    
    //             }
    //             // this.mixer.setTime(elapsedTime)
    //             // this.boidInstancedMesh[1].setMorphAt(i,this.dummy[1])
            
            
    // }
    // // this.boidInstancedMesh[1].morphTexture.needsUpdate=true

    // }

    setModels(model,maxScale)
    {
        this.modelScale=maxScale
        const glb=model
        // console.log(glb)
        // console.log(glb)
        this.dummy=[]
        this.dummy.push(glb.scene.children[ 0 ].children[ 0 ].children[ 0 ]);
        this.dummy.push(glb.scene.children[ 0 ].children[ 0 ].children[ 1 ]);
        this.dummy.push(glb.scene.children[ 0 ].children[ 0 ].children[ 2 ]);

        //expand the boid bounding box
        // [ ] convert to bounding sphere
        if(!this.localBoidBoundingBox)
        {
            this.localBoidBoundingBox=new THREE.Box3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0))

        }
        this.dummy.forEach(obj=>{
            this.localBoidBoundingBox.expandByObject(obj)
        })
        this.localBoidBoundingBox2=this.localBoidBoundingBox.clone()
        this.localBoidBoundingBox.min.multiplyScalar(0.1*this.modelScale)
        this.localBoidBoundingBox.max.multiplyScalar(0.1*this.modelScale)
        

        // this.scene.add(this.dummy)
        this.boidInstancedMesh=[]

        this.boidInstancedMesh[0] = new THREE.InstancedMesh( this.dummy[0].geometry, new THREE.MeshBasicMaterial( {
            color:"orange"
        } ), this.boidLogic.boidCount );
        this.boidInstancedMesh[1]= new THREE.InstancedMesh( this.dummy[1].geometry, new THREE.MeshBasicMaterial( {
            color:'white'

        } ), this.boidLogic.boidCount );
        this.boidInstancedMesh[2] = new THREE.InstancedMesh( this.dummy[2].geometry, new THREE.MeshBasicMaterial( {

            color:'black'
        } ), this.boidLogic.boidCount );
       
        // this.boidInstancedMesh[1].updateMorphTargets() 
        // this.boidInstancedMesh[2].updateMorphTargets() 
        // this.boidInstancedMesh[3].updateMorphTargets() 
        // console.log(this.boidInstancedMesh[1])

        // mesh.castShadow = true;
        // let temp
        for ( let i = 0; i < this.boidLogic.boidCount; i ++ ) {
            const boid=this.boidLogic.boidArray[i]

            const scale= Math.max(Math.random(),this.modelScale)

            for(let n=0; n<3; n++)
                {

                    this.dummy[n].position.set(boid.x,boid.y,boid.z)
                    this.dummy[n].scale.set(0.1*scale,0.1*scale,0.1*scale)
                    this.dummy[n].updateMatrix();

                    if(n==1)
                        {
                        // this.boidInstancedMesh[n].setColorAt( i, new THREE.Color( this.randomColor() ) );
                        }

                    this.boidInstancedMesh[n].setMatrixAt( i, this.dummy[n].matrix );

                }




                // this.dummy[1].position.x=this.boids.boidLogic.boidArray[i].x
            
        }
        
        this.scene.add( this.boidInstancedMesh[0] );
        this.scene.add( this.boidInstancedMesh[1] );
        this.scene.add( this.boidInstancedMesh[2] );

        console.log(this.boidInstancedMesh)

        this.mixer = new THREE.AnimationMixer( glb.scene );
        console.log(glb)
        const action = this.mixer.clipAction( glb.animations[ 0 ] );
        // console.log(action)
        action.play();
        
    }

    changeModelCount()
    {
        this.boidInstancedMesh.forEach(obj=>{
            this.scene.remove(obj)
            obj.geometry.dispose()
            obj.material.dispose()
        })
        const count= this.getBoidArray().length
        console.log(count)

        this.boidInstancedMesh[0] = new THREE.InstancedMesh( this.dummy[0].geometry, new THREE.MeshBasicMaterial( {
            color:"orange"
        } ), count );
        this.boidInstancedMesh[1]= new THREE.InstancedMesh( this.dummy[1].geometry, new THREE.MeshBasicMaterial( {
            color:'white'

        } ), count );
        this.boidInstancedMesh[2] = new THREE.InstancedMesh( this.dummy[2].geometry, new THREE.MeshBasicMaterial( {

            color:'black'
        } ), count );
       
        // this.boidInstancedMesh[1].updateMorphTargets() 
        // this.boidInstancedMesh[2].updateMorphTargets() 
        // this.boidInstancedMesh[3].updateMorphTargets() 
        // console.log(this.boidInstancedMesh[1])

        // mesh.castShadow = true;
        // let temp
        for ( let i = 0; i < count; i ++ ) {
            const boid=this.boidLogic.boidArray[i]

            const scale= Math.max(Math.random(),this.modelScale)

            for(let n=0; n<3; n++)
                {

                    this.dummy[n].position.set(boid.x,boid.y,boid.z)
                    this.dummy[n].scale.set(0.1*scale,0.1*scale,0.1*scale)
                    this.dummy[n].updateMatrix();

                    if(n==1)
                        {
                        // this.boidInstancedMesh[n].setColorAt( i, new THREE.Color( this.randomColor() ) );
                        }

                    this.boidInstancedMesh[n].setMatrixAt( i, this.dummy[n].matrix );

                }




                // this.dummy[1].position.x=this.boids.boidLogic.boidArray[i].x
            
        }
        
        this.scene.add( this.boidInstancedMesh[0] );
        this.scene.add( this.boidInstancedMesh[1] );
        this.scene.add( this.boidInstancedMesh[2] );

        // console.log(this.boidInstancedMesh)

        // this.mixer = new THREE.AnimationMixer( glb.scene );
        // console.log(glb)
        // const action = this.mixer.clipAction( glb.animations[ 0 ] );
        // // console.log(action)
        // action.play();
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

        this.debug.folder.add(this.debug,'boidCount'). min(4).max(1000).step(4).onFinishChange((count)=>
        {
            
            if(count>this.getBoidArray().length)
                {
                    this.#addBoids(count-this.getBoidArray().length)
                    this.changeModelCount(count)
                }
            if(count<this.getBoidArray().length)
                {
                    this.#removeBoids(this.getBoidArray().length-count)
                    this.changeModelCount(count)

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
                transparent:true
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


