import * as THREE from 'three'


export default  class OctreeNode
{
    /**
     * 
     * @param {*} box 
     * @param {*} minNodeSize minimum possible size per node
     * @param {*} depth depth of current node
     */
    constructor(box, minNodeSize,depth)
    {
        // this.scene=scene
        this.depth=depth||1
        // console.log(this.scene)

        this.nodeBounds= box
        this.minSize = minNodeSize
        //NOTE:add a list of objects within the children
        this.worldObjects=[]
        this.containsObject=false

        this.nodeSize =  new THREE.Vector3()
        this.nodeBounds.getSize(this.nodeSize)


        this.childBounds=[]
        this.setUpChildNodes()

        this.children=null//node array
        
        
        // new THREE.Vector3()

    }

    /**
     * sets the child bounding boxes up.
     * finds the center of the space in each division, uses that and the size to create a new box
     */
    setUpChildNodes()
    {
        

        const quarter = this.nodeSize.y/4
        // console.log(this.nodeSize.y)
        const childLength= this.nodeSize.y/ 2
        const childSize=new THREE.Vector3(childLength,childLength,childLength)

        const center= new THREE.Vector3()
        this.nodeBounds.getCenter(center)

        this.childBounds[0]=new THREE.Box3().setFromCenterAndSize(
            center
            .clone()
            .add( new THREE.Vector3(-quarter,quarter,-quarter))
            ,childSize
        )

        this.childBounds[1]=new THREE.Box3().setFromCenterAndSize(
            center
            .clone()
            .add( new THREE.Vector3(quarter,quarter,-quarter))
            ,childSize
        )

        this.childBounds[2]=new THREE.Box3().setFromCenterAndSize(
            center
            .clone()
            .add( new THREE.Vector3(-quarter,quarter,quarter))
            ,childSize
        )

        this.childBounds[3]=new THREE.Box3().setFromCenterAndSize(
            center
            .clone()
            .add( new THREE.Vector3(quarter,quarter,quarter))
            ,childSize
        )

        this.childBounds[4]=new THREE.Box3().setFromCenterAndSize(
            center
            .clone()
            .add( new THREE.Vector3(-quarter,-quarter,-quarter))
            ,childSize
        )

        this.childBounds[5]=new THREE.Box3().setFromCenterAndSize(
            center
            .clone()
            .add( new THREE.Vector3(quarter,-quarter,-quarter))
            ,childSize
        )

        this.childBounds[6]=new THREE.Box3().setFromCenterAndSize(
            center
            .clone()
            .add( new THREE.Vector3(-quarter,-quarter,quarter))
            ,childSize
        )

        this.childBounds[7]=new THREE.Box3().setFromCenterAndSize(
            center
            .clone()
            .add( new THREE.Vector3(quarter,-quarter,quarter))
            ,childSize
        ) 
    }

    /**
     * entry point to recursive tree build
     * 
     * @param {*} worldObj 
     */
    addObject(worldObj)
    {
        this.divideAndAdd(worldObj)

    }

    /**
     * Recursively builds the tree object
     * 
     * @param {*} worldObj 
     * @returns 
     */
    divideAndAdd(worldObj)
    {
        //NOTE: return if current count of worldObjects has reached 0
        //return if the node size has reached the limit
        
        if(this.nodeSize.y<=this.minSize)
            {
                // this.containsObject=true
                this.worldObjects.push(worldObj)
                this.containsObject=true
                // console.log(this.worldObjects)
                // console.log(this)
                return;
            }

        //if there are no children, set them up
        if(this.children==null)
            {
                this.children=[]
            }

        //instanciate dividing flag
        let dividing=false

        //recursively create children
        for(let i=0;i<8;i++)
            {
                //if children at index is null, instanciate a new octree
                if(this.children[i] == null)
                    {
                        
                        this.children[i]= new OctreeNode(this.childBounds[i],this.minSize,this.depth+1)

                    }
                //if there is an object within this box, recursive divide box
                //set dividing flag to true
                if(this.children[i].nodeBounds.intersectsBox(new THREE.Box3().setFromObject(worldObj)))
                    {

                        dividing=true

                        this.children[i].divideAndAdd(worldObj)
                        if(this.children[i].containsObject){this.containsObject=true}
                    }
            }

        // if there wasnt any world objects found within the box, dividing stays false, children are null
        if(dividing==false)
        {
            this.containsObject=false
            this.children=null
            
        }
    }



}