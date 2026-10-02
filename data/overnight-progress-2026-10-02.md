# Collectors Sports — avance nocturno

## Versión 10i (1 de octubre, hora de Cancún)

Partida: main `670237d9f1ac86e064d86e0668afab989759c98b`, versión 10h.

- Chrome Basketball 2025/26: 1,300 entradas, 299 base según PDF oficial.
- Resurgence Football 2025: 749 entradas, 200 base.
- Chrome WWE 2026: 1,110 entradas, 201 base; 1,137 filas de participantes agrupadas donde corresponde.
- 15 frentes promocionales de WWE, identificados como referencia; 0 reversos y 0 escaneos exactos nuevos.
- WWE incorporado a filtros y formulario. Búsqueda filtra el deporte antes de limitar resultados para no ocultar coincidencias.
- Corregidos 25 códigos Austin 3:16, nombres unidos a afiliaciones y cartas Family Tree con varios participantes.
- Inventario personal intacto. Prueba reproducible en `tests/batch6.cjs` (requiere jsdom).

Auditoría, fuentes oficiales, hashes y recuentos: `data/catalog-batch6-audit.json`.

## Siguiente trabajo prioritario

1. Agregar frentes verificados de NBA Chrome 2025/26 y NFL Resurgence 2025. Páginas de promociones:
   - https://www.checklistcenter.com/2025-26-topps-chrome-basketball-card-checklist/
   - https://www.checklistcenter.com/2025-topps-resurgence-football-card-checklist/
2. Buscar reversos verificables de estas tres colecciones y de tenis 2026. No atribuir reversos genéricos.
3. WWE: promoción Base Autograph Rhea Ripley descartada porque no figura en PDF final; CM Punk y Trish Stratus aniversario requieren confirmar código (dos entradas cada uno).
4. Verificar paralelos con odds oficiales antes de expandir filas: los PDFs de esta tanda no enumeran todos los paralelos.
5. Continuar productos vacíos: Chrome NFL 2025, Chrome F1 2025/Sapphire, Chrome Update NBA 2025/26 y productos pendientes de fútbol. Verificar año del producto con la fuente oficial antes de cargar.

Siempre leer main y auditorías antes de editar. No iniciar cambios después de las 07:00 de Cancún del 2 de octubre de 2026.

## Versión 10j (1 de octubre, hora de Cancún)

- 31 frentes promocionales añadidos y revisados: 16 de Chrome Basketball 2025/26 y 15 de Resurgence Football 2025.
- Cada imagen está vinculada a la identidad completa de la entrada (colección, código, subset y jugador), incluidas las cartas con códigos numéricos repetidos entre base y autógrafo.
- Los acabados sólo se nombran cuando aparecen en el título de la fuente o la serialización es visible; el resto se conserva como promoción sin inventar paralelo.
- Las imágenes se cargan bajo demanda para no aumentar el peso de instalación del service worker.
- Auditoría: `data/catalog-batch7-image-audit.json`.

Pendiente: reversos de NBA/NFL/WWE/tenis, más imágenes exactas verificables y la siguiente colección oficial vacía.

## Versión 10k (2 de octubre, hora de Cancún)

- Topps Chrome Football 2025 completado con 2,375 identidades de carta derivadas de 2,388 filas codificadas del PDF oficial: 400 base/rookies, inserts, variaciones, autógrafos, reliquias y auto-relics.
- Las 13 Dual Autographs conservan a sus dos participantes dentro de una sola carta; la identidad extendida evita colisiones entre códigos compartidos.
- Se agregaron 20 frentes promocionales revisados y vinculados por colección, código, subset y jugador. Son referencias, no escaneos exactos; 0 reversos nuevos.
- Se omitieron deliberadamente 32 Fanatics Authentics Redemptions sin código, además de Hidden Gems TBA, para no inventar identidades.
- Rookies Team Camo (96) y Tecmo (23) mantienen los huecos reales del checklist oficial.
- Los 20 frentes se cargan bajo demanda y no engordan la instalación inicial del service worker.
- Inventario personal intacto. Prueba reproducible en `tests/batch8.cjs`.

Auditoría, fuente oficial, hash, recuentos y omisiones: `data/catalog-batch8-audit.json`.

Pendiente: encontrar reversos exactos verificables, sustituir promociones por escaneos exactos cuando exista fuente legítima y continuar otra colección oficial incompleta.

## Versión 10l (2 de octubre, hora de Cancún)

- Topps Chrome UFC 2026 pasó de 200 bases a 880 identidades de carta completas derivadas de 905 filas oficiales: bases, inserts, case hits, autógrafos y UFC Debut Patch Autographs.
- Las 25 Split Decision conservan a ambos peleadores dentro de una sola identidad de carta.
- Se añadieron 10 frentes promocionales oficiales de Topps, revisados visualmente y vinculados por colección, código, subset y peleador. Son referencias, no escaneos exactos; 0 reversos nuevos.
- El PDF oficial de odds se auditó pero sus familias de paralelos no se duplicaron como entradas independientes, porque Topps advierte que no todos los sujetos aparecen en cada paralelo.
- Inventario personal intacto. Prueba reproducible en `tests/batch9.cjs`.

Auditoría, hashes, recuentos y fuentes: `data/catalog-batch9-audit.json`.

Pendiente: reversos verificables, más imágenes exactas y completar otra colección deportiva desde una fuente oficial.
