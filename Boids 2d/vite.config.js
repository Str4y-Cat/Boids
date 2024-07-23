
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    base: '',
    root: 'src',
    publicDir: '../public',
    build: {
        outDir: '../dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, './src/index.html'),
                // second: resolve(__dirname, './src/contact.html'),
            },
        },
    },
})