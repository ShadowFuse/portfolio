# Arseniy Kharitonov — Portfolio

Live: https://shadowfuse.github.io/portfolio/

React + Vite + Three.js. The compiled site is in the repository root; editable source is in `portfolio-source/`.

## Development

```sh
cd portfolio-source
npm ci
npm run dev
```

## Publish an update

```sh
cd portfolio-source
npm run build
cp -r dist/assets/. ../assets/
cp dist/index.html ../index.html
```

Commit the source and compiled files and push to `main`. GitHub Pages serves the repository root. Keep `.nojekyll` and `projects/`.

Pluvia and Form remain available at `projects/pluvia/` and `projects/form/`.
The sculpture uses `assets/sculpture/scene.gltf` with external buffers. A static fallback appears without WebGL2. Telegram: @ShadowFuse.
