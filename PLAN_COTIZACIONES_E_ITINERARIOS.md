# 📋 PLAN DETALLADO: COTIZACIONES E ITINERARIOS

**Fecha**: Enero 26, 2026  
**Objetivo**: Diseñar flujo automatizado de cotizaciones y generación de itinerarios  
**Alcance**: San Andrés + Providencia

---

## 📊 FLUJO GENERAL DE COTIZACIÓN

```
┌─────────────────────────────────────────────────────────────┐
│                    PROCESO DE COTIZACIÓN                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. AGENCIA SOLICITA                                        │
│     └─ Abre formulario en GUIASAI                           │
│        ├─ Fechas (entrada/salida)                           │
│        ├─ # Personas                                        │
│        ├─ Tipo alojamiento                                  │
│        ├─ Actividades deseadas                              │
│        └─ Presupuesto                                       │
│                                                             │
│  2. SISTEMA BUSCA EN AIRTABLE                               │
│     └─ Valida disponibilidad                                │
│        ├─ Alojamientos → Filter por fecha, precio, tipo     │
│        ├─ Tours → Filter por tipo y disponibilidad          │
│        └─ Transporte → Auto-calcula según necesidad         │
│                                                             │
│  3. MUESTRA OPCIONES (3-5 máx)                              │
│     └─ Agencia elige combinación                            │
│        ├─ Hotel seleccionado                                │
│        ├─ Tours incluidos                                   │
│        └─ Resumen preliminar                                │
│                                                             │
│  4. SOLICITA CONFIRMACIÓN AUTOMÁTICA                        │
│     └─ Via Make + WhatsApp a proveedores                    │
│        ├─ Notificación inteligente (NO chat)                │
│        ├─ Botones: Sí/No/Alternativa                        │
│        └─ Timeout: 2 horas                                  │
│                                                             │
│  5. ESPERA RESPUESTAS                                       │
│     └─ Dashboard muestra status real-time                   │
│        ├─ Hotel: ✅/⏳/❌                                   │
│        ├─ Tours: ✅/⏳/❌                                   │
│        └─ Transfer: ✅/⏳/❌                                │
│                                                             │
│  6. MANEJA ALTERNATIVAS (si alguno dice NO)                 │
│     └─ Sistema sugiere opciones similares                   │
│        ├─ Mismo rango de precio                             │
│        ├─ Mismas características                            │
│        └─ Agencia elige o rechaza                           │
│                                                             │
│  7. TODAS CONFIRMAN → PAGO HABILITADO                       │
│     └─ Agencia procede a pagar                              │
│        ├─ Link Wompi                                        │
│        ├─ Resumen final                                     │
│        └─ Confirmación segura                               │
│                                                             │
│  8. PAGO PROCESADO → ITINERARIO AUTO-GENERADO               │
│     └─ Sistema crea documento profesional                   │
│        ├─ Día a día detallado                               │
│        ├─ Horarios confirmados                              │
│        ├─ Vouchers por servicio                             │
│        ├─ QR para escanear                                  │
│        └─ PDF descargable                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 COMPONENTE 1: COTIZACIÓN

### 1.1 FORMULARIO DE COTIZACIÓN

**Ubicación**: `/quotation/new`

**Campos obligatorios**:

```typescript
interface QuotationForm {
  // Fechas
  checkInDate: Date;        // Fecha llegada
  checkOutDate: Date;       // Fecha salida
  nights: number;           // Noches (auto-calculado)
  
  // Personas
  totalPeople: number;      // Total de personas
  adults: number;           // Adultos
  children: number;         // Niños (opcional)
  infants: number;          // Infantes (opcional)
  
  // Alojamiento
  accommodationType: string;     // "Hotel 5★" | "Hotel 4★" | etc
  accommodationLocation: string; // "Oceanfront" | "Centro" | etc
  accommodationBudget: {
    min: number;
    max: number;
  };
  roomPreferences: string[];     // ["Desayuno", "Piscina", etc]
  
  // Actividades
  selectedTours: string[];       // ["Vuelta a isla", "Snorkel"]
  experienceType: string;        // "Relajado" | "Activo" | "Mixto"
  specialRequests: string;       // Notas libres
  
  // Presupuesto total
  totalBudget: {
    min: number;
    max: number;
  };
}
```

**Validaciones**:

```
✓ checkOutDate > checkInDate
✓ Mínimo 1 persona
✓ Presupuesto coherente (máx >= mín)
✓ Mínimo 1 tour seleccionado
✓ Fechas dentro de rango permitido (hoy + 365 días)
```

---

### 1.2 BÚSQUEDA EN AIRTABLE

**Query 1: Alojamientos**

```sql
SELECT * FROM {ACCOMMODATIONS_TABLE}
WHERE
  check_in_available <= 'checkInDate' AND
  check_out_available >= 'checkOutDate' AND
  location = 'accommodationLocation' AND
  type = 'accommodationType' AND
  price_per_night BETWEEN min_budget AND max_budget AND
  (has_breakfast = TRUE OR 'Desayuno' NOT IN roomPreferences) AND
  (has_pool = TRUE OR 'Piscina' NOT IN roomPreferences) AND
  capacity >= totalPeople
ORDER BY rating DESC
LIMIT 5
```

**Query 2: Tours**

```sql
SELECT * FROM {TOURS_TABLE}
WHERE
  id IN ('selectedTours') AND
  available_dates INCLUDES checkInDate TO checkOutDate AND
  capacity >= totalPeople AND
  price_per_person * totalPeople <= totalBudget.max
ORDER BY rating DESC
```

**Query 3: Transporte**

```sql
SELECT * FROM {TRANSPORT_TABLE}
WHERE
  type = 'Airport Transfer' AND
  available_date = checkInDate AND
  capacity >= totalPeople
```

---

### 1.3 VISTA PREVIA DE COTIZACIÓN

**Estructura UI**:

```
┌─────────────────────────────────────────┐
│         VISTA PREVIA COTIZACIÓN          │
├─────────────────────────────────────────┤
│                                         │
│ 📅 FECHAS                               │
│ 15 Oct - 18 Oct (3 noches)              │
│                                         │
│ 👥 PERSONAS                             │
│ 4 adultos                               │
│                                         │
│ 🏨 ALOJAMIENTO                          │
│ Hotel Decameron (5★ Oceanfront)         │
│ 3 noches × $2.5M = $7.5M                │
│                                         │
│ 🎭 TOURS INCLUIDOS                      │
│ • Vuelta a la isla (Oct 16, 8-2 PM)    │
│   4 personas × $350k = $1.4M            │
│                                         │
│ • Snorkel Night (Oct 17, 6-10 PM)      │
│   4 personas × $280k = $1.1M            │
│                                         │
│ 🚕 TRANSPORTE                           │
│ Transfer Aeropuerto → Hotel: $200k      │
│ Transfer Hotel → Aeropuerto: $200k      │
│                                         │
│ ────────────────────────────────────    │
│ TOTAL BRUTO:        $10.4M              │
│ Comisión GUIASAI:   $520k (5%)          │
│ TOTAL AGENCIA:      $9.88M              │
│ ────────────────────────────────────    │
│                                         │
│ [CONFIRMAR CON PROVEEDORES]             │
│ [EDITAR SELECCIÓN]                      │
│ [GUARDAR COMO BORRADOR]                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎭 COMPONENTE 2: CONFIRMACIÓN AUTOMÁTICA VÍA MAKE

### 2.1 CONFIGURACIÓN MAKE WORKFLOW

**Trigger**: Webhook → Agencia toca [CONFIRMAR CON PROVEEDORES]

```javascript
// Paso 1: Preparar data para notificaciones
const quotationData = {
  id: "QT-20260126-0001",
  hotelName: "Hotel Decameron",
  checkIn: "2026-02-15",
  checkOut: "2026-02-18",
  people: 4,
  
  tours: [
    {
      name: "Vuelta a la isla",
      date: "2026-02-16",
      time: "08:00",
      people: 4
    },
    {
      name: "Snorkel Night",
      date: "2026-02-17",
      time: "18:00",
      people: 4
    }
  ],
  
  transport: [
    {
      type: "Airport → Hotel",
      date: "2026-02-15",
      time: "14:00"
    }
  ]
};
```

**Paso 2: Enviar a Hotel (WhatsApp)**

```
Mensaje:
"Hola María, cotización nueva de GUIASAI:
👥 4 personas
📅 Feb 15-18, 2026 (3 noches)
🏨 Decameron - Oceanfront

¿Disponible? 
[✅ SÍ] [❌ NO] [🔄 ALTERNATIVA]

Ref: QT-20260126-0001"
```

**Paso 3: Enviar a Operadores Tours (WhatsApp)**

```
"Solicitud de tours - GUIASAI

TOUR 1: Vuelta a la isla
📅 Feb 16 | 👥 4 pax | ⏰ 8:00 AM
¿Confirmado? [✅ SÍ] [❌ NO]

TOUR 2: Snorkel Night
📅 Feb 17 | 👥 4 pax | ⏰ 6:00 PM
¿Confirmado? [✅ SÍ] [❌ NO]

Ref: QT-20260126-0001"
```

**Paso 4: Actualizar estado en tiempo real**

```javascript
// Cuando hotel responde "SÍ"
await updateQuotation("QT-20260126-0001", {
  status: "hotel_confirmed",
  hotel_confirmed_at: new Date(),
  hotel_response: "Sí"
});

// Dashboard de agencia ve:
// 🏨 Hotel: ✅ Confirmado (14:32)
```

---

### 2.2 MANEJO DE ALTERNATIVAS

**Si hotel responde "NO"**:

```javascript
const alternatives = await airtable.query({
  table: "Accommodations",
  filters: [
    { field: "location", value: "Oceanfront" },
    { field: "type", value: "Hotel 5★" },
    { field: "price_range", value: "$2M-$3M" },
    { field: "dates_available", value: "Feb 15-18" },
    { field: "id", operator: "!=", value: "decameron" } // Excluir original
  ],
  limit: 3
});

// Retorna:
// 1. Palmera Beach Resort ($2.0M)
// 2. Caribbean Paradise ($2.4M)
// 3. Oceanview Boutique ($2.8M)
```

**UI para agencia**:

```
┌─────────────────────────────────────┐
│ ⚠️ Hotel Decameron no disponible    │
│                                     │
│ Alternativas sugeridas:             │
│                                     │
│ [1] Palmera Beach Resort            │
│     $2.0M/noche (más barato)        │
│     4.5★ | Oceanfront               │
│     [USAR ESTA] [VER DETALLES]     │
│                                     │
│ [2] Caribbean Paradise              │
│     $2.4M/noche (similar)           │
│     4.6★ | Oceanfront               │
│     [USAR ESTA] [VER DETALLES]     │
│                                     │
│ [3] Oceanview Boutique              │
│     $2.8M/noche (premium)           │
│     4.8★ | Oceanfront               │
│     [USAR ESTA] [VER DETALLES]     │
│                                     │
│ [BUSCAR OTRAS] [EDITAR CRITERIOS]  │
│                                     │
└─────────────────────────────────────┘
```

---

## 📖 COMPONENTE 3: ITINERARIOS AUTO-GENERADOS

### 3.1 ESTRUCTURA DEL ITINERARIO

**Archivo**: `ITINERARIO_QT-{id}.pdf`

**Secciones**:

```markdown
# 🌴 ITINERARIO SAN ANDRÉS

**Referencia**: QT-20260126-0001  
**Generado**: 26 de Enero, 2026  
**Vigencia**: Válido hasta 2 de Marzo, 2026  

---

## 👥 INFORMACIÓN DEL VIAJE

**Huéspedes**: 4 personas (2 adultos + 2 niños)  
**Período**: 15-18 Febrero, 2026 (3 noches)  
**Origen**: Bogotá → Destino: San Andrés

---

## 📅 DÍA 1 - LUNES 15 DE FEBRERO

**Tema**: Llegada y Bienvenida

---

**14:00 - Llegada al Aeropuerto**
- ✈️ Vuelo AV123 (Avianca) llega 14:00
- 🚕 Transfer incluido hacia hotel
- Driver: Carlos García
- Teléfono: +57 3xx xxx xxxx

---

**15:00 - Check-in Hotel Decameron**
- 🏨 Hotel Decameron San Andrés
- Dirección: Carrera 1 #1-10, Oceanfront
- Teléfono hotel: +57 8 512 4567
- Código check-in: HDC-2026-0001

**Habitación**: Suite Oceanfront (Habitación 301)
- 2 camas Queen
- Vista al mar
- Aire acondicionado
- Servicio de room service 24h

**Check-in tiempo**: 3:00 PM
**Check-out tiempo**: 11:00 AM (Día 4)

---

**16:00 - Sesión de Bienvenida**
- Ubicación: Lobby Principal
- Información sobre la isla
- Mapas y guías turísticas
- Recomendaciones de restaurantes

**17:00 - Tiempo libre**
- Descanso después del viaje
- Playa privada del hotel disponible
- Piscina infinity

**19:00 - Cena de Bienvenida**
- Ubicación: Restaurante "Caribbean Taste"
- Tipo: Buffet Internacional
- Incluido en paquete
- Horario: 7:00 PM - 11:00 PM

---

## 📅 DÍA 2 - MARTES 16 DE FEBRERO

**Tema**: Aventura en la Isla

---

**07:00 - Desayuno**
- Ubicación: Buffet del hotel
- Horario: 6:30 AM - 10:00 AM

**08:00 - TOUR: Vuelta a la Isla**
- 🎭 Operador: Tours San Andrés S.A.S.
- Guide: Juan Rodríguez (Hablante de inglés/español)
- Incluye: Transporte, snacks, agua
- Duración: 6 horas
- Paradas:
  1. **Playa Spratt Bight** (30 min) - Fotografías
  2. **Rocky Cay** (1 hora) - Almuerzo incluido
  3. **Acuario Natural** (1.5 horas) - Snorkel
  4. **Manglar de Old Point** (1 hora) - Observación de fauna

**Pick-up**: Lobby del hotel 7:45 AM
**Retorno**: Hotel 2:15 PM

---

**14:30 - Tiempo libre**
- Descanso en hotel
- Actividades opcionales no incluidas:
  - Masaje spa: $100k
  - Pesca deportiva: $200k
  - Yoga en playa: $50k

**18:00 - Aperitivo en la playa**

**19:30 - Cena libre**
- Restaurantes recomendados cercanos

---

## 📅 DÍA 3 - MIÉRCOLES 17 DE FEBRERO

**Tema**: Experiencia Nocturna

---

**07:00 - Desayuno**

**09:00-16:00 - Día libre**
- Opciones:
  1. Explorar centro comercial
  2. Buceo en arrecife
  3. Relajarse en playa

**18:00 - Cena**
- Abierto

**19:00 - TOUR: Snorkel Night**
- 🎭 Operador: Caribbean Adventures
- Guide: Miguel Santos
- Duración: 4 horas
- Incluye: Transporte, snorkel gear, linterna submarina
- Actividades:
  - Snorkel nocturno en arrecife bioluminiscente
  - Observación de fauna marina nocturna
  - Bocadillos y bebidas

**Pick-up**: Lobby 6:45 PM
**Retorno**: Hotel 11:00 PM

---

## 📅 DÍA 4 - JUEVES 18 DE FEBRERO

**Tema**: Retorno

---

**07:00 - Desayuno**

**08:00-10:30 - Check-out y tiempo libre**

**10:00 - Check-out Hotel**
- Dejar llaves en recepción
- Factura final lista

**10:30 - Transfer hacia Aeropuerto**
- Driver: Carlos García
- Tiempo estimado: 15 minutos

**11:00 - Llegada Aeropuerto**

**13:00 - Despegue**
- Vuelo AV124 (Avianca)
- Llegada Bogotá: 1:45 PM

---

## 📞 INFORMACIÓN DE EMERGENCIA

**Contacto 24h Hotel**: +57 8 512 4567
**Contacto Operadores Tours**: +57 310 xxx xxxx
**Embajada de Colombia en San Andrés**: +57 8 512 1234
**Hospital**: San Andrés Clínica +57 8 512 5678

---

## 💰 RESUMEN DE PAGOS

**Pago realizado a**: GUIASAI  
**Fecha pago**: 26 de Enero, 2026  
**Referencia**: QT-20260126-0001  

| Servicio | Cantidad | Valor Unit | Total |
|----------|----------|-----------|-------|
| Hotel Decameron | 3 noches | $2.5M | $7.5M |
| Tour Vuelta Isla | 4 personas | $350k | $1.4M |
| Tour Snorkel | 4 personas | $280k | $1.1M |
| Transfer Aero | 2 viajes | $200k | $400k |
| **TOTAL** | | | **$10.4M** |

---

## 🎁 RECOMENDACIONES ESPECIALES

1. **Protector Solar**: Esencial, nivel 50+
2. **Dinero en efectivo**: Para propinas/compras
3. **Documentos**: Pasaporte vigente
4. **Ropa**: Ligera, cómoda para playa
5. **Medicamentos**: Traer propios (farmacias limitadas)

---

## ✅ CÓDIGO QR PARA CLIENTE

```
[QR AQUÍ - Escanear para acceder a versión digital]
```

**Contiene**:
- Confirmación de reservas
- Números de emergencia
- Mapas offline de la isla
- Horarios de servicios

---
```

### 3.2 GENERACIÓN AUTOMÁTICA

**Trigger**: Pago confirmado en Wompi

```javascript
async function generateItinerary(quotation) {
  // 1. Obtener data confirmada
  const hotel = await airtable.getRecord(quotation.hotelId);
  const tours = await airtable.getRecords(quotation.tourIds);
  const transport = await airtable.getRecord(quotation.transportId);
  
  // 2. Crear documento con PlantillaHTML + CSS
  const itineraryHTML = buildItineraryHTML({
    quotation,
    hotel,
    tours,
    transport
  });
  
  // 3. Convertir a PDF (usando html2pdf library)
  const pdf = await html2pdf(itineraryHTML);
  
  // 4. Guardar en S3
  const pdfUrl = await uploadToS3(
    pdf,
    `itinerarios/ITINERARIO_${quotation.id}.pdf`
  );
  
  // 5. Enviar por email + WhatsApp
  await sendEmail({
    to: quotation.agencyEmail,
    subject: `Itinerario San Andrés - Ref: ${quotation.id}`,
    body: `Tu itinerario está listo para descargar`,
    attachments: [pdfUrl]
  });
  
  await sendWhatsApp({
    to: quotation.agencyPhone,
    message: `Tu itinerario está listo: ${pdfUrl}`
  });
  
  // 6. Actualizar Airtable
  await airtable.updateRecord(quotation.id, {
    status: "itinerary_generated",
    itinerary_url: pdfUrl,
    generated_at: new Date()
  });
}
```

---

## 🎯 COMPONENT 4: GESTIÓN DE RESERVA (TIMELINE)

### 4.1 CRONOGRAMA AUTOMÁTICO

Después del pago, se activa un timeline de recordatorios:

```javascript
const timeline = [
  {
    daysBeforeTrip: 7,
    action: "Email reminder",
    message: "Tu viaje comienza en 7 días. Confirma datos con cliente",
    recipient: "agency"
  },
  {
    daysBeforeTrip: 3,
    action: "WhatsApp to hotel",
    message: "María, 3 días para llegada de huéspedes (QT-xxx)",
    recipient: "provider"
  },
  {
    daysBeforeTrip: 1,
    action: "Final confirmation email",
    message: "Confirmación final de todos los servicios",
    recipient: "agency"
  },
  {
    daysAfterTrip: 0,
    action: "Check-in confirmation",
    message: "Confirmar llegada de huéspedes",
    recipient: "hotel"
  },
  {
    daysAfterTrip: 1,
    action: "Experience check",
    message: "¿Cómo va el viaje? Cualquier problema?",
    recipient: "agency"
  },
  {
    daysAfterTrip: 3,
    action: "Post-trip feedback",
    message: "Califica tu experiencia (hotel, tours, servicio)",
    recipient: "both"
  }
];
```

---

## 🎯 RESUMEN: COTIZACIONES E ITINERARIOS

✅ **Formulario intuitivo** - Sin IA, fácil de llenar  
✅ **Búsqueda automática** - Queries simples en Airtable  
✅ **Confirmación en tiempo real** - Via Make + WhatsApp  
✅ **Itinerarios profesionales** - Auto-generados en PDF  
✅ **Gestión completa** - Timeline de recordatorios  
✅ **Experiencia fluida** - De cotización a itinerario en minutos  

**Timeline de implementación**:
- Semana 1: Formulario + búsqueda
- Semana 2: Make workflow
- Semana 3: Itinerario auto-generado
- Semana 4: Testing completo


