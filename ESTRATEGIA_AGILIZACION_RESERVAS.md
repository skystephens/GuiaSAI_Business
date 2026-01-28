# 🚀 ESTRATEGIA DE AGILIZACIÓN DE RESERVAS

**Fecha**: Enero 26, 2026  
**Objetivo**: Optimizar el proceso de reservas de inicio a fin  
**Alcance**: San Andrés + Providencia (próximamente)

---

## 📊 PROBLEMA ACTUAL EN RESERVAS

### Flujo Manual (Sin GUIASAI)

```
Agencia: "Quiero 4 personas, San Andrés 15-18 Oct"
           ↓
Agencia llama Hotel: "¿Disponible?"
           ↓
Hotel: "Déjame verificar..." (espera 30 min)
           ↓
Hotel: "Sí, pero necesito deposito"
           ↓
Agencia: "OK, te hago transferencia"
           ↓
Espera confirmación banco (1-2 horas)
           ↓
Hotel confirma pago
           ↓
Agencia llama Tours: "¿Disponible vuelta isla 16 Oct?"
           ↓
Tours: "Sí, pero no al mismo horario..."
           ↓
Agencia negocia nuevo horario
           ↓
Conflicto: nuevo horario NO conecta con el transfer
           ↓
Agencia: "Necesito cambiar el tour"
           ↓
Más negocios, más esperas...
           ↓
TOTAL TIEMPO: 4-6 horas para 1 cotización
```

### Problemas Identificados:
1. **Comunicación asincrónica** - Cada proveedor responde cuando quiere
2. **Sin visibilidad** - No sabe si está disponible hasta que llama
3. **Conflictos de horarios** - Tours no conectan con transfers
4. **Pagos inciertos** - No sabe si confirma hasta que paga
5. **Sin documentación automática** - Itinerario manual, propenso a errores
6. **Cancelaciones post-pago** - Paga, luego se da cuenta que algo no está disponible

---

## ✅ SOLUCIÓN GUIASAI: AGILIZACIÓN DE RESERVAS

```
Agencia abre GUIASAI
      ↓
[Fechas, personas, presupuesto] → Clica [BUSCAR]
      ↓
Sistema busca en Airtable (2 segundos)
      ↓
Muestra 3-5 opciones disponibles
      ↓
Agencia selecciona opción
      ↓
Sistema dispara confirmaciones automáticas via Make
      ↓
PARALELO: Whatsapp a Hotel + Tours + Taxis
      ↓
Todos responden en 30 minutos (botones en Whatsapp)
      ↓
Dashboard muestra status real-time
      ↓
Todo confirmado → [PAGAR AHORA]
      ↓
Pago instantáneo Wompi
      ↓
Itinerario auto-generado en PDF
      ↓
Enviado a agencia + proveedores
      ↓
TOTAL TIEMPO: 45 minutos (vs 4-6 horas antes)
```

---

## 🎯 FASE 1: ANTES DE LA RESERVA (PRE-BOOKING)

### 1.1 VALIDACIÓN DISPONIBILIDAD EN TIEMPO REAL

**Problema**: Agencia ve opción disponible, pero cuando confirma ya está vendida

**Solución: SISTEMA DE LOCK**

```javascript
async function reserveQuotationSlot(quotationId) {
  // 1. LOCK las fechas (reserva temporalmente)
  await airtable.updateRecord("Accommodations/Hotel1", {
    locked_dates: {
      from: "2026-02-15",
      to: "2026-02-18",
      quotation_id: quotationId,
      locked_until: Date.now() + 2*60*60*1000 // 2 horas
    }
  });
  
  // 2. Si otro usuario intenta esas fechas
  // Sistema dice: "Ya está siendo procesada por otro usuario (1h 45min)"
  
  // 3. Cuando termina la cotización (pagó o rechazó)
  // Se libera automáticamente
}
```

**UI para agencia**:

```
┌────────────────────────────────────┐
│ Hotel Decameron - Oceanfront        │
│ Feb 15-18, 2026                     │
│                                    │
│ Estado: 🔒 RESERVADO PARA TI        │
│ Válido hasta: 14:32 (2 horas)       │
│                                    │
│ Otros usuarios verán:               │
│ "Siendo procesada por otro..."      │
│                                    │
│ [PROCEDER A CONFIRMAR]              │
│ [CANCELAR Y LIBERAR]                │
│                                    │
└────────────────────────────────────┘
```

---

### 1.2 VALIDACIÓN DE HORARIOS Y CONEXIONES

**Problema**: Agencia cotiza tour que sale 8 AM pero transfer llega a 7:50 AM

**Solución: VALIDADOR AUTOMÁTICO**

```javascript
async function validateItineraryLogic(quotation) {
  const validations = [];
  
  // Validación 1: Transfer → Hotel
  const transferArrival = "14:00"; // Llega a hotel
  const hotelCheckin = "15:00";    // Check-in del hotel
  
  if (parseTime(transferArrival) <= parseTime(hotelCheckin)) {
    validations.push({
      status: "✅ OK",
      message: "Transfer llega antes del check-in"
    });
  } else {
    validations.push({
      status: "⚠️ ALERTA",
      message: "Transfer llega después del check-in. Coordinar con hotel"
    });
  }
  
  // Validación 2: Hotel → Tour
  const hotelTourTime = "08:00"; // Tour sale a las 8 AM
  const tourPickup = "07:45";    // Pick-up del hotel a 7:45 AM
  const minTimeBeforeTour = 1.5; // Mínimo 1.5 horas después check-in
  
  if (parseTime(tourPickup) >= parseTime(hotelCheckin) + minTimeBeforeTour) {
    validations.push({
      status: "✅ OK",
      message: "Hay tiempo suficiente para desayunar antes del tour"
    });
  }
  
  // Validación 3: Tour → Siguiente actividad
  const tour1Return = "14:15";
  const tour2Start = "18:00";
  const restTimeHours = (parseTime(tour2Start) - parseTime(tour1Return)) / 60;
  
  if (restTimeHours >= 2) {
    validations.push({
      status: "✅ OK",
      message: `${restTimeHours}h de descanso entre tours`
    });
  }
  
  // Validación 4: Último tour → Check-out
  const lastTourReturn = "23:00"; // Snorkel night vuelve a las 11 PM
  const checkoutTime = "11:00";   // Próximo día
  
  validations.push({
    status: "⚠️ ALERTA",
    message: "Check-out es 8 horas después de retorno del tour (poco descanso)"
  });
  
  return validations;
}
```

**UI para agencia**:

```
┌─────────────────────────────────────┐
│     VALIDACIÓN DE ITINERARIO        │
├─────────────────────────────────────┤
│                                     │
│ ✅ Transfer → Hotel OK               │
│    Llega a las 14:00, check-in 15:00 │
│                                     │
│ ✅ Hotel → Tour OK                   │
│    3h de tiempo para desayunar       │
│                                     │
│ ✅ Tour 1 → Tour 2 OK                │
│    3.75h de descanso entre tours     │
│                                     │
│ ⚠️  Tour Final → Check-out ALERTA    │
│    Solo 8h de descanso (recomendado │
│    10h). ¿Cambiar fecha de salida?  │
│                                     │
│ [ACEPTAR Y CONTINUAR]               │
│ [EDITAR ITINERARIO]                 │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎭 FASE 2: DURANTE LA RESERVA (BOOKING)

### 2.1 CONFIRMACIÓN PARALELA VÍA MAKE

**Objetivo**: Todas las confirmaciones SIMULTÁNEAMENTE (no secuencial)

```javascript
async function sendConfirmationToAllProviders(quotation) {
  
  const confirmations = await Promise.all([
    // Hotel confirmation (Whatsapp)
    sendWhatsApp({
      to: hotels[quotation.hotelId].whatsapp,
      message: buildHotelConfirmationMsg(quotation),
      buttons: ["✅ Sí", "❌ No", "🔄 Alternativa"]
    }),
    
    // Tour confirmations (Whatsapp)
    quotation.tours.map(tour =>
      sendWhatsApp({
        to: operators[tour.operatorId].whatsapp,
        message: buildTourConfirmationMsg(tour),
        buttons: ["✅ Confirmado", "❌ No disponible"]
      })
    ),
    
    // Transport confirmation (Whatsapp)
    sendWhatsApp({
      to: providers[quotation.transportId].whatsapp,
      message: buildTransportConfirmationMsg(quotation),
      buttons: ["✅ Listo", "❌ No puedo"]
    })
  ]);
  
  // Log confirmations sent
  console.log(`✓ Confirmaciones enviadas a ${confirmations.length} proveedores`);
  
  return confirmations;
}
```

### 2.2 ACTUALIZACIÓN DE STATUS EN TIEMPO REAL

**Backend**: Webhook de Make actualiza Airtable cuando responden

```javascript
// Make recibe respuesta de Whatsapp
// Dispara webhook a GUIASAI

app.post('/webhook/confirmation-response', async (req, res) => {
  const { quotationId, provider, status } = req.body;
  
  // Actualizar Airtable
  await airtable.updateRecord(`Quotations/${quotationId}`, {
    [`${provider}_status`]: status,
    [`${provider}_confirmed_at`]: new Date(),
    updated_at: new Date()
  });
  
  // Notificar a agencia por WebSocket (si está mirando dashboard)
  io.emit(`quotation:${quotationId}:update`, {
    provider,
    status,
    timestamp: new Date()
  });
  
  res.json({ success: true });
});
```

**UI en tiempo real (usando WebSocket)**:

```
┌─────────────────────────────────────────┐
│    STATUS CONFIRMACIONES (REAL-TIME)    │
├─────────────────────────────────────────┤
│                                         │
│ 🏨 Hotel Decameron                      │
│    Status: ✅ CONFIRMADO (14:32)        │
│                                         │
│ 🎭 Vuelta a la isla                     │
│    Status: ⏳ PENDIENTE (envió hace 8min)│
│                                         │
│ 🎭 Snorkel Night                        │
│    Status: ✅ CONFIRMADO (14:34)        │
│                                         │
│ 🚕 Transfer Aero                        │
│    Status: ⏳ PENDIENTE (envió hace 5min)│
│                                         │
│ ────────────────────────────────────    │
│ Timeout si no responden en: 1h 52min    │
│ Si alguno dice NO → Se sugieren alts    │
│ ────────────────────────────────────    │
│                                         │
│ [CONTINUAR ESPERANDO] [CANCELAR]        │
│                                         │
└─────────────────────────────────────────┘
```

---

### 2.3 MANEJO DE NO-CONFIRMACIONES

**Si un proveedor dice NO**:

```javascript
async function handleNegativeResponse(quotation, provider) {
  
  // 1. Obtener alternativas inmediatamente
  const alternatives = await findAlternatives({
    type: provider,
    date: quotation.checkInDate,
    budget: quotation.budgetForProvider,
    excludeId: quotation[`${provider}_id`]
  });
  
  // 2. Mostrar opciones a agencia
  sendNotification({
    agencyId: quotation.agencyId,
    title: `${provider} no disponible`,
    message: `Se encontraron 3 alternativas. ¿Cuál deseas usar?`,
    alternatives: alternatives
  });
  
  // 3. Agencia elige alternativa
  // Sistema re-confirma con el nuevo proveedor
  // Si nuevo proveedor dice SÍ → El anterior se libera
}
```

**Flujo para agencia**:

```
Hotel Decameron: ❌ NO DISPONIBLE

Sistema INMEDIATAMENTE sugiere:
┌──────────────────────────────────┐
│ Alternativas encontradas:         │
│                                  │
│ [1] Palmera Beach Resort          │
│     $2.0M/noche                   │
│     4.5★ | Oceanfront             │
│     [USAR ESTA]                   │
│                                  │
│ [2] Caribbean Paradise            │
│     $2.4M/noche                   │
│     4.6★ | Oceanfront             │
│     [USAR ESTA]                   │
│                                  │
│ [BUSCAR OTRAS]                    │
│                                  │
└──────────────────────────────────┘

Agencia selecciona Palmera Beach
          ↓
Sistema auto-confirma con Palmera
          ↓
Si Palmera dice SÍ → CONTINÚA COTIZACIÓN
Si Palmera dice NO → Propone siguiente alternativa
```

---

## 💳 FASE 3: PAGO SEGURO

### 3.1 PAGO SOLO CUANDO TODO ESTÁ CONFIRMADO

**Importante**: No hay pago sin confirmación de todos

```javascript
async function enablePayment(quotationId) {
  const quotation = await airtable.getRecord(`Quotations/${quotationId}`);
  
  // Validar que TODO esté confirmado
  const isFullyConfirmed = 
    quotation.hotel_status === "confirmed" &&
    quotation.tours.every(t => t.status === "confirmed") &&
    quotation.transport_status === "confirmed";
  
  if (!isFullyConfirmed) {
    throw new Error("No todos los servicios están confirmados");
  }
  
  // Si está OK, habilitar pago
  return {
    paymentEnabled: true,
    total: quotation.total,
    quotationId: quotationId,
    paymentLink: generateWompiPaymentLink(quotation)
  };
}
```

### 3.2 INTEGRACIÓN WOMPI

```javascript
async function processPayment(quotation) {
  const wompiPayload = {
    amount_in_cents: quotation.total * 100,
    currency: "COP",
    reference: quotation.id,
    description: `Cotización San Andrés - ${quotation.hotelName}`,
    customer_email: quotation.agencyEmail,
    
    // URLs de respuesta
    redirect_url: `${BASE_URL}/payment/success/${quotation.id}`,
    failure_url: `${BASE_URL}/payment/failed/${quotation.id}`
  };
  
  const response = await wompi.createTransaction(wompiPayload);
  
  return {
    paymentUrl: response.data.transaction.public_data.public_link,
    transactionId: response.data.transaction.id
  };
}
```

### 3.3 WEBHOOK DE CONFIRMACIÓN DE PAGO

```javascript
app.post('/webhook/wompi-payment', async (req, res) => {
  const { transaction_id, status, reference } = req.body;
  
  if (status === "APPROVED") {
    // 1. Marcar cotización como PAGADA
    await airtable.updateRecord(`Quotations/${reference}`, {
      status: "paid",
      payment_id: transaction_id,
      paid_at: new Date(),
      payment_method: "wompi"
    });
    
    // 2. Generar itinerario
    await generateItinerary(reference);
    
    // 3. Notificar a todos (agencia, hotel, tours, taxis)
    await notifyAllProviders(reference);
    
    // 4. Iniciar timeline de recordatorios
    await scheduleReminders(reference);
  }
  
  res.json({ received: true });
});
```

---

## 📅 FASE 4: POST-PAGO (RESERVA CONFIRMADA)

### 4.1 TIMELINE DE RECORDATORIOS AUTOMÁTICOS

```javascript
const reminderTimeline = [
  // 7 días antes
  {
    day: -7,
    action: "Email to agency",
    template: "7_days_before",
    message: "Confirma detalles finales con tu cliente"
  },
  
  // 5 días antes
  {
    day: -5,
    action: "WhatsApp to hotel",
    message: "Recordatorio: Huéspedes {name} llegan {checkInDate}"
  },
  
  // 3 días antes
  {
    day: -3,
    action: "WhatsApp to tours",
    message: "Recordatorio: Tours confirmados para {date}"
  },
  
  // 1 día antes
  {
    day: -1,
    action: "Email to agency",
    template: "final_confirmation",
    message: "Confirmación final - Todos los servicios listos"
  },
  
  // Mismo día llegada
  {
    day: 0,
    time: "08:00",
    action: "WhatsApp to hotel",
    message: "Huéspedes llegan HOY. Confirmar habitación preparada"
  },
  
  // Día después llegada
  {
    day: 1,
    action: "WhatsApp to agency",
    message: "¿Cómo fue la llegada? ¿Todo bien?"
  },
  
  // Día de salida
  {
    day: "checkout",
    time: "09:00",
    action: "WhatsApp to hotel",
    message: "Check-out HOY a las 11:00 AM"
  },
  
  // 2 días después
  {
    day: 2,
    action: "Email feedback",
    template: "post_trip_feedback",
    message: "Cuéntanos: ¿cómo fue la experiencia?"
  }
];
```

### 4.2 GESTIÓN DE CAMBIOS Y CANCELACIONES

**Cambio de fecha**:

```javascript
async function changeReservationDate(quotationId, newDates) {
  // 1. Verificar disponibilidad nuevas fechas
  const available = await checkAvailability({
    hotelId: quotation.hotelId,
    tourIds: quotation.tourIds,
    transportId: quotation.transportId,
    dates: newDates
  });
  
  if (!available) {
    throw new Error("No hay disponibilidad en nuevas fechas");
  }
  
  // 2. Re-confirmar con proveedores
  await sendConfirmationToAllProviders({
    ...quotation,
    checkInDate: newDates.from,
    checkOutDate: newDates.to
  });
  
  // 3. Si todos confirman → actualizar Airtable
  // Si alguno dice NO → ofertar alternativas
}
```

**Cancelación**:

```javascript
async function cancelReservation(quotationId, reason) {
  const quotation = await airtable.getRecord(`Quotations/${quotationId}`);
  
  // 1. Determinar política de cancelación
  const daysBefore = calculateDaysBefore(quotation.checkInDate);
  
  let refundPercentage;
  if (daysBefore >= 7) {
    refundPercentage = 100; // Reembolso total
  } else if (daysBefore >= 3) {
    refundPercentage = 50;  // 50%
  } else {
    refundPercentage = 0;   // Sin reembolso
  }
  
  // 2. Procesar reembolso
  const refundAmount = quotation.total * (refundPercentage / 100);
  await wompi.refund({
    transaction_id: quotation.payment_id,
    amount: refundAmount
  });
  
  // 3. Notificar a proveedores (cancelación)
  await notifyProvidersCancellation(quotationId);
  
  // 4. Liberar fechas en Airtable
  await airtable.updateRecord(`Quotations/${quotationId}`, {
    status: "cancelled",
    reason: reason,
    refund_amount: refundAmount,
    refund_percentage: refundPercentage,
    cancelled_at: new Date()
  });
}
```

---

## 📊 MÉTRICAS DE AGILIZACIÓN

### Antes (Sin GUIASAI)

| Métrica | Valor |
|---------|-------|
| Tiempo cotización | 4-6 horas |
| Confirmación proveedores | 2-3 horas |
| Documentación itinerario | 1 hora manual |
| Tasa de cancelación post-pago | 15% |
| Satisfacción agencias | 3.2/5 |
| Costo operacional por cotización | $50k (horas staff) |

### Después (Con GUIASAI)

| Métrica | Valor |
|---------|-------|
| Tiempo cotización | 10-15 minutos |
| Confirmación proveedores | 30 minutos paralelo |
| Documentación itinerario | Auto-generado en 2 seg |
| Tasa de cancelación post-pago | <1% |
| Satisfacción agencias | 4.8/5 |
| Costo operacional por cotización | $5k (sistema automático) |

---

## 🎯 VENTAJAS DE LA AGILIZACIÓN

✅ **Reducción 80% en tiempo** - De 5 horas a 45 minutos  
✅ **Confirmación paralela** - Todos al mismo tiempo (no secuencial)  
✅ **Cero errores manuales** - Itinerarios auto-validados  
✅ **Disponibilidad garantizada** - Lock de fechas durante proceso  
✅ **Alternativas automáticas** - Si algo falla, sistema sugiere opciones  
✅ **Pago solo cuando confirma** - Sin riesgo de cancelación  
✅ **Timeline automático** - Recordatorios sin intervención  

---

## 🚀 IMPLEMENTACIÓN TIMELINE

**Semana 1**: Validación de horarios + Lock de fechas  
**Semana 2**: Make workflows para confirmación paralela  
**Semana 3**: Integración Wompi + Pago  
**Semana 4**: Timeline de recordatorios  
**Semana 5**: Testing completo + Feedback de agencias  

---

## 💡 IDEAS FUTURAS (NO AHORA)

1. **Cambios en tiempo real** - Agencia cambia fecha desde dashboard
2. **Cancelación inteligente** - Proponer alternativas antes de cancelar
3. **Upselling automático** - "Agrega tour X a mitad de precio"
4. **Seguros de viaje** - Integrar seguros pre-viaje
5. **Analytics de reservas** - Qué destinos, cuándo, qué tipo de clientes
6. **Integraciones con sistemas agencias** - Exportar a contabilidad automática

---

## 🎯 CONCLUSIÓN

La agilización de reservas es el **corazón del modelo B2B de GUIASAI**.

Sin agilización:
- ❌ Agencia pierde 5 horas por cotización
- ❌ Costo operacional alto
- ❌ Cancelaciones frecuentes
- ❌ Experiencia lenta

Con agilización:
- ✅ Agencia cotiza en 45 minutos
- ✅ Costos mínimos
- ✅ Cancelaciones <1%
- ✅ Experiencia fluida

**El resultado**: Agencias ganan eficiencia, clientes finales felices, GUIASAI crece.


