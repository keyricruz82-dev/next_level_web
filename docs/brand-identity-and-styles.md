# Identidad Visual y Guía de Estilos - Next Level Producciones

## Documento de Referencia
**Proyecto:** Next Level Producciones  
**Creado:** Abril 2026  
**Última actualización:** Abril 2026  
**Ubicación de colores:** `resources/main_color_palette.txt`  
**Archivo de estilos:** `css/style.css`

---

## 1. Paleta de Colores Corporativa

### Colores Base
La identidad visual de Next Level Producciones se fundamenta en una paleta de colores profesional que representa innovación, naturalidad y creatividad.

| Nombre | Código Hex | RGB | Uso Primario |
|--------|-----------|-----|-------------|
| **Verde Oscuro (Primario)** | `#65812C` | RGB(101, 129, 44) | Acentos, títulos, elementos interactivos |
| **Verde Limón (Secundario)** | `#9FCC3D` | RGB(159, 204, 61) | Hover states, highlights, énfasis |
| **Gris Claro** | `#E9E9E9` | RGB(233, 233, 233) | Fondo Light Mode |
| **Gris Oscuro** | `#232323` | RGB(35, 35, 35) | Texto en Light Mode |
| **Negro Profundo** | `#101010` | RGB(16, 16, 16) | Fondo Dark Mode (por defecto) |

### Filosofía de Color
- **Verde Oscuro (#65812C)**: Representa la profesionalidad y la naturaleza. Usado para elementos primarios y llamadas a acción.
- **Verde Limón (#9FCC3D)**: Transmite energía y modernidad. Utilizado para estados interactivos y complementos visuales.
- **Escala de Grises**: Proporciona balance y contraste profesional entre los modos claro y oscuro.

---

## 2. Modo Oscuro (Por Defecto)

El sitio web está optimizado por defecto en modo oscuro, proporcionando una experiencia visual moderna y atractiva.

### Paleta Dark Mode

```css
--bg-primary: #101010         /* Fondo principal */
--bg-secondary: #1b1b1b       /* Fondo secundario (navbar, footer, cards) */
--text-primary: #ffffff       /* Texto principal */
--text-secondary: #cccccc     /* Texto secundario/descriptivo */
--border-color: #333333       /* Bordes y divisores */
--card-bg: #1b1b1b           /* Fondo de tarjetas */

/* Acentos */
--color-primary: #65812C      /* Verde oscuro */
--color-secondary: #9FCC3D    /* Verde limón */
```

### Características
- Fondo muy oscuro (#101010) para reducir fatiga visual
- Texto blanco para máxima legibilidad
- Verdes como acentos que destacan sin saturar
- Sombras sutiles para jerarquía visual

---

## 3. Modo Claro (Light Mode)

El modo claro está diseñado para usuarios que prefieren interfaces claras y luminosas, manteniendo la profesionalidad de la marca.

### Paleta Light Mode

```css
--bg-primary: #E9E9E9         /* Fondo principal */
--bg-secondary: #f5f5f5       /* Fondo secundario (navbar, footer) */
--text-primary: #232323       /* Texto principal */
--text-secondary: #555555     /* Texto secundario/descriptivo */
--border-color: #cccccc       /* Bordes y divisores */
--card-bg: #ffffff            /* Fondo de tarjetas */

/* Acentos (igual que dark mode) */
--color-primary: #65812C      /* Verde oscuro */
--color-secondary: #9FCC3D    /* Verde limón */
```

### Características
- Fondo claro (#E9E9E9) para facilidad de lectura diurna
- Texto oscuro (#232323) para máximo contraste
- Mismos acentos verdes para consistencia de marca
- Bordes sutiles para separación de elementos

---

## 4. Implementación Técnica

### Sistema de Variables CSS

El sitio utiliza **CSS Custom Properties (Variables CSS)** para implementar el tema dinámico. Esto permite cambios instantáneos entre modos sin recargar la página.

```css
:root {
  /* Variables globales - Dark Mode por defecto */
  --bg-primary: #101010;
  --text-primary: #ffffff;
  /* ... más variables ... */
}

.light-mode {
  /* Sobreescribe variables para Light Mode */
  --bg-primary: #E9E9E9;
  --text-primary: #232323;
  /* ... más variables ... */
}
```

### Transiciones Suaves

Las transiciones entre modos tienen duración de **0.3s** con función de timing `ease`:

```css
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### Alternancia de Temas

El botón de modo (🌙/☀️) en la navbar permite al usuario alternar entre temas. La preferencia se guarda en `localStorage` y persiste entre sesiones.

**Ubicación del script:** `js/script.js`

---

## 5. Componentes Principales y Sus Colores

### Navbar (Barra de Navegación)
- **Background:** `bg-secondary`
- **Logo (h1):** `color-primary` (#65812C)
- **Enlaces:** `text-primary`
- **Enlaces Hover:** `color-secondary` (#9FCC3D)
- **Botón Modo:** Borde `color-primary`, hover llena con `color-primary`

### Hero Video / Contenido Principal
- **Overlay:** `rgba(0, 0, 0, 0.5)`
- **Título:** `text-primary`
- **Sombra de texto:** Para mejor legibilidad

### Tarjetas de Servicios
- **Background:** `card-bg`
- **Título (h3):** `color-primary` (#65812C)
- **Descripción:** `text-secondary`
- **Border en Hover:** `color-primary`
- **Sombra Hover:** `rgba(101, 129, 44, 0.2)` - verde tinted

### Encabezados (h2)
- **Color:** `color-primary` (#65812C)
- **Texto transformado:** Mayúsculas
- **Espaciado de letras:** Aumentado para profesionalismo

### Contacto y Footer
- **Background:** `bg-secondary`
- **Texto:** `text-secondary`
- **Border Superior:** 2px `color-primary`

---

## 6. Estados Interactivos

### Hover States

#### Enlaces de Navegación
```
Color: --text-primary → --color-secondary
Transición: 0.3s ease
```

#### Tarjetas de Servicios
```
Transform: translateY(-8px)
Border: 2px solid --color-primary
Box-shadow: 0 8px 20px rgba(101, 129, 44, 0.2)
```

#### Botón de Modo
```
Background: --color-primary
Color: --bg-primary
Transición: all 0.3s ease
```

---

## 7. Guía de Uso

### Cuándo Usar Cada Color

| Color | Usar Para |
|-------|-----------|
| `#65812C` (Verde Oscuro) | Títulos h2, logos, botones primarios, bordes destacados |
| `#9FCC3D` (Verde Limón) | Estados hover, énfasis, acentos secundarios |
| `#E9E9E9` (Gris Claro) | Fondo en Light Mode, tarjetas |
| `#232323` (Gris Oscuro) | Texto en Light Mode |
| `#101010` (Negro Profundo) | Fondo en Dark Mode, elementos muy oscuros |

### Mejores Prácticas

1. **Usar Variables CSS:** Siempre utilizar `var(--color-name)` en lugar de códigos hex directos.
2. **Mantener Contraste:** Asegurar relación de contraste mínima de 4.5:1 para texto.
3. **Transiciones Consistentes:** Usar `transition: 0.3s ease` para cambios de estado.
4. **Respetar la Jerarquía:** Usar `color-primary` para elementos que necesitan atención.

---

## 8. Archivo de Configuración

### Ubicación del archivo CSS maestro
```
css/style.css
```

### Estructura del archivo
1. **Variables de Color** - Definiciones de :root y .light-mode
2. **Reset Global** - Estilos base para todos los elementos
3. **Navbar** - Estilos de navegación
4. **Hero Video** - Sección principal
5. **Secciones Generales** - Estilos para section, h2, h3, p
6. **Servicios** - Tarjetas y grid
7. **Galería** - Slider de imágenes
8. **Animaciones** - @keyframes y transiciones
9. **Contacto** - Sección de contacto
10. **Footer** - Pie de página

---

## 9. Cambios Futuros y Mantenimiento

### Si Necesitas Cambiar Colores
1. Edita `resources/main_color_palette.txt` con los nuevos códigos hex
2. Actualiza las variables en `css/style.css` (:root y .light-mode)
3. Prueba en ambos modos (Light y Dark)
4. Actualiza esta documentación

### Testing de Cambios
- Prueba en navegador Light Mode con DevTools (`F12` → Toggle device toolbar)
- Verifica contraste de colores con herramientas como WebAIM Contrast Checker
- Comprueba que las animaciones sean suaves (60 fps)

---

## 10. Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| Abril 2026 | Creación inicial de identidad visual con CSS variables | Copilot |
| Abril 2026 | Implementación de Dark Mode por defecto | Copilot |
| Abril 2026 | Implementación de Light Mode con localStorage | Copilot |

---

## Notas Finales

Esta paleta de colores fue diseñada específicamente para **Next Level Producciones**, un estudio fotográfico y de video profesional. Los colores verdes transmiten profesionalismo, creatividad y conexión con la naturaleza, mientras que el sistema de modo claro/oscuro asegura accesibilidad y comodidad para todos los usuarios.

Para preguntas sobre implementación o mejoras futuras, consulta este documento como referencia.

**Documento preparado para futuras referencias y mantenimiento de la identidad visual corporativa.**
