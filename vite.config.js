import {resolve} from 'path'

export default {
    root: 'src/',
    publicDir: '../static/',
    base: './',
    server:
    {
        host: true, // Open to local network and display URL
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
    },
    build:
    {
        rollupOptions: {
            // input: {
            //   app: './Boids.js', // default
            // }
            external:["lil-gui","three",'three-mesh-bvh']
        },
        lib: {
            // entry: resolve(__dirname,'src/Boid.js'),
            entry: './Boids.js',
            name: 'three-boids',
            filename: 'three-boids'
         },
        minify:false,
        outDir: '../dist', // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
        sourcemap: true // Add sourcemap
    },
}