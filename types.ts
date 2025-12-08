
export interface MockCheckData {
  ocupacao: string;
  ultimo_post_simulado: string;
  status_fiscal: string;
  score_social_simulado: number;
}

export interface SourceTableItem {
  plataforma: string;
  email_encontrado: string | null;
  pais_encontrado: string | null;
  url_perfil: string;
  grau_correspondencia: string; // Ex: "Alto (98%)"
}

export interface VibeIDResponse {
  status_validacao: 'SUCESSO' | 'FALHA' | 'PENDENTE_CONSENTIMENTO';
  nome_completo: string | null;
  data_nascimento: string | null;
  domicilio_fiscal: string | null;
  info_checagem_simulada: MockCheckData | null;
  tabela_fontes: SourceTableItem[];
  resumo_perfil: string;
  razao_falha?: string;
  
  // Task 3: Validated Identity Fields
  validated_name?: string | null;
  validated_country?: string | null;
  validated_email?: string | null;
  final_confidence_score?: number;
  reasoning_explanation?: string;
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: VibeIDResponse | null;
}
