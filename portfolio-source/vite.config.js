import {defineConfig} from 'vite';
export default defineConfig({base:'/portfolio/',build:{chunkSizeWarningLimit:1100,rollupOptions:{output:{manualChunks:{three:['three','@react-three/fiber','@react-three/drei']}}}}});
