import WorldValues from "../WorldValues";
export default class BoidLogic
{
    /**
     * 
     * @param {int} boidCount 
     * @param {object} displaySizes 
     * @param {object} param2
     * 
     */
    constructor(boidCount,box)
    {
        //world variables
        // this.sizes=displaySizes
        // this.sceneSize=size/2|| defaultValue(2,"sceneSize")
        // this.minHeight= WorldValues.floorHeight
        // this.maxHeight= WorldValues.roofHeight
        // this.transPadding = startValues.transPadding || defaultValue(10,"transPadding");
        this.solidPadding = defaultValue(1,"solidPadding");
        // this.boundingBoxTransparent={
        //     width : this.sizes.width + this.transPadding * 2,
        //     height : this.sizes.height + this.transPadding * 2
        // }
        //TODO use a box three for the scene size?
        this.boundingBoxSolid=box
        

        //debuggable objects
        //TODO fix this kak
        const startValues={}
        this.setUpTweakableValues(startValues)

        //boid objects
        this.boidCount=boidCount|| defaultValue(1,"boidCount")
        this.boidArray=[]
        this.addBoids(this.boidCount)
        this.needsUpdate=false
        
        // console.log('success!')
    }

    setUpTweakableValues()
    {
        this.visualRange=WorldValues.boids.visualRange || defaultValue(1,"VisualRange")
        this.protectedRange=WorldValues.boids.protectedRange|| defaultValue(0.5,"protectedRange")
        this.cohesionFactor=WorldValues.boids.cohesionFactor|| defaultValue(0.0039,"cohesionFactor")
        this.matchingFactor=WorldValues.boids.matchingFactor|| defaultValue(0.0287,"matchingFactor")
        this.seperationFactor=WorldValues.boids.seperationFactor|| defaultValue(0.01395,"seperationFactor")
        this.minSpeed=WorldValues.boids.minSpeed/100|| defaultValue(0.005,"minSpeed")
        this.maxSpeed=WorldValues.boids.maxSpeed/100  || defaultValue(0.01,"maxSpeed")
        this.wallTransparent=WorldValues.boids.wallTransparent|| defaultValue(false,"wallTransparent")
        this.turnFactor=WorldValues.boids.turnFactor/100|| defaultValue(0.2,"turnFactor")
        this.objectAvoidFactor=WorldValues.boids.objectAvoidFactor|| defaultValue(2,"object avoid")
    }

    //Update bounding box
    // updateSolidBoundingBox(padding){
    //     this.solidPadding=padding
        
    //     // this.boundingBoxSolid.top= this.sceneSize
    //     // this.boundingBoxSolid.bottom=-this.sceneSize
    //     // this.boundingBoxSolid.left= -this.sceneSize
    //     // this.boundingBoxSolid.right= this.sizes.width
        
    // }

    //initial boid positions
    addBoids(count){
        for(let i = 0; i< count; i++)
            {   
                const x= (Math.random()-0.5)*2*this.boundingBoxSolid.max.x
                const y= (Math.random()-0.5)*2*this.boundingBoxSolid.max.y
                const z= (Math.random()-0.5)*2*this.boundingBoxSolid.max.z

                const vx= (Math.random()-0.5)*2*this.maxSpeed
                const vy= (Math.random()-0.5)*2*this.maxSpeed
                const vz= (Math.random()-0.5)*2*this.maxSpeed
                this.boidArray.push(new Boid(x,y,z,vy,vx,vz))
            }
    }

    removeBoids(count)
    {
        while(count)
        {
            this.boidArray.pop()
            count--
        }
    }

    // updates the boids based on other boids and environment objects
    update(environmenObjects)
    {
        // if(environmenObjects[0]){console.log(environmenObjects)}
        this.boidArray.forEach((boid,i)=>
            {
                //set up the rotation target
                boid.targetX=boid.x
                boid.targetY=boid.y
                boid.targetZ=boid.z

                //zero accum variables
                let accum= this.accumulatorObject()
                
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
                                //FIXME: remove the sqrt check
                                const distance= Math.sqrt(dx**2+dy**2+dz**2)

                                //is the distance less than the protected range
                                if(distance< this.protectedRange)
                                    {
                                        //calculate the difference in x/y-coordinates to the nearfield boid
                                        const exp=(1-(distance/this.protectedRange))**2

                                        accum.close_dx+=dx*exp 
                                        accum.close_dy+=dy*exp 
                                        accum.close_dz+=dz*exp 

                                    }
                                
                                //if its not in the protected range, is it in the visual range?
                                else if(distance<this.visualRange)
                                    {
                                        const exp=(1-(distance/this.visualRange))**2
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
                if(!environmenObjects[i]){

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

                            boid.vy+= (accum.ypos_avg-boid.y)*this.cohesionFactor
                            boid.vy+= (accum.yvel_avg-boid.vy)*this.matchingFactor

                            boid.vz+= (accum.zpos_avg-boid.z)*this.cohesionFactor
                            boid.vz+= (accum.zvel_avg-boid.vz)*this.matchingFactor
                        }
                }

                //there are other boids! get out of the way
                else
                {
                    //avoiding object
                    const avoidObjExp=(1-environmenObjects[i].distance)**2

                    const dx= boid.x - environmenObjects[i].position.x
                    const dy= boid.y - environmenObjects[i].position.y
                    const dz= boid.z - environmenObjects[i].position.z

                    accum.close_dx+=dx*avoidObjExp 
                    accum.close_dy+=dy*avoidObjExp 
                    accum.close_dz+=dz*avoidObjExp 

                    accum.close_dx*= this.objectAvoidFactor
                    accum.close_dy*= this.objectAvoidFactor
                    accum.close_dz*= this.objectAvoidFactor
                }

                //Add sepperation factor
                boid.vx+= (accum.close_dx*this.seperationFactor) 
                boid.vy+= (accum.close_dy*this.seperationFactor)
                boid.vz+= (accum.close_dz*this.seperationFactor)

                
                //the bounding box
                boid=(this.wallTransparent)?this.transparentWall(boid):this.solidWall(boid)
                // boid=this.solidWall(boid)
                 
                
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
                
                //update positions
                boid.x+=boid.vx
                boid.y+=boid.vy
                boid.z+=boid.vz

        })
    }

    // sets up the accumulator object
    accumulatorObject(){
        const accum=
        {
            xpos_avg:0,
            ypos_avg:0,
            zpos_avg:0,
            xvel_avg:0,
            yvel_avg:0,
            zvel_avg:0,
            neighboring_boids:0,
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

    // NOTE: could use a box3 to represent the bounding box
    solidWall(boid)
    {
       
        // console.log(this.boundingBoxSolid)
        if(this.boundingBoxSolid.max.y<boid.y)
            {
                // console.log("top")
                // console.log("bounding top")
                boid.vy-=this.turnFactor
            }
        
        if(this.boundingBoxSolid.max.x<boid.x)
            {
                // console.log("bounding left")
                // console.log("right")

                boid.vx-=this.turnFactor
            }
            
        if(this.boundingBoxSolid.min.x>boid.x)
            {
                // console.log("bounding right")
                // console.log("left")

                boid.vx+=this.turnFactor
            }
        
        if(this.boundingBoxSolid.min.y>boid.y)
            {
                // console.log("bounding bottom")
                // console.log("bottom")

                boid.vy+=this.turnFactor
            }

        if(this.boundingBoxSolid.max.z<boid.z)
            {
                // console.log("bounding bottom")
                // console.log("bottom")

                boid.vz-=this.turnFactor
            }
        if(this.boundingBoxSolid.min.z>boid.z)
            {
                // console.log("bounding bottom")
                // console.log("bottom")

                boid.vz+=this.turnFactor
            }
        return boid
    }

    transparentWall(boid)
    {
        if(boid.x>this.boundingBoxTransparent.width){boid.x=0}
        if(boid.x<0){boid.x=this.boundingBoxTransparent.width}
        if(boid.y>this.boundingBoxTransparent.height){boid.y=0}
        if(boid.y<0){boid.y=this.boundingBoxTransparent.height}

        return boid
    }


    // #region utils

   
    //#endregion
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