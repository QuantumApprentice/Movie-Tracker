import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr"
// import jsfeat from "jsfeat"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  base: "/Movie-Tracker/",
})