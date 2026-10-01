# Collectors Sports

Aplicación web móvil para inventariar tarjetas deportivas que realmente vale la pena registrar: One Touch, Top Loader, slabs y piezas relevantes.

## Deportes iniciales

- Soccer
- MLB
- NFL
- NBA
- UFC
- F1

## V0.4

- Colección vacía por defecto, sin jugadores demo.
- Búsqueda real por jugador, equipo, set, paralelo, serial y notas.
- Filtros por deporte y orden por valor/jugador/fecha.
- Alta, edición, detalle y eliminación de cartas.
- RC, Auto, Relic, Insert, SP y SSP.
- Precio de compra, valor estimado, moneda, estado y protección física.
- Dashboard de valor y conteos.
- Exportación/importación de respaldo JSON.
- PWA instalable y soporte offline básico.
- Catálogo de colecciones por deporte, fabricante y temporada.
- Alta asistida desde catálogo para autocompletar colección, jugador, equipo, número y RC cuando existe checklist cargado.
- Importador automatizado de checklists oficiales de fabricantes.
- Despliegue automático con GitHub Pages.

## Checklists base ya cargados

Actualmente hay 900 cartas base precargadas en cuatro colecciones completas:

- Topps Chrome UEFA Club Competitions 2025/26 — 200 cartas.
- Topps Chrome Formula 1 2026 — 200 cartas.
- Topps Chrome Baseball 2026 — 300 cartas.
- Topps Chrome UFC 2026 — 200 cartas.

Los tres últimos se generan mediante un importador automático desde archivos oficiales del fabricante. El catálogo contiene además otras colecciones de Soccer, NBA, NFL, MLB, UFC y F1 a nivel colección mientras se incorporan sus checklists completos.

## Estado de datos

En esta fase el inventario personal se guarda localmente en el navegador del dispositivo. El código y los catálogos son públicos en GitHub, pero las cartas que el usuario registra en la app no se suben al repositorio. Antes de convertirla en el inventario definitivo se añadirá una base de datos sincronizada y soporte de fotografías.
