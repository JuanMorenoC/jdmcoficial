# ✅ Guía para Publicar y Actualizar tu Portafolio Angular en GitHub Pages

Cada vez que hagas cambios en tu proyecto (por ejemplo: componentes, estilos, texto, etc.), sigue estos pasos para actualizarlos en línea:

---

## 1. Guarda y sube tus cambios a la rama `master`

```bash
git add .
git commit -m "Actualización del portafolio"
git push origin master

---
##  2. Compila el proyecto con el base-href correcto:
```bash
Copiar
Editar
ng build --configuration production --base-href "https://TU_USUARIO.github.io/jdmcoficial/"

---

## 3. Publica en GitHub Pages:
```bash
Copiar
Editar
npx angular-cli-ghpages --dir=dist/jdmcoficial
Esto subirá el contenido compilado al branch gh-pages, que es el que GitHub usa para mostrar tu página.

---

## 📌 ¿Puedo trabajar en otra rama y luego pasar a master?
```Sí, también puedes:

Crear ramas como dev, actualizacion-home, etc.

Hacer tus cambios allí.

Cuando estén listos, hacer merge a master, y luego ejecutar los comandos de build y publicación desde master.

---

## ✅ Consejo adicional
```GitHub Pages no publica directamente desde master, sino desde la rama gh-pages, la cual se genera automáticamente por el comando angular-cli-ghpages. Así que puedes seguir trabajando en master tranquilamente y publicar cuando esté listo.