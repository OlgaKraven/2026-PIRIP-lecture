import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({base:process.env.BASE_PATH || '/2026-PIRIP-lecture/',plugins:[react()],server:{host:'127.0.0.1'},build:{sourcemap:false}})
