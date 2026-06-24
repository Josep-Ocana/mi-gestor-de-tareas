# Guía de estilo visual — Mi Gestor de Tareas

## Principios generales

- Estética editorial minimalista. Sin gradientes, sin sombras pesadas, sin glassmorphism.
- Modo oscuro nativo mediante variables CSS (`--color-*`).

## Colores

Usar siempre las variables CSS del proyecto como clases Tailwind:

- Fondo principal: `bg-main-bg`
- Fondo de cards: `bg-card-bg`
- Texto principal: `text-main-text`
- Bordes: `border-border/40` o `border-border/50`
- Botón primario: `bg-[#111111]` hover `bg-[#333333]`

## Tipografía

- Headings principales (h1, h2): `font-serif` con `tracking-tight` o `tracking-[-0.02em]`
  - Font: Instrument Serif (cargada via Google Fonts)
- Labels de sección: `text-[10px] font-medium uppercase tracking-[0.08em] text-main-text/40`
- Texto secundario: `text-main-text/40` o `text-main-text/45`
- Tamaño base UI: `text-sm`

## Contenedores y cards

- Border radius: `rounded-xl` (nunca `rounded-3xl` ni `rounded-full` en contenedores)
- Borde: `border border-border/40`
- Fondo: `bg-card-bg` (nunca `bg-card-bg/60` ni `backdrop-blur`)
- Sin sombras o ultra-difusas máximo `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`

## Inputs y selects

- Clase base: `rounded-md border border-border/50 bg-main-bg px-3 py-2.5 text-sm text-main-text outline-none transition-colors duration-200 placeholder:text-main-text/30 focus:border-main-text/40 focus:ring-0`
- SIEMPRE `bg-main-bg`, nunca `bg-transparent` (rompe modo oscuro en selects nativos)

## Botones

- Primario: `rounded-md bg-[#111111] py-3 text-sm font-medium text-white hover:bg-[#333333] active:scale-[0.98] disabled:opacity-40`
- Secundario/ghost: `rounded-md border border-border/50 text-main-text/60 hover:border-main-text/30 hover:text-main-text active:scale-[0.98]`
- NUNCA `rounded-2xl` ni `rounded-full` en botones

## Tags / badges

- `rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]`
- Fondo con opacidad baja del color: `backgroundColor: \`${color}18\``

## Empty states

- Sin caja dashed. Solo icono pequeño con borde fino + texto centrado.
- Icono: `size-10 rounded-md border border-border/50 text-main-text/25`
- Título: font-serif, `text-lg tracking-tight`

## Animaciones

- Entrada de listas: `animate-in fade-in slide-in-from-bottom-2 duration-300` con `animationDelay` escalonado (`index * 60ms`)
- Hover en botones: solo `scale(0.98)` en active, sin lift ni sombra
