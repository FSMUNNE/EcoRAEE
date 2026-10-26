import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const description = (body.description || '').trim();
    const image_url = body.image_url || null;

    if (!description && !image_url) {
      return Response.json({ error: 'Se requiere una descripción o una imagen.' }, { status: 400 });
    }

    const descPart = description || '(sin descripción, clasificar por imagen)';
    const imagePart = image_url ? 'Se adjuntó una imagen: ' + image_url : 'No se adjuntó imagen.';
    const prompt = [
      'Eres un experto en gestión de Residuos de Aparatos Eléctricos y Electrónicos (RAEE) en Argentina.',
      'Analiza el siguiente residuo electrónico reportado por un ciudadano y entrega una clasificación técnica y recomendaciones de seguridad.',
      '',
      'Descripción del ciudadano: "' + descPart + '"',
      imagePart,
      '',
      'Responde en español argentino, claro y accesible para un ciudadano común. Si el residuo podría contener baterías de litio, mercurio, plomo u otros componentes tóxicos, marca el riesgo como Alto o Crítico e incluye advertencias concretas. Incluye pasos de borrado de datos personales según la Ley 25.326.'
    ].join('\n');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: prompt,
      file_urls: image_url ? [image_url] : undefined,
      response_json_schema: {
        type: "object",
        properties: {
          waste_type: { type: "string", description: "Nombre del residuo identificado" },
          category: { type: "string", enum: ["Pequeño Hogar", "Grande Hogar", "IT/Telecom", "Iluminación", "Herramientas", "Juguetes", "Médico", "Otros"] },
          risk_level: { type: "string", enum: ["Bajo", "Medio", "Alto", "Crítico"] },
          risk_reason: { type: "string", description: "Por qué tiene ese nivel de riesgo" },
          safety_warnings: { type: "array", items: { type: "string" } },
          data_sanitization: { type: "array", items: { type: "string" } },
          disposal_recommendation: { type: "string" },
          can_recycle: { type: "boolean" }
        },
        required: ["waste_type", "category", "risk_level", "risk_reason", "safety_warnings", "data_sanitization", "disposal_recommendation", "can_recycle"]
      }
    });

    return Response.json({ classification: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}