import {
  GoogleGenAI,
  Type,
} from "@google/genai";
import {
  simulatedSocialSearch,
} from "./mockDatabase";
import { VibeIDResponse } from "../types";
import { Language } from "./i18n";

const SYSTEM_INSTRUCTION = `
Você é o algoritmo de decisão do VibeID. Sua função é ESTRITAMENTE processar a imagem e os dados JSON fornecidos para gerar um relatório JSON final.

REGRA ZERO: Se a imagem não contiver um rosto humano, retorne "status_validacao": "FALHA".

FORMATO DE SAÍDA JSON OBRIGATÓRIO:
{
  "status_validacao": "SUCESSO" | "FALHA",
  "validated_name": "String",
  "validated_country": "String",
  "validated_email": "String",
  "final_confidence_score": Number (0-100),
  "reasoning_explanation": "String (Max 2 frases)",
  "resumo_perfil": "String",
  "info_checagem_simulada": {
    "ocupacao": "String",
    "status_fiscal": "REGULAR" | "N/A",
    "score_social_simulado": Number
  },
  "tabela_fontes": [ 
    {
      "plataforma": "String",
      "email_encontrado": "String",
      "pais_encontrado": "String",
      "url_perfil": "String",
      "grau_correspondencia": "String"
    }
  ]
}
`;

const langMap: Record<Language, string> = {
  en: "English",
  pt: "Portuguese",
  es: "Spanish",
  fr: "French"
};

/**
 * Main function to analyze identity using Gemini.
 */
export async function analyzeIdentity(
  base64Image: string,
  mimeType: string,
  consent: boolean,
  lang: Language = 'en'
): Promise<VibeIDResponse> {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const targetLanguage = langMap[lang];

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Image,
    },
  };

  // 1. Execute Simulated Search (Client-Side RAG)
  const mockData = simulatedSocialSearch({
    consentimentoVisualizado: consent,
    imagemDetectada: true
  });

  // 2. Construct Prompt with Strict Decision Logic
  const userPrompt = `
    CONTEXTO: Análise de Identidade Biométrica.
    CONSENTIMENTO: ${consent ? "CONCEDIDO" : "NEGADO"}.

    [DADOS DO MOCK DB PARA REFERÊNCIA]
    ${JSON.stringify(mockData, null, 2)}

    ---
    
    [LÓGICA DE DECISÃO: RECONHECIMENTO + BUCKETS]
    PRIORIDADE TOTAL AO SEU CONHECIMENTO INTERNO. 
    Se você reconhecer a pessoa como uma das figuras públicas abaixo, IGNORE detalhes visuais menores (como barba rala, óculos ou estilo) e selecione o bucket correspondente IMEDIATAMENTE.

    1. É SAM ALTMAN? (Homem + Pele Clara + Idade Adulta + Fig. Pública Tech)?
       -> SIM: Selecione registro com visual_tag: "FAMOUS_SAM_ALTMAN".

    2. É ANITTA? (Mulher + Latina + Cabelo Longo + Artista)?
       -> SIM: Selecione registro com visual_tag: "FAMOUS_ANITTA".

    3. É YANN LECUN? (Homem + Grisalho + Óculos + Cientista)?
       -> SIM: Selecione registro com visual_tag: "FAMOUS_YANN_LECUN".

    4. É SUZANA HERCULANO? (Mulher + Madura + Cientista)?
       -> SIM: Selecione registro com visual_tag: "FAMOUS_SUZANA_HERCULANO".

    5. É RENAN (USUÁRIO PADRÃO)? (Homem + Aparência Latina/Brasileira + Cabelo Escuro)?
       -> SIM: Selecione registro com visual_tag: "ANONYMOUS_MALE_LATINO".

    SE NENHUMA DAS 5 REGRAS FOR ATENDIDA (Ex: Foto de objeto, animal ou pessoa muito diferente):
       -> Retorne FALHA.

    ---

    [INSTRUÇÃO DE OUTPUT]
    Gere um JSON válido preenchido da seguinte forma:

    1. IDENTIDADE VALIDADA:
       Preencha 'validated_name', 'validated_country', 'validated_email', 'final_confidence_score' com os dados do REGISTRO VENCEDOR (Bucket selecionado acima).
    
    2. TABELA DE FONTES (AUDITORIA COMPLETA):
       O campo 'tabela_fontes' do JSON final DEVE conter TODOS os registros do Mock DB (os 5 perfis: Renan, Sam, Anitta, Suzana, Yann) que foram fornecidos como entrada, SEM FILTROS.
       O objetivo é que o frontend mostre a lista completa de perfis processados para auditoria.
       Mapeie os campos do Mock DB para o JSON de saída:
       - platform -> plataforma
       - email -> email_encontrado
       - country -> pais_encontrado
       - url -> url_perfil
       - match_score -> grau_correspondencia

    3. TRADUÇÃO:
       Os campos 'reasoning_explanation' e 'resumo_perfil' DEVEM estar em **${targetLanguage}**.
       'reasoning_explanation': Explique qual regra de bucket foi ativada. MÁXIMO 2 FRASES.
  `;

  try {
    // 3. Single Call to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        { role: "user", parts: [imagePart, { text: userPrompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    
    try {
        const parsed = JSON.parse(text);
        
        // Ensure default structure if fields are missing
        return {
          status_validacao: parsed.status_validacao || "FALHA",
          validated_name: parsed.validated_name || null,
          validated_country: parsed.validated_country || null,
          validated_email: parsed.validated_email || null,
          final_confidence_score: parsed.final_confidence_score || 0,
          reasoning_explanation: parsed.reasoning_explanation || "Sem explicação gerada.",
          
          // Legacy mappings
          nome_completo: parsed.validated_name || parsed.nome_completo || null,
          data_nascimento: parsed.data_nascimento || null,
          domicilio_fiscal: parsed.validated_country || parsed.domicilio_fiscal || null,
          
          info_checagem_simulada: {
              ocupacao: parsed.info_checagem_simulada?.ocupacao || "Desconhecida",
              ultimo_post_simulado: parsed.info_checagem_simulada?.ultimo_post_simulado || "N/A",
              status_fiscal: parsed.info_checagem_simulada?.status_fiscal || "N/A",
              score_social_simulado: parsed.info_checagem_simulada?.score_social_simulado || 0
          },
          tabela_fontes: parsed.tabela_fontes || [],
          resumo_perfil: parsed.resumo_perfil || "Análise concluída.",
          razao_falha: parsed.razao_falha
        } as VibeIDResponse;

    } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        return {
            status_validacao: "FALHA",
            nome_completo: null,
            data_nascimento: null,
            domicilio_fiscal: null,
            info_checagem_simulada: null,
            tabela_fontes: [],
            resumo_perfil: text.substring(0, 200) + "...",
            razao_falha: "Formato de resposta inválido do modelo."
        };
    }

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(`Falha na análise: ${error.message}`);
  }
}