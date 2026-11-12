// Configuração da conexão com o Supabase.
// Preencha os dois campos abaixo (veja o passo a passo no README.md).
// Enquanto estiverem vazios, o site abre em MODO DEMONSTRAÇÃO, com dados fictícios
// guardados só no seu navegador. Serve apenas para conhecer a tela.
//
// Use a chave "publishable" (começa com sb_publishable_) ou, em projetos antigos, a "anon public".
// Ela pode ficar neste arquivo: é pública por natureza.
// Quem protege os dados são as regras de acesso do banco (arquivo supabase/schema.sql).
// NUNCA coloque aqui a chave "secret" (sb_secret_...) nem a "service_role".
window.GESTAO_CS_CONFIG = {
  supabaseUrl: "https://wqspjdwuwageayoxyjqp.supabase.co",      // exemplo: https://abcdefghijkl.supabase.co
  supabaseAnonKey: "sb_publishable_nfcyZpOj-nDI7HU4-lSGAw_Z-WNb1qX"   // chave publishable (sb_publishable_...) ou anon public
};
