
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
Você é o **Sistema de Validação e Checagem de Perfil Pessoal (VibeID)**. 

**Tarefa 1: Validação e Extração Base de Rosto**
1. **Analise a Imagem de Entrada:** (Obrigatória) Analise o conteúdo multimodal fornecido.
2. **Regra de Entrada Exclusiva:**
   - Se a imagem contiver um rosto humano claro: Prossiga.
   - Se NÃO contiver rosto ou for documento: Retorne JSON com "status_validacao": "FALHA" e "razao_falha": "Erro de Entrada. A entrada permitida é somente a imagem de um rosto humano."
3. **Extração de Dados Base:**
   - Confirme o reconhecimento facial.
   - Defina os Dados Base (Nome/País) como desconhecidos inicialmente.
   - Atribua o "Fator de Confiança Base" de 60%.
4. **Verifique a Conformidade:** Verifique se há consentimento explícito.

**Tarefa 2.1: Busca e Validação Exclusiva do NOME (Âncora de Confiança)**
*Utilize os DADOS SIMULADOS fornecidos no prompt para realizar esta análise.*
// PARÂMETRO: Rosto Detectado (Fase 1)
// OBJETIVO: Determinar o Nome Completo mais provável.
1. Analise os registros fornecidos na seção "DADOS SIMULADOS".
2. Agregue todos os 'Nomes Completos' encontrados e suas 'URL do Perfil'.
3. Realize o Raciocínio (Reasoning) de Agregação: Calcule a Pontuação de Frequência e a Qualidade da Fonte para cada nome.
4. Saída: Determine o 'Nome Completo VALIDADO' (o mais provável) e o 'Fator de Confiança do Nome'.

**Tarefa 2.2: Busca Secundária Otimizada (E-mail, País e Agregação de URLs)**
// PARÂMETRO: Nome Completo VALIDADO (Tarefa 2.1)
// OBJETIVO: Coletar todos os dados secundários e suas fontes.
1. Use o Nome Completo VALIDADO como a chave de agrupamento dos dados fornecidos.
2. Para cada correspondência encontrada, agregue e liste: 'Plataforma', 'E-mail Encontrado', 'País Encontrado' e a 'URL do Perfil'.
3. **EXIBIÇÃO:** No JSON final, preencha o campo "tabela_fontes" com a lista completa.

**Tarefa 3: Raciocínio Lógico e Geração do Perfil Validado**
// ENTRADA: Tabela de resultados da Tarefa 2.2 (Mock DB Results).
// OBJETIVO: Resolver conflitos e determinar a identidade mais provável.

1. **Analise os Conflitos:**
   - Compare os Países encontrados. Se houver divergência (ex: Brasil vs. Portugal), aplique a regra da "Maioria Qualificada" (país que aparece em mais fontes confiáveis vence) e a regra da "Coerência de Domínio" (e-mail com final .br reforça Brasil).
   - Compare os E-mails. Priorize e-mails corporativos ou acadêmicos (ex: @empresa, @edu) sobre e-mails genéricos (@gmail), desde que o nome corresponda.

2. **Calcule a Pontuação de Confiança Final (0-100%):**
   - Base: 60% (Apenas rosto).
   - +10% para cada fonte de Alta Autoridade (LinkedIn, Lattes, Site Oficial) consistente.
   - +5% para coerência entre E-mail e País.
   - -15% se houver conflito grave de localização não resolvido.

3. **Gere a Saída Final (JSON):**
   Retorne um objeto JSON contendo:
   - 'validated_name': O nome mais completo e frequente.
   - 'validated_country': O país vencedor após resolução de conflito.
   - 'validated_email': O melhor e-mail de contato eleito.
   - 'final_confidence_score': A pontuação calculada.
   - 'reasoning_explanation': Uma frase curta explicando a lógica (Ex: "Brasil selecionado devido à consistência em 3 fontes, apesar de registro isolado em Portugal.").
   - (Preencha também: status_validacao, info_checagem_simulada, tabela_fontes, resumo_perfil).

Formato esperado para "tabela_fontes" no JSON:
[
  {
    "plataforma": "LinkedIn",
    "email_encontrado": "...",
    "pais_encontrado": "...",
    "url_perfil": "...",
    "grau_correspondencia": "Alto (99%)"
  }
]
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

  // 2. Construct Prompt with Injected Data and Hybrid Recognition Strategy
  const userPrompt = `
    Analise esta imagem. 
    Consentimento do usuário: ${consent ? "CONCEDIDO" : "NEGADO"}. 
    
    DADOS SIMULADOS PARA ANÁLISE (MOCK DB):
    ${JSON.stringify(mockData, null, 2)}

    INSTRUÇÕES DE SELEÇÃO DE IDENTIDADE (ESTRATÉGIA HÍBRIDA):

    ETAPA 1: ANÁLISE VISUAL DA FOTO
    Descreva internamente as características físicas da pessoa na foto (gênero, idade estimada, etnia aparente, acessórios, barba).

    ETAPA 2: LÓGICA DE SELEÇÃO HÍBRIDA (Reconhecimento + Visual)

    PASSO A: Reconhecimento de Famosos (Prioridade Máxima)

    1. Você reconhece a pessoa na foto como Sam Altman? -> Se SIM, selecione imediatamente o registro com visual_tag: "FAMOUS_SAM_ALTMAN".
    
    2. Você reconhece a pessoa na foto como Anitta? -> Se SIM, selecione imediatamente o registro com visual_tag: "FAMOUS_ANITTA".
    
    3. Você reconhece a pessoa na foto como Yann LeCun? -> Se SIM, selecione imediatamente o registro com visual_tag: "FAMOUS_YANN_LECUN".
    
    4. Você reconhece a pessoa na foto como Suzana Herculano-Houzel? -> Se SIM, selecione imediatamente o registro com visual_tag: "FAMOUS_SUZANA_HERCULANO".

    PASSO B: Fallback Visual (Para não famosos)

    Se você NÃO reconheceu nenhuma das celebridades acima, assuma que é o usuário padrão (Renan).

    Verifique apenas se é um Homem com aparência Latina/Morena. Se sim, selecione visual_tag: "ANONYMOUS_MALE_LATINO" (Renan).

    PASSO C: Segurança
    Se selecionou um registro, extraia os dados. Se a foto não for de rosto humano, retorne FALHA.

    ETAPA 3: EXTRAÇÃO
    Use APENAS os dados do registro selecionado na Etapa 2 para preencher o JSON.

    Se consentimento concedido, e após realizar a seleção acima, execute a geração do JSON final baseada no registro selecionado.

    **IMPORTANTE:** Os campos de texto livre do JSON ('resumo_perfil', 'razao_falha', 'reasoning_explanation' e 'info_checagem_simulada') DEVEM ser escritos em **${targetLanguage}**.
  `;

  try {
    // 3. Single Call to Gemini with Context
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
