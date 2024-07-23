
export default class Boids2
{
    /**
     * 
     * @param {int} boidCount 
     * @param {object} displaySizes 
     * @param {object} param2
     * 
     */
    constructor(boidCount,displaySizes,{visualRange,protectedRange,seperationFactor,cohesionFactor,matchingFactor,minSpeed,maxSpeed, wallTransparent,turnFactor})
    {
        //world variables
        this.sizes=displaySizes

        this.transPadding = 10;
        this.solidPadding = 50;
        this.boundingBoxTransparent={
            width : this.sizes.width + this.transPadding * 2,
            height : this.sizes.height + this.transPadding * 2
        }
        this.boundingBoxSolid={
            top : this.solidPadding,
            bottom : this.sizes.height - this.solidPadding,

            left : this.solidPadding,
            right : this.sizes.width - this.solidPadding,
        }

        //debuggable objects
        this.visualRange=visualRange;
        this.protectedRange=protectedRange;
        this.cohesionFactor=cohesionFactor
        this.matchingFactor=matchingFactor
        this.seperationFactor=seperationFactor
        this.minSpeed=minSpeed
        this.maxSpeed=maxSpeed   
        this.wallTransparent=(wallTransparent)
        this.turnFactor=turnFactor

        //boid objects
        this.boidCount=boidCount
        this.boidArray=this.setUpBoidPositions(this.boidCount)
        // console.log(this.boidArray)
        
        console.log('success!')
    }

    // updateBoids
    updateSolidBoundingBox(padding){
        this.solidPadding=padding
        
        this.boundingBoxSolid.top= padding
        this.boundingBoxSolid.bottom=this.sizes.height - padding
        this.boundingBoxSolid.left= padding
        this.boundingBoxSolid.right=this.sizes.width - padding
        
    }

    setUpBoidPositions(count){
        const boidArray=[]
        // console.log(`count:${count}`)
        for(let i = 0; i< count; i++)
            {   
                const x= Math.random()*this.sizes.width

                const y= Math.random()*this.sizes.height
                const vx= (Math.random()-0.5)*2*this.maxSpeed
                const vy= (Math.random()-0.5)*2*this.maxSpeed
                boidArray.push(new Boid(x,y,vy,vx))
            }
        // console.log(boidArray)
        return boidArray
    }

    update()
    {
        this.boidArray.forEach((boid,i)=>
            {
                //set up the rotation target
                boid.targetX=boid.x
                boid.targetY=boid.y

                // console.log('entering loop')s
                //zero accum variables
                let accum= this.accumulatorObject()
                // console.log(`${boid.vx}\n${boid.vy}`)
                // console.log(boid)
                // console.log(this.boidArray)

                //loop through every other boid
                this.boidArray.forEach((otherBoid,n)=>
                    {
                        //compute differences in xy coords
                        const dx= boid.x - otherBoid.x
                        const dy= boid.y - otherBoid.y

                        //check if they are within visual range
                        if(Math.abs(dx)<this.visualRange && Math.abs(dy)<this.visualRange)
                            {
                                //get the distance between the two boids
                                const distance= Math.sqrt(dx**2+dy**2)

                                //is the distance less than the protected range
                                if(distance< this.protectedRange)
                                    {
                                        //calculate the difference in x/y-coordinates to the nearfield boid
                                        // accum.close_dx+=boid.x-otherBoid.x //!!!!!!!!! can just use dx
                                        // accum.close_dy+=boid.y-otherBoid.y //!!!!!!!!! can just use dy
                                        const exp=(1-(distance/this.protectedRange))**2
                                        // if(i==0)
                                        //     {
                                        //         console.log(exp)
                                        //     }
                                        accum.close_dx+=dx*exp //!!!!!!!!! can just use dx
                                        accum.close_dy+=dy*exp //!!!!!!!!! can just use dy

                                    }
                                
                                //if its not in the protected range, is it in the visual range?
                                else if(distance<this.visualRange)
                                    {
                                        const exp=(1-(distance/this.visualRange))**2
                                        //add other boids x/y coords and velocity variables to the accum
                                        accum.xpos_avg+=otherBoid.x
                                        accum.ypos_avg+=otherBoid.y
                                        accum.xvel_avg+=otherBoid.vx*exp
                                        accum.yvel_avg+=otherBoid.vy*exp

                                        //increment number of boids in visual range
                                        accum.neighboring_boids++
                                    }
                            }
                    })

                //check if there were any boids in the visual range
                if(accum.neighboring_boids>0)
                    {
                        //average the positions and velocity by number of neighboring boids
                        // console.log(`yvel_avg before averaging: ${accum.yvel_avg}\n`)
                        accum.xpos_avg/=accum.neighboring_boids
                        accum.ypos_avg/=accum.neighboring_boids
                        accum.xvel_avg/=accum.neighboring_boids
                        accum.yvel_avg/=accum.neighboring_boids
                        // console.log(`vy : ${boid.vy}`)
                        // console.log(`yvel_avg after averaging: ${accum.yvel_avg}\n`)

                        
                        //add cohesion and alignment factors
                        boid.vx+= (accum.xpos_avg-boid.x)*this.cohesionFactor
                        boid.vx+= (accum.xvel_avg-boid.vx)*this.matchingFactor

                        boid.vy+= (accum.ypos_avg-boid.y)*this.cohesionFactor
                        boid.vy+= (accum.yvel_avg-boid.vy)*this.matchingFactor
                    }
                
                //Add sepperation factor
                

                boid.vx+= (accum.close_dx*this.seperationFactor) 
                boid.vy+= (accum.close_dy*this.seperationFactor)

                
                //the bounding box
                boid=(this.wallTransparent)?this.transparentWall(boid):this.solidWall(boid)
                // boid=this.solidWall(boid)
                 
                
                // calculate boids speed
                const speed = Math.sqrt(boid.vx**2+boid.vy**2)

                //enforce speedlimits

                if (speed< this.minSpeed)
                    {
                        boid.vx= (boid.vx/speed)*this.minSpeed
                        boid.vy= (boid.vy/speed)*this.minSpeed
                    }
                if (speed> this.maxSpeed)
                    {
                        boid.vx= (boid.vx/speed)*this.maxSpeed
                        boid.vy= (boid.vy/speed)*this.maxSpeed
                    }
                
                //update positions
                boid.x+=boid.vx
                boid.y+=boid.vy

                // console.log(`${boid.x}\n${boid.y}`)
                // console.log(`${boid.vx}\n${boid.vy}`)
        })
    }

    accumulatorObject(){
        const accum=
        {
            xpos_avg:0,
             ypos_avg:0,
             xvel_avg:0,
             yvel_avg:0,
             neighboring_boids:0,
             close_dx:0,
             close_dy:0
        }
        return accum
    }

    getMain()
    {
        return this.boidArray[0]
    }

    solidWall(boid)
    {
        // console.log(this.boundingBoxSolid)
        if(this.boundingBoxSolid.top>boid.y)
            {
                // console.log("bounding top")
                boid.vy+=this.turnFactor
            }
        
        if(this.boundingBoxSolid.right<boid.x)
            {
                // console.log("bounding left")

                boid.vx-=this.turnFactor
            }
            
        if(this.boundingBoxSolid.left>boid.x)
            {
                // console.log("bounding right")

                boid.vx+=this.turnFactor
            }
        
        if(this.boundingBoxSolid.bottom<boid.y)
            {
                // console.log("bounding bottom")

                boid.vy-=this.turnFactor
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
}

class Boid
{
    constructor(x,y,vx,vy)
    {
        this.x=x
        this.y=y
        this.vx=vx
        this.vy=vy
        this.targetX=0
        this.targetY=0
    }
}

