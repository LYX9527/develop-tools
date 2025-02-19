import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {NaiveUiResolver} from 'unplugin-vue-components/resolvers'
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [NaiveUiResolver()],
            imports: ["vue", "vue-router"],
            dts: 'types/auto-imports.d.ts'
        }),
        Components({
            resolvers: [NaiveUiResolver()],
            dts: 'types/components.d.ts',
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        hmr: {
            overlay: false
        }
    }
})
