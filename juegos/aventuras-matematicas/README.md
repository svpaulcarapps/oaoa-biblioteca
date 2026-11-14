# Aventuras matemáticas en San Vicente de Paúl

Código editable del juego OAOA. Despliegue principal: Google Apps Script, proyecto JUEGOS OAOA.

- Editor: https://script.google.com/home/projects/1XLoh44c36shb6WWI6-nKddJHzi3hJY2NQthXZRe32DZmRKJ4TwSDbj0q/edit
- Recursos y copia completa del código: https://drive.google.com/file/d/1bvouRc2tVV-UYtSEDf5RvLn2T6mb8MRC/view
- Carpeta de trabajo: https://drive.google.com/drive/folders/1XxUYeD_yGsCcc-OA2Ph5n1Cx-5_JQFPY

Los datos del alumnado se guardan en una hoja privada independiente. No subir copias, hashes de contraseña, sesiones, archivos StudentData ni variables secretas a este repositorio.

Para reconstruir, extraer la copia completa con los recursos, instalar las dependencias y ejecutar `node apps-script/build.mjs`. Subir Code.gs, Index.html, SpritesSport.html y SpritesFormal.html al proyecto existente, manteniendo StudentData.gs y las propiedades privadas. Actualizar la implementación existente con una versión nueva para conservar el enlace.

Ranking global por defecto con filtros de prueba, nivel, curso y clase. Cuentas sin correo, avatar dentro de Mi cuenta y recuperación dentro de Profesor. No reclamar puntos históricos automáticamente por coincidencia de nombre: la asociación la realiza el profesor.

La migración se verifica antes de bloquear el juego anterior. Los siguientes minijuegos pendientes están documentados en ROADMAP.md.
