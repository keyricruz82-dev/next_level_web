# Guía Rápida: Modos Claro y Oscuro

## Descripción General
Next Level Producciones utiliza un sistema de temas basado en **CSS Variables** que permite cambiar entre modo oscuro (por defecto) y modo claro de manera instantánea.

## Modo Oscuro (Predeterminado)
- **Fondo:** Negro profundo (#101010)
- **Texto:** Blanco (#ffffff)
- **Acentos:** Verde oscuro (#65812C) y verde limón (#9FCC3D)
- **Ideal para:** Uso nocturno, reducción de fatiga visual

## Modo Claro (Light Mode)
- **Fondo:** Gris claro (#E9E9E9)
- **Texto:** Gris oscuro (#232323)
- **Acentos:** Mismos verdes que en dark mode
- **Ideal para:** Uso diurno, máxima legibilidad

## Cómo Cambiar Entre Modos
1. Haz clic en el botón **🌙/☀️** ubicado en la barra de navegación (navbar)
2. La página alternará entre modos instantáneamente
3. Tu preferencia se guardará automáticamente en el navegador
4. La próxima vez que visites el sitio, se cargará en el modo que elegiste

## Archivos Relevantes
- **CSS:** `css/style.css` - Contenedor de variables y estilos
- **JavaScript:** `js/script.js` - Lógica de alternancia de temas
- **Documentación Completa:** `docs/brand-identity-and-styles.md`

## Paleta de Colores
Consulta `resources/main_color_palette.txt` para ver todos los códigos hexadecimales de la paleta corporativa.

## Notas
- La sesión del tema se persiste usando `localStorage`
- Las transiciones entre modos son suaves (0.3s)
- Ambos modos mantienen la identidad visual de la marca
