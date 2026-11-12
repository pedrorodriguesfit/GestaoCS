/* Gestão CS: quadro de avisos e análise de atendimentos.
   Dois modos: "supabase" (dados reais, quando config.js está preenchido)
   e "demo" (dados fictícios no navegador, para conhecer a tela). */
(() => {
'use strict';

const CFG = window.GESTAO_CS_CONFIG || {};
const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js';
const MODO = (CFG.supabaseUrl && CFG.supabaseAnonKey) ? 'supabase' : 'demo';
const CANAIS = ['Hubspot', 'BlipDesk', '3CX'];
const POLL_MS = 60000;

/* ================= utilidades ================= */
const pad = n => String(n).padStart(2, '0');
const hojeISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fmtData = iso => iso ? iso.split('-').reverse().join('/') : '';
const fmtCurta = iso => iso ? iso.split('-').reverse().slice(0, 2).join('/') : '';
const diaSemana = iso => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
const diasEntre = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000) + 1;
const fmtDataHora = ts => { const d = new Date(ts); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const distinct = (a, b) => (a ?? null) !== (b ?? null);
const fmtCodigo = c => (c || '').replace(/(.{4})(?=.)/g, '$1-');

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  let value;
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'value') value = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'checked' || k === 'disabled' || k === 'selected' || k === 'required') el[k] = !!v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  if (value !== undefined) el.value = value;
  return el;
}
const $ = (sel, root = document) => root.querySelector(sel);

function toast(msg, erro = false) {
  const t = h('div', { class: 'toast' + (erro ? ' erro' : ''), text: msg });
  $('#toasts').append(t);
  setTimeout(() => t.remove(), erro ? 7000 : 3800);
}

const PALETA = ['#0e7490', '#be185d', '#4d7c0f', '#9333ea', '#c2410c', '#0369a1', '#a16207', '#047857'];
const CORES = { 'Férias': '#16a34a', 'Atestado': '#dc2626', 'Ausência Temporária': '#d97706', 'Folga': '#2563eb', 'Day Off': '#7c3aed' };
function corNatureza(nome) {
  if (CORES[nome]) return CORES[nome];
  let x = 0; for (const c of String(nome)) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  return PALETA[x % PALETA.length];
}

function erroAmigavel(e) {
  const m = String((e && (e.message || e.error_description)) || e || '');
  if (/Invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/Email not confirmed/i.test(m)) return 'O e-mail ainda não foi confirmado. Peça ao administrador para conferir a configuração do Supabase (veja o README).';
  if (/User already registered/i.test(m)) return 'Este e-mail já tem acesso. Use a aba "Entrar" (ou "Esqueci minha senha").';
  if (/Database error saving new user|convite_invalido/i.test(m)) return 'Não foi possível criar o acesso. Confira se o e-mail é o mesmo que o administrador cadastrou e se o código está correto e dentro do prazo (7 dias).';
  if (/row-level security|permission denied|insufficient/i.test(m)) return 'Você não tem permissão para esta ação.';
  if (/Password should be at least/i.test(m)) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (/rate limit|too many/i.test(m)) return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Sem conexão com o servidor. Verifique a internet e tente de novo.';
  return m || 'Ocorreu um erro inesperado.';
}

/* ================= camada de dados: DEMO ================= */
function criarApiDemo() {
  const KEY = 'gestaocs_demo_v1';
  const SESS = 'gestaocs_demo_sessao';
  const hoje = new Date();
  const dia = n => { const d = new Date(hoje); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  function seed() {
    const funcionarios = [
      [1, 'Admin Demo', 'Gerente de Sucesso do Cliente', 'Gestão', null],
      [2, 'Ana Souza', 'Supervisora', 'Gestão', 1],
      [3, 'Bruno Lima', 'Supervisor', 'Gestão', 1],
      [4, 'Carla Mendes', 'Auxiliar de Atendimento', 'Atendimento N1', 2],
      [5, 'Diego Alves', 'Auxiliar de Atendimento', 'Atendimento N1', 2],
      [6, 'Elisa Rocha', 'Auxiliar de Atendimento', 'Atendimento N1', 2],
      [7, 'Fábio Nunes', 'Analista', 'Atendimento N3', 3],
      [8, 'Gabi Torres', 'Analista', 'Atendimento N3', 3],
      [9, 'Heitor Dias', 'Analista', 'Inadimplência', 3]
    ].map(([id, nome, cargo, subsetor, gestor_id]) => ({ id, matricula: String(1000 + id), nome, cargo, subsetor, nivel: '', gestor_id, gestor_nome: null }));
    const perfis = [
      { id: 1, user_id: 'u1', email: 'admin@demo.com', nome: 'Admin Demo', papel: 'admin', funcionario_id: 1 },
      { id: 2, user_id: 'u2', email: 'ana@demo.com', nome: 'Ana Souza', papel: 'supervisor', funcionario_id: 2 },
      { id: 3, user_id: 'u3', email: 'bruno@demo.com', nome: 'Bruno Lima', papel: 'supervisor', funcionario_id: 3 }
    ];
    const mk = (id, fid, natureza, i, f, obs, status, por) => {
      const fu = funcionarios.find(x => x.id === fid); const p = perfis.find(x => x.id === por);
      return { id, funcionario_id: fid, funcionario_nome: fu.nome, setor: fu.subsetor, gestor_id: p.papel === 'admin' ? fu.gestor_id : p.id,
        natureza, data_inicio: dia(i), data_fim: dia(f), observacao: obs, status, motivo_recusa: null, criado_por: p.id, criado_por_nome: p.nome,
        criado_em: new Date(hoje.getTime() - id * 3600000).toISOString(), decidido_por: status === 'aprovado' ? 1 : null, decidido_em: null };
    };
    return {
      seq: { aviso: 20, analise: 10, func: 20, perfil: 10, nat: 10 },
      perfis, funcionarios,
      naturezas: ['Férias', 'Atestado', 'Ausência Temporária', 'Folga', 'Day Off'].map((nome, i) => ({ id: i + 1, nome, ordem: i + 1 })),
      avisos: [
        mk(1, 4, 'Atestado', 0, 1, 'Consulta médica, retorna na quinta.', 'aprovado', 2),
        mk(2, 7, 'Férias', -2, 8, '', 'aprovado', 3),
        mk(3, 5, 'Folga', 2, 2, 'Compensação de banco de horas.', 'aprovado', 2),
        mk(4, 8, 'Ausência Temporária', 0, 0, 'Saída às 15h para resolver pendência pessoal.', 'aprovado', 3),
        mk(5, 6, 'Day Off', 5, 5, 'Aniversário.', 'pendente', 2),
        mk(6, 9, 'Atestado', -9, -7, '', 'aprovado', 1),
        mk(7, 2, 'Atestado', 1, 1, '', 'pendente', 2)
      ],
      analises: [
        { id: 1, gestor_id: 2, gestor_nome: 'Ana Souza', id_atendimento: '84521', resumo: 'Cliente pediu segunda via da fatura e questionou a cobrança.', avaliacao: 'Boa condução, explicou o cálculo com clareza.', pontos_melhoria: 'Confirmar o e-mail do cliente antes de encerrar.', canal: 'BlipDesk', data_atendimento: dia(-1), criado_em: new Date().toISOString() },
        { id: 2, gestor_id: 3, gestor_nome: 'Bruno Lima', id_atendimento: 'HS-3391', resumo: 'Dúvida sobre troca de titularidade.', avaliacao: 'Atendimento correto, porém demorado.', pontos_melhoria: 'Usar a resposta pronta de documentos.', canal: 'Hubspot', data_atendimento: dia(-2), criado_em: new Date().toISOString() }
      ],
      convites: [], contas: { 'admin@demo.com': 'demo', 'ana@demo.com': 'demo', 'bruno@demo.com': 'demo' }
    };
  }
  let db;
  const salvar = () => localStorage.setItem(KEY, JSON.stringify(db));
  const carregar = () => { try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; } if (!db) { db = seed(); salvar(); } };
  carregar();
  const clone = x => JSON.parse(JSON.stringify(x));
  const eu = () => { const u = sessionStorage.getItem(SESS); return db.perfis.find(p => p.user_id === u) || null; };
  const exigir = () => { const p = eu(); if (!p) throw new Error('Sem acesso'); return p; };
  const admin = () => { const p = exigir(); if (p.papel !== 'admin') throw new Error('Você não tem permissão para esta ação.'); return p; };
  const podeCriarPara = fid => { const p = exigir(); if (p.papel === 'admin') return true; const fu = db.funcionarios.find(f => f.id === fid); return !!fu && (fu.gestor_id === p.id || fu.id === p.funcionario_id); };
  const gerarCodigo = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(16).padStart(2, '0')).join('').toUpperCase().slice(0, 12);
  const limpaCod = c => String(c || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const wait = async v => { await new Promise(r => setTimeout(r, 40)); return v; };

  return {
    modo: 'demo',
    async init(onRecovery) { carregar(); },
    async sessao() { return !!eu(); },
    async entrar(email, senha) {
      const e = String(email).trim().toLowerCase();
      if (db.contas[e] === undefined || db.contas[e] !== senha) throw new Error('Invalid login credentials');
      const p = db.perfis.find(x => x.email === e); if (!p) throw new Error('Sem acesso');
      sessionStorage.setItem(SESS, p.user_id);
    },
    async primeiroAcesso(email, senha, codigo) {
      const e = String(email).trim().toLowerCase();
      const p = db.perfis.find(x => x.email === e && !x.user_id);
      const cv = p && db.convites.find(c => c.perfil_id === p.id);
      if (!cv || cv.hash !== limpaCod(codigo) || new Date(cv.expira) < new Date()) throw new Error('convite_invalido');
      if (String(senha).length < 8) throw new Error('Password should be at least 8 characters');
      p.user_id = 'u' + p.id + Date.now(); db.contas[e] = senha;
      db.convites = db.convites.filter(c => c !== cv); salvar();
      sessionStorage.setItem(SESS, p.user_id);
    },
    async sair() { sessionStorage.removeItem(SESS); },
    async esqueciSenha() { throw new Error('No modo demonstração a recuperação de senha não está disponível. Use as senhas "demo".'); },
    async novaSenha() { throw new Error('Indisponível na demonstração.'); },
    async meuPerfil() { return clone(eu()); },
    async carregarTudo() {
      const p = exigir();
      const avisos = db.avisos.filter(a => p.papel === 'admin' || a.status === 'aprovado' || a.criado_por === p.id);
      const analises = db.analises.filter(a => p.papel === 'admin' || a.gestor_id === p.id);
      return clone({ perfis: db.perfis, funcionarios: db.funcionarios, naturezas: db.naturezas, avisos, analises });
    },
    async criarAviso(d) {
      const p = exigir();
      if (!podeCriarPara(d.funcionario_id)) throw new Error('Você não tem permissão para esta ação.');
      const fu = db.funcionarios.find(f => f.id === d.funcionario_id);
      if (!fu) throw new Error('Funcionário não encontrado');
      if (d.data_fim < d.data_inicio) throw new Error('A data final não pode ser anterior à inicial.');
      const adm = p.papel === 'admin';
      db.avisos.push({ id: ++db.seq.aviso, funcionario_id: fu.id, funcionario_nome: fu.nome, setor: fu.subsetor,
        gestor_id: adm ? fu.gestor_id : p.id, natureza: d.natureza, data_inicio: d.data_inicio, data_fim: d.data_fim,
        observacao: d.observacao || null, status: adm ? 'aprovado' : 'pendente', motivo_recusa: null,
        criado_por: p.id, criado_por_nome: p.nome, criado_em: new Date().toISOString(), decidido_por: adm ? p.id : null, decidido_em: null });
      salvar(); return wait();
    },
    async decidirAviso(id, status, motivo) {
      admin(); const a = db.avisos.find(x => x.id === id); if (!a) throw new Error('Aviso não encontrado');
      a.status = status; a.motivo_recusa = status === 'recusado' ? (motivo || null) : null; salvar(); return wait();
    },
    async excluirAviso(id) {
      const p = exigir(); const a = db.avisos.find(x => x.id === id);
      const visivel = a && (p.papel === 'admin' || a.status === 'aprovado' || a.criado_por === p.id);
      const pode = visivel && (p.papel === 'admin' || (a.gestor_id === p.id && distinct(a.funcionario_id, p.funcionario_id)));
      if (!pode) throw new Error('Você não tem permissão para esta ação.');
      db.avisos = db.avisos.filter(x => x.id !== id); salvar(); return wait();
    },
    async criarAnalise(d) {
      const p = exigir();
      if (!CANAIS.includes(d.canal)) throw new Error('Canal inválido');
      db.analises.push({ id: ++db.seq.analise, gestor_id: p.id, gestor_nome: p.nome, ...d, criado_em: new Date().toISOString() });
      salvar(); return wait();
    },
    async excluirAnalise(id) { admin(); db.analises = db.analises.filter(a => a.id !== id); salvar(); return wait(); },
    async criarNatureza(nome) {
      admin(); nome = String(nome).trim(); if (!nome) throw new Error('Informe o nome da opção.');
      if (db.naturezas.some(n => norm(n.nome) === norm(nome))) throw new Error('Essa opção já existe.');
      db.naturezas.push({ id: ++db.seq.nat, nome, ordem: 100 }); salvar(); return wait();
    },
    async excluirNatureza(id) { admin(); db.naturezas = db.naturezas.filter(n => n.id !== id); salvar(); return wait(); },
    async criarGestor(nome, email, papel, funcionario_id) {
      admin(); email = String(email).trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('E-mail inválido');
      if (!String(nome).trim()) throw new Error('Informe o nome');
      if (db.perfis.some(p => p.email === email)) throw new Error('Já existe um perfil com este e-mail');
      const id = ++db.seq.perfil;
      if (db.contas[email] !== undefined) { db.perfis.push({ id, user_id: 'u' + id, email, nome: nome.trim(), papel, funcionario_id: funcionario_id || null }); salvar(); return { perfil_id: id, reativado: true, codigo: null }; }
      db.perfis.push({ id, user_id: null, email, nome: nome.trim(), papel, funcionario_id: funcionario_id || null });
      const cod = gerarCodigo(); db.convites.push({ perfil_id: id, hash: cod, expira: new Date(Date.now() + 7 * 864e5).toISOString() });
      salvar(); return { perfil_id: id, reativado: false, codigo: cod };
    },
    async novoCodigo(perfil_id) {
      admin(); const p = db.perfis.find(x => x.id === perfil_id);
      if (!p || p.user_id) throw new Error('Este gestor já fez o primeiro acesso');
      db.convites = db.convites.filter(c => c.perfil_id !== perfil_id);
      const cod = gerarCodigo(); db.convites.push({ perfil_id, hash: cod, expira: new Date(Date.now() + 7 * 864e5).toISOString() }); salvar(); return cod;
    },
    async excluirGestor(id) {
      const eu_ = admin(); const alvo = db.perfis.find(p => p.id === id); if (!alvo) throw new Error('Gestor não encontrado');
      if (alvo.id === eu_.id) throw new Error('Você não pode excluir o seu próprio perfil');
      if (alvo.papel === 'admin' && db.perfis.filter(p => p.papel === 'admin').length <= 1) throw new Error('Não é possível excluir o único administrador');
      db.perfis = db.perfis.filter(p => p.id !== id);
      db.funcionarios.forEach(f => { if (f.gestor_id === id) f.gestor_id = null; });
      db.avisos.forEach(a => { if (a.gestor_id === id) a.gestor_id = null; if (a.criado_por === id) a.criado_por = null; });
      db.analises.forEach(a => { if (a.gestor_id === id) a.gestor_id = null; });
      db.convites = db.convites.filter(c => c.perfil_id !== id); salvar(); return wait();
    },
    async atualizarFuncionario(id, patch) { admin(); const f = db.funcionarios.find(x => x.id === id); if (!f) throw new Error('Funcionário não encontrado'); Object.assign(f, patch); salvar(); return wait(); },
    async criarFuncionario(d) { admin(); if (!String(d.nome).trim()) throw new Error('Informe o nome'); db.funcionarios.push({ id: ++db.seq.func, matricula: '', nivel: '', gestor_nome: null, ...d, nome: d.nome.trim() }); salvar(); return wait(); },
    async excluirFuncionario(id) {
      admin(); db.funcionarios = db.funcionarios.filter(f => f.id !== id);
      db.perfis.forEach(p => { if (p.funcionario_id === id) p.funcionario_id = null; });
      db.avisos.forEach(a => { if (a.funcionario_id === id) a.funcionario_id = null; }); salvar(); return wait();
    },
    resetarDemo() { db = seed(); salvar(); sessionStorage.removeItem(SESS); },
    contasDemo: [['Administrador', 'admin@demo.com'], ['Supervisora Ana', 'ana@demo.com'], ['Supervisor Bruno', 'bruno@demo.com']]
  };
}

/* ================= camada de dados: SUPABASE ================= */
function criarApiSupabase(sb) {
  const ok = ({ error, data }) => { if (error) throw error; return data; };
  async function paginado(montar) {
    const out = []; const TAM = 1000;
    for (let i = 0; ; i += TAM) {
      const dados = ok(await montar().range(i, i + TAM - 1));
      out.push(...dados); if (dados.length < TAM) break;
    }
    return out;
  }
  async function removido(q, msg = 'Você não tem permissão para esta ação.') {
    const dados = ok(await q.select('id'));
    if (!dados || dados.length === 0) throw new Error(msg);
  }
  const COL_PERFIL = 'id,user_id,email,nome,papel,funcionario_id';
  return {
    modo: 'supabase',
    async init(onRecovery) {
      sb.auth.onAuthStateChange((evento) => { if (evento === 'PASSWORD_RECOVERY') onRecovery(); });
    },
    async sessao() { const { data } = await sb.auth.getSession(); return !!data.session; },
    async entrar(email, senha) { ok(await sb.auth.signInWithPassword({ email: String(email).trim().toLowerCase(), password: senha })); },
    async primeiroAcesso(email, senha, codigo) {
      const r = ok(await sb.auth.signUp({ email: String(email).trim().toLowerCase(), password: senha, options: { data: { codigo: String(codigo).trim() } } }));
      if (!r.session) throw new Error('O Supabase está exigindo confirmação de e-mail. Peça ao administrador para desativar "Confirm email" (veja o README).');
    },
    async sair() { await sb.auth.signOut(); },
    async esqueciSenha(email) {
      ok(await sb.auth.resetPasswordForEmail(String(email).trim().toLowerCase(), { redirectTo: location.origin + location.pathname }));
    },
    async novaSenha(senha) { ok(await sb.auth.updateUser({ password: senha })); },
    async meuPerfil() {
      const { data: s } = await sb.auth.getSession(); const uid = s.session && s.session.user.id; if (!uid) return null;
      return ok(await sb.from('perfis').select(COL_PERFIL).eq('user_id', uid).maybeSingle());
    },
    async carregarTudo() {
      const [perfis, funcionarios, naturezas, avisos, analises] = await Promise.all([
        paginado(() => sb.from('perfis').select(COL_PERFIL).order('nome')),
        paginado(() => sb.from('funcionarios').select('*').order('nome')),
        paginado(() => sb.from('naturezas').select('*').order('ordem').order('nome')),
        paginado(() => sb.from('avisos').select('*').order('data_inicio', { ascending: false }).order('id', { ascending: false })),
        paginado(() => sb.from('analises').select('*').order('data_atendimento', { ascending: false }).order('id', { ascending: false }))
      ]);
      return { perfis, funcionarios, naturezas, avisos, analises };
    },
    async criarAviso(d) { ok(await sb.from('avisos').insert({ funcionario_id: d.funcionario_id, natureza: d.natureza, data_inicio: d.data_inicio, data_fim: d.data_fim, observacao: d.observacao || null })); },
    async decidirAviso(id, status, motivo) {
      const dados = ok(await sb.from('avisos').update({ status, motivo_recusa: status === 'recusado' ? (motivo || null) : null }).eq('id', id).select('id'));
      if (!dados.length) throw new Error('Você não tem permissão para esta ação.');
    },
    async excluirAviso(id) { await removido(sb.from('avisos').delete().eq('id', id)); },
    async criarAnalise(d) { ok(await sb.from('analises').insert({ id_atendimento: d.id_atendimento, resumo: d.resumo, avaliacao: d.avaliacao, pontos_melhoria: d.pontos_melhoria, canal: d.canal, data_atendimento: d.data_atendimento })); },
    async excluirAnalise(id) { await removido(sb.from('analises').delete().eq('id', id)); },
    async criarNatureza(nome) { ok(await sb.from('naturezas').insert({ nome: String(nome).trim(), ordem: 100 })); },
    async excluirNatureza(id) { await removido(sb.from('naturezas').delete().eq('id', id)); },
    async criarGestor(nome, email, papel, funcionario_id) {
      return ok(await sb.rpc('criar_gestor', { p_nome: nome, p_email: email, p_papel: papel, p_funcionario_id: funcionario_id || null }));
    },
    async novoCodigo(perfil_id) { return ok(await sb.rpc('novo_codigo_gestor', { p_perfil_id: perfil_id })); },
    async excluirGestor(id) { ok(await sb.rpc('excluir_gestor', { p_perfil_id: id })); },
    async atualizarFuncionario(id, patch) {
      const dados = ok(await sb.from('funcionarios').update(patch).eq('id', id).select('id'));
      if (!dados.length) throw new Error('Você não tem permissão para esta ação.');
    },
    async criarFuncionario(d) { ok(await sb.from('funcionarios').insert({ nome: d.nome.trim(), cargo: d.cargo || null, subsetor: d.subsetor || null, gestor_id: d.gestor_id || null })); },
    async excluirFuncionario(id) { await removido(sb.from('funcionarios').delete().eq('id', id)); }
  };
}

/* ================= estado ================= */
let api;
const S = {
  perfil: null, perfis: [], funcionarios: [], naturezas: [], avisos: [], analises: [],
  aba: 'avisos', carregadoEm: 0, ultimoConvite: null, painelAdmin: 'gestores', buscaFunc: '',
  fAv: { gestor: '', func: '', setor: '', de: '', ate: '', encerrados: false },
  fAn: { id: '', resumo: '', avaliacao: '', pontos: '', canal: '', de: '', ate: '', gestor: '' },
  anLimite: 200
};
const ui = {};
const ehAdmin = () => !!S.perfil && S.perfil.papel === 'admin';
const byNome = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR');
const nomeGestor = id => { const p = S.perfis.find(x => x.id === id); return p ? p.nome : ''; };
const meuTime = () => S.funcionarios.filter(f => f.gestor_id === S.perfil.id);

function carregarScript(src) {
  return new Promise((ok, falha) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok;
    s.onerror = () => falha(new Error('Não foi possível carregar a biblioteca do Supabase. Verifique a internet.'));
    document.head.append(s);
  });
}

async function recarregar() {
  const d = await api.carregarTudo();
  S.perfis = d.perfis; S.funcionarios = d.funcionarios; S.naturezas = d.naturezas; S.avisos = d.avisos; S.analises = d.analises;
  S.carregadoEm = Date.now();
}
async function acao(fn, okMsg) {
  try { await fn(); if (okMsg) toast(okMsg); return true; }
  catch (e) { toast(erroAmigavel(e), true); return false; }
}
async function atualizarDepois() { await recarregar(); atualizarAvisos(); atualizarAnalises(); atualizarBadge(); }

/* ================= modal ================= */
function modal({ titulo, corpo, rodape, largo }) {
  const dlg = h('dialog', { class: largo ? 'wide' : '' },
    h('div', { class: 'dlg-head' }, h('h2', { text: titulo }), h('button', { class: 'x', type: 'button', 'aria-label': 'Fechar', onclick: () => dlg.close() }, '×')),
    h('div', { class: 'dlg-body' }, corpo),
    rodape ? h('div', { class: 'dlg-foot' }, rodape) : null);
  dlg.addEventListener('close', () => dlg.remove());
  document.body.append(dlg); dlg.showModal();
  return dlg;
}

/* ================= telas de acesso ================= */
function centro(...kids) { return h('div', { class: 'center-msg' }, ...kids); }

function demoBanner() {
  if (MODO !== 'demo') return null;
  return h('div', { class: 'demo-banner' }, 'Modo demonstração: dados fictícios, guardados só neste navegador. Para usar de verdade, preencha o config.js (veja o README).',
    h('button', { type: 'button', onclick: () => { if (confirm('Restaurar os dados de exemplo?')) { api.resetarDemo(); renderLogin(); } } }, 'Restaurar exemplos'));
}

function renderLogin(msgInicial) {
  let modo = 'entrar';
  const erro = h('div', { class: 'err hidden', role: 'alert' });
  const caixa = h('div');
  const mostrarErro = m => { erro.textContent = m; erro.classList.toggle('hidden', !m); };
  const campo = (id, rotulo, attrs = {}) => h('div', { class: 'field' }, h('label', { for: id, text: rotulo }), h('input', { id, ...attrs }));

  function formEntrar() {
    const f = h('form', { novalidate: true, onsubmit: async ev => {
      ev.preventDefault(); mostrarErro('');
      const email = $('#lg-email').value, senha = $('#lg-senha').value;
      if (!email || !senha) return mostrarErro('Informe e-mail e senha.');
      const b = $('button[type=submit]', f); b.disabled = true;
      try { await api.entrar(email, senha); await entrarNoApp(); } catch (e) { mostrarErro(erroAmigavel(e)); b.disabled = false; }
    } },
      campo('lg-email', 'E-mail', { type: 'email', autocomplete: 'username', required: true }),
      campo('lg-senha', 'Senha', { type: 'password', autocomplete: 'current-password', required: true }),
      h('button', { class: 'btn primary', type: 'submit' }, 'Entrar'),
      h('div', {}, h('button', { class: 'linkbtn', type: 'button', onclick: () => { modo = 'recuperar'; desenhar(); } }, 'Esqueci minha senha')));
    return f;
  }
  function formPrimeiro() {
    const f = h('form', { novalidate: true, onsubmit: async ev => {
      ev.preventDefault(); mostrarErro('');
      const email = $('#pa-email').value, cod = $('#pa-cod').value, s1 = $('#pa-s1').value, s2 = $('#pa-s2').value;
      if (!email || !cod || !s1) return mostrarErro('Preencha todos os campos.');
      if (s1.length < 8) return mostrarErro('A senha precisa ter pelo menos 8 caracteres.');
      if (s1 !== s2) return mostrarErro('As senhas não conferem.');
      const b = $('button[type=submit]', f); b.disabled = true;
      try { await api.primeiroAcesso(email, s1, cod); await entrarNoApp(); } catch (e) { mostrarErro(erroAmigavel(e)); b.disabled = false; }
    } },
      h('p', { class: 'hint', style: 'margin:0' }, 'Use o e-mail cadastrado pelo administrador e o código de convite que ele enviou.'),
      campo('pa-email', 'E-mail', { type: 'email', autocomplete: 'username', required: true }),
      campo('pa-cod', 'Código de convite', { type: 'text', autocomplete: 'off', placeholder: 'XXXX-XXXX-XXXX', required: true }),
      campo('pa-s1', 'Crie uma senha (mínimo 8 caracteres)', { type: 'password', autocomplete: 'new-password', required: true }),
      campo('pa-s2', 'Repita a senha', { type: 'password', autocomplete: 'new-password', required: true }),
      h('button', { class: 'btn primary', type: 'submit' }, 'Criar meu acesso'));
    return f;
  }
  function formRecuperar() {
    const f = h('form', { novalidate: true, onsubmit: async ev => {
      ev.preventDefault(); mostrarErro('');
      const email = $('#rc-email').value; if (!email) return mostrarErro('Informe o e-mail.');
      try { await api.esqueciSenha(email); toast('Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.'); modo = 'entrar'; desenhar(); }
      catch (e) { mostrarErro(erroAmigavel(e)); }
    } },
      h('p', { class: 'hint', style: 'margin:0' }, 'Enviaremos um link para você criar uma nova senha.'),
      campo('rc-email', 'E-mail', { type: 'email', autocomplete: 'username', required: true }),
      h('button', { class: 'btn primary', type: 'submit' }, 'Enviar link'),
      h('div', {}, h('button', { class: 'linkbtn', type: 'button', onclick: () => { modo = 'entrar'; desenhar(); } }, 'Voltar')));
    return f;
  }
  function desenhar() {
    mostrarErro('');
    const abas = modo === 'recuperar' ? null : h('div', { class: 'tabs2', role: 'tablist' },
      h('button', { type: 'button', role: 'tab', 'aria-selected': String(modo === 'entrar'), onclick: () => { modo = 'entrar'; desenhar(); } }, 'Entrar'),
      h('button', { type: 'button', role: 'tab', 'aria-selected': String(modo === 'primeiro'), onclick: () => { modo = 'primeiro'; desenhar(); } }, 'Primeiro acesso'));
    caixa.replaceChildren(abas, erro, modo === 'entrar' ? formEntrar() : modo === 'primeiro' ? formPrimeiro() : formRecuperar());
  }
  desenhar();
  if (msgInicial) mostrarErro(msgInicial);

  const demo = MODO === 'demo' ? h('div', { class: 'demo-box' },
    h('div', {}, 'Modo demonstração. Entre rapidamente com:'),
    api.contasDemo.map(([rot, em]) => h('button', { class: 'btn sm', type: 'button', onclick: async () => { await api.entrar(em, 'demo'); await entrarNoApp(); } }, rot)),
    h('div', { class: 'hint', style: 'margin-top:8px' }, 'Senha de todos: demo')) : null;

  $('#app').replaceChildren(h('div', { class: 'login-wrap' }, h('div', { class: 'login' },
    h('div', { class: 'brand' }, h('span', { class: 'logo' }, 'CS'), 'Gestão CS'),
    h('p', { class: 'sub' }, 'Quadro de avisos e análise de atendimentos'), caixa, demo)));
}

function renderNovaSenha() {
  const erro = h('div', { class: 'err hidden', role: 'alert' });
  const f = h('form', { novalidate: true, class: '', style: 'display:flex;flex-direction:column;gap:13px', onsubmit: async ev => {
    ev.preventDefault();
    const s1 = $('#ns1').value, s2 = $('#ns2').value;
    const m = s1.length < 8 ? 'A senha precisa ter pelo menos 8 caracteres.' : s1 !== s2 ? 'As senhas não conferem.' : '';
    erro.textContent = m; erro.classList.toggle('hidden', !m); if (m) return;
    try { await api.novaSenha(s1); toast('Senha atualizada.'); history.replaceState(null, '', location.pathname); await entrarNoApp(); }
    catch (e) { erro.textContent = erroAmigavel(e); erro.classList.remove('hidden'); }
  } },
    h('div', { class: 'field' }, h('label', { for: 'ns1', text: 'Nova senha (mínimo 8 caracteres)' }), h('input', { id: 'ns1', type: 'password', autocomplete: 'new-password' })),
    h('div', { class: 'field' }, h('label', { for: 'ns2', text: 'Repita a nova senha' }), h('input', { id: 'ns2', type: 'password', autocomplete: 'new-password' })),
    erro, h('button', { class: 'btn primary', type: 'submit' }, 'Salvar nova senha'));
  $('#app').replaceChildren(h('div', { class: 'login-wrap' }, h('div', { class: 'login' },
    h('div', { class: 'brand' }, h('span', { class: 'logo' }, 'CS'), 'Gestão CS'), h('p', { class: 'sub' }, 'Crie uma nova senha'), f)));
}

function renderSemAcesso() {
  $('#app').replaceChildren(centro(h('h2', { text: 'Sem acesso' }),
    h('p', { text: 'Seu login existe, mas ainda não está liberado no Gestão CS. Peça ao administrador para cadastrar o seu e-mail.' }),
    h('button', { class: 'btn', type: 'button', onclick: sair }, 'Sair')));
}

/* ================= entrada e saída ================= */
let timer = null;
async function entrarNoApp() {
  $('#app').replaceChildren(centro(h('span', { class: 'spinner' }), ' Carregando...'));
  try { S.perfil = await api.meuPerfil(); }
  catch (e) { $('#app').replaceChildren(centro(h('h2', { text: 'Não foi possível entrar' }), h('p', { text: erroAmigavel(e) }), h('button', { class: 'btn', onclick: sair }, 'Voltar'))); return; }
  if (!S.perfil) { renderSemAcesso(); return; }
  try { await recarregar(); }
  catch (e) { $('#app').replaceChildren(centro(h('h2', { text: 'Erro ao carregar os dados' }), h('p', { text: erroAmigavel(e) }), h('button', { class: 'btn', onclick: () => entrarNoApp() }, 'Tentar de novo'))); return; }
  S.aba = 'avisos'; render();
  clearInterval(timer); timer = setInterval(silencioso, POLL_MS);
}
async function silencioso() {
  if (!S.perfil || document.visibilityState !== 'visible' || document.querySelector('dialog[open]')) return;
  try { await recarregar(); atualizarAvisos(); atualizarAnalises(); atualizarBadge(); } catch { /* tenta de novo no próximo ciclo */ }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.perfil && Date.now() - S.carregadoEm > POLL_MS) silencioso(); });

async function sair() {
  clearInterval(timer); await api.sair();
  Object.assign(S, { perfil: null, perfis: [], funcionarios: [], naturezas: [], avisos: [], analises: [], aba: 'avisos', anLimite: 200, ultimoConvite: null, buscaFunc: '',
    fAv: { gestor: '', func: '', setor: '', de: '', ate: '', encerrados: false },
    fAn: { id: '', resumo: '', avaliacao: '', pontos: '', canal: '', de: '', ate: '', gestor: '' } });
  renderLogin();
}

/* ================= estrutura principal ================= */
function render() {
  $('#app').replaceChildren(demoBanner(), cabecalho(), h('main', {}, S.aba === 'avisos' ? viewAvisos() : viewAnalises()));
  atualizarAvisos(); atualizarAnalises();
}
function pendentesN() { return ehAdmin() ? S.avisos.filter(a => a.status === 'pendente').length : 0; }
function atualizarBadge() {
  if (!ui.badge) return; const n = pendentesN();
  ui.badge.textContent = n; ui.badge.classList.toggle('hidden', n === 0);
}
function cabecalho() {
  const p = S.perfil;
  ui.badge = h('span', { class: 'badge-n hidden', title: 'Avisos aguardando aprovação' });
  const aba = (id, rotulo, extra) => h('button', { class: 'tab', role: 'tab', id: 'tab-' + id, 'aria-selected': String(S.aba === id), onclick: () => { S.aba = id; render(); } }, rotulo, extra || null);
  const head = h('header', { class: 'topbar' }, h('div', { class: 'topbar-in' },
    h('div', { class: 'brand' }, h('span', { class: 'logo' }, 'CS'), 'Gestão CS'),
    h('nav', { class: 'tabs', role: 'tablist' }, aba('avisos', 'Quadro de avisos', ehAdmin() ? ui.badge : null), aba('analises', 'Análise de atendimentos')),
    h('div', { class: 'user' },
      ehAdmin() ? h('button', { class: 'btn sm ghost-light', id: 'btn-admin', onclick: () => abrirAdmin() }, 'Administração') : null,
      h('div', { class: 'who' }, p.nome, h('small', {}, p.papel === 'admin' ? 'Administrador' : 'Supervisor')),
      h('button', { class: 'btn sm ghost-light', id: 'btn-sair', onclick: sair }, 'Sair'))));
  atualizarBadge();
  return head;
}

/* ================= QUADRO DE AVISOS ================= */
function funcionariosPermitidos() {
  const p = S.perfil;
  if (p.papel === 'admin') return S.funcionarios.slice().sort(byNome);
  return S.funcionarios.filter(f => f.gestor_id === p.id || f.id === p.funcionario_id).sort(byNome);
}
function podeExcluirAviso(a) {
  const p = S.perfil; if (p.papel === 'admin') return true;
  return a.gestor_id === p.id && distinct(a.funcionario_id, p.funcionario_id);
}

function viewAvisos() {
  const f = S.fAv;
  const setores = [...new Set(S.funcionarios.map(x => x.subsetor).filter(Boolean).concat(S.avisos.map(a => a.setor).filter(Boolean)))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const selGestor = h('select', { id: 'fav-gestor', onchange: e => { f.gestor = e.target.value; atualizarAvisos(); } },
    h('option', { value: '' }, 'Todos'), S.perfis.slice().sort(byNome).map(p => h('option', { value: String(p.id) }, p.nome)), h('option', { value: 'none' }, 'Sem gestor definido'));
  selGestor.value = f.gestor;
  const selSetor = h('select', { id: 'fav-setor', onchange: e => { f.setor = e.target.value; atualizarAvisos(); } },
    h('option', { value: '' }, 'Todos'), setores.map(s => h('option', { value: s }, s)));
  selSetor.value = f.setor;
  const limpar = () => { Object.assign(f, { gestor: '', func: '', setor: '', de: '', ate: '', encerrados: false }); render(); };

  ui.pend = h('div', { id: 'avisos-pend' });
  ui.lista = h('div', { id: 'avisos-lista' });
  return h('div', {},
    h('div', { class: 'page-head' },
      h('div', {}, h('h1', { text: 'Quadro de avisos' }), h('p', { text: ehAdmin() ? 'Aprove os avisos enviados pelos supervisores e acompanhe a rotina do setor.' : 'Ausências, férias, atestados e outras informações que afetam a rotina do setor.' })),
      h('button', { class: 'btn primary', id: 'btn-novo-aviso', onclick: abrirNovoAviso }, '+ Novo aviso')),
    ui.pend,
    h('div', { class: 'card panel' },
      h('div', { class: 'filters' },
        h('div', { class: 'field' }, h('label', { for: 'fav-gestor', text: 'Gestor' }), selGestor),
        h('div', { class: 'field' }, h('label', { for: 'fav-func', text: 'Funcionário' }),
          h('input', { id: 'fav-func', type: 'search', list: 'dl-func', placeholder: 'Digite o nome', autocomplete: 'off', value: f.func, oninput: e => { f.func = e.target.value; atualizarAvisos(); } }),
          h('datalist', { id: 'dl-func' }, S.funcionarios.slice().sort(byNome).map(x => h('option', { value: x.nome })))),
        h('div', { class: 'field' }, h('label', { for: 'fav-setor', text: 'Setor' }), selSetor),
        h('div', { class: 'field' }, h('label', { for: 'fav-de', text: 'Data (de)' }), h('input', { id: 'fav-de', type: 'date', value: f.de, onchange: e => { f.de = e.target.value; atualizarAvisos(); } })),
        h('div', { class: 'field' }, h('label', { for: 'fav-ate', text: 'Data (até)' }), h('input', { id: 'fav-ate', type: 'date', value: f.ate, onchange: e => { f.ate = e.target.value; atualizarAvisos(); } }))),
      h('div', { class: 'filters-foot' },
        h('label', { class: 'check' }, h('input', { id: 'fav-enc', type: 'checkbox', checked: f.encerrados, onchange: e => { f.encerrados = e.target.checked; atualizarAvisos(); } }), 'Incluir avisos já encerrados'),
        h('span', { class: 'hint' }, 'Com só a primeira data preenchida, mostra os avisos daquele dia.'),
        h('button', { class: 'linkbtn', type: 'button', onclick: limpar }, 'Limpar filtros'))),
    ui.lista);
}

function passaFiltroAviso(a, f) {
  if (f.gestor) { if (f.gestor === 'none') { if (a.gestor_id != null) return false; } else if (String(a.gestor_id) !== f.gestor) return false; }
  if (f.func && !norm(a.funcionario_nome).includes(norm(f.func))) return false;
  if (f.setor && (a.setor || '') !== f.setor) return false;
  if (f.de || f.ate) {
    const ini = f.de || '0000-01-01', fim = f.ate || f.de;
    if (!(a.data_inicio <= fim && a.data_fim >= ini)) return false;
  }
  return true;
}

function cardAviso(a, { decidir = false } = {}) {
  const cor = corNatureza(a.natureza);
  const gestor = nomeGestor(a.gestor_id) || 'Sem gestor definido';
  const unico = a.data_inicio === a.data_fim;
  const quando = unico ? `${diaSemana(a.data_inicio)}, ${fmtData(a.data_inicio)}` : `${fmtCurta(a.data_inicio)} a ${fmtData(a.data_fim)}`;
  const acoes = [];
  if (decidir) {
    acoes.push(h('button', { class: 'btn sm ok', 'data-acao': 'aprovar', onclick: () => acao(async () => { await api.decidirAviso(a.id, 'aprovado'); await atualizarDepois(); }, 'Aviso aprovado e publicado.') }, 'Aprovar'));
    acoes.push(h('button', { class: 'btn sm danger', 'data-acao': 'recusar', onclick: () => {
      const motivo = prompt('Motivo da recusa (opcional). O supervisor poderá ver:'); if (motivo === null) return;
      acao(async () => { await api.decidirAviso(a.id, 'recusado', motivo.trim()); await atualizarDepois(); }, 'Aviso recusado.');
    } }, 'Recusar'));
  }
  if (podeExcluirAviso(a)) acoes.push(h('button', { class: 'btn sm danger', 'data-acao': 'excluir', onclick: () => {
    if (!confirm(`Excluir o aviso de ${a.funcionario_nome} (${a.natureza}, ${quando})?`)) return;
    acao(async () => { await api.excluirAviso(a.id); await atualizarDepois(); }, 'Aviso excluído.');
  } }, 'Excluir'));
  return h('article', { class: 'aviso' + (a.status === 'pendente' ? ' pend' : ''), style: `--cor:${cor}`, 'data-id': a.id },
    h('div', { class: 'topo' }, h('h3', { text: a.funcionario_nome }), h('span', { class: 'tag', text: a.natureza })),
    h('div', { class: 'meta' }, [a.setor, 'Gestor: ' + gestor].filter(Boolean).join(' · ')),
    h('div', { class: 'when' }, h('span', { text: quando }), unico ? null : h('small', { text: `${diasEntre(a.data_inicio, a.data_fim)} dias` }),
      a.status !== 'aprovado' ? h('span', { class: 'chip ' + a.status, text: a.status === 'pendente' ? 'Aguardando aprovação' : 'Recusado' }) : null),
    a.observacao ? h('div', { class: 'obs', text: a.observacao }) : null,
    a.status === 'recusado' && a.motivo_recusa ? h('div', { class: 'motivo', text: 'Motivo: ' + a.motivo_recusa }) : null,
    h('div', { class: 'foot' }, h('span', { text: `Enviado por ${a.criado_por_nome || '—'} em ${fmtDataHora(a.criado_em)}` }), acoes.length ? h('span', { class: 'acoes' }, acoes) : null));
}
function secao(titulo, n, cls = '') { return h('div', { class: 'section ' + cls }, h('h2', { text: titulo }), h('span', { class: 'count', text: n })); }

function atualizarAvisos() {
  if (!ui.lista || !ui.pend || !document.body.contains(ui.lista)) return;
  const f = S.fAv, hoje = hojeISO();
  /* pendências / meus envios (não dependem dos filtros) */
  const pend = [];
  if (ehAdmin()) {
    const pe = S.avisos.filter(a => a.status === 'pendente').sort((a, b) => a.criado_em.localeCompare(b.criado_em));
    const rec = S.avisos.filter(a => a.status === 'recusado');
    if (pe.length) pend.push(secao('Aguardando a sua aprovação', pe.length, 'warn'), h('div', { class: 'grid', id: 'grid-pend' }, pe.map(a => cardAviso(a, { decidir: true }))));
    if (rec.length) pend.push(h('details', { style: 'margin-top:14px' }, h('summary', { text: `Avisos recusados (${rec.length})` }), h('div', { class: 'grid', style: 'margin-top:10px' }, rec.map(a => cardAviso(a)))));
  } else {
    const meus = S.avisos.filter(a => a.criado_por === S.perfil.id && a.status !== 'aprovado').sort((a, b) => b.criado_em.localeCompare(a.criado_em));
    if (meus.length) pend.push(secao('Meus envios em análise ou recusados', meus.length, 'warn'), h('div', { class: 'grid', id: 'grid-meus' }, meus.map(a => cardAviso(a))));
  }
  ui.pend.replaceChildren(...pend);

  /* quadro geral: só aprovados */
  const base = S.avisos.filter(a => a.status === 'aprovado' && passaFiltroAviso(a, f));
  const blocos = [];
  const lista = arr => h('div', { class: 'grid' }, arr.map(a => cardAviso(a)));
  if (f.de || f.ate) {
    const arr = base.slice().sort((a, b) => a.data_inicio.localeCompare(b.data_inicio) || a.funcionario_nome.localeCompare(b.funcionario_nome, 'pt-BR'));
    blocos.push(secao('Resultado do filtro', arr.length), arr.length ? lista(arr) : h('div', { class: 'empty', text: 'Nenhum aviso nesse período com os filtros escolhidos.' }));
  } else {
    const vig = base.filter(a => a.data_inicio <= hoje && a.data_fim >= hoje).sort((a, b) => a.data_fim.localeCompare(b.data_fim) || a.funcionario_nome.localeCompare(b.funcionario_nome, 'pt-BR'));
    const prox = base.filter(a => a.data_inicio > hoje).sort((a, b) => a.data_inicio.localeCompare(b.data_inicio));
    const enc = base.filter(a => a.data_fim < hoje).sort((a, b) => b.data_fim.localeCompare(a.data_fim));
    blocos.push(secao('Hoje', vig.length), vig.length ? lista(vig) : h('div', { class: 'empty', text: 'Nenhum aviso vigente hoje.' }));
    blocos.push(secao('Próximos dias', prox.length), prox.length ? lista(prox) : h('div', { class: 'empty', text: 'Nenhum aviso para os próximos dias.' }));
    if (f.encerrados) blocos.push(secao('Encerrados', enc.length), enc.length ? lista(enc) : h('div', { class: 'empty', text: 'Nenhum aviso encerrado.' }));
  }
  ui.lista.replaceChildren(...blocos);
}

function abrirNovoAviso() {
  const permitidos = funcionariosPermitidos();
  const p = S.perfil;
  if (!permitidos.length) { toast('Você ainda não tem funcionários no seu time. Peça ao administrador para vinculá-los.', true); return; }
  const rot = f => (p.papel !== 'admin' && f.id === p.funcionario_id) ? `${f.nome} (eu)` : f.nome;
  let opts;
  if (p.papel === 'admin') {
    const grupos = {}; permitidos.forEach(f => (grupos[f.subsetor || 'Sem setor'] ||= []).push(f));
    opts = Object.keys(grupos).sort((a, b) => a.localeCompare(b, 'pt-BR')).map(g => h('optgroup', { label: g }, grupos[g].map(f => h('option', { value: f.id }, rot(f)))));
  } else {
    const ordenados = permitidos.slice().sort((a, b) => (b.id === p.funcionario_id) - (a.id === p.funcionario_id) || a.nome.localeCompare(b.nome, 'pt-BR'));
    opts = ordenados.map(f => h('option', { value: f.id }, rot(f)));
  }
  const selFunc = h('select', { id: 'na-func', required: true }, h('option', { value: '' }, 'Selecione...'), opts);
  const selNat = h('select', { id: 'na-nat', required: true }, h('option', { value: '' }, 'Selecione...'), S.naturezas.slice().sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR')).map(n => h('option', { value: n.nome }, n.nome)));
  const hoje = hojeISO();
  const dIni = h('input', { id: 'na-ini', type: 'date', required: true, value: hoje });
  const dFim = h('input', { id: 'na-fim', type: 'date', value: hoje });
  const boxFim = h('div', { class: 'field hidden', id: 'na-fim-box' }, h('label', { for: 'na-fim', text: 'Data final' }), dFim);
  const lblIni = h('label', { for: 'na-ini', text: 'Data' });
  const radio = (v, rot_, marcado) => h('label', {}, h('input', { type: 'radio', name: 'na-tipo', value: v, checked: marcado, onchange: () => {
    const multi = v === 'multi'; boxFim.classList.toggle('hidden', !multi); lblIni.textContent = multi ? 'Data inicial' : 'Data';
    dFim.required = multi; if (multi && dFim.value < dIni.value) dFim.value = dIni.value;
  } }), rot_);
  const obs = h('textarea', { id: 'na-obs', maxlength: '1000', placeholder: 'Opcional: detalhes que o time precisa saber (horário de saída, retorno, cobertura...)' });
  const erro = h('div', { class: 'err hidden', role: 'alert' });
  const adm = ehAdmin();
  const form = h('form', { id: 'form-aviso', novalidate: true, onsubmit: async ev => {
    ev.preventDefault(); erro.classList.add('hidden');
    const multi = $('input[name=na-tipo]:checked', form).value === 'multi';
    const d = { funcionario_id: Number(selFunc.value), natureza: selNat.value, data_inicio: dIni.value, data_fim: multi ? dFim.value : dIni.value, observacao: obs.value.trim() };
    const m = !selFunc.value ? 'Escolha o funcionário.' : !d.natureza ? 'Escolha a natureza do aviso.' : !d.data_inicio ? 'Informe a data.' : !d.data_fim ? 'Informe a data final.' : d.data_fim < d.data_inicio ? 'A data final não pode ser anterior à inicial.' : '';
    if (m) { erro.textContent = m; erro.classList.remove('hidden'); return; }
    const btn = $('#na-enviar'); btn.disabled = true;
    const ok = await acao(async () => { await api.criarAviso(d); await atualizarDepois(); }, adm ? 'Aviso publicado no quadro.' : 'Aviso enviado para a aprovação do administrador.');
    if (ok) dlg.close(); else btn.disabled = false;
  } },
    h('div', { class: 'form-grid' },
      h('div', { class: 'field span-all' }, h('label', { for: 'na-func', text: 'Funcionário' }), selFunc,
        adm ? null : h('small', { text: 'Você pode criar avisos para o seu time e para você mesmo.' })),
      h('div', { class: 'field' }, h('label', { for: 'na-nat', text: 'Natureza do aviso' }), selNat),
      h('div', { class: 'field' }, h('label', { text: 'Período' }), h('div', { class: 'seg', role: 'radiogroup' }, radio('uno', 'Um único dia', true), radio('multi', 'Mais de um dia', false))),
      h('div', { class: 'field' }, lblIni, dIni), boxFim,
      h('div', { class: 'field span-all' }, h('label', { for: 'na-obs', text: 'Observações' }), obs, h('small', { text: 'Não registre diagnóstico, CID ou outros dados de saúde. Informe apenas o que o time precisa saber para se organizar.' })), erro));
  const dlg = modal({ titulo: 'Novo aviso', corpo: form,
    rodape: [h('button', { class: 'btn', type: 'button', onclick: () => dlg.close() }, 'Cancelar'), h('button', { class: 'btn primary', id: 'na-enviar', type: 'submit', form: 'form-aviso' }, adm ? 'Publicar aviso' : 'Enviar para aprovação')] });
}

/* ================= ANÁLISE DE ATENDIMENTOS ================= */
function viewAnalises() {
  const f = S.fAn, adm = ehAdmin();
  const campo = (id, rot, el, extra = '') => h('div', { class: 'field ' + extra }, h('label', { for: id, text: rot }), el);
  const selCanal = h('select', { id: 'an-canal', required: true }, h('option', { value: '' }, 'Selecione...'), CANAIS.map(c => h('option', { value: c }, c)));
  const iId = h('input', { id: 'an-id', type: 'text', maxlength: '120', required: true, autocomplete: 'off' });
  const iData = h('input', { id: 'an-data', type: 'date', required: true, value: hojeISO() });
  const tResumo = h('textarea', { id: 'an-resumo', required: true, maxlength: '4000' });
  const tAval = h('textarea', { id: 'an-aval', required: true, maxlength: '4000' });
  const tMelhoria = h('textarea', { id: 'an-melhoria', required: true, maxlength: '4000' });
  const erro = h('div', { class: 'err hidden', role: 'alert' });
  const form = h('form', { id: 'form-analise', novalidate: true, onsubmit: async ev => {
    ev.preventDefault(); erro.classList.add('hidden');
    const d = { id_atendimento: iId.value.trim(), resumo: tResumo.value.trim(), avaliacao: tAval.value.trim(), pontos_melhoria: tMelhoria.value.trim(), canal: selCanal.value, data_atendimento: iData.value };
    const faltando = [['ID do atendimento', d.id_atendimento], ['Resumo do atendimento', d.resumo], ['Avaliação do atendimento', d.avaliacao], ['Pontos de melhoria', d.pontos_melhoria], ['Canal do atendimento', d.canal], ['Data do atendimento', d.data_atendimento]].filter(x => !x[1]).map(x => x[0]);
    if (faltando.length) { erro.textContent = 'Preencha: ' + faltando.join(', ') + '.'; erro.classList.remove('hidden'); return; }
    const b = $('#an-enviar'); b.disabled = true;
    const ok = await acao(async () => { await api.criarAnalise(d); await atualizarDepois(); }, 'Atendimento registrado.');
    b.disabled = false;
    if (ok) { iId.value = ''; tResumo.value = ''; tAval.value = ''; tMelhoria.value = ''; selCanal.value = ''; iId.focus(); }
  } },
    h('div', { class: 'form-grid' },
      campo('an-id', 'ID do atendimento', iId), campo('an-canal', 'Canal do atendimento', selCanal), campo('an-data', 'Data do atendimento', iData),
      campo('an-resumo', 'Resumo do atendimento', tResumo, 'span-all'),
      campo('an-aval', 'Avaliação do atendimento', tAval), campo('an-melhoria', 'Pontos de melhoria', tMelhoria)),
    erro, h('div', { class: 'right' }, h('button', { class: 'btn primary', id: 'an-enviar', type: 'submit' }, 'Registrar atendimento')));

  const txt = (id, rot, chave) => h('div', { class: 'field' }, h('label', { for: id, text: rot }), h('input', { id, type: 'search', value: f[chave], autocomplete: 'off', oninput: e => { f[chave] = e.target.value; S.anLimite = 200; atualizarAnalises(); } }));
  const fCanal = h('select', { id: 'fan-canal', onchange: e => { f.canal = e.target.value; S.anLimite = 200; atualizarAnalises(); } }, h('option', { value: '' }, 'Todos'), CANAIS.map(c => h('option', { value: c }, c)));
  fCanal.value = f.canal;
  const fGestor = adm ? (() => { const s = h('select', { id: 'fan-gestor', onchange: e => { f.gestor = e.target.value; S.anLimite = 200; atualizarAnalises(); } }, h('option', { value: '' }, 'Todos'), S.perfis.slice().sort(byNome).map(p => h('option', { value: String(p.id) }, p.nome))); s.value = f.gestor; return h('div', { class: 'field' }, h('label', { for: 'fan-gestor', text: 'Gestor' }), s); })() : null;
  ui.anLista = h('div', { id: 'analises-lista' });
  return h('div', {},
    h('div', { class: 'page-head' }, h('div', {}, h('h1', { text: 'Análise de atendimentos' }),
      h('p', { text: adm ? 'Atendimentos avaliados diariamente pelos gestores. Somente você pode excluir registros.' : 'Registre diariamente os atendimentos que você avaliou no seu time. Os registros não podem ser apagados por você.' }))),
    h('div', { class: 'card panel' }, h('h2', { style: 'font-size:17px;margin-bottom:12px', text: 'Registrar atendimento avaliado' }), form),
    h('div', { class: 'card panel' },
      h('div', { class: 'filters' }, txt('fan-id', 'ID do atendimento', 'id'), txt('fan-resumo', 'Resumo', 'resumo'), txt('fan-aval', 'Avaliação', 'avaliacao'), txt('fan-mel', 'Pontos de melhoria', 'pontos'),
        h('div', { class: 'field' }, h('label', { for: 'fan-canal', text: 'Canal' }), fCanal),
        h('div', { class: 'field' }, h('label', { for: 'fan-de', text: 'Data (de)' }), h('input', { id: 'fan-de', type: 'date', value: f.de, onchange: e => { f.de = e.target.value; S.anLimite = 200; atualizarAnalises(); } })),
        h('div', { class: 'field' }, h('label', { for: 'fan-ate', text: 'Data (até)' }), h('input', { id: 'fan-ate', type: 'date', value: f.ate, onchange: e => { f.ate = e.target.value; S.anLimite = 200; atualizarAnalises(); } })),
        fGestor),
      h('div', { class: 'filters-foot' }, h('button', { class: 'linkbtn', type: 'button', onclick: () => { Object.assign(f, { id: '', resumo: '', avaliacao: '', pontos: '', canal: '', de: '', ate: '', gestor: '' }); S.anLimite = 200; render(); } }, 'Limpar filtros'))),
    ui.anLista);
}

function atualizarAnalises() {
  if (!ui.anLista || !document.body.contains(ui.anLista)) return;
  const f = S.fAn, adm = ehAdmin();
  const contem = (campo, termo) => !termo || norm(campo).includes(norm(termo));
  const arr = S.analises.filter(a => contem(a.id_atendimento, f.id) && contem(a.resumo, f.resumo) && contem(a.avaliacao, f.avaliacao) && contem(a.pontos_melhoria, f.pontos)
    && (!f.canal || a.canal === f.canal) && (!f.gestor || String(a.gestor_id) === f.gestor)
    && (!f.de || a.data_atendimento >= f.de) && (!f.ate || a.data_atendimento <= f.ate))
    .sort((a, b) => b.data_atendimento.localeCompare(a.data_atendimento) || b.id - a.id);
  const vis = arr.slice(0, S.anLimite);
  const cab = ['Data', 'ID', 'Canal', adm ? 'Gestor' : null, 'Resumo', 'Avaliação', 'Pontos de melhoria', adm ? '' : null].filter(x => x !== null);
  const linhas = vis.map(a => h('tr', { 'data-id': a.id },
    h('td', { class: 'nowrap', text: fmtData(a.data_atendimento) }), h('td', { class: 'nowrap', text: a.id_atendimento }), h('td', {}, h('span', { class: 'canal', text: a.canal })),
    adm ? h('td', { text: a.gestor_nome || nomeGestor(a.gestor_id) || '—' }) : null,
    h('td', { class: 'cell-long', text: a.resumo }), h('td', { class: 'cell-long', text: a.avaliacao }), h('td', { class: 'cell-long', text: a.pontos_melhoria }),
    adm ? h('td', {}, h('button', { class: 'btn sm danger', 'data-acao': 'excluir-analise', onclick: () => {
      if (!confirm(`Excluir o registro do atendimento ${a.id_atendimento}? Esta ação não pode ser desfeita.`)) return;
      acao(async () => { await api.excluirAnalise(a.id); await atualizarDepois(); }, 'Registro excluído.');
    } }, 'Excluir')) : null));
  ui.anLista.replaceChildren(
    h('p', { class: 'meta-line', id: 'an-total', text: `${arr.length} ${arr.length === 1 ? 'registro' : 'registros'}${arr.length !== S.analises.length ? ` (de ${S.analises.length})` : ''}` }),
    arr.length ? h('div', { class: 'table-wrap' }, h('table', {}, h('thead', {}, h('tr', {}, cab.map(c => h('th', { text: c })))), h('tbody', {}, linhas)))
      : h('div', { class: 'empty', text: S.analises.length ? 'Nenhum registro com esses filtros.' : 'Nenhum atendimento registrado ainda.' }),
    arr.length > vis.length ? h('div', { class: 'right' }, h('button', { class: 'btn', onclick: () => { S.anLimite += 200; atualizarAnalises(); } }, `Mostrar mais (${arr.length - vis.length})`)) : null);
}

/* ================= ADMINISTRAÇÃO ================= */
let dlgAdmin = null, corpoAdmin = null;
function abrirAdmin(aba) {
  if (aba) S.painelAdmin = aba;
  corpoAdmin = h('div');
  dlgAdmin = modal({ titulo: 'Administração', corpo: corpoAdmin, largo: true });
  dlgAdmin.addEventListener('close', () => { dlgAdmin = null; corpoAdmin = null; S.ultimoConvite = null; render(); });
  desenharAdmin();
}
function desenharAdmin() {
  if (!corpoAdmin) return;
  const sub = (id, rot) => h('button', { class: 'subtab', role: 'tab', id: 'sub-' + id, 'aria-selected': String(S.painelAdmin === id), onclick: () => { S.painelAdmin = id; desenharAdmin(); } }, rot);
  corpoAdmin.replaceChildren(h('div', { class: 'subtabs', role: 'tablist' }, sub('gestores', 'Gestores'), sub('naturezas', 'Natureza dos avisos'), sub('funcionarios', 'Funcionários')),
    S.painelAdmin === 'gestores' ? painelGestores() : S.painelAdmin === 'naturezas' ? painelNaturezas() : painelFuncionarios());
}
async function adminAcao(fn, msg) { const ok = await acao(fn, msg); if (ok) { await recarregar(); desenharAdmin(); } return ok; }

function mensagemConvite(c) {
  const url = location.origin + location.pathname;
  return `Olá, ${c.nome.split(' ')[0]}! Seu acesso ao Gestão CS foi criado.\nSite: ${url}\nE-mail: ${c.email}\nCódigo de primeiro acesso: ${fmtCodigo(c.codigo)} (vale por 7 dias)\nNo site, abra a aba "Primeiro acesso", informe o e-mail e o código e crie a sua senha.`;
}
function caixaConvite(c) {
  if (!c) return null;
  if (c.reativado) return h('div', { class: 'invite', id: 'invite-box' }, h('strong', { text: `Acesso de ${c.nome} reativado.` }), h('div', { class: 'hint', text: 'Essa pessoa já tinha login. Ela entra com o e-mail e a senha que já usava (se esqueceu, use "Esqueci minha senha").' }));
  return h('div', { class: 'invite', id: 'invite-box' },
    h('strong', { text: `Convite para ${c.nome}` }), h('br'), h('code', { id: 'invite-code', text: fmtCodigo(c.codigo) }),
    h('button', { class: 'btn sm', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(mensagemConvite(c)); toast('Mensagem copiada.'); } catch { prompt('Copie a mensagem:', mensagemConvite(c)); } } }, 'Copiar mensagem pronta'),
    h('div', { class: 'hint', text: 'Envie o endereço do site, o e-mail cadastrado e este código ao gestor. Ele vale 7 dias e só pode ser usado uma vez. Este código não aparece de novo: se perder, gere um novo.' }));
}

function painelGestores() {
  const nome = h('input', { id: 'g-nome', type: 'text', placeholder: 'Nome completo', required: true });
  const email = h('input', { id: 'g-email', type: 'email', placeholder: 'nome.sobrenome@empresa.com.br', required: true });
  const papel = h('select', { id: 'g-papel' }, h('option', { value: 'supervisor' }, 'Supervisor'), h('option', { value: 'admin' }, 'Administrador'));
  const func = h('select', { id: 'g-func' }, h('option', { value: '' }, 'Nenhum / não está na lista'), S.funcionarios.slice().sort(byNome).map(f => h('option', { value: f.id }, `${f.nome}${f.subsetor ? ' · ' + f.subsetor : ''}`)));
  const form = h('form', { novalidate: true, id: 'form-gestor', onsubmit: async ev => {
    ev.preventDefault();
    if (!nome.value.trim() || !email.value.trim()) return toast('Informe nome e e-mail.', true);
    let res = null;
    const ok = await acao(async () => { res = await api.criarGestor(nome.value.trim(), email.value.trim(), papel.value, func.value ? Number(func.value) : null); }, null);
    if (ok) { S.ultimoConvite = { nome: nome.value.trim(), email: email.value.trim().toLowerCase(), codigo: res.codigo, reativado: res.reativado }; await recarregar(); desenharAdmin(); }
  } },
    h('div', { class: 'form-grid' }, h('div', { class: 'field' }, h('label', { for: 'g-nome', text: 'Nome' }), nome), h('div', { class: 'field' }, h('label', { for: 'g-email', text: 'E-mail corporativo' }), email),
      h('div', { class: 'field' }, h('label', { for: 'g-papel', text: 'Perfil' }), papel), h('div', { class: 'field' }, h('label', { for: 'g-func', text: 'Este gestor na lista de funcionários' }), func, h('small', { text: 'Permite que ele crie avisos sobre si mesmo.' }))),
    h('div', { class: 'right' }, h('button', { class: 'btn primary', type: 'submit', id: 'g-criar' }, 'Criar acesso')));

  const linhas = S.perfis.slice().sort(byNome).map(p => {
    const eu = p.id === S.perfil.id;
    return h('tr', { 'data-perfil': p.id },
      h('td', {}, p.nome, eu ? h('span', { class: 'pill', style: 'margin-left:6px', text: 'você' }) : null), h('td', { text: p.email }),
      h('td', { text: p.papel === 'admin' ? 'Administrador' : 'Supervisor' }),
      h('td', {}, p.user_id ? h('span', { class: 'chip aprovado', text: 'Ativo' }) : h('span', { class: 'chip pendente', text: 'Aguardando primeiro acesso' })),
      h('td', { text: S.funcionarios.filter(f => f.gestor_id === p.id).length }),
      h('td', {}, h('span', { class: 'acoes', style: 'display:flex;gap:6px;flex-wrap:wrap' },
        !p.user_id ? h('button', { class: 'btn sm', 'data-acao': 'novo-codigo', onclick: async () => { let cod; const ok = await acao(async () => { cod = await api.novoCodigo(p.id); }); if (ok) { S.ultimoConvite = { nome: p.nome, email: p.email, codigo: cod, reativado: false }; desenharAdmin(); } } }, 'Novo código') : null,
        h('button', { class: 'btn sm danger', 'data-acao': 'excluir-gestor', disabled: eu, title: eu ? 'Você não pode excluir o seu próprio perfil' : '', onclick: () => {
          if (!confirm(`Excluir o perfil de ${p.nome}? Ele perde o acesso ao site. Os funcionários do time ficam sem gestor até você reatribuir.`)) return;
          adminAcao(() => api.excluirGestor(p.id), 'Perfil excluído.');
        } }, 'Excluir'))));
  });
  return h('div', {},
    caixaConvite(S.ultimoConvite),
    h('h3', { style: 'margin:6px 0 10px', text: 'Adicionar gestor' }), form,
    h('h3', { style: 'margin:22px 0 10px', text: `Gestores com acesso (${S.perfis.length})` }),
    h('div', { class: 'table-wrap' }, h('table', { class: 'mini-table' }, h('thead', {}, h('tr', {}, ['Nome', 'E-mail', 'Perfil', 'Situação', 'Time', ''].map(c => h('th', { text: c })))), h('tbody', {}, linhas))));
}

function painelNaturezas() {
  const nome = h('input', { id: 'nat-nome', type: 'text', placeholder: 'Ex.: Licença médica', maxlength: '60' });
  const form = h('form', { novalidate: true, id: 'form-nat', style: 'display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin-bottom:14px', onsubmit: ev => {
    ev.preventDefault(); if (!nome.value.trim()) return toast('Digite o nome da nova opção.', true);
    adminAcao(() => api.criarNatureza(nome.value), 'Opção adicionada.');
  } }, h('div', { class: 'field', style: 'flex:1;min-width:220px' }, h('label', { for: 'nat-nome', text: 'Nova opção' }), nome), h('button', { class: 'btn primary', type: 'submit', id: 'nat-add' }, 'Adicionar'));
  const linhas = S.naturezas.slice().sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR')).map(n => h('tr', { 'data-nat': n.id },
    h('td', {}, h('span', { class: 'tag', style: `--cor:${corNatureza(n.nome)}`, text: n.nome })),
    h('td', {}, h('button', { class: 'btn sm danger', 'data-acao': 'excluir-nat', onclick: () => { if (!confirm(`Remover a opção "${n.nome}" da lista? Avisos já criados continuam como estão.`)) return; adminAcao(() => api.excluirNatureza(n.id), 'Opção removida.'); } }, 'Remover'))));
  return h('div', {}, h('p', { class: 'hint', text: 'Estas são as opções da lista "Natureza do aviso". Remover uma opção não altera os avisos já criados.' }), form,
    h('div', { class: 'table-wrap' }, h('table', { class: 'mini-table' }, h('thead', {}, h('tr', {}, h('th', { text: 'Opção' }), h('th', { text: '' }))), h('tbody', {}, linhas))));
}

function painelFuncionarios() {
  const gestorSel = (valor, id, onchange) => { const s = h('select', { id, onchange }, h('option', { value: '' }, 'Sem gestor'), S.perfis.slice().sort(byNome).map(p => h('option', { value: String(p.id) }, p.nome))); s.value = valor == null ? '' : String(valor); return s; };
  const nome = h('input', { id: 'f-nome', type: 'text', placeholder: 'Nome completo' });
  const cargo = h('input', { id: 'f-cargo', type: 'text' });
  const setor = h('input', { id: 'f-setor', type: 'text', list: 'dl-setores' });
  const gest = gestorSel(null, 'f-gestor');
  const setores = [...new Set(S.funcionarios.map(f => f.subsetor).filter(Boolean))].sort();
  const form = h('form', { novalidate: true, id: 'form-func', onsubmit: ev => {
    ev.preventDefault(); if (!nome.value.trim()) return toast('Informe o nome.', true);
    adminAcao(() => api.criarFuncionario({ nome: nome.value, cargo: cargo.value.trim(), subsetor: setor.value.trim(), gestor_id: gest.value ? Number(gest.value) : null }), 'Funcionário adicionado.');
  } }, h('div', { class: 'form-grid' },
    h('div', { class: 'field' }, h('label', { for: 'f-nome', text: 'Nome' }), nome), h('div', { class: 'field' }, h('label', { for: 'f-cargo', text: 'Cargo' }), cargo),
    h('div', { class: 'field' }, h('label', { for: 'f-setor', text: 'Setor' }), setor, h('datalist', { id: 'dl-setores' }, setores.map(s => h('option', { value: s })))),
    h('div', { class: 'field' }, h('label', { for: 'f-gestor', text: 'Gestor' }), gest)),
    h('div', { class: 'right' }, h('button', { class: 'btn primary', type: 'submit', id: 'f-add' }, 'Adicionar funcionário')));
  const corpo = h('tbody');
  const busca = h('input', { id: 'f-busca', type: 'search', placeholder: 'Buscar por nome, cargo ou setor', value: S.buscaFunc, oninput: e => { S.buscaFunc = e.target.value; linhas(); } });
  function linhas() {
    const t = norm(S.buscaFunc);
    const arr = S.funcionarios.filter(f => !t || norm(`${f.nome} ${f.cargo || ''} ${f.subsetor || ''}`).includes(t)).sort(byNome);
    corpo.replaceChildren(...arr.map(f => h('tr', { 'data-func': f.id },
      h('td', { text: f.nome }), h('td', { text: f.cargo || '' }), h('td', { text: f.subsetor || '' }),
      h('td', {}, gestorSel(f.gestor_id, 'gs-' + f.id, e => adminAcao(() => api.atualizarFuncionario(f.id, { gestor_id: e.target.value ? Number(e.target.value) : null }), 'Gestor atualizado.'))),
      h('td', {}, h('button', { class: 'btn sm danger', 'data-acao': 'excluir-func', onclick: () => { if (!confirm(`Excluir ${f.nome} da lista de funcionários? Avisos já criados continuam no quadro.`)) return; adminAcao(() => api.excluirFuncionario(f.id), 'Funcionário excluído.'); } }, 'Excluir')))));
    const t2 = $('#f-total'); if (t2) t2.textContent = `${arr.length} de ${S.funcionarios.length} funcionários`;
  }
  const raiz = h('div', {}, h('h3', { style: 'margin:0 0 10px', text: 'Adicionar funcionário' }), form,
    h('h3', { style: 'margin:22px 0 10px', text: 'Equipes' }), h('p', { class: 'hint', text: 'O gestor escolhido define quem aparece para cada supervisor ao criar avisos. Alterar aqui vale a partir de agora.' }),
    h('div', { class: 'field', style: 'max-width:420px;margin-bottom:10px' }, busca), h('div', { class: 'hint', id: 'f-total', style: 'margin-bottom:8px' }),
    h('div', { class: 'table-wrap' }, h('table', { class: 'mini-table' }, h('thead', {}, h('tr', {}, ['Nome', 'Cargo', 'Setor', 'Gestor', ''].map(c => h('th', { text: c })))), corpo)));
  setTimeout(linhas, 0);
  return raiz;
}

/* ================= início ================= */
async function boot() {
  $('#app').replaceChildren(centro(h('span', { class: 'spinner' }), ' Carregando...'));
  try {
    if (MODO === 'supabase') {
      await carregarScript(SUPABASE_JS);
      const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      api = criarApiSupabase(sb);
    } else api = criarApiDemo();
    let recuperacao = false;
    await api.init(() => { recuperacao = true; renderNovaSenha(); });
    const logado = await api.sessao();
    if (recuperacao) return;
    if (logado) await entrarNoApp(); else renderLogin();
  } catch (e) {
    $('#app').replaceChildren(centro(h('h2', { text: 'Não foi possível iniciar' }), h('p', { text: erroAmigavel(e) })));
  }
}
boot();
})();
