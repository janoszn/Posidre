import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import fs from 'fs'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js'
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        https: {
            key: fs.readFileSync('./localhost+2-key.pem'),
            cert: fs.readFileSync('./localhost+2.pem'),
        },
        proxy: {
            '/api': {
                target: 'https://localhost:7053',
                secure: false,
                changeOrigin: true,
            }
        },
        port: 5173,
        strictPort: true,
    }
})