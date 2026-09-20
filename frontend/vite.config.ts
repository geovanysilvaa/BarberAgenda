import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Porta fixa: o backend monta o link de recuperação de senha com
    // FRONTEND_URL (padrão http://localhost:5173) — se o Vite cair pra
    // outra porta por conflito, o link do e-mail aponta pro lugar errado.
    port: 5174,
    strictPort: true,
  },
  // Pré-bundla dependências pesadas para acelerar dev e build
  optimizeDeps: {
    include: ['lucide-react', '@hookform/resolvers/zod'],
    esbuildOptions: { target: 'es2020' },
  },
  build: {
    // Browsers modernos (suportados há ~5 anos) — reduz polyfills e tamanho do bundle.
    target: 'es2020',
    cssMinify: true,
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Code splitting: bibliotecas pesadas vão para chunks separados
        // e são cacheadas individualmente pelo navegador.
        // Sintaxe de função usada porque Vite 8 (Rollup 4) tipa manualChunks
        // como ManualChunksFunction — objeto literal dá erro de TS.
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (/react|react-dom|react-router-dom/.test(id)) return 'react-vendor'
            if (/react-hook-form|@hookform|zod/.test(id)) return 'form-vendor'
            if (/supabase/.test(id)) return 'supabase-vendor'
            // Outras libs grandes ficam num chunk genérico de vendor.
            return 'vendor'
          }
          return undefined
        },
      },
    },
  },
})
