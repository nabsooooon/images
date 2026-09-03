# Visite Villa 3D

Reconstruction 3D approximative d'une villa à partir de deux photos (façade de nuit avec piscine, salon), entièrement générée en code avec Three.js : volumes, mobilier, textures procédurales (marbre, travertin, toile de Jouy, imprimé palmier) et éclairage. Aucun modèle ni texture téléchargé.

Deux sorties :

- `output/visite-villa.mp4` : vidéo verticale 1080x1920, 24 i/s, 22 s, plan caméra continu jardin → piscine → terrasse → salon → salle à manger → lounge.
- `artifact/template.html` : page interactive (lecture du plan caméra, mode libre, chapitres). Le bundle JS s'insère à la place du marqueur `/*__BUNDLE__*/`.

## Reproduire

```bash
npm install
npm run build            # dist/app.js
npm run serve            # sert render.html sur 127.0.0.1:8765 (laisser tourner)
npm run stills           # images clés PNG dans stills/
npm run frames           # 528 images JPEG dans frames/ (rendu logiciel, ~5 s par image sans GPU)
ffmpeg -framerate 24 -i frames/f%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart output/visite-villa.mp4
```

`render.mjs` pilote Chromium en headless via Playwright. Options : `--w --h --fps --dur --start --end --out --fmt --times=1,6.5 --view=px,py,pz,lx,ly,lz,fov`.

Sur une machine avec GPU, remplacer les drapeaux SwiftShader dans `render.mjs` par le rendu matériel pour aller beaucoup plus vite.

## Fichiers

- `src/scene.js` : architecture, jardin, piscine, intérieur, lumières.
- `src/textures.js` : textures dessinées en Canvas 2D avec graine fixe (rendu déterministe).
- `src/camera.js` : trajectoire caméra (spline de Hermite, 22 s) et cible du regard.
- `src/main.js` : rendu, post-traitement (bloom, vignette, grain), API `window.__villa` pour le rendu image par image et pour la page interactive.

## Ajuster

- Trajectoire : `src/camera.js`, listes `POS` et `LOOK` (secondes, x, y, z en mètres).
- Ambiance : `src/scene.js`, fonction `makeSky` et intensités des lumières.
- Textures : `src/textures.js`.
