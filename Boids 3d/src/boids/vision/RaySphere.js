import * as THREE from 'three'
import boidConfig from '../boid.config'


export default class RaySphere
{
    /**
     * raySphere controlls the positioning and firing of rays for one object
     * - uses a point geometry to position targets for rays. 
     * 
     */
    constructor()
    {
        

        //debug
        this.debug={
            
        }
        
        //set up start params
        this.init()
        
        //targeting mesh
        this.pointSphere=this.setUpPointSphere()

        //raycaster
        this.rayCaster=this.setUpRayCaster()

    }

    /**
     * sets up start parameters
     */
    init()
    {
        this.rayCount=boidConfig.vision.count
        this.rayAngleLimit=boidConfig.vision.rayAngleLimit
        this.rayFar=boidConfig.vision.far
        
    }

    
    /**
     * 
     * @returns clone of the pointsphere
     */
    getPointSphere()
    {
        return this.pointSphere.clone()
    }

    //#region sphere methods

    /**
     * updates point sphere mesh
     * 
     * @returns mesh
     */
    updatePointSphere()
    {
        this.rayPositions_vec3Array=this.fibonacci_sphere_vec3()
        this.rayPositions_floatArray=this.toFloatArr(this.rayPositions_vec3Array)

        const pointsGeometry= new THREE.BufferGeometry()
        pointsGeometry.setAttribute('position',new THREE.BufferAttribute(this.rayPositions_floatArray,3))

        this.pointSphere.geometry.dispose()
        this.pointSphere.geometry=pointsGeometry
        

    }
    
    /**
     * Creates the point sphere points mesh using a bufferattribute derived from the global float array
     * 
     * @returns mesh
     */
    setUpPointSphere()
    {
        this.rayPositions_vec3Array=this.fibonacci_sphere_vec3()
        this.rayPositions_floatArray=this.toFloatArr(this.rayPositions_vec3Array)

        //set up the geometry
        const pointsGeometry= new THREE.BufferGeometry()

        //get points from global float array
        pointsGeometry.setAttribute('position',new THREE.BufferAttribute(this.rayPositions_floatArray,3))

        //set up material
        const pointsMaterial= new THREE.PointsMaterial({
            color:'green',
            size:0.04,
            // sizeAttenuation:true,
        })

        //create mesh
        const particleMesh= new THREE.Points(pointsGeometry,pointsMaterial)

        //no need to add it to scene. its just for ray target positioning

        return particleMesh
    }

    /**
     * returns points placed quasi equidistantly around a sphere using the Fibonacci sphere algorithm
     * - radius is normalized
     * - cuttoff value determines the z limit for the points on the sphere
     * - adapted from https://stackoverflow.com/questions/9600801/evenly-distributing-n-points-on-a-sphere/44164075#44164075
     * @returns a THREE.Vector3 array
     */
    fibonacci_sphere_vec3(){

        const points = []
        const phi = Math.PI * (Math.sqrt(5)-1)  //golden angle in radians

        for(let i=0; i<this.rayCount; i++)
            {
               
                let y = 1 - (i / (this.rayCount - 1)) * 2  // y goes from 1 to -1
                let radius = Math.sqrt(1 - y * y)  // radius at y
        
                let theta = phi * i  // golden angle increment
        
                let x = Math.cos(theta) * radius 
                let z = Math.sin(theta) * radius 


                    if(z<this.rayAngleLimit){
                        const normalizedTarget=new THREE.Vector3(x,y,z)
                        normalizedTarget.normalize()
                        points.push(normalizedTarget)
                    }
                    
                
            }
            
        return points
    }

    /**
     * Rotates the point sphere to match the given mesh rotation.
     * Returns an array of the sphere vertices shifted to the world position
     * 
     * note! it may be quicker to use the boidPoistion array instead of the boidMesh
     * possibly dont need the mesh. may be better with just the vec3 rotation (euler)
     * 
     * @param {*} mesh object mesh
     * @returns THREE.Vector3 Array
     */
    rotateTo(mesh)
    {
        //[x] convert to rotate with quaternion
        this.pointSphere.quaternion.setFromRotationMatrix(mesh.rotationMatrix)
        
       return this.toWorldVertices()
    }

    //#endregion

    //#region ray casting

    /**
     * sets up the raycaster.
     * - current layer set to 1
  
     * @returns THREE.Raycaster
     */
    setUpRayCaster()
    {
        // if(rayCastValues==undefined){rayCastValues={}}
        const rayCaster= new THREE.Raycaster()
        rayCaster.layers.set( 1 );
        rayCaster.far=this.rayFar
        rayCaster.firstHitOnly = true;

        return rayCaster
    }

    /**
     * Aims the raycaster and checks for intersections
     * - averages the found intersections distances and position
     * - normalized the final distance with the raycaster Far distance
     * 
     * @param {[THREE.Vector3]} rayTargets array of vec3 directions(normalized)
     * @param {THREE.Vector3} origin 
     * @returns {Object} {distance: int ,position: obj}
     */
    castRays(rayTargets, origin, environment)
    {
        
        //instanciate the found objects arr
        const objectArr=[]
        //instanciate accumulator
        const sum= {distance:0,position:{x:0,y:0,z:0}}
       
        let foundArr=[]

        // this.timer('castRays')
        //loop through targets, aim raycaster and check for intersection
        for(let i=0; i<rayTargets.length;i++)
            {
                //aims the raycaster
                this.rayCaster.set(origin,rayTargets[i])

                //find intersections of environment objects
                if(environment.length>1){
                    foundArr=this.rayCaster.intersectObjects(environment)
                }

                else
                {
                    // console.log(environment)
                    foundArr=this.rayCaster.intersectObject(environment[0])
                    // console.log(foundArr)
                }


                //if something was found add it to the array
                if(foundArr.length>0)
                {
                    objectArr.push(...foundArr)
                    // console.log(foundArr)
                }
            }


        //if there is something intersecting the ray
        if(objectArr.length>0)
        {

            //sum the values in the array
            for(const obj of objectArr){
                //[x]: ADD counter(CastRays)
                // this.counter('castRays')

                sum.distance+=obj.distance
                sum.position.x+=obj.point.x
                sum.position.z+=obj.point.z
                sum.position.y+=obj.point.y
            }
            
            //if theres more than one value average the values
            if(objectArr.length>1)
                {
                    sum.distance/=objectArr.length
                    sum.position.x/=objectArr.length
                    sum.position.y/=objectArr.length
                    sum.position.z/=objectArr.length
                }

            //normalize the distance
            sum.distance/=this.rayCaster.far
        }
        

        //return the distance, else return null
        return (sum.distance)?sum:null

    }

    
    //#endregion

    
    //#region utils

    /**
     * converts the vertices of the pointsphere mesh to world space
     * @returns [THREE.Vector3] array
     */
    toWorldVertices()
    {
        const positionAttribute = this.pointSphere.geometry.getAttribute( 'position' );
        // console.log(positionAttribute)
        const rotatedVerticies=[]
        for(let i=0; i<positionAttribute.count;i++)
            {
                //[x]: ADD counter(toWorldVertices)
                // this.counter('toWorldVertices')

                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute( positionAttribute, i );
                this.pointSphere.localToWorld( vertex );
                rotatedVerticies.push(vertex)
                
            }

        
        // this.timer('rotate')

        return rotatedVerticies
    }

    /**
     * Converts a THREE.Vector3 array to a Float32Array
     * @param {*} arr 
     * @returns 
     */
    toFloatArr(arr)
    {
        const floatArr= new Float32Array(arr.length*3)
        arr.forEach((vec,i)=>
        {
            //[x]: ADD counter(toFloatArr)
            // this.counter('toFloatArr')

            const i3=i*3
            floatArr[i3]=vec.x
            floatArr[i3+1]=vec.y
            floatArr[i3+2]=vec.z
        })
        return floatArr
    }

    /**
     * Converts a Float32Array to a THREE.Vector3 array
     * @param {*} arr 
     * @returns 
     */
    toVec3Arr(arr)
    {
        
        const vec3Arr=[]
        for (let i = 0; i < arr.length/3; i++) {
                //[x]: ADD counter(toVec3Arr)
                // this.counter('toVec3Arr')

                const i3=i*3
                const vec= new THREE.Vector3(
                    arr[i3],//x
                    arr[i3+1],//y
                    arr[i3+2]//z
                )
                // vec.normalize()
                vec3Arr.push(vec)
            
        }
        return vec3Arr
    }
    //#endregion
}

