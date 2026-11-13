// GitHub Pages has no SPA rewrite. Write a copy of index.html at every
// route so deep links return 200 (link previews and crawlers need that),
// plus 404.html as a catch-all.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'

const slugs = [...readFileSync('src/data/projects.ts', 'utf8').matchAll(/slug: '([^']+)'/g)].map((m) => m[1])
const routes = ['work', 'world', 'services', ...slugs.map((s) => `projects/${s}`)]
for (const r of routes) {
  mkdirSync(`dist/${r}`, { recursive: true })
  copyFileSync('dist/index.html', `dist/${r}/index.html`)
}
copyFileSync('dist/index.html', 'dist/404.html')
console.log(`wrote ${routes.length} route pages and 404.html`)
