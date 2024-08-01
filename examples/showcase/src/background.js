import * as THREE from 'three'


const dragMaterial= new THREE.MeshPhongMaterial({color:"#ff5733"})
const dragGeometry1= new THREE.BoxGeometry(1,1,1)


// const dragGeometry1= new THREE.TorusGeometry(1)
export const removeBackground=(environmentObjects,scene)=>
{
    environmentObjects.forEach(obj=>{
        scene.remove(obj)
        obj.material.dispose()
        obj.geometry.dispose()
    })
}

export const addFloor=(width,length,height)=>
{
    
    const floorGeometry= new THREE.PlaneGeometry(width,length,width,length)
    const floorMaterial= new THREE.MeshBasicMaterial(
        {
            color:"red",
            wireframe:true
        })
    const floor= new THREE.Mesh(
        floorGeometry,
        floorMaterial
    )
    floor.rotation.x=-Math.PI/2
    floor.position.y-=height/2
    floor.layers.enable( 1 );

    // floor.position.x=1
    return floor

}

export const createRandom=(width,length,height)=>
    {
        const environmentObjects=[]

        
        for(let i=0; i<5; i++)
            {
                const mesh= new THREE.Mesh(dragGeometry1,dragMaterial )
                mesh.scale.x=Math.max(Math.random(),0.4)
                mesh.scale.y=Math.max(Math.random(),0.4)
                mesh.scale.z=Math.max(Math.random(),0.4)
                // mesh.rotation.set(new THREE.Vector3((Math.random()-0.5)*2*Math.PI,(Math.random()-0.5)*2*Math.PI,(Math.random()-0.5)*2*Math.PI)) 
                mesh.rotation.x=(Math.random()-0.5)*2*Math.PI
                mesh.rotation.y=(Math.random()-0.5)*2*Math.PI
                mesh.rotation.z=(Math.random()-0.5)*2*Math.PI
        
                // console.log(mesh.rotation.x)
                
                // mesh.position.set(new THREE.Vector3((Math.random()-0.5)*2*10,(Math.random()-0.5)*2*10,(Math.random()-0.5)*2*10)) 
                mesh.position.x=(Math.random()-0.5)*width
                mesh.position.y=(Math.random()-0.5)*height
                mesh.position.z=(Math.random()-0.5)*length
                
                mesh.layers.enable( 1 );
               
                // scene.add(mesh)
                environmentObjects.push(mesh)
            }

        const geometry2= new THREE.TorusGeometry(1)
        for(let i=0; i<5; i++)
            {
                const mesh= new THREE.Mesh(geometry2,dragMaterial )
                const random= Math.max(Math.random(),0.4)
                mesh.scale.x=random
                mesh.scale.y=random
                mesh.scale.z=random
                // mesh.rotation.set(new THREE.Vector3((Math.random()-0.5)*2*Math.PI,(Math.random()-0.5)*2*Math.PI,(Math.random()-0.5)*2*Math.PI)) 
                mesh.rotation.x=(Math.random()-0.5)*2*Math.PI
                mesh.rotation.y=(Math.random()-0.5)*2*Math.PI
                mesh.rotation.z=(Math.random()-0.5)*2*Math.PI
        
                // console.log(mesh.rotation.x)
                
                // mesh.position.set(new THREE.Vector3((Math.random()-0.5)*2*10,(Math.random()-0.5)*2*10,(Math.random()-0.5)*2*10)) 
                mesh.position.x=(Math.random()-0.5)*width
                mesh.position.y=(Math.random()-0.5)*height
                mesh.position.z=(Math.random()-0.5)*length
                
                mesh.layers.enable( 1 );
                
                // scene.add(mesh)
                environmentObjects.push(mesh)
            }
    return environmentObjects
        
    }

export const createGrid=()=>{
    const environmentObjects=[]
    const material= new THREE.MeshPhongMaterial({color:"#ff5733"})
    const geometry= new THREE.SphereGeometry(1)

    for(let y=-2; y<=2; y++)
        {
            for(let x = -2 ; x<=2;x++)
                {
                    for (let z = -2 ; z<=2;z++ )
                        {
                            const mesh= new THREE.Mesh(geometry,material )
                            mesh.scale.x=0.3
                            mesh.scale.y=0.3
                            mesh.scale.z=0.3

                            mesh.position.x=x
                            mesh.position.y=y
                            mesh.position.z=z
                            
                            mesh.layers.enable( 1 );
                           
                            
                            environmentObjects.push(mesh)
                        }
                }
        }
        return environmentObjects
}

export const createWall=()=>{
   const environmentObjects =[]

    const mesh= new THREE.Mesh(dragGeometry1,dragMaterial )
        mesh.scale.x=Math.abs(Math.random()-0.5)
    mesh.scale.y=2.5
    mesh.position.y=-1.25
        mesh.scale.z=5
    mesh.layers.enable( 1 );
    // scene.add(mesh)

    environmentObjects.push(mesh)
    return environmentObjects

    }



