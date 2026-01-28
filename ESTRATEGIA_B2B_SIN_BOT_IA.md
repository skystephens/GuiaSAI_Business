# 🎯 ESTRATEGIA B2B GUIASAI - SIN BOT DE IA (VERSIÓN SIMPLIFICADA)

**Fecha**: Enero 26, 2026  
**Enfoque**: Agencias de Viajes B2B - Cotizaciones, Itinerarios y Reservas  
**Alcance**: San Andrés + Providencia (próximamente)

---

## 📊 CONTEXTO: DE B2C CON BOT A B2B SIN BOT

### ❌ PROYECTO ANTERIOR (B2C + Bot IA)
```
Cliente Final (Viajero)
    ↓
Chat Bot IA (Asistente conversacional)
    ↓
Búsqueda de opciones
    ↓
Pago directo
    ↓
Viaje
```

**Problemas identificados:**
- Dependencia de procesamiento natural de lenguaje
- Costos API altos (Claude/GPT)
- Margen bajo en B2C (mucha competencia)
- Escala lenta sin eficiencia operacional

### ✅ PROYECTO ACTUAL (B2B SIN BOT, INTERFAZ DIRECTA)
```
Agencia de Viajes (Empresario)
    ↓
GUIASAI Platform (Formulario intuitivo + Airtable)
    ↓
Búsqueda multiservicio
    ↓
Confirmación automática vía Make
    ↓
Pago seguro (después de confirmar)
    ↓
Itinerario automatizado
    ↓
Gestión de reserva
```

**Ventajas:**
- Interfaz simple, SIN necesidad de IA
- Costos controlados
- Margen más alto (B2B vs B2C)
- Escalable con Airtable + Make
- Menos complejidad operacional

---

## 🏢 DIFERENCIAS B2C vs B2B EN GUIASAI

| Aspecto | B2C (Anterior) | B2B (Actual) |
|--------|----------------|-------------|
| **Usuario Final** | Turista individual | Agencia de viajes |
| **Necesidad** | Planificar viaje rápido | Cotizar para múltiples clientes |
| **Volumen** | 1 cotización = 1 persona | 1 cotización = 4-20 personas |
| **Frecuencia** | Compra ocasional | Compras regulares (50+ mes) |
| **Soporte IA** | Bot conversacional necesario | NO necesario, interfaz clara |
| **Precio** | Bajo ($500k-1M COP) | Alto ($2M-5M COP) |
| **Margen** | 5-10% | 15-25% |
| **Integración Sistemas** | No | Sí (contabilidad agencia) |
| **Documentación** | Mínima | Completa (vouchers, itinerarios) |

---

## 🎯 PROPOSICIÓN DE VALOR B2B SIMPLIFICADA

### Para Agencias de Viajes:
1. **Cotizar más rápido** (10 min vs 2 horas)
2. **Sin errores manuales** (itinerarios validados)
3. **Confirmación real-time** (saber disponibilidad en minutos)
4. **Documentación profesional** (listas para cliente)
5. **Sin intermediarios** (tú controlas todo)

### Para Prestadores (Hoteles, Tours, Taxis):
1. **Más clientes** (50+ agencias potenciales)
2. **Control de inventario** (Airtable actualizado)
3. **Confirmación rápida** (vía WhatsApp/Make)
4. **Pago asegurado** (después de confirmar)
5. **Analytics** (saber qué buscan las agencias)

---

## 🌏 MERCADOS OBJETIVO: SAN ANDRÉS + PROVIDENCIA

### SAN ANDRÉS (FASE 1 - AHORA)
```
Población: 40,000 hab
Turistas/año: 250,000
Agencias en Colombia: ~5,000

Estrategia:
- Lanzar en ANATO 2026 (Feria de turismo)
- Alcanzar 50-100 agencias en 3 meses
- Conectar 40-60 proveedores locales
```

**Proveedores clave en San Andrés:**  (ya tenemos esto)

*Alojamiento:*
- Hotel Decameron
- ATIS (cadena hotelera)
- PalmTop Hotel
- Rosario Islands Resort
- Boutique hotels (20+)

*Tours:*
- Operadores de tours aventura (15+)
- Tours culturales
- Buceo y snorkel
- Tours isla de Providencia
- Pesca deportiva

*Transporte:*
- Taxis aeropuerto
- Alquiler de vehículos
- Lanchas interislas
- Transfers hotel-aeropuerto

---

### PROVIDENCIA (FASE 2 - Q2 2026)
```
Población: 5,000 hab
Turistas/año: 15,000
Estrategia:
- Expandir San Andrés a Providencia
- Tours San Andrés ↔ Providencia
- Lodges y hospedajes boutique
```

**Ventaja competitiva:**
> "Único marketplace que conecta San Andrés + Providencia en 1 plataforma"

---

## 🛠️ ARQUITECTURA SIN BOT (VERSIÓN FINAL)

```
┌─────────────────────────────────────────────────────────┐
│              GUIASAI B2B - INTERFACE LAYER              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  LOGIN & DASHBOARD AGENCIA                       │  │
│  │  - Historial cotizaciones                        │  │
│  │  - Reservas activas                              │  │
│  │  - Pagos                                         │  │
│  │  - Analytics (opcional)                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  FORMULARIO DE COTIZACIÓN (SIN BOT)              │  │
│  │  - Fechas                                        │  │
│  │  - # Personas                                    │  │
│  │  - Tipo alojamiento (dropdown)                   │  │
│  │  - Actividades (checkboxes)                      │  │
│  │  - Presupuesto (rango)                          │  │
│  │  - Preferencias especiales                       │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  BÚSQUEDA AUTOMÁTICA EN AIRTABLE                 │  │
│  │  - Filtra alojamiento por criterios              │  │
│  │  - Busca tours disponibles                       │  │
│  │  - Calcula transporte                            │  │
│  │  - Retorna opciones (max 5)                      │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  VISTA PREVIA DE COTIZACIÓN                      │  │
│  │  - Hotel seleccionado                            │  │
│  │  - Tours incluidos                               │  │
│  │  - Fechas y horarios                             │  │
│  │  - Precio total                                  │  │
│  │  - Itinerario preliminar                         │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  SOLICITUD DE CONFIRMACIÓN (VÍA MAKE)            │  │
│  │  - Dispara WhatsApp a proveedores                │  │
│  │  - Hotel: ¿Disponible Oct 15-18?                │  │
│  │  - Tours: ¿Puedes hacer Vuelta Isla Oct 16?    │  │
│  │  - Taxi: ¿Pick-up Oct 15, 2 PM?                │  │
│  │  - Usa notificaciones inteligentes (NO chat)    │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ESPERA CONFIRMACIÓN (Real-time status)          │  │
│  │  - Hotel: ⏳ Pendiente...                        │  │
│  │  - Tours: ✅ Confirmado                          │  │
│  │  - Taxi: ⏳ Pendiente...                         │  │
│  │                                                  │  │
│  │  Si NO confirma en 2 horas:                      │  │
│  │  - Ofrece alternativas                           │  │
│  │  - Agencia puede seleccionar otro               │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  TODO CONFIRMADO → PROCEDER AL PAGO              │  │
│  │  - Mostrar total final                           │  │
│  │  - Link de pago Wompi                            │  │
│  │  - Resumen antes de pagar                        │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PAGO CONFIRMADO → ITINERARIO FINAL              │  │
│  │  - Itinerario día por día                        │  │
│  │  - Vouchers para cada proveedor                  │  │
│  │  - QR para clientes                              │  │
│  │  - Descarga PDF                                  │  │
│  │  - Envío automático vía email                    │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  GESTIÓN DE RESERVA (Timeline)                   │  │
│  │  - 2 días antes: Confirmar con cliente           │  │
│  │  - 1 día antes: Recordatorio a proveedores       │  │
│  │  - Día llegada: Confirmación check-in            │  │
│  │  - Día salida: Recordatorio check-out            │  │
│  │  - Post-viaje: Solicitar feedback                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

BACKEND (Invisible a usuario):
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  • Airtable API → Leer servicios + actualizar status   │
│  • Make Webhooks → Disparar notificaciones             │
│  • Wompi API → Procesar pagos                          │
│  • Email service → Enviar documentos                   │
│  • Simple validation rules → SIN IA                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ POR QUÉ NO NECESITAMOS BOT DE IA (Aún)

### 1️⃣ Interfaz Ultra-Clara
```
Agencia NO necesita escribir:
"Necesito 4 personas, playa, aventura, presupuesto medio"

Usa dropdowns:
- Fechas: [picker]
- Personas: [4]
- Tipo alojamiento: [dropdown] → "Oceanfront 4-5 estrellas"
- Actividades: [checkboxes] → "Aventura", "Cultural", "Relax"
- Presupuesto: [slider] → $2M-4M

La interfaz GUÍA a la agencia, no necesita IA conversacional
```

### 2️⃣ Lógica de Negocio Simple
```
Las reglas de filtrado son directas:

IF presupuesto = "bajo" AND tipo = "aventura"
  THEN filtra tours x $500k, hoteles $1.5M

NO necesita machine learning
Airtable formula fields + Query pueden hacer todo
```

### 3️⃣ Costos Controlados
```
Sin Claude API:
- Airtable: $192/mes
- Make: $100-200/mes
- Hosting: $50/mes

Con Claude API (1000 req/mes):
- +$50/mes en API
- Pero también + complejidad

Por ahora NO vale la pena
```

### 4️⃣ Velocidad de Desarrollo
```
MVP sin IA: 3 semanas
MVP con IA: 6-8 semanas

Mejor iterar con agencias y LUEGO agregar IA
cuando realmente sea necesaria
```

---

## 🎯 FOCUS ACTUAL: COTIZACIONES SIN FRICCIÓN

### PASO 1: Agencia abre GUIASAI
```
URL: app.guiasai.com
Login: email@agencia.com

Ve DASHBOARD con:
- [Crear nueva cotización]
- [Mis cotizaciones]
- [Reservas activas]
- [Pagos]
```

### PASO 2: Click en [Crear nueva cotización]
```
FORMULARIO:

Sección 1: FECHAS Y PERSONAS
├─ Fecha llegada: [date picker]
├─ Fecha salida: [date picker]
└─ # Personas: [number input]

Sección 2: ALOJAMIENTO
├─ Ubicación: [dropdown]
│  ├─ Centro
│  ├─ Oceanfront
│  ├─ Oeste
│  └─ Zona turística
├─ Tipo: [dropdown]
│  ├─ Hotel 5★
│  ├─ Hotel 4★
│  ├─ Hotel 3★
│  ├─ Apartamento
│  └─ Cabaña/Lodge
├─ Presupuesto habitación: [$1M - $5M]
└─ Preferencias: [checkboxes]
   ├─ Desayuno incluido
   ├─ Piscina
   ├─ Playa privada
   └─ Restaurante 5★

Sección 3: ACTIVIDADES
├─ Tours: [checkboxes]
│  ├─ Vuelta a la isla
│  ├─ Snorkel / Buceo
│  ├─ Tours culturales
│  ├─ Pesca deportiva
│  └─ Aventura extrema
├─ Tipo experiencia:
│  ├─ Relajado
│  ├─ Activo
│  └─ Mixto

Sección 4: PRESUPUESTO GENERAL
├─ Presupuesto total: [$2M - $10M]
└─ Notas especiales: [text area]

[BUSCAR OPCIONES]
```

### PASO 3: SISTEMA BUSCA AUTOMÁTICAMENTE
```
Query a Airtable:

SELECT * FROM Alojamientos
WHERE 
  fecha_disponible >= 2026-02-15 AND
  fecha_disponible <= 2026-02-18 AND
  locacion = "Oceanfront" AND
  precio BETWEEN $2M AND $3M AND
  tiene_desayuno = TRUE

SELECT * FROM Tours
WHERE
  tipo_tour IN ["Vuelta a la isla", "Snorkel"] AND
  disponible >= 2026-02-16 AND
  precio <= $500k

SELECT * FROM Transporte
WHERE
  tipo = "Aeropuerto transfer" AND
  disponible >= 2026-02-15

(Este es SQL simple, NO necesita IA)
```

### PASO 4: MUESTRA OPCIONES (3-5 máximo)
```
RESULTADOS:

[Option 1]
Hotel Decameron
├─ $2.5M/noche x 3 = $7.5M
├─ Oceanfront | 5★ | All-inclusive
├─ Rating: 4.7/5 (125 reviews)
└─ [Seleccionar]

[Option 2]
Palmera Beach Resort
├─ $2.0M/noche x 3 = $6M
├─ Oceanfront | 4★ | Desayuno incl.
├─ Rating: 4.5/5 (89 reviews)
└─ [Seleccionar]

...
```

### PASO 5: AGENCIA SELECCIONA
```
Selecciona Decameron
Sistema muestra:

TOURS SUGERIDOS (para Decameron):
├─ Vuelta a la isla: $350k/persona x 4 = $1.4M
│  (Operador: Tours San Andrés)
│  Salida: 8 AM | Retorno: 2 PM
│
├─ Snorkel Night: $280k/persona x 4 = $1.1M
│  (Operador: Caribbean Adventures)
│  Salida: 6 PM | Retorno: 10 PM
│
└─ [Seleccionar tours]

TRASLADOS AUTOMÁTICOS:
├─ Aeropuerto → Hotel (15 Oct, 2 PM): $200k
├─ Hotel → Vuelta a isla (16 Oct, 8 AM): Incluido
└─ Hotel → Aeropuerto (18 Oct, 10 AM): $200k
```

### PASO 6: RESUMEN Y CONFIRMACIÓN
```
VISTA PREVIA COTIZACIÓN:

FECHAS: 15-18 Oct (3 noches)
PERSONAS: 4

ALOJAMIENTO:
Hotel Decameron Oceanfront
3 noches x $2.5M = $7.5M

TOURS:
Vuelta a la isla (Oct 16) = $1.4M
Snorkel Night (Oct 17) = $1.1M

TRANSPORTE:
Transfer aeropuerto = $400k

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL COTIZACIÓN: $10.4M
COMISIÓN (5%): $520k
AGENCIA PAGA: $9.88M (si lo reduce)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CONFIRMAR CON PROVEEDORES]
```

### PASO 7: CONFIRMACIÓN AUTOMÁTICA VÍA MAKE
```
Disparador en MAKE:

├─ WebHook: "Nueva cotización confirmada por agencia"
│
├─ Paso 1: WhatsApp a Hotel Decameron
│  "Maria, cotización para 4 pax, Oct 15-18
│   ¿Disponible? [SÍ] [NO] [ALTERNATIVA]"
│
├─ Paso 2: WhatsApp a Tours San Andrés
│  "Vuelta isla Oct 16, 4 pax a 8 AM
│   ¿Confirmado? [SÍ] [NO]"
│
├─ Paso 3: WhatsApp a Caribbean Adventures
│  "Snorkel night Oct 17, 4 pax a 6 PM
│   ¿Confirmado? [SÍ] [NO]"
│
└─ Paso 4: Dashboard de agencia ACTUALIZA estado
   ├─ Hotel: ⏳ Pendiente
   ├─ Tours: ⏳ Pendiente
   └─ Sistema ESPERA confirmaciones (2 horas max)
```

### PASO 8: TODAS CONFIRMAN → PAGO HABILITADO
```
Si todo confirma:

├─ Hotel: ✅ Confirmado
├─ Tour 1: ✅ Confirmado
├─ Tour 2: ✅ Confirmado
└─ Transfer: ✅ Automático

Dashboard muestra:

"Todos los servicios están disponibles.
 ¿Deseas proceder al pago?"

[PROCEDER AL PAGO] [GUARDAR COMO BORRADOR]
```

### PASO 9: PAGO WOMPI
```
Agencia toca [PROCEDER AL PAGO]

Mostrar resumen final:
- Total: $10.4M
- Comisión: $520k
- Agencia paga: $9.88M
- Forma pago: [Tarjeta] [Transferencia]

[PAGAR AHORA] [CANCELAR]

Wompi procesa
↓
Confirmación de pago
↓
Envío de documentos (email + WhatsApp)
```

### PASO 10: ITINERARIO FINAL GENERADO
```
Automáticamente se genera:

ITINERARIO_QT-20260126-0001.pdf
├─ Detalle de vuelos/transporte
├─ Check-in hotel
├─ Tours con horarios
├─ Mapas de ubicaciones
├─ Números de emergencia
├─ Vouchers por servicio
├─ QR para cliente escanear
└─ Instrucciones especiales

Se envía a:
├─ Agencia: Email + descarga en plataforma
├─ Hotel: WhatsApp (para preparar)
├─ Operadores: WhatsApp (confirmar horarios)
└─ Opcional: Email a cliente final
```

---

## 💰 MODELO DE INGRESOS (SIN BOT)

```
Por cotización pagada:
- Cotización promedio: $10M COP
- Comisión GUIASAI: 5% = $500k
- Si 30 cotizaciones/mes = $15M COP/mes

Suscripción agencia (modelo alternativo):
- Plan Básico: $100k/mes → 10 cotizaciones
- Plan Pro: $300k/mes → Ilimitado + prioridad
- Plan Enterprise: $1M/mes → Custom integrations

Venta datos a proveedores:
- Hotel paga $200k/mes → "Tenemos 40 agencias solicitando"
- Tours pagan $150k/mes → Analytics de demanda
- 50 proveedores x $175k promedio = $8.75M/mes
```

---

## 🎯 RESUMEN: POR QUÉ ESTA ESTRATEGIA ES GANADORA

✅ **Simplicidad**: Sin IA conversacional, interfaz clara  
✅ **Costos bajos**: Airtable + Make (no Claude API)  
✅ **Rápido MVP**: 3-4 semanas vs 8-10 con IA  
✅ **Margen alto**: B2B vs B2C  
✅ **Escalable**: Airtable crece sin complicación  
✅ **Ready para IA**: Cuando sea necesario, agregar más adelante  

**En 6 meses**:
- 100+ agencias activas
- 50+ proveedores integrados
- $15M+ revenue MES
- Base sólida para agregar IA premium después

---

## 🚀 PRÓXIMOS PASOS

1. **Esta semana**: Terminar formulario cotizador
2. **Próxima semana**: Integración Make para confirmaciones
3. **Semana 3**: Itinerario auto-generado (template simple)
4. **Semana 4**: Testing con 10 agencias Beta
5. **ANATO (Feb)**: Lanzamiento oficial

**¿Listo para ejecutar?**
