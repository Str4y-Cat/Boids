import * as THREE from 'three'
import OctreeNode from "./OctreeNode";

export default class Octree
{
    constructor(worldObjects,minNodeSize)
    {

        //create a new box
        const bounds = this.setUpBounds(worldObjects)

        //create rootNode
        this.rootNode= new OctreeNode(bounds,minNodeSize)

        //add objects to the tree
        this.addObjects(worldObjects)
        

    }

    /**Grows a bounding box to cover all the objects in the array
     * 
     * @param {*} worldObjects 
     * @returns Box3
     */
    setUpBounds(worldObjects)
    {
        //create a new box
        const bounds = new THREE.Box3() 

        //loop through all meshes and grow the box to encapsulate all
        worldObjects.forEach(mesh => {

            //grow the bounds
            bounds.expandByObject(mesh)

        });

        //copy the size of the bounds
        const size= new THREE.Vector3()
        bounds.getSize(size)

        //find the max axis value of the size vector
        const maxSize= Math.max(...[size.x,size.y,size.z])
        // console.log(`maxSize: ${maxSize}`) //works!

        //new box size
        const sizeVector= new THREE.Vector3(maxSize,maxSize,maxSize)
        //box starts from center, multiply by 0.5 to account for extra length
        sizeVector.multiplyScalar(0.5)
        // console.log(sizeVector)
        
        //get the center of the box
        const boundsCenter=new THREE.Vector3()
        bounds.getCenter(boundsCenter)

        bounds.set(boundsCenter.clone().sub(sizeVector),boundsCenter.add(sizeVector))

        return bounds
    }

    /**
     * 
     * @param {*} worldObjects 
     */
    addObjects(worldObjects)
    {
        worldObjects.forEach(obj => {
            this.rootNode.addObject(obj)
        });
    }

    /**
     * Recursively checks children, returns a list of THREE.JS Meshes that intersect with the provided object
     * 
     * @param {*} mesh 
     * @param {*} scene 
     * @returns 
     */
    getObjects(obj,scene)
    {
        let box =obj;
        if(!obj.isBox3||obj.isBox3==null){
             box= new THREE.Box3().setFromObject(obj)
        }
        
        const intersections=this.intersectsObject(this.rootNode,box,scene)
        const uniqueIntersections = [...new Map(intersections.map(item => [item.uuid, item])).values()]

        return uniqueIntersections

    }




    /**
     * Recursively checks children, returns the layers of the thee.js meshes
     * @param {*} mesh 
     * @param {*} scene 
     * @returns 
     */
    getLayers(mesh,scene)
    {
        const box= new THREE.Box3().setFromObject(mesh)
        const testLayers=this.intersectsLayers(this.rootNode,box,scene)
        const unique = [...new Map(testLayers.map(item => [item.mask, item])).values()]

        return unique

    }

    /**
     * 
     * Recursively checks children, returns true if the object is intersecting with any object
     * @param {*} mesh 
     * @param {*} scene 
     * @returns 
     */
    intersects(mesh,scene)
    {

        const box= new THREE.Box3().setFromObject(mesh)

        return this.isIntersecting(this.rootNode,box,scene)
    }

    /**
     * Recursively checks children, returns a list of THREE.JS Meshes that intersect with the provided box3
     * @param {OctreeNode} node 
     * @param {Box3} box 
     * @param {Object3d} scene 
     * @returns Three.Mesh[]
     */
    intersectsObject(node,box,scene)
    {
        // console.log(node)
        const array= []

        // if(node.isBox3)
        //check if bounding box intersects
        if(node.nodeBounds.intersectsBox(box)&&node.containsObject)
            {
                //if node is leaf, return with world objects(if there are any)
                if(node.children==null)
                    {
                        if(scene){
                            this.debugDraw(node.nodeBounds,"green",scene)
                            this.debugDraw(box,"red",scene)
                        }
                        
                        
                        return node.worldObjects
                    }

                //loop through children
                for(let i =0; i<8; i++)
                    {
                        //recursivly checks children that fit criteria:
                        // - child bounds must intersect with the box
                        // - node must contain an object
                        if(node.childBounds[i].intersectsBox(box)&&node.containsObject)
                            {
                                //recurisve call
                                const value= this.intersectsObject(node.children[i],box,scene)
                                if(value)
                                    {
                                        //  NOTE: not sure if this is the best option. multiple calls may outweigh the O()time of map
                                        //  figured map is pro
                                        const unique = [...new Map(value.map(item => [item.uuid, item])).values()]
                                        array.push(...unique)
                                    }
                                
                            }
                    }
            }
        return array
            
    }

    /**
         * Recursively checks children, returns the layers of the thee.js meshes
         * @param {OctreeNode} node 
         * @param {Box3} box 
         * @param {Object3d} scene 
         * @returns int[]
         */
    intersectsLayers(node,box,scene)
    {
        // console.log(node)
        const array= []

        // if(node.isBox3)
        //check if bounding box intersects
        if(node.nodeBounds.intersectsBox(box)&&node.containsObject)
            {
                //if node is leaf, return with world objects(if there are any)
                if(node.children==null)
                    {
                        //generates box if there is a scene variable
                        if(scene){
                            this.debugDraw(node.nodeBounds,"green",scene)
                            this.debugDraw(box,"red",scene)
                        }
                        const temp=[]
                        

                        if(node.worldObjects.length>0)
                            {
                                
                                node.worldObjects.forEach((worldObj)=>{
                                    temp.push(worldObj.layers);
                                    })

                            }
                        
                        return temp
                    }

                //loop through children
                for(let i =0; i<8; i++)
                    {
                        //recursivly checks children that fit criteria:
                        // - child bounds must intersect with the box
                        // - node must contain an object
                        if(node.childBounds[i].intersectsBox(box)&&node.containsObject)
                            {
                                //recurisve call
                                const value= this.intersectsLayers(node.children[i],box,scene)
                                if(value)
                                    {
                                        //  NOTE: not sure if this is the best option. multiple calls may outweigh the O()time of map
                                        //  figured map is pro
                                        // const unique = [...new Map(value.map(item => [item.uuid, item])).values()]
                                        array.push(...value)
                                    }
                                
                            }
                    }
            }
        return array
            
    }

    /**
         * Recursively checks children, returns true if the object is intersecting with any object
         *  
         * @param {OctreeNode} node 
         * @param {Box3} box 
         * @param {Object3d} scene 
         * @returns Three.Mesh[]
         */
    isIntersecting(node,box,scene)
    {
        let value =false
        // if(node.isBox3)
        //check if bounding box intersects
        if(node.nodeBounds.intersectsBox(box)&&node.containsObject)
            {
                //if node is leaf, return with world objects(if there are any)
                if(node.children==null)
                    {
                        
                        //generates box if there is a scene variable
                        if(scene){
                            this.debugDraw(node.nodeBounds,"green",scene)
                            this.debugDraw(box,"red",scene)
                        }
                        return true
                    }

                //loop through children
                for(let i =0; i<8; i++)
                    {
                        //recursivly checks children that fit criteria:
                        // - child bounds must intersect with the box
                        // - node must contain an object
                        if(node.childBounds[i].intersectsBox(box)&&node.containsObject)
                            {
                                //recurisve call
                               const holder = this.isIntersecting(node.children[i],box,scene)
                               if(holder){value=true}
                            }
                    }
            }
        return value
            
    }



    debugDraw(box,color,scene)
    {
        const helper = new THREE.Box3Helper( box, color )
        scene.add(helper)
    }

    

}