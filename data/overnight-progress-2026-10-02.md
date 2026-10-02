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
