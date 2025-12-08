
// services/mockDatabase.ts

export const simulatedSocialSearch = (_params?: any) => {
  return [
    {
      id: "renan_real",
      visual_tag: "ANONYMOUS_MALE_LATINO", // Tag genérica para não famosos
      platform: "LinkedIn / GitHub",
      name: "Renan Oliveira Andrade",
      email: "renan.andrade@exemplo-profissional.com",
      country: "Brasil",
      region: "São Paulo, SP",
      url: "https://www.linkedin.com/in/renanoliveiraandrade/",
      match_score: 99,
      source_type: "Professional Network",
      reasoning_notes: "Identidade confirmada (Perfil do Usuário). Consistência técnica e profissional."
    },
    {
      id: "sam_test",
      visual_tag: "FAMOUS_SAM_ALTMAN", // Tag explícita de identidade
      platform: "X (Twitter) / OpenAI",
      name: "Sam Altman",
      email: "s.altman@openai.com",
      country: "EUA",
      region: "San Francisco, CA",
      url: "https://twitter.com/sama",
      match_score: 98,
      source_type: "Social Media",
      reasoning_notes: "Figura pública reconhecida. CEO OpenAI."
    },
    {
      id: "anitta_test",
      visual_tag: "FAMOUS_ANITTA", // Tag explícita de identidade
      platform: "Instagram / Warner",
      name: "Anitta (Larissa de Macedo Machado)",
      email: "contact@anitta.com.br",
      country: "Brasil",
      region: "Rio de Janeiro / Miami",
      url: "https://instagram.com/anitta",
      match_score: 95,
      source_type: "Entertainment",
      reasoning_notes: "Figura pública reconhecida. Artista global."
    },
    {
      id: "yann_test",
      visual_tag: "FAMOUS_YANN_LECUN", // Tag explícita de identidade
      platform: "Meta AI / NYU",
      name: "Yann LeCun",
      email: "yann@nyu.edu",
      country: "EUA",
      region: "New York",
      url: "http://yann.lecun.com",
      match_score: 97,
      source_type: "Academic",
      reasoning_notes: "Pioneiro em IA reconhecido."
    },
    {
      id: "suzana_test",
      visual_tag: "FAMOUS_SUZANA_HERCULANO", // Tag explícita de identidade
      platform: "Lattes / Vanderbilt",
      name: "Suzana Herculano-Houzel",
      email: "suzana.houzel@vanderbilt.edu",
      country: "EUA",
      region: "Nashville, TN",
      url: "http://lattes.cnpq.br/123456789",
      match_score: 96,
      source_type: "Academic",
      reasoning_notes: "Cientista brasileira reconhecida."
    }
  ];
};
