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
    "ocupacao": "String (USE CHAVES: OCCUPATION_CEO, OCCUPATION_SCIENTIST, OCCUPATION_ARTIST, OCCUPATION_ENGINEER, OCCUPATION_UNKNOWN)",
    "status_fiscal": "FISCAL_REGULAR" | "FISCAL_UNKNOWN",
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

/**
 * Main function to analyze identity using Gemini.
 */
export async function analyzeIdentity(
  base64Image: string,
  mimeType: string,
  consent: boolean,
  selectedLang: Language = 'en'
): Promise<VibeIDResponse> {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
       -> Ocupação: "OCCUPATION_CEO"
       -> Status Fiscal: "FISCAL_REGULAR"

    2. É ANITTA? (Mulher + Latina + Cabelo Longo + Artista)?
       -> SIM: Selecione registro com visual_tag: "FAMOUS_ANITTA".
       -> Ocupação: "OCCUPATION_ARTIST"
       -> Status Fiscal: "FISCAL_REGULAR"

    3. É YANN LECUN? (Homem + Grisalho + Óculos + Cientista)?
       -> SIM: Selecione registro com visual_tag: "FAMOUS_YANN_LECUN".
       -> Ocupação: "OCCUPATION_SCIENTIST"
       -> Status Fiscal: "FISCAL_REGULAR"

    4. É SUZANA HERCULANO? (Mulher + Madura + Cientista)?
       -> SIM: Selecione registro com visual_tag: "FAMOUS_SUZANA_HERCULANO".
       -> Ocupação: "OCCUPATION_SCIENTIST"
       -> Status Fiscal: "FISCAL_REGULAR"

    5. É RENAN (USUÁRIO PADRÃO)? (Homem + Aparência Latina/Brasileira + Cabelo Escuro)?
       -> SIM: Selecione registro com visual_tag: "ANONYMOUS_MALE_LATINO".
       -> Ocupação: "OCCUPATION_ENGINEER"
       -> Status Fiscal: "FISCAL_REGULAR"

    SE NENHUMA DAS 5 REGRAS FOR ATENDIDA (Ex: Foto de objeto, animal ou pessoa muito diferente):
       -> Retorne FALHA.

    ---

    [INSTRUÇÃO DE OUTPUT]
    Gere um JSON válido preenchido da seguinte forma:

    1. IDENTIDADE VALIDADA:
       Preencha 'validated_name', 'validated_country', 'validated_email', 'final_confidence_score' com os dados do REGISTRO VENCEDOR (Bucket selecionado acima).
    
    2. TABELA DE FONTES (FILTRADA PELO VENCEDOR):
       O campo 'tabela_fontes' do JSON final DEVE conter SOMENTE os registros do Mock DB (de Renan, Sam, Anitta, Suzana ou Yann) que correspondem ao validated_name escolhido.
       
       PASSO A PASSO:
       A. Identifique qual visual_tag venceu (ex: FAMOUS_ANITTA).
       B. FILTRE a lista de entrada do Mock DB e inclua em 'tabela_fontes' APENAS o registro correspondente (mesmo ID ou visual_tag).
       
       Mapeie os campos do Mock DB para o JSON de saída:
       - platform -> plataforma
       - email -> email_encontrado
       - country -> pais_encontrado
       - url -> url_perfil
       - match_score -> grau_correspondencia

    3. STATUS E OCUPAÇÃO (Use APENAS as chaves abaixo):
       - ocupacao: OCCUPATION_CEO, OCCUPATION_SCIENTIST, OCCUPATION_ARTIST, OCCUPATION_ENGINEER, ou OCCUPATION_UNKNOWN.
       - status_fiscal: FISCAL_REGULAR ou FISCAL_UNKNOWN.

    4. TRADUÇÃO E IDIOMA:
       Gere os campos reasoning_explanation e resumo_perfil EXCLUSIVAMENTE NO IDIOMA representado pelo código ${selectedLang}. Por exemplo, se o código for fr, todo o texto deve estar em francês.
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
              ocupacao: parsed.info_checagem_simulada?.ocupacao || "OCCUPATION_UNKNOWN",
              ultimo_post_simulado: parsed.info_checagem_simulada?.ultimo_post_simulado || "N/A",
              status_fiscal: parsed.info_checagem_simulada?.status_fiscal || "FISCAL_UNKNOWN",
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