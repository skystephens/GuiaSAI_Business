# 🚀 PLAN DE IMPLEMENTACIÓN CLAUDE BOT - PASO A PASO
## GuiaSAI B2B + Integración IA Conversacional

**Duración estimada**: 4 semanas (Fase 1-3)  
**Costo API Claude**: ~$50-200/mes (según volumen)  
**Complejidad**: Media (puedes hacerlo tú solo)

---

## 📋 FASE 1: SETUP INICIAL (SEMANA 1)

### Paso 1.1: Crear Cuenta en Anthropic
```
1. Ve a https://console.anthropic.com
2. Registra con tu email
3. Crea API Key
4. Guarda en .env.local:
   VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Paso 1.2: Instalar Dependencia
```bash
npm install @anthropic-ai/sdk dotenv
```

### Paso 1.3: Crear Servicio Base
```typescript
// src/services/claudeService.ts

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithClaude(
  messages: ClaudeMessage[],
  systemPrompt: string,
  maxTokens: number = 1024
): Promise<string> {
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }

    return 'Error: respuesta sin contenido de texto';
  } catch (error: any) {
    console.error('Error en Claude API:', error);
    throw new Error(`Error de Claude: ${error.message}`);
  }
}

// Función auxiliar para análisis de cotizaciones
export async function analyzeQuotation(
  quotation: any,
  userMessage: string,
  contextData?: any
): Promise<string> {
  const systemPrompt = `
Eres un asistente experto en turismo en San Andrés.

CONTEXTO ACTUAL:
- Servicios disponibles: ${contextData?.totalServices || '50+'}
- Agencias registradas: ${contextData?.agencies || '20+'}
- Rating promedio: 4.5/5

Tu role es ayudar a agencias de viaje a crear cotizaciones perfectas analizando:
1. Disponibilidad de servicios
2. Compatibilidad de horarios
3. Sugerencias de mejora
4. Alternativas cuando hay conflictos

Responde siempre de manera profesional, amigable y concisa.
Usa emojis para claridad, pero mantén profesionalismo.

Cotización actual:
${JSON.stringify(quotation, null, 2)}
  `;

  return chatWithClaude(
    [{ role: 'user', content: userMessage }],
    systemPrompt,
    1500
  );
}
```

### Paso 1.4: Crear Componente Chat Basic
```typescript
// src/components/ClaudeAssistant.tsx

import { useState } from 'react';
import { chatWithClaude, ClaudeMessage } from '../services/claudeService';
import '../styles/claude-assistant.css';

interface ClaudeAssistantProps {
  quotation?: any;
  onClose?: () => void;
}

export function ClaudeAssistant({ quotation, onClose }: ClaudeAssistantProps) {
  const [messages, setMessages] = useState<ClaudeMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de cotizaciones. ¿En qué puedo ayudarte?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ClaudeMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const systemPrompt = `
Eres un asistente de cotizaciones para agencias de viaje en San Andrés.
Ayuda a los usuarios a entender, mejorar y validar sus cotizaciones de viaje.

${quotation ? `Cotización actual: ${JSON.stringify(quotation)}` : ''}
      `;

      const response = await chatWithClaude(
        [...messages, userMessage],
        systemPrompt
      );

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response },
      ]);
    } catch (err: any) {
      setError(err.message);
      setMessages(prev =>
        prev.slice(0, -1) // Remover último mensaje del usuario si hay error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="claude-assistant">
      <div className="assistant-header">
        <h3>🤖 Asistente de Cotizaciones</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="messages-container">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && <div className="avatar">🤖</div>}
            <div className="message-content">{msg.content}</div>
            {msg.role === 'user' && <div className="avatar">👤</div>}
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="avatar">🤖</div>
            <div className="message-content">Procesando...</div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSendMessage} className="input-form">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu pregunta..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Enviar
        </button>
      </form>
    </div>
  );
}
```

### Paso 1.5: Estilos CSS
```css
/* src/styles/claude-assistant.css */

.claude-assistant {
  display: flex;
  flex-direction: column;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #FF6600 0%, #2FA9B8 100%);
  color: white;
}

.assistant-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message.assistant {
  flex-direction: row;
}

.avatar {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.message-content {
  background: #f0f0f0;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  max-width: 70%;
  word-wrap: break-word;
  line-height: 1.4;
}

.message.user .message-content {
  background: #FF6600;
  color: white;
}

.message.assistant .message-content {
  background: #f0f0f0;
  color: #333;
}

.input-form {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.input-form input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
}

.input-form button {
  padding: 0.75rem 1.5rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.input-form button:hover {
  background: #e55a00;
}

.input-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  padding: 0.5rem 1rem;
  background: #ffebee;
  font-size: 0.9rem;
}
```

### Paso 1.6: Integrar en App.tsx
```typescript
// En App.tsx - agregar estado y componente

const [showAssistant, setShowAssistant] = useState(false);

// En el JSX, agregar botón flotante:
<button
  onClick={() => setShowAssistant(!showAssistant)}
  style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#FF6600',
    color: 'white',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    zIndex: 999,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  }}
  title="Asistente de Cotizaciones"
>
  🤖
</button>

{showAssistant && (
  <div style={{
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    width: '400px',
    maxHeight: '600px',
    zIndex: 998,
  }}>
    <ClaudeAssistant
      quotation={mockQuotation}
      onClose={() => setShowAssistant(false)}
    />
  </div>
)}
```

---

## 📋 FASE 2: FUNCIONALIDADES AVANZADAS (SEMANA 2-3)

### Paso 2.1: Validador de Itinerarios
```typescript
// src/services/itineraryValidator.ts

import { analyzeQuotation } from './claudeService';

export async function validateItinerary(quotation: any): Promise<{
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
  analysis: string;
}> {
  const message = `
Analiza este itinerario y valida:
1. ¿Los horarios de transporte permiten llegar a tiempo a los tours?
2. ¿Hay tiempo suficiente entre servicios?
3. ¿Las cantidades de personas cumplen capacidades?
4. ¿Hay overlaps (dos cosas al mismo tiempo)?
5. ¿Los check-in/out funcionan con los tours?

Formato de respuesta JSON:
{
  "isValid": boolean,
  "warnings": ["warning1", "warning2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "analysis": "análisis general"
}
  `;

  const response = await analyzeQuotation(quotation, message);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      isValid: true,
      warnings: [],
      suggestions: [],
      analysis: response,
    };
  }
}
```

### Paso 2.2: Generador de Itinerarios
```typescript
// src/services/itineraryGenerator.ts

import { analyzeQuotation } from './claudeService';

export async function generateItinerary(
  quotation: any,
  clientName: string = 'Cliente'
): Promise<string> {
  const message = `
Genera un itinerario detallado y profesional para un viaje a San Andrés.

Cliente: ${clientName}
Servicios contratados:
${JSON.stringify(quotation, null, 2)}

Formato de itinerario:
- Incluye cada día con horas específicas
- Menciona check-in/out
- Horarios de tours
- Horarios de transporte
- Comidas recomendadas
- Tiempo libre
- Instrucciones de qué traer

Genera un itinerario que sea:
1. Realista (respeta horarios)
2. Profesional (para mostrar a cliente)
3. Detallado (pero conciso)
4. Emocionante (vende la experiencia)
  `;

  return analyzeQuotation(quotation, message);
}
```

### Paso 2.3: Sugerencias de Upsell
```typescript
// src/services/upsellSuggestions.ts

import { analyzeQuotation } from './claudeService';

export async function suggestUpsells(
  quotation: any,
  availableServices: any[]
): Promise<{
  suggestions: Array<{
    service: string;
    reason: string;
    price: number;
  }>;
  totalUpsellValue: number;
}> {
  const message = `
Basándote en estos servicios ya seleccionados, sugiere 3 servicios adicionales que complementarían bien.

Servicios seleccionados:
${JSON.stringify(quotation, null, 2)}

Servicios disponibles en total:
${JSON.stringify(availableServices, null, 2)}

Sugiere servicios que:
1. Complementen lo ya reservado
2. Tengan precio accesible (no más del 15% del total actual)
3. Sean populares con este tipo de viajero
4. No creen conflictos de horario

Responde en JSON:
{
  "suggestions": [
    {
      "service": "nombre",
      "reason": "por qué lo recomendamos",
      "price": 100000
    }
  ],
  "totalUpsellValue": 300000
}
  `;

  const response = await analyzeQuotation(quotation, message);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      suggestions: [],
      totalUpsellValue: 0,
    };
  }
}
```

### Paso 2.4: Alternativas Inteligentes
```typescript
// src/services/alternativesFinder.ts

import { analyzeQuotation } from './claudeService';

export async function findAlternatives(
  quotation: any,
  rejectedService: {
    id: string;
    name: string;
    type: 'accommodation' | 'tour' | 'transport';
  },
  availableServices: any[]
): Promise<{
  alternatives: Array<{
    id: string;
    name: string;
    reason: string;
    priceChange: number;
  }>;
  recommendation: string;
}> {
  const message = `
El proveedor "${rejectedService.name}" no tiene disponibilidad.
Busca 3 alternativas similares de estos servicios disponibles.

Servicios disponibles:
${JSON.stringify(availableServices, null, 2)}

Alternativas deben:
1. Ser del mismo tipo (${rejectedService.type})
2. Tener características similares
3. Estar disponibles en las mismas fechas
4. Estar en rango de precio similar

Responde en JSON:
{
  "alternatives": [
    {
      "id": "service-id",
      "name": "nombre",
      "reason": "por qué es buena alternativa",
      "priceChange": 50000
    }
  ],
  "recommendation": "cuál recomendamos más"
}
  `;

  const response = await analyzeQuotation(quotation, message);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      alternatives: [],
      recommendation: '',
    };
  }
}
```

---

## 📋 FASE 3: INTEGRACIÓN PRODUCTIVA (SEMANA 4)

### Paso 3.1: Modal de Validación Pre-Pago
```typescript
// src/components/QuotationValidation.tsx

import { useState, useEffect } from 'react';
import { validateItinerary } from '../services/itineraryValidator';

interface QuotationValidationProps {
  quotation: any;
  onApprove: () => void;
  onReject: () => void;
}

export function QuotationValidation({
  quotation,
  onApprove,
  onReject,
}: QuotationValidationProps) {
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateItinerary(quotation)
      .then(result => {
        setValidation(result);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error validating:', err);
        setLoading(false);
      });
  }, [quotation]);

  if (loading) {
    return <div>Validando itinerario...</div>;
  }

  return (
    <div className="validation-modal">
      <h2>Validación de Cotización</h2>

      {validation?.warnings?.length > 0 && (
        <div className="warnings">
          <h3>⚠️ Advertencias</h3>
          <ul>
            {validation.warnings.map((w: string, i: number) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {validation?.suggestions?.length > 0 && (
        <div className="suggestions">
          <h3>💡 Sugerencias de Mejora</h3>
          <ul>
            {validation.suggestions.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {validation?.analysis && (
        <div className="analysis">
          <h3>📊 Análisis General</h3>
          <p>{validation.analysis}</p>
        </div>
      )}

      <div className="actions">
        <button onClick={onReject} className="btn-secondary">
          Editar Cotización
        </button>
        <button onClick={onApprove} className="btn-primary">
          Continuar a Pago
        </button>
      </div>
    </div>
  );
}
```

### Paso 3.2: Widget Flotante con Sugerencias
```typescript
// Agregar a QuotationSummary.tsx

import { useEffect, useState } from 'react';
import { suggestUpsells } from '../services/upsellSuggestions';

export function UpsellWidget({ quotation, services }) {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    suggestUpsells(quotation, services)
      .then(setSuggestions)
      .finally(() => setLoading(false));
  }, [quotation]);

  if (loading || !suggestions?.suggestions?.length) return null;

  return (
    <div style={{
      backgroundColor: '#FFF7ED',
      border: '2px solid #FF6600',
      borderRadius: '8px',
      padding: '1rem',
      marginTop: '1rem'
    }}>
      <h4>🎁 Servicios Recomendados</h4>
      {suggestions.suggestions.map((s: any, i: number) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0.5rem 0',
          borderBottom: i < suggestions.suggestions.length - 1 ? '1px solid #ffe0cc' : 'none'
        }}>
          <span>{s.service}</span>
          <span style={{ color: '#FF6600', fontWeight: 'bold' }}>
            +${s.price.toLocaleString('es-CO')}
          </span>
        </div>
      ))}
      <div style={{
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '2px solid #FF6600',
        fontWeight: 'bold',
        color: '#FF6600'
      }}>
        Total servicios adicionales: ${suggestions.totalUpsellValue.toLocaleString('es-CO')}
      </div>
    </div>
  );
}
```

### Paso 3.3: Manejo de Rechazos
```typescript
// Modificar handleSubmitQuotation en App.tsx

// Si algún proveedor rechaza, mostrar alternativas automáticas
const handlePartnerRejection = async (rejectedService: any) => {
  const alternatives = await findAlternatives(
    mockQuotation,
    rejectedService,
    accommodations // o tours/transports según tipo
  );

  // Mostrar modal de alternativas
  setAlternativesModal({
    isOpen: true,
    rejected: rejectedService,
    alternatives: alternatives,
  });
};
```

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN

### Semana 1:
- [ ] Crear cuenta Anthropic y API key
- [ ] Instalar @anthropic-ai/sdk
- [ ] Crear claudeService.ts
- [ ] Crear ClaudeAssistant.tsx
- [ ] Crear estilos CSS
- [ ] Agregar botón flotante a App.tsx
- [ ] Testing manual con 3 preguntas diferentes

### Semana 2-3:
- [ ] Crear itineraryValidator.ts
- [ ] Crear itineraryGenerator.ts
- [ ] Crear upsellSuggestions.ts
- [ ] Crear alternativesFinder.ts
- [ ] Crear QuotationValidation.tsx
- [ ] Crear UpsellWidget.tsx
- [ ] Testing con cotizaciones reales

### Semana 4:
- [ ] Integrar validación pre-pago
- [ ] Integrar sugerencias de upsell
- [ ] Integrar manejo de alternativas
- [ ] Testing exhaustivo
- [ ] Optimizar prompts basado en feedback
- [ ] Documentar para producción

---

## 💰 COSTOS ESTIMADOS

| Acción | Costo |
|--------|-------|
| Claude API (1000 req/mes a $0.003 por request) | $3-5 |
| Anthropic SDK | Gratis |
| Tiempo desarrollo (40h a $50/h) | $2,000 |
| **TOTAL MES 1** | **$2,003-2,005** |

**Nota**: Después del mes 1, solo pagas Claude ($3-5/mes si usas internamente, $50-200/mes si lo monetizas).

---

## 🚀 PRÓXIMOS PASOS

1. **Hoy**: Registrarse en Anthropic y obtener API key
2. **Mañana**: Implementar Paso 1.1 a 1.6
3. **Esta semana**: Terminar Fase 1 y hacer testing
4. **Próxima semana**: Comenzar Fase 2
5. **En 4 semanas**: Lanzar con Claude en producción

---

## 📞 SOPORTE Y RECURSOS

**Documentación oficial Claude**:
- https://docs.anthropic.com

**SDK React**:
- https://github.com/anthropics/anthropic-sdk-python

**Testing con cURL**:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hola"}]
  }'
```

---

¡Éxito con la implementación! 🎉
