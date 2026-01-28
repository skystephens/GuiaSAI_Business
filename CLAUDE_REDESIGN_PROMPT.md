# 🤖 PROMPT PARA CLAUDE - REDISEÑO GUIASAI BUSINESS

## 📋 **PROMPT PRINCIPAL**

```
Eres un experto UX/UI designer especializado en plataformas B2B de turismo. Necesito rediseñar completamente la interfaz de GuiaSAI Business, una plataforma para agencias de viajes que permite cotizar y reservar servicios turísticos en el Caribe.

CONTEXTO ACTUAL:
- Plataforma React/TypeScript existente
- 3 secciones principales: Alojamientos, Tours, Transportes
- Usuarios: Agencias de viajes profesionales
- Problema: Interfaz desactualizada, poca conversión, UX confusa

OBJETIVOS DEL REDISEÑO:
1. Modernizar la interfaz visual completamente
2. Mejorar la experiencia de cotización (proceso principal)
3. Crear un diseño más profesional y confiable
4. Optimizar para conversión y eficiencia
5. Implementar responsive design avanzado

IDENTIDAD DE MARCA:
- Nombre: GuiaSAI Business
- Sector: Turismo B2B - Caribe
- Color primario: #FF6600 (naranja vibrante)
- Color secundario: #2FA9B8 (turquesa caribe)
- Personalidad: Profesional, confiable, moderna, eficiente

REQUERIMIENTOS ESPECÍFICOS:
- Header con navegación sticky moderna
- Tarjetas de servicios rediseñadas con mejor jerarquía visual
- Sistema de filtros más intuitivo
- Proceso de cotización simplificado
- Dashboard de resumen mejorado
- Micro-animaciones y transiciones suaves
- Tema claro/oscuro opcional

COMPONENTES A REDISEÑAR:
1. NavigationBar
2. ServiceCard (hoteles, tours, transportes)
3. FilterPanel
4. QuotationSummary
5. ContactModal
6. ImageGallery
7. PriceCalculator

ENTREGABLES ESPERADOS:
- Wireframes detallados de cada sección
- Mockups de alta fidelidad
- Sistema de diseño completo
- Especificaciones técnicas para desarrollo
- Guía de implementación paso a paso

¿Puedes crear un diseño moderno, profesional y eficiente para esta plataforma B2B de turismo?
```

## 🎨 **PROMPTS ESPECÍFICOS POR COMPONENTE**

### **Header/Navegación**
```
Rediseña el header de GuiaSAI Business con estos elementos:
- Logo prominente a la izquierda
- Navegación horizontal: Alojamientos | Tours | Transportes
- Avatar de usuario con dropdown (perfil, configuración, logout)
- Indicador de cotización activa (badge con número de items)
- Búsqueda global opcional
- Sticky al hacer scroll
- Modo dark/light toggle

Estilo: Moderno, limpio, profesional. Fondo blanco con sombra sutil.
```

### **Tarjetas de Servicios**
```
Rediseña las tarjetas de servicios (hoteles/tours/transportes) con:
- Imagen destacada con overlay de gradiente
- Badge de tipo de servicio (Hotel, Tour, etc.)
- Título prominente del servicio
- Ubicación con ícono
- Rating con estrellas
- Precio destacado con moneda
- Lista de amenities/incluye (max 3 items)
- Botón CTA principal: "Agregar a Cotización"
- Hover effects y micro-animaciones
- Layout responsive (grid adaptativo)

Estilo: Cards elevation, bordes redondeados, tipografía jerárquica.
```

### **Sistema de Filtros**
```
Crea un panel de filtros moderno para servicios turísticos:
- Filtros por fecha (date picker elegante)
- Número de huéspedes (counter interactivo)
- Rango de precios (slider dual)
- Tipo de servicio (checkbox pills)
- Ubicación/zona (dropdown con búsqueda)
- Amenities (tags seleccionables)
- Botón "Aplicar Filtros" prominente
- "Limpiar filtros" secundario
- Resultado counter: "X servicios encontrados"

Estilo: Panel lateral sticky o top collapsible en móvil.
```

### **Resumen de Cotización**
```
Rediseña el widget de cotización flotante:
- Fixed bottom en móvil, sidebar en desktop
- Header: "Mi Cotización" con número de items
- Lista de servicios agregados (expandible)
- Cada item con: imagen mini, nombre, precio, eliminar
- Subtotal y total destacado
- Botones principales: "Ver Detalle" y "Enviar Cotización"
- Progress bar del proceso de cotización
- Animaciones de entrada/salida de items

Estilo: Fondo blanco, sombra elevation, bordes redondeados.
```

## 💡 **PROMPTS PARA HERRAMIENTAS EXTERNAS**

### **Para Figma/Adobe XD**
```
BRIEF FIGMA:
Crear mockups de GuiaSAI Business - plataforma B2B turismo
Páginas principales: Home (Alojamientos), Tours, Transportes, Cotización
Resoluciones: Desktop (1440px), Tablet (768px), Mobile (375px)
Colores: #FF6600, #2FA9B8, #F5F5F5, #333333
Tipografías: Poppins (títulos), Inter (cuerpo)
Estilo: Moderno, profesional, clean, con elementos del Caribe
```

### **Para Canva/Photoshop**
```
ELEMENTOS GRÁFICOS NECESARIOS:
- Logo GuiaSAI Business (versiones horizontal, vertical, símbolo)
- Iconografía: hoteles, tours, transporte, calendario, usuarios, precio
- Ilustraciones: paisajes caribeños, playas, hoteles
- Banners promocionales para servicios
- Loading states y empty states
- Testimonios y reviews layout
```

## 🖼️ **MOCKUPS DE REFERENCIA**

### **Desktop - Vista Principal**
```
LAYOUT SUGERIDO:
┌─────────────────────────────────────────────────────┐
│ Header: Logo | Nav | Search | User Avatar          │
├─────────────────────────────────────────────────────┤
│ Filters Panel (top) or Sidebar (left)              │
├─────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ Service │ │ Service │ │ Service │ │ Service │    │
│ │  Card   │ │  Card   │ │  Card   │ │  Card   │    │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ Service │ │ Service │ │ Service │ │ Service │    │
│ │  Card   │ │  Card   │ │  Card   │ │  Card   │    │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
├─────────────────────────────────────────────────────┤
│ Footer: Links | Contact | Copyright                │
└─────────────────────────────────────────────────────┘
      Fixed Bottom: Quotation Summary Widget
```

### **Mobile - Vista Principal**
```
MOBILE LAYOUT:
┌─────────────────┐
│ Header: Burger  │
│ Logo | User     │
├─────────────────┤
│ Search Bar      │
├─────────────────┤
│ Filter Chips    │
├─────────────────┤
│ ┌─────────────┐ │
│ │   Service   │ │
│ │    Card     │ │
│ │ Full Width  │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │   Service   │ │
│ │    Card     │ │
│ └─────────────┘ │
└─────────────────┘
Fixed Bottom: Quote
```

## 🚀 **FLUJO DE IMPLEMENTACIÓN**

1. **Fase 1**: Sistema de diseño y tokens
2. **Fase 2**: Componentes base (Header, Card, Buttons)
3. **Fase 3**: Layouts principales (Grid, Filters)
4. **Fase 4**: Funcionalidades avanzadas (Cotización, Modals)
5. **Fase 5**: Responsive y optimizaciones
6. **Fase 6**: Animaciones y polish final