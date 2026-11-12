// GitHub Pages has no SPA rewrite. Serving index.html as 404.html lets
// deep links such as /projects/auron and /services load the app.
import { copyFileSync } from 'node:fs'
copyFileSync('dist/index.html', 'dist/404.html')
console.log('dist/404.html written')
