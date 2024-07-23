export default 

class boid{

    constructor(count,sizes,minDistance){
        console.log('you have created a boid!')

        this.sizes=sizes
        this.boidCount=count
        this.boidArray=this.setUpBoidPositions(this.boidCount)
        this.stagePadding = 10;
        this.boundingBox={
            width : this.sizes.width + this.stagePadding * 2,
            height : this.sizes.height + this.stagePadding * 2
        }

        //debuggable objects
        this.minDistance=minDistance;
        this.speed=2;
        this.wallType=
        {
            pacMan:true,
            solid:false,
        }


        
    }


    //set up
     setUpBoidPositions(count) {
        const boidArray=[]
        for(let i=0; i<count;i++)
            {   

                //positioning
                const x= Math.random()*this.sizes.width
                const y= Math.random()*this.sizes.height
            
                const direction= Math.random() * Math.PI * 2
                
                const obj=
                {
                     position:{x:x,y:y},
                     direction
                }
                boidArray.push(obj)
            }
        return boidArray
        
    }

    update(){
        this.boidArray.forEach((boid,i )=> {
            // boid.position.x+=2
            boid=this.move(boid,i)

        });
    }


    move(boid,i)
    {

        if(i==0){
            boid=this.advancePosition(boid,i)
        }
        // fish.direction = Math.random()*(Math.PI*2);

        // Animate the fish boid according to the direction and speed.
        boid.position.x += -Math.cos(boid.direction) * this.speed;
        boid.position.y += -Math.sin(boid.direction) * this.speed;

        

        if(this.wallType.pacMan==true){
            boid= this.pacManWalls(boid)
        }
        if(this.wallType.solid==true){
            boid= this.solidWalls()
        }


        return boid
    }



    

    advancePosition(boid,i){
        

            //create avoid array
            const avoidBoids= this.getAvoidBoids(i) //temp for now, focus on main boid
            if(avoidBoids.length==0)return boid
            let angleAdvance = 0
            //seperate
            angleAdvance= this.seperation(boid, avoidBoids)


            //align

            //cohesion
            console.log(`boid.direction: ${boid.direction}\n angleAdvance ${angleAdvance} \n differece ${angleAdvance*boid.direction}`)
            // console.log(``)
            
            boid.direction=angleAdvance
            return boid

    }

    //#region main rules
    /**
     * Need to do the inverse, find the distance. if the distance is small allocate a larger weight to it
     * 
     * should probably be a exp graph, (normalize the distance)*(exp function)*seperationStrength,
     * 
     */
    seperation(currentBoid, avoidBoids){

        let angleAdvance=0;
    
        avoidBoids.forEach((avoidBoid)=>{
            
            /**find force factor
             * get distance between boids
             * normalize distance
             * apply exp equation to normalized distance
             */

            let normalizedDistance= getDistance(currentBoid.position, avoidBoid.position)
            // normalizedDistance/=this.minDistance
            normalizedDistance/=1
            // normalizedDistance*= exponential function 


            /** Find perpendicular angle
             *  add/subtract the perpendicular angle multiplied by the force factor
             */

            let perpendicularAngle= getPerpendicularAngle(avoidBoid,currentBoid )

            
            angleAdvance+=perpendicularAngle
            // console.log(`Angle Advance:${angleAdvance}\n perpendicularAngle:${perpendicularAngle}\n normalizedDistance:${normalizedDistance} `)
        })

        return angleAdvance
    }

    /**
     * 
     * think this one is pretty simple, just average the surrounding angles and multiply a alignmentStrength
     */
    alignment(current, arr){
        const angle= arr.reduce((sum,cur)=>{
            return sum.direction+=cur.direction
        },current.direction)/(arr.length+1)

        return angle
    }

    /**
     * 
     * reverse of the seperation function
     * 
     */
    cohesion(current, arr){
    }

    //#endregion


    /**
     * combine the 3 values
     * average them
     * could add further weight to each value if one is more important, but this could be redundant
     * 
     */
    getAngle(){
        this.boidArray.forEach((boid,i)=>{
            const closeBoids= this.getAvoidBoids(boid,i)
        })
       
        

    }

    getAvoidBoids(i){

        // console.log(this.boidArray)
        // console.log(`Min search distance is ${this.minDistance}`)
        const currentBoid=this.boidArray[i]
        // console.log(currentBoid)

        let closeBoids= this.boidArray.filter((nextBoid)=> 
            {
                const distance = getDistance(currentBoid.position,nextBoid.position)
                // console.log(distance)
                return distance<=this.minDistance&&distance!=0
            })
            
            // console.log(closeBoids)
        return closeBoids;
    }

    //#region Wall functionality
    pacManWalls(boid)
    {
        if(boid.position.x>this.boundingBox.width){boid.position.x=0}
        if(boid.position.x<0){boid.position.x=this.boundingBox.width}
        if(boid.position.y>this.boundingBox.height){boid.position.y=0}
        if(boid.position.y<0){boid.position.y=this.boundingBox.height}

        return boid
    }

    solidWalls(){
        //if x is smaller than minBounding
    }
    //#endregion

}


/**gets the angle in radians between two points
 * 
 * @param {*} pos1 
 * @param {*} pos2 
 * @returns 
 */
function getAngle(pos1,pos2){
    let dY=pos2.y-pos1.y
    let dX=pos2.x-pos1.x
    let angle= Math.atan2(dY,dX)
    // return (angle<0)?(Math.PI+angle)+Math.PI:angle
    return (angle)

}

/**
 * Determines the distance between two 2d points
 * @param {vec2} pos1 
 * @param {vec2} pos2 
 * @returns int
 */
function getDistance(pos1,pos2){
   return Math.sqrt((pos1.x-pos2.x)**2+(pos1.y-pos2.y)**2)
}

function getPerpendicularAngle(boidMain, boidAvoid){
    return -1/getAngle(boidMain.position,boidAvoid.position)
}