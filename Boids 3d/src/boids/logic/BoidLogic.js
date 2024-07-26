
import boidConfig from "./boid.config";
export default class BoidLogic
{
    /**
     * 
     * @param {int} boidCount 
     * @param {THREE.Box3} box 
     */
    constructor(boidCount,box)
    {
        this.boundingBox=box

        //start values
        this.setUpTweakableValues()

        //initiate
        this.#initBoids(boidCount)
    }

    /**
     * sets up the base values based on a config file
     */
    setUpTweakableValues()
    {
        this.visualRange=boidConfig.values.visualRange              || defaultValue(1,"VisualRange")
        this.protectedRange=boidConfig.values.protectedRange        || defaultValue(0.5,"protectedRange")
        this.cohesionFactor=boidConfig.values.cohesionFactor        || defaultValue(0.0039,"cohesionFactor")
        this.matchingFactor=boidConfig.values.matchingFactor        || defaultValue(0.0287,"matchingFactor")
        this.seperationFactor=boidConfig.values.seperationFactor    || defaultValue(0.01395,"seperationFactor")
        this.minSpeed=boidConfig.values.minSpeed/100                || defaultValue(0.005,"minSpeed")
        this.maxSpeed=boidConfig.values.maxSpeed/100                || defaultValue(0.01,"maxSpeed")
        this.wallTransparent=boidConfig.values.wallTransparent      || defaultValue(false,"wallTransparent")
        this.turnFactor=boidConfig.values.turnFactor/100            || defaultValue(0.2,"turnFactor")
        this.objectAvoidFactor=boidConfig.values.objectAvoidFactor  || defaultValue(2,"object avoid")
    }

    /**
     * 
     * @param {int} boidCount 
     */
    #initBoids(boidCount)
    {
        this.boidCount=boidCount|| defaultValue(1,"boidCount")
        this.boidArray=[]
        this.addBoids(this.boidCount)
    }

    /**
     * Creates and adds new boids, with randomized aceleration and position
     * 
     * @param {int} count 
     */
    addBoids(count){
        
        for(let i = 0; i< count; i++)
            {   
                const x= (Math.random()-0.5)*2*this.boundingBox.max.x
                const y= (Math.random()-0.5)*2*this.boundingBox.max.y
                const z= (Math.random()-0.5)*2*this.boundingBox.max.z

                const vx= (Math.random()-0.5)*2*this.maxSpeed
                const vy= (Math.random()-0.5)*2*this.maxSpeed
                const vz= (Math.random()-0.5)*2*this.maxSpeed
                this.boidArray.push(new Boid(x,y,z,vy,vx,vz))
            }
    }

    /**
     * Removes boid position references
     * 
     * @param {int} count - amount of boids to remove
     */
    removeBoids(count)
    {
        while(count)
        {
            this.boidArray.pop()
            count--
        }
    }

    /**
     * Updates the boid positions based on other boids and environment objects
     * 
     * @param {[obj]} environmentObjects - array of environment objects close to boids
     */
    update(environmentObjects)
    {
        const PROTECTED_RANGE_SQUARED= this.protectedRange**2
        const VISUAL_RANGE_SQUARED = this.visualRange**2  
        // const MIN_SPEED_SQUARED= this.minSpeed**2
        // const MAX_SPEED_SQUARED= this.maxSpeed**2
        // console.log(this.cohesionFactor)
        

        this.boidArray.forEach((boid,i)=>
            {

                //set up the rotation target
                boid.targetX=boid.x
                boid.targetY=boid.y
                boid.targetZ=boid.z

                //zero accum variables
                let accum= this.#accumulatorObject()
                
                //loop through every other boid
                this.boidArray.forEach((otherBoid,n)=>
                    {
                        //compute differences in xy coords
                        const dx= boid.x - otherBoid.x
                        const dy= boid.y - otherBoid.y
                        const dz= boid.z - otherBoid.z

                        //check if they are within visual range
                        if(Math.abs(dx)<this.visualRange && Math.abs(dy)<this.visualRange&& Math.abs(dz)<this.visualRange)
                            {
                                //get the distance between the two boids
                                const distanceSquared= dx**2+dy**2+dz**2

                                //is the distance less than the protected range
                                if(distanceSquared< PROTECTED_RANGE_SQUARED)
                                    {
                                        //calculate the difference in x/y-coordinates to the nearfield boid
                                        const exp=(1-(distanceSquared/PROTECTED_RANGE_SQUARED))**2

                                        accum.close_dx+=dx*exp 
                                        accum.close_dy+=dy*exp 
                                        accum.close_dz+=dz*exp 

                                    }
                                
                                //if its not in the protected range, is it in the visual range?
                                else if(distanceSquared<VISUAL_RANGE_SQUARED)
                                    {
                                        const exp=(1-(distanceSquared/VISUAL_RANGE_SQUARED))**2
                                        //add other boids x/y coords and velocity variables to the accum
                                        accum.xpos_avg+=otherBoid.x
                                        accum.ypos_avg+=otherBoid.y
                                        accum.zpos_avg+=otherBoid.z
                                        accum.xvel_avg+=otherBoid.vx*exp
                                        accum.yvel_avg+=otherBoid.vy*exp
                                        accum.zvel_avg+=otherBoid.vz*exp

                                        //increment number of boids in visual range
                                        accum.neighboring_boids++
                                    }
                            }
                    })

                //checks environmet objects to see if this boid is near an object
                if(!environmentObjects[i]){

                    //check if there were any boids in the visual range
                    if(accum.neighboring_boids>0)
                    {
                        //average the positions and velocity by number of neighboring boids
                        
                        accum.xpos_avg/=accum.neighboring_boids
                        accum.ypos_avg/=accum.neighboring_boids
                        accum.zpos_avg/=accum.neighboring_boids
                        accum.xvel_avg/=accum.neighboring_boids
                        accum.yvel_avg/=accum.neighboring_boids
                        accum.zvel_avg/=accum.neighboring_boids
                        

                        
                        //add cohesion and alignment factors
                        boid.vx+= (accum.xpos_avg-boid.x)*this.cohesionFactor
                        boid.vx+= (accum.xvel_avg-boid.vx)*this.matchingFactor
                        // console.log('cohesion factor',(accum.xpos_avg-boid.x)*this.cohesionFactor)
                        // console.log('matching factor',(accum.xvel_avg-boid.vx)*this.matchingFactor)

                        boid.vy+= (accum.ypos_avg-boid.y)*this.cohesionFactor
                        boid.vy+= (accum.yvel_avg-boid.vy)*this.matchingFactor

                        boid.vz+= (accum.zpos_avg-boid.z)*this.cohesionFactor
                        boid.vz+= (accum.zvel_avg-boid.vz)*this.matchingFactor

                        
            
                    }

                    //Add sepperation factor
                    boid.vx+= (accum.close_dx*this.seperationFactor)
                    boid.vy+= (accum.close_dy*this.seperationFactor)
                    boid.vz+= (accum.close_dz*this.seperationFactor)
                }

                //there are other objects! get out of the way
                else
                {
                    // console.log('avoiding objects')
                    //avoiding object
                    const avoidObjExp=(1-environmentObjects[i].distance)**3

                    const dx= boid.x - environmentObjects[i].position.x
                    const dy= boid.y - environmentObjects[i].position.y
                    const dz= boid.z - environmentObjects[i].position.z

                    boid.vx+= dx*avoidObjExp*this.objectAvoidFactor
                    boid.vy+= dy*avoidObjExp*this.objectAvoidFactor
                    boid.vz+= dz*avoidObjExp*this.objectAvoidFactor
                }

                

                
                //the bounding box
                boid=(this.wallTransparent)?this.#transparentWall(boid):this.#solidWall(boid)
                 
                // calculate boids speed
                //NOTE can get rid of the sqrt, move this check to before each variable(environment -> seperation -> alignment -> cohesion) is added to 
                //create heirachy with the fish
                const speed = Math.sqrt(boid.vx**2+boid.vy**2+boid.vz**2)

                //enforce speedlimits

                if (speed< this.minSpeed)
                    {
                        boid.vx= (boid.vx/speed)*this.minSpeed
                        boid.vy= (boid.vy/speed)*this.minSpeed
                        boid.vz= (boid.vz/speed)*this.minSpeed
                    }
                if (speed> this.maxSpeed)
                    {
                        boid.vx= (boid.vx/speed)*this.maxSpeed
                        boid.vy= (boid.vy/speed)*this.maxSpeed
                        boid.vz= (boid.vz/speed)*this.maxSpeed
                    }

                    //NOTE: Math.sqrt is a slow algorithm. better to use a distance/speed squared check. But I am yet to see noticable performace increases. further testing needed
                    // const speedSquared = boid.vx**2+boid.vy**2+boid.vz**2

                    // //enforce speedlimits
    
                    // if (speedSquared< MIN_SPEED_SQUARED)
                    //     {   
                    //         const speed= Math.sqrt(speedSquared)
                    //         boid.vx= (boid.vx/speed)*this.minSpeed
                    //         boid.vy= (boid.vy/speed)*this.minSpeed
                    //         boid.vz= (boid.vz/speed)*this.minSpeed
                    //     }
                    // if (speedSquared> MAX_SPEED_SQUARED)
                    //     {
                    //         const speed= Math.sqrt(speedSquared)
                    //         boid.vx= (boid.vx/speed)*this.maxSpeed
                    //         boid.vy= (boid.vy/speed)*this.maxSpeed
                    //         boid.vz= (boid.vz/speed)*this.maxSpeed
                    //     }
                
                //update positions
                boid.x+=boid.vx
                boid.y+=boid.vy
                boid.z+=boid.vz

        })
    }

    /**
     * An object containing relevant physics accumulations
     * 
     * @returns accumulator obj
     */
    #accumulatorObject(){
        const accum=
        {
            xpos_avg:0, //position averages
            ypos_avg:0,
            zpos_avg:0,

            xvel_avg:0, //velocity averages
            yvel_avg:0,
            zvel_avg:0,

            neighboring_boids:0,    //count of neighboring boids within visual range

            close_dx:0, 
            close_dy:0,
            close_dz:0
        }
        return accum
    }

    //returns the main boid
    getMain()
    {
        return this.boidArray[0]
    }

    /**
     * Keeps boids within a bounding box. 
     * Bounding box acts as a notice to turn around
     * 
     * @param {obj} boid 
     * @returns 
     */
    #solidWall(boid)
    {

        if(this.boundingBox.max.y<boid.y)  //top
            {
                // console.log(this.boundingBox)
                boid.vy-=this.turnFactor
            }
        if(this.boundingBox.min.y>boid.y)  //bottom
        {
            boid.vy+=this.turnFactor
        }
        
        if(this.boundingBox.max.x<boid.x)  //right
            {
                boid.vx-=this.turnFactor
            }
        if(this.boundingBox.min.x>boid.x)  //left
            {
                boid.vx+=this.turnFactor
            }
        
        if(this.boundingBox.max.z<boid.z)  //front
            {
                boid.vz-=this.turnFactor
            }
        if(this.boundingBox.min.z>boid.z)  //back
            {
                boid.vz+=this.turnFactor
            }

        return boid
    }

    /**
     * Keeps boids within a bounding box. 
     * Bounding box acts as 'portal'.
     * 
     * @param {obj} boid 
     * @returns 
     */
    #transparentWall(boid)
    {
        if(this.boundingBox.max.y<boid.y)  //top
            {
                boid.y=this.boundingBox.min.y
            }
        
        if(this.boundingBox.max.x<boid.x)  //right
            {
                boid.x=this.boundingBox.min.x
            }
            
        if(this.boundingBox.min.x>boid.x)  //left
            {
                boid.x=this.boundingBox.max.x
            }
        
        if(this.boundingBox.min.y>boid.y)  //bottom
            {
                boid.y=this.boundingBox.max.y
            }

        if(this.boundingBox.max.z<boid.z)  //front
            {
                boid.z=this.boundingBox.min.z
            }

        if(this.boundingBox.min.z>boid.z)  //back
            {
                boid.z=this.boundingBox.max.z
            }

        return boid
    }

}

class Boid
{
    constructor(x,y,z,vx,vy,vz)
    {
        this.x=x
        this.y=y
        this.z=z
        this.vx=vx
        this.vy=vy
        this.vz=vz
        this.targetX=0
        this.targetY=0
        this.targetZ=0
    }
}

function defaultValue(x,name){
    console.log(`Defaulted on ${name}`)
    return x
}