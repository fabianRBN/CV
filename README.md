# Fabián Toapanta · CV

Sitio final de arquitectura, desarrollo y DevOps. La entrada principal es `index.html`, en la raíz del repositorio.

## Archivos

```text
index.html                     Página principal
cv.html                        CV completo e imprimible
assets/                        Estilos, animaciones, imágenes, logos y fuentes
assets/CREDITOS.html            Fuentes visuales y licencias
.github/workflows/deploy-pages.yml
scripts/build_pages.py         Validación y empaquetado para GitHub Pages
```

## Vista local

Abre `index.html` con un navegador o, desde esta carpeta, ejecuta:

```powershell
python -m http.server 8768 --bind 127.0.0.1
```

Después abre `http://127.0.0.1:8768/`. Ctrl+C detiene el servidor.

## Validación y despliegue

```powershell
node --check assets/lifecycle.js
python scripts/build_pages.py --check
```

El workflow valida los pull requests hacia `master`. Un push a `master`, o una ejecución manual desde esa rama, valida, genera `_site/` y publica el sitio en GitHub Pages. El artefacto contiene únicamente `index.html`, `cv.html` y `assets/`; también admite `CNAME` si se añade un dominio personalizado.

Para activarlo, sube los archivos del sitio y del pipeline a GitHub e intégralos en `master`. En **Settings → Pages → Build and deployment → Source** selecciona **GitHub Actions**. Si el environment `github-pages` restringe ramas, permite `master`. No se necesita un PAT adicional: se utiliza el token temporal de GitHub y OIDC.

URL prevista: [fabianrbn.github.io/CV/](https://fabianrbn.github.io/CV/).

Para generar el paquete localmente usa `python scripts/build_pages.py`. El directorio de salida debe ser nuevo para evitar mezclar recursos de ejecuciones anteriores; `_site/` está ignorado por Git.
