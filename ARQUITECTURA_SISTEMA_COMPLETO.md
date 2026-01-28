# 🏗️ ARQUITECTURA COMPLETA - GuíaSAI + GuanaGo + Super Admin

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Estado:** Diseño Técnico

---

## 📊 VISTA GENERAL DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NIVEL DE USUARIOS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  👥 AGENCIAS DE VIAJE          👤 TURISTAS FINALES   🔧 TÚ (Admin) │
│  (Portal B2B GuíaSAI)          (Portal B2C GuanaGo)  (Super Admin)  │
│  /agencias/                    /                     /admin/super/  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                             ↓↓↓
┌─────────────────────────────────────────────────────────────────────┐
│                    NIVEL DE APLICACIONES                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🎫 Cotizador B2B       🛒 E-commerce B2C      📈 Dashboard Admin  │
│  • Tours                • Reservas directas    • Reportes unified  │
│  • Alojamientos         • Pagos online         • Analytics         │
│  • Traslados            • Tickets digitales    • Control operaciones│
│  • Paquetes             • Calificaciones       • Gestión usuarios  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                             ↓↓↓
┌─────────────────────────────────────────────────────────────────────┐
│                     NIVEL DE DATOS                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │             AIRTABLE (Base de Datos Centralizada)        │      │
│  │                                                          │      │
│  │  📋 ServiciosTuristicos_SAI  → Tours, Alojamientos      │      │
│  │  👥 Clientes                 → Agencias + Turistas      │      │
│  │  📦 Reservas                 → Cotizaciones + Bookings  │      │
│  │  💰 Pagos                    → Transacciones            │      │
│  │  📊 Analytics                → Métricas de negocio      │      │
│  │  ⚙️ Config                   → Parámetros del sistema   │      │
│  │                                                          │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                             ↓↓↓
┌─────────────────────────────────────────────────────────────────────┐
│                  NIVEL DE INTELIGENCIA                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🤖 JARVIS AI Assistant (Make.com + Gemini/ChatGPT)                │
│  • Responde disponibilidad en tiempo real                          │
│  • Sugiere paquetes personalizados                                 │
│  • Seguimiento automático de cotizaciones                          │
│  • Soporte vía WhatsApp/Email/Chat                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE SEGUIMIENTO Y CONTROL

### **1️⃣ CICLO DE VIDA DE UNA COTIZACIÓN (B2B)**

```
AGENCIA CREA COTIZACIÓN
    ↓
    ├─ Selecciona: Alojamientos + Tours + Traslados
    ├─ Aplica filtros: Fechas, Pax, Presupuesto
    ├─ Ve precios en TIEMPO REAL desde Airtable
    ↓
COTIZACIÓN GUARDADA EN AIRTABLE
    ├─ Estado: 🟡 BORRADOR
    ├─ Timestamp: Fecha/hora creación
    ├─ ID: Identificador único
    ↓
AGENCIA COMPARTE CON CLIENTE
    ├─ Genera enlace: https://guiasanandresislas.com/cotizacion/ID
    ├─ Puede enviar por: Email / WhatsApp / PDF
    ├─ Cliente ve: Vista previa en tiempo real
    ↓
CLIENTE CONFIRMA O RECHAZA
    ├─ Confirma → Estado: 🟢 CONFIRMADA
    ├─ Rechaza  → Estado: 🔴 CANCELADA
    ↓
PAGO REGISTRADO
    ├─ Airtable actualiza: Campo "Pagado" + "Fecha Pago"
    ├─ Genera Voucher automático
    ↓
RESERVA ACTIVA
    ├─ Estado: 🟢 ACTIVA
    ├─ Genera QR para check-in
    ├─ Envía recordatorios automáticos
```

### **2️⃣ CICLO DE VIDA DE UNA RESERVA (B2C)**

```
TURISTA ACCEDE A GUANAGO.COM
    ↓
    ├─ Navega catálogo de tours/alojamientos
    ├─ Filtra por: Fechas, Presupuesto, Tipo
    ├─ Ve disponibilidad EN TIEMPO REAL
    ↓
TURISTA SELECCIONA SERVICIOS
    ├─ Elige: Tour + Alojamiento + Traslado
    ├─ Calcula precio total automáticamente
    ├─ Ve: Puntuación, Reseñas, Fotos
    ↓
VA AL CARRITO → PAGO
    ├─ Método: Stripe / PayPal / Transferencia
    ├─ Genera: Recibo electrónico
    ↓
PAGO CONFIRMADO
    ├─ Se registra en Airtable automáticamente
    ├─ Envía email de confirmación
    ├─ Crea Voucher digital (PDF + QR)
    ↓
ACCESO A ÁREA PERSONAL
    ├─ Turista puede: Ver itinerario, descargar vouchers
    ├─ Sistema envía: Recordatorios 7 días antes
    ├─ Recordatorios: 24 horas antes
```

### **3️⃣ TU CONTROL COMO DUEÑO (Super Admin)**

```
DASHBOARD SUPER ADMIN (/admin/super/)
    ↓
    ├─📊 RESUMEN EJECUTIVO
    │  ├─ Ingresos B2B vs B2C (últimos 30 días)
    │  ├─ Nuevas agencias registradas
    │  ├─ Tasa de conversión de cotizaciones
    │  ├─ Ingresos por operador (aliados)
    │
    ├─👥 GESTIÓN DE AGENCIAS
    │  ├─ Lista de agencias activas
    │  ├─ Comisiones generadas por cada una
    │  ├─ Actividad: Cotizaciones creadas, bookings
    │  ├─ Habilitar/Deshabilitar acceso
    │  ├─ Ver: Datos de contacto, ubicación
    │
    ├─💰 GESTIÓN FINANCIERA
    │  ├─ Ingresos totales
    │  ├─ Desglose por:
    │  │  ├─ Servicio (tours vs alojamientos vs traslados)
    │  │  ├─ Canal (B2B vs B2C)
    │  │  ├─ Operador (aliado)
    │  ├─ Comisiones a pagar a operadores
    │  ├─ Reportes para contabilidad
    │
    ├─📦 GESTIÓN DE RESERVAS
    │  ├─ Todas las reservas (B2B + B2C) en una vista
    │  ├─ Filtrar por: Estado, Fecha, Operador, Agencia
    │  ├─ Ver detalles completos
    │  ├─ Modificar (si es necesario)
    │  ├─ Cancelar con reembolso
    │
    ├─⚙️ OPERACIONES
    │  ├─ Gestionar operadores/aliados
    │  ├─ Crear/editar servicios (tours, alojamientos)
    │  ├─ Definir comisiones y márgenes
    │  ├─ Horarios de operación
    │  ├─ Precios por temporada
    │
    ├─🤖 JARVIS AI
    │  ├─ Ver logs de interacciones
    │  ├─ Ajustar prompts
    │  ├─ Ver conversaciones por agencia/cliente
    │  ├─ Desempeño del asistente
    │
    ├─📈 ANALYTICS AVANZADO
    │  ├─ Gráficos de tendencias
    │  ├─ Tours más vendidos
    │  ├─ Alojamientos más reservados
    │  ├─ Clientes recurrentes
    │  ├─ Valor medio por reserva
    │  ├─ Tasa de retención de agencias
    │
    └─📋 REPORTES
       ├─ Reporte mensual de ingresos
       ├─ Reporte de comisiones a operadores
       ├─ Reporte de agencias más activas
       ├─ Exportar: PDF, Excel, CSV
```

---

## 📱 FLUJOS DE DATOS EN TIEMPO REAL

### **Airtable como Base de Datos Central**

```
┌─────────────────────────────────────────────────────┐
│              TABLA: ServiciosTuristicos_SAI         │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Campos principales:                                │
│ • Servicio (Nombre del tour/alojamiento)           │
│ • Tipo de Servicio (Tour / Alojamiento / Traslado) │
│ • Precio actualizado (Tarifa actual)               │
│ • Precio Costo (Tu costo base)                     │
│ • Capacidad (Máx personas)                         │
│ • Descripción                                       │
│ • Horarios de Operación                            │
│ • Imagenurl (Fotos)                                │
│ • Operador (Quién lo maneja)                       │
│ • Publicado (Visible o no)                         │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              TABLA: Cotizaciones_B2B                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ • ID_Cotizacion (Único)                            │
│ • Agencia (Link a tabla Clientes)                  │
│ • Fecha_Creacion                                    │
│ • Estado (Borrador/Confirmada/Cancelada)           │
│ • Items (Tours + Alojamientos + Traslados)         │
│ • Precio_Total                                      │
│ • Margen_Agencia (%)                               │
│ • Fecha_Viaje                                       │
│ • Numero_Pax                                        │
│ • Cliente_Final (Nombre del turista)               │
│ • Email_Cliente                                     │
│ • Whatsapp_Cliente                                  │
│ • Enlace_Compartido                                │
│ • Pagado (Si/No)                                    │
│ • Fecha_Pago                                        │
│ • Metodo_Pago                                       │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              TABLA: Reservas_B2C                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ • ID_Reserva (Único)                               │
│ • Turista_Email                                     │
│ • Turista_Nombre                                    │
│ • Turista_Telefono                                  │
│ • Items_Reservados (Tours/Alojamientos/Traslados)  │
│ • Precio_Total                                      │
│ • Fecha_Reserva                                     │
│ • Fecha_Viaje                                       │
│ • Estado (Activa/Completada/Cancelada)             │
│ • Pagado (Si/No)                                    │
│ • Voucher_URL                                       │
│ • QR_Code                                           │
│ • Feedback (Calificación, reseña)                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 NIVELES DE ACCESO

```
┌─────────────────────────────────────────┐
│         USUARIO: AGENCIA DE VIAJE       │
├─────────────────────────────────────────┤
│ ✅ Puede:                                │
│ • Ver catálogo de servicios             │
│ • Crear cotizaciones                    │
│ • Ver sus propias cotizaciones          │
│ • Compartir con clientes                │
│ • Ver estado de pagos                   │
│ • Descargar comprobantes                │
│ • Acceso a Jarvis (soporte IA)          │
│                                         │
│ ❌ NO puede:                             │
│ • Ver datos de otras agencias           │
│ • Modificar precios                     │
│ • Ver datos financieros globales        │
│ • Gestionar operadores                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         USUARIO: TURISTA FINAL (B2C)    │
├─────────────────────────────────────────┤
│ ✅ Puede:                                │
│ • Ver catálogo completo                 │
│ • Hacer reserva directa                 │
│ • Pagar online                          │
│ • Ver vouchers digitales                │
│ • Acceso a área personal                │
│ • Calificar experiencias                │
│                                         │
│ ❌ NO puede:                             │
│ • Ver datos de agencias                 │
│ • Modificar reservas (solo cancelar)    │
│ • Acceder a datos financieros           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    USUARIO: TÚ (SUPER ADMIN)            │
├─────────────────────────────────────────┤
│ ✅ Puede:                                │
│ • VER TODO                              │
│ • EDITAR TODO                           │
│ • CONTROLAR TODO                        │
│ • Ver analytics avanzado                │
│ • Gestionar operadores                  │
│ • Ver comisiones                        │
│ • Exportar reportes                     │
└─────────────────────────────────────────┘
```

---

## 💡 VENTAJAS DEL SISTEMA

### **Para TI (Dueño)**
- ✅ Vista única de toda la operación
- ✅ Ingresos de dos fuentes (B2B + B2C)
- ✅ Control total de precios y márgenes
- ✅ Analytics en tiempo real
- ✅ Automatización con IA (Jarvis)
- ✅ Escalabilidad sin límites

### **Para las Agencias**
- ✅ Herramienta fácil para cotizar
- ✅ Acceso a 26+ servicios variados
- ✅ Precios actualizados automáticamente
- ✅ Compartir cotizaciones con clientes
- ✅ Soporte IA automático (Jarvis)
- ✅ Sin complicaciones técnicas

### **Para los Turistas**
- ✅ Compra directa sin intermediarios
- ✅ Precios transparentes
- ✅ Tickets digitales inmediatos
- ✅ Experiencia mobile-friendly
- ✅ Soporte en tiempo real

---

## 🚀 PRÓXIMOS PASOS

1. **Crear tablas faltantes en Airtable**
2. **Desarrollar Super Admin Dashboard**
3. **Separar GuanaGo (B2C) en dominio propio**
4. **Configurar Make.com para Jarvis IA**
5. **Implementar sistema de pagos online**
6. **Crear manual de usuario para agencias**

---

**¿Listo para el siguiente paso?**
