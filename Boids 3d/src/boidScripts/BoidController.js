import BoidLogic from "./BoidLogic";
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
    constructor(count, sizes, scene,debug,gui,camera,texture)
    {
        this.camera=camera
        this.texture= texture
        this.global={}


        this.scene=scene
        this.sceneSize=debug.floorSize
        startValues.sceneSize=this.sceneSize


        this.boidLogic=new BoidLogic(count, sizes,startValues)
        this.boidMeshes= []
        this.addMeshes(this.boidLogic.boidArray)


        this.gui=gui
        
        this.addControls()

    }

    addMeshes(arr)
    {
        //create geometry
        const geometry = new THREE.ConeGeometry( 0.027, 0.132,3 ); 

        //create material
        const material = new THREE.MeshMatcapMaterial( {matcap:this.texture} );
        geometry.rotateX(-Math.PI * 0.5);

        arr.forEach((boid) => {
            this.boidMeshes.push(this.createMesh(boid,geometry,material))
        });

        this.global.boidCount=this.boidMeshes.length
 
    }

    createMesh({x,y,z}, geometry,material)
    {
        const boidMesh= new THREE.Mesh(geometry,material)

        boidMesh.position.set(x,y,z)

        // console.log()
        this.scene.add(boidMesh)
        return boidMesh
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
        // console.log(`count is ${count}\nBefore pos: ${this.boidLogic.boidArray.length}\nBefore mesh: ${this.boidMeshes.length}`)
        this.boidLogic.addBoids(count)
        const iStart=this.boidLogic.boidArray.length-count
        const iEnd= this.boidLogic.boidArray.length
        // console.log(iStart)
        // console.log(iEnd)
        for(let i= iStart; i<iEnd;i++){
            // console.log([this.boidLogic.boidArray[i]])
            this.addMeshes([this.boidLogic.boidArray[i]])
        }
        // console.log(`After pos: ${this.boidLogic.boidArray.length}\nAfter mesh: ${this.boidMeshes.length}`)


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

    /** Update()
     * 
     * Updates the movement of the boid objects
     * 
     */
    update(environmenObjects)
    {
        

        this.boidLogic.update(environmenObjects)

        this.boidMeshes.forEach((boidMesh,i)=>
        {
            // console.log(i)
            // console.log(this.boidLogic.boidArray[i])
            // console.log(this.boidLogic.boidArray)
            const boid= this.boidLogic.boidArray[i]

            // console.log(boidMesh)
            boidMesh.position.x=boid.x
            boidMesh.position.y=boid.y
            boidMesh.position.z=boid.z
            // console.log(boid.z)
            boidMesh.lookAt(new THREE.Vector3(boid.targetX,boid.targetY,boid.targetZ))
            

            if(i==0&&this.debugHalos.protectedCircle)
                {
                    this.debugHalos.protectedCircle.position.copy( boidMesh.position)
                    this.debugHalos.protectedCircle.lookAt(this.camera.position);
                    // console.log(this.scene.children) 
                    this.debugHalos.viewCircle.position.copy( boidMesh.position)
                    this.debugHalos.viewCircle.lookAt(this.camera.position);

                }

        })
    }


    /** addControls
     * 
     * adds gui controls
     * 
     */
    addControls()
    {
        // values.
       const boidsFolder= this.gui.addFolder('Boids')
        boidsFolder.add(this.global,'boidCount').step(1). min(0).max(3000).onChange((count)=>
        {
            if(count>this.boidMeshes.length)
                {
                    this.addBoids(count-this.boidMeshes.length)
                }
            if(count<this.boidMeshes.length)
                {
                    this.removeBoids(this.boidMeshes.length-count)
                }
        })





       const controlsFolder= boidsFolder.addFolder('Controls')
        controlsFolder.add(startValues,"cohesionFactor").min(0).max(0.05).step(0.00001).onChange((num)=>{
            this.boidLogic.cohesionFactor=num
        })
        controlsFolder.add(startValues,"matchingFactor").min(0).max(0.1).step(0.00001).onChange((num)=>{
            this.boidLogic.matchingFactor=num
        })
        controlsFolder.add(startValues,"seperationFactor").min(0).max(0.5).step(0.00001).onChange((num)=>{
            this.boidLogic.seperationFactor=num
        })
        controlsFolder.add(startValues,"turnFactor").min(0).max(1).step(0.0001).onChange((num)=>{
            this.boidLogic.turnFactor=num/100
        })
        controlsFolder.add(startValues,"minSpeed").min(0).max(10).step(0.001).onChange((num)=>{
            this.boidLogic.minSpeed=num/100
        })
        controlsFolder.add(startValues,"maxSpeed").min(0).max(10).step(0.001).onChange((num)=>{
            this.boidLogic.maxSpeed=num/100
        })
        controlsFolder.add(startValues,"wallTransparent").onChange((bool)=>{
            this.boidLogic.wallTransparent=bool
}) 
    }

    /**DEBUG
     */
    debug()
    {
        this.debugSolidBorderBox()
        this.debugHalos()
    }

    //debug border box
    debugSolidBorderBox()
    {
        // const box= new THREE.Mesh(
        //     new THREE.BoxGeometry(this.sceneSize,this.sceneSize,this.sceneSize),
        //     new THREE.MeshBasicMaterial({wireframe:true})
        // )
        const boxGeometry= new THREE.BoxGeometry(this.sceneSize,this.sceneSize,this.sceneSize)
        

        const box= new THREE.LineSegments(
            new THREE.EdgesGeometry(boxGeometry),
            new THREE.LineBasicMaterial({color:"red"})

        )
        this.scene.add(box)


    }

    debugHalos()
    {
        
        const viewMaterial = new THREE.LineBasicMaterial( { color: "green" } );
        const protectedMaterial = new THREE.LineBasicMaterial( { color: "red" } );

        const viewCurve = new THREE.EllipseCurve(
            0,  0,            // ax, aY
            this.boidLogic.visualRange, this.boidLogic.visualRange,           // xRadius, yRadius
            0,  2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );
        
       
        let points = viewCurve.getPoints( 50 );
        let viewGeometry = new THREE.BufferGeometry().setFromPoints( points );
        
        // Create the final object to add to the scene
        const viewCircle = new THREE.Line( viewGeometry, viewMaterial );


        const protectedCurve = new THREE.EllipseCurve(
            0,  0,            // ax, aY
            this.boidLogic.protectedRange, this.boidLogic.protectedRange,           // xRadius, yRadius
            0,  2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );
        
       
        points = protectedCurve.getPoints( 50 );
        let protectedGeometry = new THREE.BufferGeometry().setFromPoints( points );
        
        // Create the final object to add to the scene
        const protectedCircle = new THREE.Line( protectedGeometry, protectedMaterial );
        // protectedCircle.material.color= new THREE.Color("red")

        this.scene.add(protectedCircle,viewCircle)

        
        this.debugHalos={
            protectedCircle:protectedCircle,
            viewCircle:viewCircle
        }
        // console.log(this.debugValues)
    }


}

/**
 * start options
 */

const startValues=
{
    // transPadding : null,
    // solidPadding : null,
    visualRange:0.6,
    protectedRange:0.2,
    cohesionFactor:0.00206,
    matchingFactor:0.09385,
    seperationFactor:0.30332,
    minSpeed:2.379,
    maxSpeed:5.575   ,
    wallTransparent:false,
    turnFactor:0.201,
    boidCount:null,
    sceneSize:null,
}

