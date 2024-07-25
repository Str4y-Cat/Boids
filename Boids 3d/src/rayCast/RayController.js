import * as THREE from 'three'
import { arrayBuffer, attribute } from 'three/examples/jsm/nodes/Nodes.js'
import RaySphere from './RaySphere'


export default class 
{
    constructor(environmentOctree)
    {
        this.environmentOctree= environmentOctree

        this.raySphere= new RaySphere()

        this.stagger= {count:0}

    }


    //  NOTE: it may be better to use the standard boid position array,instead of the vec3 arr

    /**
     * checks the environment to see if there are world objects within the boids vision
     * 
     * @param {[THREE.Vector3]} boidPositions 
     * @returns {foundIntersections{boidindex,{distance,position}}} found intersections
     */
    #checkEnviroment(boidPositions, iStart, iEnd)
    {
        if(iStart==null||iEnd==null)
            {
                iStart=0;
                iEnd=boidPositions.length
            }
        
        
        //initialize return object
        const foundIntersections={}
        //loop through boidPositions
        for(let i = iStart; i<iEnd; i++){

            //finds environments objects that the boid intersects with
            const enviromentObjects=this.environmentOctree.getObjects(boidPositions[i])
            let environmentIntersections
            
            //if there are intersections, cast the rays
            if(enviromentObjects.length>0)
            {
                //rotate raySphere to match boid
                const targets= this.raySphere.rotateTo(boidPositions[i])
                
                //cast rays on that sphere
                environmentIntersections = this.raySphere.castRays(targets,boidPositions[i].position, enviromentObjects)
                
            }
            
            //if there are intersections
            if(environmentIntersections)
                {
                    //sets a new object in the found intersections obj
                    // {currentIndex: {distance:k, position: { x,y,z}}}
                    foundIntersections[i]=environmentIntersections
                }
            
        }
        
        return foundIntersections
    }

    /**
     * Performs the raycast check on surrounding environment objects.
     * these checks are staggered to improve performance. 
     * the stagger parameter partitions the array into sections, only one section is checked per function call
     * 
     * @param {*} boidPoistions array of three.js meshes 
     * @param {*} stagger the amount of partitions for the boidPositions. Keep to factor of the length of the array, no greater than length/2
     * @returns 
     */
    update(boidPoistions, stagger)
    {
        //update the global stagger variable. 
        this.stagger.count++

        //avoid any large number errors
        if(this.stagger.count==10000){this.stagger.count=0}   

        //instanciate the window length and the current Position within the cycle
        const window= boidPoistions.length/stagger
        const shift= this.stagger.count%stagger
        
        //instanciate the start and end indicies for the window
        const iStart=window*shift
        const iEnd=window*(shift+1)
        
        if(iStart%1!=0||iEnd%1!=0)
        {
            throw 'Boid Array length is not divisible by stagger'
            //make sure that the stagger you use is a factor of the boidArray.length value
        }

        if(this.debug.showRays)
        {
            this.#debugUpdate(boidPoistions[0])
        }

        //check the environment based on the window
        return this.#checkEnviroment(boidPoistions,iStart,iEnd)
    }


    /**
     * sets up debug panel for raycasting.
     * Includes:
     * - Show/Hide ray targets
     * - Tweak ray count
     * - Tweak Ray angle
     * - Tweak Ray Distance
     * 
     * @param {*} gui lil-gui instance
     * @param {*} scene three.js scene
     */
    setDebug(gui,scene)
    {
        this.debug={}
        const folder= gui.addFolder('Environment Vision')
        
        this.#debugRays(folder,scene)
        this.#debugTweakRays(folder,scene)
    }

    
    #debugUpdate(boidMesh)
    {
        this.debug.pointSphere.position.copy(boidMesh.position)
        this.debug.pointSphere.rotation.copy(boidMesh.rotation)
    }
    
    #debugRays(folder,scene)
    {
        this.debug.showRays=false
        folder.add(this.debug,'showRays').onChange(bool=>{

            if(bool)
            {
                this.#debugSetPointSphere(scene)
            }
            else{
                this.#debugRemovePointSphere(scene)
            }
        })
    }
    #debugSetPointSphere(scene)
    {
        this.debug.pointSphere= this.raySphere.getPointSphere()
        const scale=new THREE.Vector3(1,1,1)
        scale.multiplyScalar(this.raySphere.rayFar)
        this.debug.pointSphere.scale.copy(scale)
        scene.add(this.debug.pointSphere)
    }

    #debugRemovePointSphere(scene)
    {
        scene.remove(this.debug.pointSphere)
        this.debug.pointSphere.material.dispose()
        this.debug.pointSphere.geometry.dispose()
    }

    #debugTweakRays(folder,scene)
    {
        //tweak points
        folder.add(this.raySphere,'rayCount').min(1).max(500).step(1).name('Ray Count').onChange((num)=>{
            //update raysphere sphere
            // this.raySphere.rayCount=num
            this.raySphere.updatePointSphere()
            //udpate debug sphere
            if(this.debug.showRays)
            {
                this.#debugRemovePointSphere(scene)
                this.#debugSetPointSphere(scene)
            }
        })


        //change angle
        folder.add(this.raySphere,'rayAngleLimit').min(-1).max(1).step(0.001).name('Ray Angle').onChange(()=>{
            //update raysphere sphere
            // this.raySphere.rayCount=num
            this.raySphere.updatePointSphere()
            //udpate debug sphere
            if(this.debug.showRays)
            {
                this.#debugRemovePointSphere(scene)
                this.#debugSetPointSphere(scene)
            }
        })

        //change vision distance
        folder.add(this.raySphere,'rayFar').min(0).max(1).step(0.001).name('Ray Distance').onChange(()=>{
            //update raysphere sphere
            // this.raySphere.rayCount=num
            this.raySphere.updatePointSphere()
            //udpate debug sphere
            if(this.debug.showRays)
            {
                this.#debugRemovePointSphere(scene)
                this.#debugSetPointSphere(scene)
            }
        })

        
    }




}