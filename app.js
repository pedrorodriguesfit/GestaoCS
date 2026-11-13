/* Gestão CS: quadro de avisos e análise de atendimentos.
   Dois modos: "supabase" (dados reais, quando config.js está preenchido)
   e "demo" (dados fictícios no navegador, para conhecer a tela). */
(() => {
'use strict';

const CFG = window.GESTAO_CS_CONFIG || {};
const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js';
const MODO = (CFG.supabaseUrl && CFG.supabaseAnonKey) ? 'supabase' : 'demo';
const LOGO_FIT = 'data:image/png;base64,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'; // logo FIT Energia (versão para fundo escuro), embutido para não depender de outro arquivo
const VERSAO = '2026.11.13-c';   // aparece no rodapé: serve para conferir se a versão nova está no ar
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

/* Troca os filhos de um elemento ignorando null/false. Importante: replaceChildren(null) escreve a palavra "null" na tela. */
function subst(el, ...kids) { el.replaceChildren(...kids.flat(Infinity).filter(k => k != null && k !== false)); }

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
  if (/Could not find the .* column|column .* does not exist/i.test(m)) return 'O banco de dados ainda não tem as colunas novas. Rode a atualização do Supabase indicada no README (atualizacao_05_colaboradores.sql) e recarregue a página.';
  if (/row-level security|permission denied|insufficient/i.test(m)) return 'Você não tem permissão para esta ação.';
  if (/Password should be at least/i.test(m)) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (/rate limit|too many/i.test(m)) return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Sem conexão com o servidor. Verifique a internet e tente de novo.';
  return m || 'Ocorreu um erro inesperado.';
}

/* ================= mapa de lugares: catálogo (6 ilhas, 12 lugares em cada, 72 no total) ================= */
const ILHAS = [
  { id: 1, orient: 'v', x: 58, y: 200, rot: [109, 162] }, { id: 2, orient: 'v', x: 303, y: 200, rot: [354, 162] },
  { id: 3, orient: 'h', x: 577, y: 140, rot: [883, 54] }, { id: 4, orient: 'h', x: 577, y: 570, rot: [883, 772] },
  { id: 5, orient: 'v', x: 1365, y: 200, rot: [1417, 162] }, { id: 6, orient: 'v', x: 1610, y: 200, rot: [1660, 162] }
];
const DESK = { v: { w: 104, h: 460, cols: 2, rows: 6 }, h: { w: 612, h: 110, cols: 6, rows: 2 } };
const LUGARES = [];
ILHAS.forEach(il => {
  const d = DESK[il.orient];
  if (il.orient === 'v') {
    const rh = d.h / d.rows;
    for (let r = 0; r < d.rows; r++) {
      const y = il.y + r * rh + (rh - 54) / 2;
      LUGARES.push({ id: `I${il.id}-${pad(2 * r + 1)}`, ilha: il.id, n: 2 * r + 1, x: il.x - 52, y, w: 46, h: 54 });
      LUGARES.push({ id: `I${il.id}-${pad(2 * r + 2)}`, ilha: il.id, n: 2 * r + 2, x: il.x + d.w + 6, y, w: 46, h: 54 });
    }
  } else {
    const cw = d.w / d.cols;
    for (let c = 0; c < d.cols; c++) {
      const x = il.x + c * cw + (cw - 58) / 2;
      LUGARES.push({ id: `I${il.id}-${pad(c + 1)}`, ilha: il.id, n: c + 1, x, y: il.y - 54, w: 58, h: 44 });
      LUGARES.push({ id: `I${il.id}-${pad(c + 7)}`, ilha: il.id, n: c + 7, x, y: il.y + d.h + 10, w: 58, h: 44 });
    }
  }
});
const LUGAR_POR_ID = Object.fromEntries(LUGARES.map(l => [l.id, l]));
const lugarValido = id => !!LUGAR_POR_ID[id];

/* ================= camada de dados: DEMO ================= */
function criarApiDemo() {
  const KEY = 'gestaocs_demo_v2';
  const SESS = 'gestaocs_demo_sessao';
  const hoje = new Date();
  const dia = n => { const d = new Date(hoje); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  function seed() {
    const F = (id, nome, cargo, subsetor, nivel, adm, sup, hor, alm, reg, extra = {}) => ({ id, matricula: String(1000 + id), nome, cargo, subsetor, nivel, admissao: adm,
      superior_id: sup, gestor_id: sup && sup <= 3 ? sup : null, gestor_nome: null, apelido: null, cor_equipe: null, horario_trabalho: hor, horario_almoco: alm, regime: reg, vaga: false, ...extra });
    const funcionarios = [
      F(1, 'Admin Demo', 'Gerente De Sucesso Do Cliente', 'Gestão', 'Head', '2023-07-11', null, '-', '-', '-', { gestor_nome: 'Diretoria Demo', apelido: 'Admin Demo', cor_equipe: '#E97132' }),
      F(2, 'Ana Souza', 'Supervisor De Sucesso Do Cliente I', 'Gestão', 'Supervisão', '2023-10-16', 1, '-', '-', '-', { apelido: 'Ana Souza', cor_equipe: '#CCECFF' }),
      F(3, 'Bruno Lima', 'Supervisor De Sucesso Do Cliente I', 'Gestão', 'Supervisão', '2024-03-18', 1, '-', '-', '-', { apelido: 'Bruno Lima', cor_equipe: '#FF99CC' }),
      F(4, 'Carla Mendes', 'Auxiliar De Sucesso Do Cliente I', 'Atendimento N1', 'N1', '2025-02-10', 2, '08:00 às 18:00', '12:00 às 13:12', 'Segunda a Sexta'),
      F(5, 'Diego Alves', 'Auxiliar De Sucesso Do Cliente I', 'Atendimento N1', 'N1', '2025-03-03', 2, '10:00 às 20:00', '14:18 às 15:30', '5x2 (escala)'),
      F(6, 'Elisa Rocha', 'Auxiliar De Sucesso Do Cliente I', 'Atendimento N1', 'N1', '2025-06-16', 2, '11:30 às 21:30', '15:30 às 16:42', '5x2 (escala)'),
      F(7, 'Fábio Nunes', 'Analista De Sucesso Do Cliente Júnior I', 'Atendimento N3', 'N3', '2024-11-11', 3, '09:00 às 19:00', '13:00 às 14:12', 'Segunda a Sexta'),
      F(8, 'Gabi Torres', 'Analista De Sucesso Do Cliente Júnior I', 'Atendimento N3', 'N3', '2025-01-20', 3, '07:00 às 17:00', '11:42 às 12:54', 'Segunda a Sexta'),
      F(9, 'Heitor Dias', 'Analista De Sucesso Do Cliente Júnior I', 'Inadimplência', 'N3', '2025-08-04', 3, '08:00 às 18:00', '12:12 às 13:24', 'Segunda a Sexta'),
      F(10, 'Vaga aberta', 'Auxiliar De Sucesso Do Cliente I', 'Atendimento N1', 'N1', null, 2, '12:00 às 22:00', '15:30 às 16:42', '5x2 (escala)', { matricula: null, vaga: true }),
      F(11, 'Vaga aberta', 'Analista De Sucesso Do Cliente Júnior II', 'Inadimplência', 'N3', null, 3, '08:00 às 18:00', '12:00 às 13:12', 'Segunda a Sexta', { matricula: null, vaga: true })
    ];
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
      seq: { aviso: 20, analise: 10, func: 30, perfil: 10, nat: 10 },
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
        { id: 1, gestor_id: 2, gestor_nome: 'Ana Souza', id_atendimento: '84521', resumo: 'Cliente pediu segunda via da fatura e questionou a cobrança.', avaliacao: 'Boa condução, explicou o cálculo com clareza.', pontos_melhoria: 'Confirmar o e-mail do cliente antes de encerrar.', canal: 'BlipDesk', atendente: 'Carla Mendes', data_atendimento: dia(-1), criado_em: new Date().toISOString() },
        { id: 2, gestor_id: 3, gestor_nome: 'Bruno Lima', id_atendimento: 'HS-3391', resumo: 'Dúvida sobre troca de titularidade.', avaliacao: 'Atendimento correto, porém demorado.', pontos_melhoria: 'Usar a resposta pronta de documentos.', canal: 'Hubspot', atendente: 'Fábio Nunes', data_atendimento: dia(-2), criado_em: new Date().toISOString() }
      ],
      lugares: [
        ...Array.from({ length: 12 }, (_, i) => ({ lugar: 'I1-' + pad(i + 1), tipo: 'setor', setor: 'Atendimento N1', funcionario_id: null, funcionario_nome: null })),
        ...Array.from({ length: 6 }, (_, i) => ({ lugar: 'I3-' + pad(i + 1), tipo: 'setor', setor: 'Atendimento N3', funcionario_id: null, funcionario_nome: null })),
        { lugar: 'I3-12', tipo: 'pessoa', setor: 'Inadimplência', funcionario_id: 9, funcionario_nome: 'Heitor Dias' }
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
  const subordinados = id => { const out = new Set(); const vai = x => db.funcionarios.filter(f => f.superior_id === x).forEach(f => { if (!out.has(f.id)) { out.add(f.id); vai(f.id); } }); vai(id); return out; };
  const gestorDoSite = superiorId => { const p = db.perfis.find(x => x.funcionario_id === superiorId); return p ? p.id : null; };
  function validarFuncionario(f, patch) {
    if ('superior_id' in patch && patch.superior_id != null) {
      if (patch.superior_id === f.id) throw new Error('Uma pessoa não pode ser gestora de si mesma');
      if (subordinados(f.id).has(patch.superior_id)) throw new Error('Não é possível: o novo gestor já é subordinado desta pessoa (formaria um ciclo)');
    }
  }
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
      if (!db.lugares) db.lugares = [];
      return clone({ perfis: db.perfis, funcionarios: db.funcionarios, naturezas: db.naturezas, avisos, analises, lugares: db.lugares });
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
    async editarAviso(id, d) {
      const p = exigir(); const a = db.avisos.find(x => x.id === id);
      const visivel = a && (p.papel === 'admin' || a.status === 'aprovado' || a.criado_por === p.id);
      if (!visivel || !(p.papel === 'admin' || a.criado_por === p.id)) throw new Error('Você não tem permissão para esta ação.');
      if (d.data_fim < d.data_inicio) throw new Error('A data final não pode ser anterior à inicial.');
      if (d.funcionario_id !== a.funcionario_id) {
        if (!podeCriarPara(d.funcionario_id)) throw new Error('Você não tem permissão para criar avisos para este funcionário');
        const fu = db.funcionarios.find(f => f.id === d.funcionario_id); if (!fu) throw new Error('Funcionário não encontrado');
        const criador = db.perfis.find(x => x.id === a.criado_por);
        a.funcionario_id = fu.id; a.funcionario_nome = fu.nome; a.setor = fu.subsetor;
        if (criador && criador.papel === 'admin') a.gestor_id = fu.gestor_id;
      }
      Object.assign(a, { natureza: d.natureza, data_inicio: d.data_inicio, data_fim: d.data_fim, observacao: d.observacao || null });
      if (p.papel !== 'admin') { a.status = 'pendente'; a.motivo_recusa = null; a.decidido_por = null; a.decidido_em = null; }
      salvar(); return wait();
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
      if (!String(d.atendente || '').trim()) throw new Error('Informe o atendente.');
      db.analises.push({ id: ++db.seq.analise, gestor_id: p.id, gestor_nome: p.nome, ...d, criado_em: new Date().toISOString() });
      salvar(); return wait();
    },
    async editarAnalise(id, d) {
      const p = exigir(); const a = db.analises.find(x => x.id === id);
      if (!a || !(p.papel === 'admin' || a.gestor_id === p.id)) throw new Error('Você não tem permissão para esta ação.');
      if (!CANAIS.includes(d.canal)) throw new Error('Canal inválido');
      if (!String(d.atendente || '').trim()) throw new Error('Informe o atendente.');
      Object.assign(a, { atendente: d.atendente, id_atendimento: d.id_atendimento, resumo: d.resumo, avaliacao: d.avaliacao, pontos_melhoria: d.pontos_melhoria, canal: d.canal, data_atendimento: d.data_atendimento });
      salvar(); return wait();
    },
    async excluirAnalise(id) { admin(); db.analises = db.analises.filter(a => a.id !== id); salvar(); return wait(); },
    async criarNatureza(nome) {
      admin(); nome = String(nome).trim(); if (!nome) throw new Error('Informe o nome da opção.');
      if (db.naturezas.some(n => norm(n.nome) === norm(nome))) throw new Error('Essa opção já existe.');
      db.naturezas.push({ id: ++db.seq.nat, nome, ordem: 100 }); salvar(); return wait();
    },
    async salvarLugares(itens) {
      admin(); if (!db.lugares) db.lugares = [];
      if (!Array.isArray(itens) || itens.length > 100) throw new Error('Formato inválido');
      const copia = clone(db.lugares);
      for (const it of itens) {
        if (!lugarValido(it.lugar)) throw new Error('Lugar inexistente: ' + it.lugar);
        const tipo = it.tipo || 'livre';
        if (tipo === 'livre') { copia.splice(0, copia.length, ...copia.filter(l => l.lugar !== it.lugar)); }
        else if (tipo === 'setor') {
          const setor = String(it.setor || '').trim(); if (!setor) throw new Error('Informe o setor');
          const novo = { lugar: it.lugar, tipo: 'setor', setor, funcionario_id: null, funcionario_nome: null };
          const i = copia.findIndex(l => l.lugar === it.lugar); if (i >= 0) copia[i] = novo; else copia.push(novo);
        } else if (tipo === 'pessoa') {
          const fu = db.funcionarios.find(f => f.id === it.funcionario_id); if (!fu) throw new Error('Funcionário não encontrado');
          const sem = copia.filter(l => !(l.funcionario_id === fu.id && l.lugar !== it.lugar));
          copia.splice(0, copia.length, ...sem);
          const novo = { lugar: it.lugar, tipo: 'pessoa', setor: fu.subsetor, funcionario_id: fu.id, funcionario_nome: fu.nome };
          const i = copia.findIndex(l => l.lugar === it.lugar); if (i >= 0) copia[i] = novo; else copia.push(novo);
        } else throw new Error('Tipo inválido');
      }
      db.lugares = copia; salvar(); return wait(itens.length);
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
    async atualizarFuncionario(id, patch) {
      admin(); const f = db.funcionarios.find(x => x.id === id); if (!f) throw new Error('Funcionário não encontrado');
      validarFuncionario(f, patch);
      const nomeAntes = f.nome, setorAntes = f.subsetor, supAntes = f.superior_id;
      Object.assign(f, patch);
      if ('superior_id' in patch && patch.superior_id !== supAntes) f.gestor_id = gestorDoSite(f.superior_id);
      if (f.nome !== nomeAntes || f.subsetor !== setorAntes) {
        db.avisos.forEach(a => { if (a.funcionario_id === f.id) { a.funcionario_nome = f.nome; a.setor = f.subsetor; } });
        (db.lugares || []).forEach(l => { if (l.funcionario_id === f.id) { l.funcionario_nome = f.nome; l.setor = f.subsetor; } });
      }
      salvar(); return wait();
    },
    async criarFuncionario(d) {
      admin(); if (!String(d.nome || '').trim()) throw new Error('Informe o nome');
      const novo = { matricula: null, cargo: null, subsetor: null, nivel: null, admissao: null, horario_trabalho: null, horario_almoco: null, regime: null, vaga: false, superior_id: null, gestor_id: null, gestor_nome: null, apelido: null, cor_equipe: null, ...d, id: ++db.seq.func, nome: d.nome.trim() };
      if (novo.superior_id != null) novo.gestor_id = gestorDoSite(novo.superior_id);
      db.funcionarios.push(novo); salvar(); return wait(novo.id);
    },
    async excluirFuncionario(id) {
      admin(); db.funcionarios.forEach(f => { if (f.superior_id === id) { f.superior_id = null; f.gestor_id = null; } });
      db.funcionarios = db.funcionarios.filter(f => f.id !== id);
      db.perfis.forEach(p => { if (p.funcionario_id === id) p.funcionario_id = null; });
      db.avisos.forEach(a => { if (a.funcionario_id === id) a.funcionario_id = null; });
      db.lugares = (db.lugares || []).filter(l => l.funcionario_id !== id); salvar(); return wait();
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
      let lugaresIndisponivel = false;
      const lugaresP = paginado(() => sb.from('lugares').select('*').order('lugar')).catch(() => { lugaresIndisponivel = true; return []; });
      const [perfis, funcionarios, naturezas, avisos, analises] = await Promise.all([
        paginado(() => sb.from('perfis').select(COL_PERFIL).order('nome')),
        paginado(() => sb.from('funcionarios').select('*').order('nome')),
        paginado(() => sb.from('naturezas').select('*').order('ordem').order('nome')),
        paginado(() => sb.from('avisos').select('*').order('data_inicio', { ascending: false }).order('id', { ascending: false })),
        paginado(() => sb.from('analises').select('*').order('data_atendimento', { ascending: false }).order('id', { ascending: false }))
      ]);
      const lugares = await lugaresP;
      return { perfis, funcionarios, naturezas, avisos, analises, lugares, lugaresIndisponivel };
    },
    async criarAviso(d) { ok(await sb.from('avisos').insert({ funcionario_id: d.funcionario_id, natureza: d.natureza, data_inicio: d.data_inicio, data_fim: d.data_fim, observacao: d.observacao || null })); },
    async decidirAviso(id, status, motivo) {
      const dados = ok(await sb.from('avisos').update({ status, motivo_recusa: status === 'recusado' ? (motivo || null) : null }).eq('id', id).select('id'));
      if (!dados.length) throw new Error('Você não tem permissão para esta ação.');
    },
    async editarAviso(id, d) {
      const dados = ok(await sb.from('avisos').update({ funcionario_id: d.funcionario_id, natureza: d.natureza, data_inicio: d.data_inicio, data_fim: d.data_fim, observacao: d.observacao || null }).eq('id', id).select('id'));
      if (!dados || !dados.length) throw new Error('Você não tem permissão para esta ação.');
    },
    async excluirAviso(id) { await removido(sb.from('avisos').delete().eq('id', id)); },
    async criarAnalise(d) { ok(await sb.from('analises').insert({ atendente: d.atendente, id_atendimento: d.id_atendimento, resumo: d.resumo, avaliacao: d.avaliacao, pontos_melhoria: d.pontos_melhoria, canal: d.canal, data_atendimento: d.data_atendimento })); },
    async editarAnalise(id, d) {
      const dados = ok(await sb.from('analises').update({ atendente: d.atendente, id_atendimento: d.id_atendimento, resumo: d.resumo, avaliacao: d.avaliacao, pontos_melhoria: d.pontos_melhoria, canal: d.canal, data_atendimento: d.data_atendimento }).eq('id', id).select('id'));
      if (!dados || !dados.length) throw new Error('Você não tem permissão para esta ação.');
    },
    async excluirAnalise(id) { await removido(sb.from('analises').delete().eq('id', id)); },
    async criarNatureza(nome) { ok(await sb.from('naturezas').insert({ nome: String(nome).trim(), ordem: 100 })); },
    async excluirNatureza(id) { await removido(sb.from('naturezas').delete().eq('id', id)); },
    async salvarLugares(itens) { return ok(await sb.rpc('salvar_lugares', { p_itens: itens })); },
    async criarGestor(nome, email, papel, funcionario_id) {
      return ok(await sb.rpc('criar_gestor', { p_nome: nome, p_email: email, p_papel: papel, p_funcionario_id: funcionario_id || null }));
    },
    async novoCodigo(perfil_id) { return ok(await sb.rpc('novo_codigo_gestor', { p_perfil_id: perfil_id })); },
    async excluirGestor(id) { ok(await sb.rpc('excluir_gestor', { p_perfil_id: id })); },
    async atualizarFuncionario(id, patch) {
      const dados = ok(await sb.from('funcionarios').update(patch).eq('id', id).select('id'));
      if (!dados.length) throw new Error('Você não tem permissão para esta ação.');
    },
    async criarFuncionario(d) {
      const linha = { nome: String(d.nome || '').trim(), matricula: d.matricula || null, cargo: d.cargo || null, subsetor: d.subsetor || null, nivel: d.nivel || null, admissao: d.admissao || null,
        horario_trabalho: d.horario_trabalho || null, horario_almoco: d.horario_almoco || null, regime: d.regime || null, vaga: !!d.vaga, superior_id: d.superior_id ?? null, gestor_nome: d.gestor_nome || null, cor_equipe: d.cor_equipe || null };
      const r = ok(await sb.from('funcionarios').insert(linha).select('id'));
      return r && r[0] ? r[0].id : null;
    },
    async excluirFuncionario(id) { await removido(sb.from('funcionarios').delete().eq('id', id)); }
  };
}

/* ================= estado ================= */
let api;
const S = {
  perfil: null, perfis: [], funcionarios: [], naturezas: [], avisos: [], analises: [],
  aba: 'avisos', carregadoEm: 0, ultimoConvite: null, painelAdmin: 'gestores', buscaFunc: '',
  fAv: { gestor: '', func: '', setor: '', de: '', ate: '', encerrados: false },
  fAn: { id: '', atendente: '', resumo: '', avaliacao: '', pontos: '', canal: '', de: '', ate: '', gestor: '' },
  anLimite: 200,
  lugares: [], lugaresIndisponivel: false, colabIndisponivel: false, mapa: { modo: 'lugar', sel: null },
  org: { visao: 'planilha', busca: '', sub: '', nivel: '', gestor: '', regime: '', tipo: 'todos', sort: { col: 'nome', dir: 1 }, aberto: null, achados: null, zoom: 1, arrasto: null, rolarPara: null, foco: null, autoAjuste: true },
  visao: 'cartoes', cal: { ano: new Date().getFullYear(), mes: new Date().getMonth() }, calPend: false
};
const ui = {};
const ehAdmin = () => !!S.perfil && S.perfil.papel === 'admin';
const byNome = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR');
const nomeGestor = id => { const p = S.perfis.find(x => x.id === id); return p ? p.nome : ''; };
const pessoas = () => S.funcionarios.filter(f => !f.vaga);
const nomeExibicao = f => (f && (f.apelido || nomeEnxuto(f.nome))) || '';
const meuTime = () => pessoas().filter(f => f.gestor_id === S.perfil.id);

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
  S.lugares = d.lugares || []; S.lugaresIndisponivel = !!d.lugaresIndisponivel;
  S.colabIndisponivel = S.funcionarios.length > 0 && !('vaga' in S.funcionarios[0]);
  S.carregadoEm = Date.now();
}
async function acao(fn, okMsg) {
  try { await fn(); if (okMsg) toast(okMsg); return true; }
  catch (e) { toast(erroAmigavel(e), true); return false; }
}
async function atualizarDepois() { await recarregar(); atualizarAvisos(); atualizarAnalises(); atualizarBadge(); if (typeof preencherDia === 'function') preencherDia(); if (typeof atualizarMapa === 'function') atualizarMapa(); if (typeof atualizarOrg === 'function') atualizarOrg(); }

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
    subst(caixa, abas, erro, modo === 'entrar' ? formEntrar() : modo === 'primeiro' ? formPrimeiro() : formRecuperar());
  }
  desenhar();
  if (msgInicial) mostrarErro(msgInicial);

  const demo = MODO === 'demo' ? h('div', { class: 'demo-box' },
    h('div', {}, 'Modo demonstração. Entre rapidamente com:'),
    api.contasDemo.map(([rot, em]) => h('button', { class: 'btn sm', type: 'button', onclick: async () => { await api.entrar(em, 'demo'); await entrarNoApp(); } }, rot)),
    h('div', { class: 'hint', style: 'margin-top:8px' }, 'Senha de todos: demo')) : null;

  subst($('#app'), h('div', { class: 'login-wrap' }, h('div', { class: 'login' },
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
  subst($('#app'), h('div', { class: 'login-wrap' }, h('div', { class: 'login' },
    h('div', { class: 'brand' }, h('span', { class: 'logo' }, 'CS'), 'Gestão CS'), h('p', { class: 'sub' }, 'Crie uma nova senha'), f)));
}

function renderSemAcesso() {
  subst($('#app'), centro(h('h2', { text: 'Sem acesso' }),
    h('p', { text: 'Seu login existe, mas ainda não está liberado no Gestão CS. Peça ao administrador para cadastrar o seu e-mail.' }),
    h('button', { class: 'btn', type: 'button', onclick: sair }, 'Sair')));
}

/* ================= entrada e saída ================= */
let timer = null;
async function entrarNoApp() {
  subst($('#app'), centro(h('span', { class: 'spinner' }), ' Carregando...'));
  try { S.perfil = await api.meuPerfil(); }
  catch (e) { subst($('#app'), centro(h('h2', { text: 'Não foi possível entrar' }), h('p', { text: erroAmigavel(e) }), h('button', { class: 'btn', onclick: sair }, 'Voltar'))); return; }
  if (!S.perfil) { renderSemAcesso(); return; }
  try { await recarregar(); }
  catch (e) { subst($('#app'), centro(h('h2', { text: 'Erro ao carregar os dados' }), h('p', { text: erroAmigavel(e) }), h('button', { class: 'btn', onclick: () => entrarNoApp() }, 'Tentar de novo'))); return; }
  S.aba = 'avisos'; render();
  clearInterval(timer); timer = setInterval(silencioso, POLL_MS);
}
async function silencioso() {
  if (!S.perfil || document.visibilityState !== 'visible' || document.querySelector('dialog[open]')) return;
  try { await recarregar(); atualizarAvisos(); atualizarAnalises(); atualizarBadge(); atualizarMapa(); atualizarOrg(); } catch { /* tenta de novo no próximo ciclo */ }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.perfil && Date.now() - S.carregadoEm > POLL_MS) silencioso(); });

async function sair() {
  clearInterval(timer); await api.sair();
  Object.assign(S, { perfil: null, perfis: [], funcionarios: [], naturezas: [], avisos: [], analises: [], lugares: [], lugaresIndisponivel: false, mapa: { modo: 'lugar', sel: null }, org: { visao: 'planilha', busca: '', sub: '', nivel: '', gestor: '', regime: '', tipo: 'todos', sort: { col: 'nome', dir: 1 }, aberto: null, achados: null, zoom: 1, arrasto: null, rolarPara: null, foco: null, autoAjuste: true }, aba: 'avisos', anLimite: 200, ultimoConvite: null, buscaFunc: '', visao: 'cartoes', calPend: false,
    fAv: { gestor: '', func: '', setor: '', de: '', ate: '', encerrados: false },
    fAn: { id: '', atendente: '', resumo: '', avaliacao: '', pontos: '', canal: '', de: '', ate: '', gestor: '' } });
  renderLogin();
}

/* ================= estrutura principal ================= */
function render() {
  subst($('#app'), demoBanner(), cabecalho(), h('main', { class: S.aba === 'org' ? 'largo' : '' }, S.aba === 'avisos' ? viewAvisos() : S.aba === 'analises' ? viewAnalises() : S.aba === 'mapa' ? viewMapa() : viewOrg()), h('footer', { class: 'rodape', id: 'rodape-versao', text: `Gestão CS · versão ${VERSAO}` }));
  atualizarAvisos(); atualizarAnalises(); atualizarMapa(); atualizarOrg(true);
  const abaAtiva = $('.tab[aria-selected="true"]'); if (abaAtiva && abaAtiva.scrollIntoView) abaAtiva.scrollIntoView({ inline: 'center', block: 'nearest' });
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
    h('div', { class: 'brand' }, h('img', { class: 'brand-logo', src: LOGO_FIT, alt: 'FIT Energia', width: '134', height: '40', style: 'height:40px;width:auto' }), h('span', { class: 'brand-sep', 'aria-hidden': 'true' }), h('span', { class: 'brand-nome', text: 'Gestão CS' })),
    h('nav', { class: 'tabs', role: 'tablist' }, aba('avisos', 'Quadro de avisos', ehAdmin() ? ui.badge : null), aba('analises', 'Análise de atendimentos'), aba('mapa', 'Mapa de lugares'), aba('org', 'Colaboradores e Organização')),
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
  if (p.papel === 'admin') return pessoas().sort(byNome);
  return pessoas().filter(f => f.gestor_id === p.id || f.id === p.funcionario_id).sort(byNome);
}
function podeEditarAviso(a) {
  const p = S.perfil; if (p.papel === 'admin') return true;
  return a.criado_por === p.id;
}
function podeExcluirAviso(a) {
  const p = S.perfil; if (p.papel === 'admin') return true;
  return a.gestor_id === p.id && distinct(a.funcionario_id, p.funcionario_id);
}

function viewAvisos() {
  const f = S.fAv, cal = S.visao === 'calendario';
  const setores = [...new Set(pessoas().map(x => x.subsetor).filter(Boolean).concat(S.avisos.map(a => a.setor).filter(Boolean)))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const selGestor = h('select', { id: 'fav-gestor', onchange: e => { f.gestor = e.target.value; atualizarAvisos(); } },
    h('option', { value: '' }, 'Todos'), S.perfis.slice().sort(byNome).map(p => h('option', { value: String(p.id) }, p.nome)), h('option', { value: 'none' }, 'Sem gestor definido'));
  selGestor.value = f.gestor;
  const selSetor = h('select', { id: 'fav-setor', onchange: e => { f.setor = e.target.value; atualizarAvisos(); } },
    h('option', { value: '' }, 'Todos'), setores.map(s => h('option', { value: s }, s)));
  selSetor.value = f.setor;
  const limpar = () => { Object.assign(f, { gestor: '', func: '', setor: '', de: '', ate: '', encerrados: false }); S.calPend = false; render(); };
  const alternar = v => () => { if (S.visao !== v) { S.visao = v; render(); } };

  ui.pend = h('div', { id: 'avisos-pend' });
  ui.lista = h('div', { id: 'avisos-lista' });
  return h('div', {},
    h('div', { class: 'page-head' },
      h('div', {}, h('h1', { text: 'Quadro de avisos' }), h('p', { text: ehAdmin() ? 'Aprove os avisos enviados pelos supervisores e acompanhe a rotina do setor.' : 'Ausências, férias, atestados e outras informações que afetam a rotina do setor.' })),
      h('div', { class: 'head-acoes' },
        h('div', { class: 'seg seg-btn', role: 'group', 'aria-label': 'Forma de visualizar' },
          h('button', { type: 'button', id: 'vis-cartoes', 'aria-pressed': String(!cal), onclick: alternar('cartoes') }, 'Cartões'),
          h('button', { type: 'button', id: 'vis-calendario', 'aria-pressed': String(cal), onclick: alternar('calendario') }, 'Calendário')),
        h('button', { class: 'btn primary', id: 'btn-novo-aviso', onclick: abrirNovoAviso }, '+ Novo aviso'))),
    ui.pend,
    h('div', { class: 'card panel' },
      h('div', { class: 'filters' },
        h('div', { class: 'field' }, h('label', { for: 'fav-gestor', text: 'Gestor' }), selGestor),
        h('div', { class: 'field' }, h('label', { for: 'fav-func', text: 'Funcionário' }),
          h('input', { id: 'fav-func', type: 'search', list: 'dl-func', placeholder: 'Digite o nome', autocomplete: 'off', value: f.func, oninput: e => { f.func = e.target.value; atualizarAvisos(); } }),
          h('datalist', { id: 'dl-func' }, pessoas().sort(byNome).map(x => h('option', { value: x.nome })))),
        h('div', { class: 'field' }, h('label', { for: 'fav-setor', text: 'Setor' }), selSetor),
        cal ? null : h('div', { class: 'field' }, h('label', { for: 'fav-de', text: 'Data (de)' }), h('input', { id: 'fav-de', type: 'date', value: f.de, onchange: e => { f.de = e.target.value; atualizarAvisos(); } })),
        cal ? null : h('div', { class: 'field' }, h('label', { for: 'fav-ate', text: 'Data (até)' }), h('input', { id: 'fav-ate', type: 'date', value: f.ate, onchange: e => { f.ate = e.target.value; atualizarAvisos(); } }))),
      h('div', { class: 'filters-foot' },
        cal
          ? h('label', { class: 'check' }, h('input', { id: 'fav-calpend', type: 'checkbox', checked: S.calPend, onchange: e => { S.calPend = e.target.checked; atualizarAvisos(); } }), ehAdmin() ? 'Incluir avisos aguardando aprovação' : 'Incluir os meus avisos em análise')
          : h('label', { class: 'check' }, h('input', { id: 'fav-enc', type: 'checkbox', checked: f.encerrados, onchange: e => { f.encerrados = e.target.checked; atualizarAvisos(); } }), 'Incluir avisos já encerrados'),
        cal ? null : h('span', { class: 'hint' }, 'Com só a primeira data preenchida, mostra os avisos daquele dia.'),
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
  if (podeEditarAviso(a)) acoes.push(h('button', { class: 'btn sm', 'data-acao': 'editar', onclick: () => abrirFormAviso(a) }, 'Editar'));
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
    a.status === 'pendente' ? avisoSobreposicao(a) : null,
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
  subst(ui.pend, ...pend);

  if (S.visao === 'calendario') { subst(ui.lista, calendario()); return; }
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
  subst(ui.lista, ...blocos);
}

function abrirNovoAviso() { abrirFormAviso(null); }
function abrirFormAviso(existente) {
  const editando = !!existente;
  const permitidos = funcionariosPermitidos();
  const p = S.perfil;
  if (!editando && !permitidos.length) { toast('Você ainda não tem funcionários no seu time. Peça ao administrador para vinculá-los.', true); return; }
  const rot = f => (p.papel !== 'admin' && f.id === p.funcionario_id) ? `${f.nome} (eu)` : f.nome;
  let opts;
  if (p.papel === 'admin') {
    const grupos = {}; permitidos.forEach(f => (grupos[f.subsetor || 'Sem setor'] ||= []).push(f));
    opts = Object.keys(grupos).sort((a, b) => a.localeCompare(b, 'pt-BR')).map(g => h('optgroup', { label: g }, grupos[g].map(f => h('option', { value: f.id }, rot(f)))));
  } else {
    const ordenados = permitidos.slice().sort((a, b) => (b.id === p.funcionario_id) - (a.id === p.funcionario_id) || a.nome.localeCompare(b.nome, 'pt-BR'));
    opts = ordenados.map(f => h('option', { value: f.id }, rot(f)));
  }
  if (editando && p.papel !== 'admin' && existente.funcionario_id != null && !permitidos.some(f => f.id === existente.funcionario_id)) {
    opts = [h('option', { value: existente.funcionario_id }, `${existente.funcionario_nome} (atual)`), ...opts];
  }
  const selFunc = h('select', { id: 'na-func', required: true }, h('option', { value: '' }, 'Selecione...'), opts);
  if (editando && existente.funcionario_id != null) selFunc.value = String(existente.funcionario_id);
  const selNat = h('select', { id: 'na-nat', required: true }, h('option', { value: '' }, 'Selecione...'), S.naturezas.slice().sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR')).map(n => h('option', { value: n.nome }, n.nome)));
  if (editando) {
    if (![...selNat.options].some(o => o.value === existente.natureza)) selNat.append(h('option', { value: existente.natureza }, `${existente.natureza} (atual)`));
    selNat.value = existente.natureza;
  }
  const hoje = hojeISO();
  const multiInicial = editando && existente.data_inicio !== existente.data_fim;
  const dIni = h('input', { id: 'na-ini', type: 'date', required: true, value: editando ? existente.data_inicio : hoje });
  const dFim = h('input', { id: 'na-fim', type: 'date', value: editando ? existente.data_fim : hoje, required: multiInicial });
  const boxFim = h('div', { class: 'field' + (multiInicial ? '' : ' hidden'), id: 'na-fim-box' }, h('label', { for: 'na-fim', text: 'Data final' }), dFim);
  const lblIni = h('label', { for: 'na-ini', text: multiInicial ? 'Data inicial' : 'Data' });
  const radio = (v, rot_, marcado) => h('label', {}, h('input', { type: 'radio', name: 'na-tipo', value: v, checked: marcado, onchange: () => {
    const multi = v === 'multi'; boxFim.classList.toggle('hidden', !multi); lblIni.textContent = multi ? 'Data inicial' : 'Data';
    dFim.required = multi; if (multi && dFim.value < dIni.value) dFim.value = dIni.value;
  } }), rot_);
  const obs = h('textarea', { id: 'na-obs', maxlength: '1000', value: editando ? (existente.observacao || '') : '', placeholder: 'Opcional: detalhes que o time precisa saber (horário de saída, retorno, cobertura...)' });
  const erro = h('div', { class: 'err hidden', role: 'alert' });
  const adm = ehAdmin();
  const form = h('form', { id: 'form-aviso', novalidate: true, onsubmit: async ev => {
    ev.preventDefault(); erro.classList.add('hidden');
    const multi = $('input[name=na-tipo]:checked', form).value === 'multi';
    const d = { funcionario_id: Number(selFunc.value), natureza: selNat.value, data_inicio: dIni.value, data_fim: multi ? dFim.value : dIni.value, observacao: obs.value.trim() };
    const m = !selFunc.value ? 'Escolha o funcionário.' : !d.natureza ? 'Escolha a natureza do aviso.' : !d.data_inicio ? 'Informe a data.' : !d.data_fim ? 'Informe a data final.' : d.data_fim < d.data_inicio ? 'A data final não pode ser anterior à inicial.' : '';
    if (m) { erro.textContent = m; erro.classList.remove('hidden'); return; }
    const btn = $('#na-enviar'); btn.disabled = true;
    const voltaParaAprovacao = editando && !adm;
    const msgOk = editando ? (adm ? 'Aviso atualizado.' : 'Aviso atualizado e enviado para a aprovação do administrador.') : (adm ? 'Aviso publicado no quadro.' : 'Aviso enviado para a aprovação do administrador.');
    const ok = await acao(async () => { if (editando) await api.editarAviso(existente.id, d); else await api.criarAviso(d); await atualizarDepois(); }, msgOk);
    if (ok) dlg.close(); else btn.disabled = false;
  } },
    h('div', { class: 'form-grid' },
      editando && !adm && existente.status !== 'pendente'
        ? h('div', { class: 'dia-aviso multi span-all', id: 'aviso-reenvio', text: existente.status === 'aprovado' ? 'Este aviso já está publicado. Ao salvar, ele volta para a aprovação do administrador e sai do quadro até ser aprovado de novo.' : 'Ao salvar, o aviso será reenviado para a aprovação do administrador.' })
        : null,
      h('div', { class: 'field span-all' }, h('label', { for: 'na-func', text: 'Funcionário' }), selFunc,
        adm ? null : h('small', { text: 'Você pode criar avisos para o seu time e para você mesmo.' })),
      h('div', { class: 'field' }, h('label', { for: 'na-nat', text: 'Natureza do aviso' }), selNat),
      h('div', { class: 'field' }, h('label', { text: 'Período' }), h('div', { class: 'seg', role: 'radiogroup' }, radio('uno', 'Um único dia', !multiInicial), radio('multi', 'Mais de um dia', multiInicial))),
      h('div', { class: 'field' }, lblIni, dIni), boxFim,
      h('div', { class: 'field span-all' }, h('label', { for: 'na-obs', text: 'Observações' }), obs, h('small', { text: 'Não registre diagnóstico, CID ou outros dados de saúde. Informe apenas o que o time precisa saber para se organizar.' })), erro));
  const dlg = modal({ titulo: editando ? 'Editar aviso' : 'Novo aviso', corpo: form,
    rodape: [h('button', { class: 'btn', type: 'button', onclick: () => dlg.close() }, 'Cancelar'), h('button', { class: 'btn primary', id: 'na-enviar', type: 'submit', form: 'form-aviso' }, editando ? (adm || existente.status === 'pendente' ? 'Salvar alterações' : 'Salvar e enviar para aprovação') : (adm ? 'Publicar aviso' : 'Enviar para aprovação'))] });
}

/* ================= CALENDÁRIO ================= */
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const DIAS_SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const isoDe = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
function somaDias(iso, n) { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return isoDe(d.getFullYear(), d.getMonth(), d.getDate()); }
function nomeEnxuto(nome) { const p = String(nome || '').trim().split(/\s+/).filter(Boolean); return p.length > 1 ? `${p[0]} ${p[p.length - 1]}` : (p[0] || ''); }
function nomeCurto(nome) { const p = String(nome).trim().split(/\s+/); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0]; }

/* Avisos pendentes: mostra se há aprovados do mesmo time no mesmo período */
function sobreposicoes(a) {
  if (a.gestor_id == null) return [];
  return S.avisos.filter(b => b.id !== a.id && b.status === 'aprovado' && b.gestor_id === a.gestor_id && b.data_inicio <= a.data_fim && b.data_fim >= a.data_inicio);
}
function avisoSobreposicao(a) {
  const lista = sobreposicoes(a); if (!lista.length) return null;
  const itens = lista.slice(0, 3).map(b => `${nomeCurto(b.funcionario_nome)} (${b.data_inicio === b.data_fim ? fmtCurta(b.data_inicio) : fmtCurta(b.data_inicio) + ' a ' + fmtCurta(b.data_fim)})`).join(', ');
  return h('div', { class: 'sobrepoe', 'data-sobreposicao': lista.length, text: `Atenção: sobrepõe com o mesmo time: ${itens}${lista.length > 3 ? ` e mais ${lista.length - 3}` : ''}.` });
}

function avisosDoDia(base, iso) { return base.filter(a => a.data_inicio <= iso && a.data_fim >= iso); }
function gruposDoMesmoTime(lista) {
  const por = {}; lista.forEach(a => { if (a.gestor_id != null) (por[a.gestor_id] ||= []).push(a); });
  return Object.values(por).filter(g => g.length >= 2);
}
function baseCalendario() {
  const f = { ...S.fAv, de: '', ate: '' };
  return S.avisos.filter(a => (a.status === 'aprovado' || (S.calPend && a.status === 'pendente')) && passaFiltroAviso(a, f));
}

function calendario() {
  const { ano, mes } = S.cal;
  const ult = new Date(ano, mes + 1, 0).getDate();
  const ini = isoDe(ano, mes, 1), fim = isoDe(ano, mes, ult), hoje = hojeISO();
  const base = baseCalendario().filter(a => a.data_inicio <= fim && a.data_fim >= ini);
  const porDia = {};
  for (let d = 1; d <= ult; d++) { const iso = isoDe(ano, mes, d); porDia[iso] = avisosDoDia(base, iso); }
  const diasMulti = Object.keys(porDia).filter(k => porDia[k].length >= 2);
  const diasTime = Object.keys(porDia).filter(k => gruposDoMesmoTime(porDia[k]).length > 0);

  const nav = (delta) => () => { let m = S.cal.mes + delta, y = S.cal.ano; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } S.cal = { ano: y, mes: m }; atualizarAvisos(); };
  const topo = h('div', { class: 'cal-nav' },
    h('button', { class: 'btn sm', type: 'button', id: 'cal-prev', 'aria-label': 'Mês anterior', onclick: nav(-1) }, '‹'),
    h('h2', { id: 'cal-titulo', text: `${MESES[mes]} de ${ano}` }),
    h('button', { class: 'btn sm', type: 'button', id: 'cal-next', 'aria-label': 'Próximo mês', onclick: nav(1) }, '›'),
    h('button', { class: 'btn sm', type: 'button', id: 'cal-hoje', onclick: () => { const d = new Date(); S.cal = { ano: d.getFullYear(), mes: d.getMonth() }; atualizarAvisos(); } }, 'Hoje'));

  const botoesDias = (dias) => dias.map(k => h('button', { type: 'button', class: 'chip-dia', 'data-dia': k, onclick: () => abrirDia(k), text: `${fmtCurta(k)} (${porDia[k].length})` }));
  const resumo = h('div', { class: 'cal-resumo', id: 'cal-resumo' },
    h('div', {}, h('strong', { text: String(base.length) }), base.length === 1 ? ' aviso neste mês · ' : ' avisos neste mês · ',
      h('span', { class: 'tem-multi' }, h('strong', { id: 'cal-n-multi', text: String(diasMulti.length) }), diasMulti.length === 1 ? ' dia com mais de 1 aviso' : ' dias com mais de 1 aviso'), ' · ',
      h('span', { class: 'tem-time' }, h('strong', { id: 'cal-n-time', text: String(diasTime.length) }), diasTime.length === 1 ? ' dia com sobreposição no mesmo time' : ' dias com sobreposição no mesmo time')),
    diasMulti.length ? h('div', { class: 'cal-lista-dias' }, h('span', { class: 'hint', text: 'Dias com mais de 1 aviso:' }), botoesDias(diasMulti)) : null);

  const legenda = h('div', { class: 'cal-legenda' },
    h('span', {}, h('i', { class: 'sw multi' }), 'Mais de 1 aviso no dia'),
    h('span', {}, h('i', { class: 'sw time' }), 'Sobreposição no mesmo time'),
    h('span', {}, h('i', { class: 'sw pend' }), 'Aguardando aprovação'));

  const cabec = DIAS_SEM.map(d => h('div', { class: 'cal-cab', text: d }));
  const vazios = new Date(ano, mes, 1).getDay();
  const celulas = [];
  for (let i = 0; i < vazios; i++) celulas.push(h('div', { class: 'cal-dia vazio', 'aria-hidden': 'true' }));
  for (let d = 1; d <= ult; d++) {
    const iso = isoDe(ano, mes, d), lista = porDia[iso], n = lista.length, dow = new Date(ano, mes, d).getDay();
    const time = gruposDoMesmoTime(lista).length > 0;
    const mostrar = lista.slice(0, 3), extra = n - mostrar.length;
    const cls = 'cal-dia' + (n >= 2 ? ' multi' : '') + (time ? ' conflito' : '') + (iso === hoje ? ' hoje' : '') + (dow === 0 || dow === 6 ? ' fds' : '');
    celulas.push(h('div', { class: cls, 'data-dia': iso, 'data-n': n, tabindex: '0', role: 'button',
      'aria-label': `${d} de ${MESES[mes]}: ${n} ${n === 1 ? 'aviso' : 'avisos'}${time ? ', sobreposição no mesmo time' : ''}`,
      onclick: () => abrirDia(iso), onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirDia(iso); } } },
      h('div', { class: 'cal-topo' }, h('span', { class: 'cal-num', text: d }), n ? h('span', { class: 'cal-n' + (n >= 2 ? ' alto' : ''), title: `${n} ${n === 1 ? 'aviso' : 'avisos'}`, text: n }) : null),
      h('div', { class: 'cal-itens' },
        mostrar.map(a => h('div', { class: 'cal-item' + (a.status === 'pendente' ? ' pend' : ''), style: `--cor:${corNatureza(a.natureza)}`, title: `${a.funcionario_nome} · ${a.natureza}`, text: `${nomeCurto(a.funcionario_nome)} · ${a.natureza}` })),
        extra > 0 ? h('div', { class: 'cal-mais', text: `+${extra} mais` }) : null)));
  }
  return h('div', { class: 'cal', id: 'calendario' }, topo, resumo, legenda, h('div', { class: 'cal-grid' }, cabec, celulas));
}

/* Detalhe de um dia */
let diaAberto = null;
function conteudoDia(iso) {
  const lista = avisosDoDia(baseCalendario(), iso).sort((a, b) => a.funcionario_nome.localeCompare(b.funcionario_nome, 'pt-BR'));
  const grupos = gruposDoMesmoTime(lista);
  const topo = [];
  if (lista.length >= 2) topo.push(h('div', { class: 'dia-aviso multi', id: 'dia-multi', text: `${lista.length} avisos neste dia.` }));
  grupos.forEach(g => topo.push(h('div', { class: 'dia-aviso time', 'data-time': '1', text: `Sobreposição no time de ${nomeGestor(g[0].gestor_id) || 'gestor não definido'}: ${g.map(a => a.funcionario_nome).join(', ')}.` })));
  if (!lista.length) return h('div', { class: 'empty', text: 'Nenhum aviso neste dia.' });
  return h('div', {}, topo, h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(280px,1fr));margin-top:10px' }, lista.map(a => cardAviso(a, { decidir: ehAdmin() && a.status === 'pendente' }))));
}
function abrirDia(iso) {
  const corpo = h('div', { id: 'dia-corpo' });
  const dlg = modal({ titulo: `${diaSemana(iso)}, ${fmtData(iso)}`, corpo, largo: true });
  diaAberto = { iso, corpo };
  dlg.addEventListener('close', () => { diaAberto = null; });
  preencherDia();
}
function preencherDia() {
  if (!diaAberto || !document.body.contains(diaAberto.corpo)) { diaAberto = null; return; }
  subst(diaAberto.corpo, conteudoDia(diaAberto.iso));
}

/* ================= ANÁLISE DE ATENDIMENTOS ================= */
function nomesAtendentes() {
  const nomes = new Set(funcionariosPermitidos().map(f => f.nome));
  S.analises.forEach(a => { if (a.atendente && a.atendente.trim()) nomes.add(a.atendente.trim()); });
  return [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function viewAnalises() {
  const f = S.fAn, adm = ehAdmin();
  const campo = (id, rot, el, extra = '') => h('div', { class: 'field ' + extra }, h('label', { for: id, text: rot }), el);
  const selCanal = h('select', { id: 'an-canal', required: true }, h('option', { value: '' }, 'Selecione...'), CANAIS.map(c => h('option', { value: c }, c)));
  const iId = h('input', { id: 'an-id', type: 'text', maxlength: '120', required: true, autocomplete: 'off' });
  const iAtend = h('input', { id: 'an-atendente', type: 'text', maxlength: '200', required: true, autocomplete: 'off', list: 'dl-atendentes', placeholder: 'Digite ou escolha o nome' });
  const dlAtend = h('datalist', { id: 'dl-atendentes' }, nomesAtendentes().map(n => h('option', { value: n })));
  const iData = h('input', { id: 'an-data', type: 'date', required: true, value: hojeISO() });
  const tResumo = h('textarea', { id: 'an-resumo', required: true, maxlength: '4000' });
  const tAval = h('textarea', { id: 'an-aval', required: true, maxlength: '4000' });
  const tMelhoria = h('textarea', { id: 'an-melhoria', required: true, maxlength: '4000' });
  const erro = h('div', { class: 'err hidden', role: 'alert' });
  const form = h('form', { id: 'form-analise', novalidate: true, onsubmit: async ev => {
    ev.preventDefault(); erro.classList.add('hidden');
    const d = { atendente: iAtend.value.trim(), id_atendimento: iId.value.trim(), resumo: tResumo.value.trim(), avaliacao: tAval.value.trim(), pontos_melhoria: tMelhoria.value.trim(), canal: selCanal.value, data_atendimento: iData.value };
    const faltando = [['ID do atendimento', d.id_atendimento], ['Atendente', d.atendente], ['Resumo do atendimento', d.resumo], ['Avaliação do atendimento', d.avaliacao], ['Pontos de melhoria', d.pontos_melhoria], ['Canal do atendimento', d.canal], ['Data do atendimento', d.data_atendimento]].filter(x => !x[1]).map(x => x[0]);
    if (faltando.length) { erro.textContent = 'Preencha: ' + faltando.join(', ') + '.'; erro.classList.remove('hidden'); return; }
    const b = $('#an-enviar'); b.disabled = true;
    const ok = await acao(async () => { await api.criarAnalise(d); await atualizarDepois(); }, 'Atendimento registrado.');
    b.disabled = false;
    if (ok) { iId.value = ''; iAtend.value = ''; tResumo.value = ''; tAval.value = ''; tMelhoria.value = ''; selCanal.value = ''; iId.focus(); }
  } },
    h('div', { class: 'form-grid' },
      campo('an-id', 'ID do atendimento', iId), campo('an-atendente', 'Atendente', iAtend), campo('an-canal', 'Canal do atendimento', selCanal), campo('an-data', 'Data do atendimento', iData),
      campo('an-resumo', 'Resumo do atendimento', tResumo, 'span-all'),
      campo('an-aval', 'Avaliação do atendimento', tAval), campo('an-melhoria', 'Pontos de melhoria', tMelhoria)),
    dlAtend, erro, h('div', { class: 'right' }, h('button', { class: 'btn primary', id: 'an-enviar', type: 'submit' }, 'Registrar atendimento')));

  const txt = (id, rot, chave) => h('div', { class: 'field' }, h('label', { for: id, text: rot }), h('input', { id, type: 'search', value: f[chave], autocomplete: 'off', oninput: e => { f[chave] = e.target.value; S.anLimite = 200; atualizarAnalises(); } }));
  const txtLista = (id, rot, chave) => h('div', { class: 'field' }, h('label', { for: id, text: rot }), h('input', { id, type: 'search', value: f[chave], autocomplete: 'off', list: 'dl-atendentes-filtro', placeholder: 'Digite o nome', oninput: e => { f[chave] = e.target.value; S.anLimite = 200; atualizarAnalises(); } }), h('datalist', { id: 'dl-atendentes-filtro' }, nomesAtendentes().map(n => h('option', { value: n }))));
  const fCanal = h('select', { id: 'fan-canal', onchange: e => { f.canal = e.target.value; S.anLimite = 200; atualizarAnalises(); } }, h('option', { value: '' }, 'Todos'), CANAIS.map(c => h('option', { value: c }, c)));
  fCanal.value = f.canal;
  const fGestor = adm ? (() => { const s = h('select', { id: 'fan-gestor', onchange: e => { f.gestor = e.target.value; S.anLimite = 200; atualizarAnalises(); } }, h('option', { value: '' }, 'Todos'), S.perfis.slice().sort(byNome).map(p => h('option', { value: String(p.id) }, p.nome))); s.value = f.gestor; return h('div', { class: 'field' }, h('label', { for: 'fan-gestor', text: 'Gestor' }), s); })() : null;
  ui.anLista = h('div', { id: 'analises-lista' });
  return h('div', {},
    h('div', { class: 'page-head' }, h('div', {}, h('h1', { text: 'Análise de atendimentos' }),
      h('p', { text: adm ? 'Atendimentos avaliados diariamente pelos gestores. Somente você pode excluir registros.' : 'Registre diariamente os atendimentos que você avaliou no seu time. Você pode editar os seus registros, mas não apagá-los.' }))),
    h('div', { class: 'card panel' }, h('h2', { style: 'font-size:17px;margin-bottom:12px', text: 'Registrar atendimento avaliado' }), form),
    h('div', { class: 'card panel' },
      h('div', { class: 'filters' }, txt('fan-id', 'ID do atendimento', 'id'), txtLista('fan-atendente', 'Atendente', 'atendente'), txt('fan-resumo', 'Resumo', 'resumo'), txt('fan-aval', 'Avaliação', 'avaliacao'), txt('fan-mel', 'Pontos de melhoria', 'pontos'),
        h('div', { class: 'field' }, h('label', { for: 'fan-canal', text: 'Canal' }), fCanal),
        h('div', { class: 'field' }, h('label', { for: 'fan-de', text: 'Data (de)' }), h('input', { id: 'fan-de', type: 'date', value: f.de, onchange: e => { f.de = e.target.value; S.anLimite = 200; atualizarAnalises(); } })),
        h('div', { class: 'field' }, h('label', { for: 'fan-ate', text: 'Data (até)' }), h('input', { id: 'fan-ate', type: 'date', value: f.ate, onchange: e => { f.ate = e.target.value; S.anLimite = 200; atualizarAnalises(); } })),
        fGestor),
      h('div', { class: 'filters-foot' }, h('button', { class: 'linkbtn', type: 'button', onclick: () => { Object.assign(f, { id: '', atendente: '', resumo: '', avaliacao: '', pontos: '', canal: '', de: '', ate: '', gestor: '' }); S.anLimite = 200; render(); } }, 'Limpar filtros'))),
    ui.anLista);
}

function atualizarAnalises() {
  if (!ui.anLista || !document.body.contains(ui.anLista)) return;
  const f = S.fAn, adm = ehAdmin();
  const contem = (campo, termo) => !termo || norm(campo).includes(norm(termo));
  const arr = S.analises.filter(a => contem(a.id_atendimento, f.id) && contem(a.atendente, f.atendente) && contem(a.resumo, f.resumo) && contem(a.avaliacao, f.avaliacao) && contem(a.pontos_melhoria, f.pontos)
    && (!f.canal || a.canal === f.canal) && (!f.gestor || String(a.gestor_id) === f.gestor)
    && (!f.de || a.data_atendimento >= f.de) && (!f.ate || a.data_atendimento <= f.ate))
    .sort((a, b) => b.data_atendimento.localeCompare(a.data_atendimento) || b.id - a.id);
  const vis = arr.slice(0, S.anLimite);
  const cab = ['Data', 'ID', 'Atendente', 'Canal', adm ? 'Gestor' : null, 'Resumo', 'Avaliação', 'Pontos de melhoria', ''].filter(x => x !== null);
  const linhas = vis.map(a => h('tr', { 'data-id': a.id },
    h('td', { class: 'nowrap col-data', text: fmtData(a.data_atendimento) }), h('td', { class: 'nowrap col-id', text: a.id_atendimento }), h('td', { class: 'nome-atend col-atend', text: a.atendente || '—' }), h('td', { class: 'col-canal' }, h('span', { class: 'canal', text: a.canal })),
    adm ? h('td', { class: 'col-gestor', title: a.gestor_nome || nomeGestor(a.gestor_id) || '', text: nomeEnxuto(a.gestor_nome || nomeGestor(a.gestor_id)) || '—' }) : null,
    h('td', { class: 'cell-long', text: a.resumo }), h('td', { class: 'cell-long', text: a.avaliacao }), h('td', { class: 'cell-long', text: a.pontos_melhoria }),
    h('td', { class: 'col-acoes' }, h('span', { class: 'acoes' },
      h('button', { class: 'btn sm', 'data-acao': 'editar-analise', onclick: () => abrirEditarAnalise(a) }, 'Editar'),
      adm ? h('button', { class: 'btn sm danger', 'data-acao': 'excluir-analise', onclick: () => {
        if (!confirm(`Excluir o registro do atendimento ${a.id_atendimento}? Esta ação não pode ser desfeita.`)) return;
        acao(async () => { await api.excluirAnalise(a.id); await atualizarDepois(); }, 'Registro excluído.');
      } }, 'Excluir') : null))));
  subst(ui.anLista, 
    h('p', { class: 'meta-line', id: 'an-total', text: `${arr.length} ${arr.length === 1 ? 'registro' : 'registros'}${arr.length !== S.analises.length ? ` (de ${S.analises.length})` : ''}` }),
    arr.length ? h('div', { class: 'table-wrap' }, h('table', {}, h('thead', {}, h('tr', {}, cab.map(c => h('th', { text: c })))), h('tbody', {}, linhas)))
      : h('div', { class: 'empty', text: S.analises.length ? 'Nenhum registro com esses filtros.' : 'Nenhum atendimento registrado ainda.' }),
    arr.length > vis.length ? h('div', { class: 'right' }, h('button', { class: 'btn', onclick: () => { S.anLimite += 200; atualizarAnalises(); } }, `Mostrar mais (${arr.length - vis.length})`)) : null);
}

function abrirEditarAnalise(a) {
  const f = (id, rot, el, extra = '') => h('div', { class: 'field ' + extra }, h('label', { for: id, text: rot }), el);
  const iId = h('input', { id: 'ea-id', type: 'text', maxlength: '120', value: a.id_atendimento, autocomplete: 'off' });
  const iAt = h('input', { id: 'ea-atendente', type: 'text', maxlength: '200', value: a.atendente || '', autocomplete: 'off', list: 'dl-atendentes-edicao', placeholder: 'Digite ou escolha o nome' });
  const dlAt = h('datalist', { id: 'dl-atendentes-edicao' }, nomesAtendentes().map(n => h('option', { value: n })));
  const sCanal = h('select', { id: 'ea-canal' }, h('option', { value: '' }, 'Selecione...'), CANAIS.map(c => h('option', { value: c }, c))); sCanal.value = a.canal;
  const iData = h('input', { id: 'ea-data', type: 'date', value: a.data_atendimento });
  const tRes = h('textarea', { id: 'ea-resumo', maxlength: '4000', value: a.resumo });
  const tAval = h('textarea', { id: 'ea-aval', maxlength: '4000', value: a.avaliacao });
  const tMel = h('textarea', { id: 'ea-melhoria', maxlength: '4000', value: a.pontos_melhoria });
  const erro = h('div', { class: 'err hidden', role: 'alert' });
  const form = h('form', { id: 'form-edita-analise', novalidate: true, onsubmit: async ev => {
    ev.preventDefault(); erro.classList.add('hidden');
    const d = { atendente: iAt.value.trim(), id_atendimento: iId.value.trim(), resumo: tRes.value.trim(), avaliacao: tAval.value.trim(), pontos_melhoria: tMel.value.trim(), canal: sCanal.value, data_atendimento: iData.value };
    const faltando = [['ID do atendimento', d.id_atendimento], ['Atendente', d.atendente], ['Resumo do atendimento', d.resumo], ['Avaliação do atendimento', d.avaliacao], ['Pontos de melhoria', d.pontos_melhoria], ['Canal do atendimento', d.canal], ['Data do atendimento', d.data_atendimento]].filter(x => !x[1]).map(x => x[0]);
    if (faltando.length) { erro.textContent = 'Preencha: ' + faltando.join(', ') + '.'; erro.classList.remove('hidden'); return; }
    const b = $('#ea-salvar'); b.disabled = true;
    const ok = await acao(async () => { await api.editarAnalise(a.id, d); await atualizarDepois(); }, 'Atendimento atualizado.');
    if (ok) dlg.close(); else b.disabled = false;
  } },
    h('div', { class: 'form-grid' }, f('ea-id', 'ID do atendimento', iId), f('ea-atendente', 'Atendente', iAt), f('ea-canal', 'Canal do atendimento', sCanal), f('ea-data', 'Data do atendimento', iData),
      f('ea-resumo', 'Resumo do atendimento', tRes, 'span-all'), f('ea-aval', 'Avaliação do atendimento', tAval), f('ea-melhoria', 'Pontos de melhoria', tMel)), dlAt, erro);
  const dlg = modal({ titulo: 'Editar atendimento avaliado', corpo: form,
    rodape: [h('button', { class: 'btn', type: 'button', onclick: () => dlg.close() }, 'Cancelar'), h('button', { class: 'btn primary', id: 'ea-salvar', type: 'submit', form: 'form-edita-analise' }, 'Salvar alterações')] });
}

/* ================= MAPA DE LUGARES ================= */
const NS_SVG = 'http://www.w3.org/2000/svg';
function sv(tag, props = {}, ...kids) {
  const el = document.createElementNS(NS_SVG, tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) { if (kid == null || kid === false) continue; el.append(kid.nodeType ? kid : document.createTextNode(String(kid))); }
  return el;
}
const COR_SETOR_FIXA = { 'gestao': '#1abc9c', 'atendimento': '#3498db', 'inadimplencia': '#e74c3c', 'estrategicos': '#9b59b6', 'ativacao': '#f1c40f', 'backoffice': '#f39c12', 'qualidade': '#27ae60', 'melhoria continua': '#2ecc71' };
const PAL_SETOR = ['#3498db', '#e74c3c', '#9b59b6', '#f1c40f', '#f39c12', '#27ae60', '#1abc9c', '#2ecc71', '#e67e22', '#16a085', '#8e44ad', '#c0392b'];
function listaSetores() {
  return [...new Set(pessoas().map(f => f.subsetor).filter(Boolean).concat(S.lugares.map(l => l.setor).filter(Boolean)))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
function corSetorMapa(setor) {
  const k = norm(setor); if (!k) return '#b0b0b0'; if (COR_SETOR_FIXA[k]) return COR_SETOR_FIXA[k];
  for (const nome of Object.keys(COR_SETOR_FIXA)) if (k.startsWith(nome + ' ')) return COR_SETOR_FIXA[nome];
  let x = 0; for (const c of k) x = (x * 31 + c.charCodeAt(0)) >>> 0; return PAL_SETOR[x % PAL_SETOR.length];
}
const lugarAtual = id => S.lugares.find(l => l.lugar === id);
const rotuloLugar = id => { const l = LUGAR_POR_ID[id]; return `Ilha ${l.ilha} · Lugar ${l.n}`; };
const descLugar = a => !a ? 'Livre' : a.tipo === 'pessoa' ? `${a.funcionario_nome}${a.setor ? ` (${a.setor})` : ''}` : a.setor;

function resumoIlha(il) {
  const seats = LUGARES.filter(l => l.ilha === il);
  const ocup = seats.map(l => lugarAtual(l.id)).filter(Boolean);
  if (!ocup.length) return 'Livre';
  const setores = [...new Set(ocup.map(a => a.setor).filter(Boolean))];
  if (ocup.length === seats.length && setores.length === 1) return setores[0];
  return `${ocup.length} de ${seats.length} lugares`;
}

function desenharMapa() {
  const adm = ehAdmin(), { modo, sel } = S.mapa;
  const svg = sv('svg', { viewBox: '0 0 1780 810', role: 'img', 'aria-label': 'Mapa de lugares do escritório', class: 'mapa-svg' });
  ILHAS.forEach(il => {
    const d = DESK[il.orient], selIl = modo === 'ilha' && sel === il.id;
    const g = sv('g', { class: 'ilha' + (selIl ? ' sel' : ''), 'data-ilha': il.id });
    if (selIl) g.append(sv('rect', { x: il.x - 62, y: il.y - 62, width: d.w + 124, height: d.h + 124, rx: 18, class: 'ilha-halo' }));
    g.append(sv('rect', { x: il.x, y: il.y, width: d.w, height: d.h, class: 'mesa' }));
    for (let c = 1; c < d.cols; c++) g.append(sv('line', { x1: il.x + c * d.w / d.cols, y1: il.y, x2: il.x + c * d.w / d.cols, y2: il.y + d.h, class: 'mesa-linha' }));
    for (let r = 1; r < d.rows; r++) g.append(sv('line', { x1: il.x, y1: il.y + r * d.h / d.rows, x2: il.x + d.w, y2: il.y + r * d.h / d.rows, class: 'mesa-linha' }));
    const [rx, ry] = il.rot;
    const selecionar = () => { S.mapa.modo = 'ilha'; S.mapa.sel = il.id; atualizarMapa(); };
    g.append(sv('g', { class: 'ilha-rot', 'data-ilha-rotulo': il.id, tabindex: '0', role: 'button', 'aria-label': `Ilha ${il.id}: ${resumoIlha(il.id)}`, onclick: selecionar,
      onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecionar(); } } },
      sv('rect', { x: rx - 62, y: ry - 24, width: 124, height: 48, rx: 24 }), sv('text', { x: rx, y: ry + 10, 'text-anchor': 'middle', text: `Ilha ${il.id}` })));
    const sx = il.x + d.w / 2, sy = il.orient === 'v' ? il.y + d.h + 52 : (il.id === 3 ? il.y + d.h + 80 : il.y - 70);
    g.append(sv('text', { x: sx, y: sy, 'text-anchor': 'middle', class: 'ilha-sub', text: resumoIlha(il.id) }));
    svg.append(g);
  });
  LUGARES.forEach(l => {
    const a = lugarAtual(l.id), cor = a ? corSetorMapa(a.setor) : null;
    const eSel = (modo === 'lugar' && sel === l.id) || (modo === 'ilha' && sel === l.ilha);
    const click = () => { if (modo === 'ilha' && adm) S.mapa.sel = l.ilha; else { S.mapa.modo = 'lugar'; S.mapa.sel = l.id; } atualizarMapa(); };
    const r = sv('rect', { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, class: 'lugar' + (a ? '' : ' livre') + (a && a.tipo === 'pessoa' ? ' pessoa' : '') + (eSel ? ' sel' : ''),
      fill: cor || '#e5e7eb', 'data-lugar': l.id, 'data-tipo': a ? a.tipo : 'livre', tabindex: '0', role: 'button', 'aria-label': `${rotuloLugar(l.id)}: ${descLugar(a)}`, onclick: click,
      onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); click(); } } }, sv('title', { text: `${rotuloLugar(l.id)}: ${descLugar(a)}` }));
    svg.append(r, sv('text', { x: l.x + l.w / 2, y: l.y + l.h / 2 + 8, 'text-anchor': 'middle', class: 'lugar-n', fill: a ? '#fff' : '#374151', text: l.n }));
  });
  return svg;
}

function painelMapa() {
  const adm = ehAdmin(), { modo, sel } = S.mapa;
  if (sel == null) return h('div', {}, h('h3', { id: 'mp-titulo', text: modo === 'ilha' ? 'Selecione uma ilha' : 'Selecione um lugar' }),
    h('p', { class: 'hint', text: adm ? (modo === 'ilha' ? 'Clique em uma ilha no mapa para designá-la, inteira, a um setor.' : 'Clique em um lugar no mapa para designá-lo a um setor ou a uma pessoa.') : 'Clique em um lugar no mapa para ver a quem ele está designado.' }));
  const setores = listaSetores();
  if (modo === 'lugar') {
    const a = lugarAtual(sel), ocupa = {};
    S.lugares.forEach(l => { if (l.funcionario_id != null) ocupa[l.funcionario_id] = l.lugar; });
    const atual = h('div', { class: 'mp-atual', id: 'mp-atual' }, h('span', { class: 'hint', text: 'Designação atual' }), h('strong', { text: descLugar(a) }));
    if (!adm) return h('div', {}, h('h3', { id: 'mp-titulo', text: rotuloLugar(sel) }), atual, h('p', { class: 'hint', text: 'Somente o administrador altera o mapa.' }));
    const opc = h('select', { id: 'mp-opcao' }, h('option', { value: '' }, 'Selecione...'),
      h('optgroup', { label: 'Setores' }, setores.map(x => h('option', { value: 's:' + x }, x))),
      h('optgroup', { label: 'Pessoas' }, pessoas().sort(byNome).map(p => h('option', { value: 'p:' + p.id }, `${p.nome}${p.subsetor ? ' · ' + p.subsetor : ''}${ocupa[p.id] && ocupa[p.id] !== sel ? ` (hoje: ${rotuloLugar(ocupa[p.id])})` : ''}`))));
    opc.value = a ? (a.tipo === 'pessoa' ? 'p:' + a.funcionario_id : 's:' + a.setor) : '';
    const aplicar = async () => {
      const v = opc.value; if (!v) return toast('Escolha um setor ou uma pessoa na lista.', true);
      let item;
      if (v.startsWith('s:')) item = { lugar: sel, tipo: 'setor', setor: v.slice(2) };
      else {
        const fid = Number(v.slice(2)), p = pessoas().find(f => f.id === fid);
        if (ocupa[fid] && ocupa[fid] !== sel && !confirm(`${p.nome} já está em ${rotuloLugar(ocupa[fid])}. Mover para ${rotuloLugar(sel)}? O lugar anterior ficará livre.`)) return;
        item = { lugar: sel, tipo: 'pessoa', funcionario_id: fid };
      }
      await acao(async () => { await api.salvarLugares([item]); await atualizarDepois(); }, 'Lugar designado.');
    };
    return h('div', {}, h('h3', { id: 'mp-titulo', text: rotuloLugar(sel) }), atual,
      h('div', { class: 'field', style: 'margin:12px 0' }, h('label', { for: 'mp-opcao', text: 'Designar a' }), opc, h('small', { text: 'Escolha um setor (o lugar fica reservado ao setor) ou uma pessoa específica.' })),
      h('div', { class: 'acoes' }, h('button', { class: 'btn primary', id: 'mp-aplicar', type: 'button', onclick: aplicar }, 'Salvar designação'),
        h('button', { class: 'btn danger', id: 'mp-liberar', type: 'button', disabled: !a, onclick: () => acao(async () => { await api.salvarLugares([{ lugar: sel, tipo: 'livre' }]); await atualizarDepois(); }, 'Lugar liberado.') }, 'Liberar lugar')));
  }
  // modo ilha
  const seats = LUGARES.filter(l => l.ilha === sel), ocup = seats.map(l => lugarAtual(l.id)).filter(Boolean);
  const porSetor = {}; ocup.forEach(a => { porSetor[a.setor || '—'] = (porSetor[a.setor || '—'] || 0) + 1; });
  const info = h('div', { class: 'mp-atual', id: 'mp-atual' }, h('span', { class: 'hint', text: `${seats.length} lugares · ${ocup.length} designados · ${seats.length - ocup.length} livres` }),
    Object.keys(porSetor).length ? h('ul', { class: 'mp-lista' }, Object.entries(porSetor).map(([k, v]) => h('li', {}, h('i', { class: 'sw-cor', style: `--c:${corSetorMapa(k)}` }), `${k}: ${v}`))) : null);
  if (!adm) return h('div', {}, h('h3', { id: 'mp-titulo', text: `Ilha ${sel}` }), info, h('p', { class: 'hint', text: 'Somente o administrador altera o mapa.' }));
  const opc = h('select', { id: 'mp-setor-ilha' }, h('option', { value: '' }, 'Selecione o setor...'), setores.map(x => h('option', { value: x }, x)));
  return h('div', {}, h('h3', { id: 'mp-titulo', text: `Ilha ${sel}` }), info,
    h('div', { class: 'field', style: 'margin:12px 0' }, h('label', { for: 'mp-setor-ilha', text: 'Designar a ilha inteira ao setor' }), opc, h('small', { text: 'Todos os lugares da ilha passam a ser do setor. Depois dá para ajustar lugares individuais.' })),
    h('div', { class: 'acoes' },
      h('button', { class: 'btn primary', id: 'mp-aplicar-ilha', type: 'button', onclick: async () => {
        if (!opc.value) return toast('Escolha o setor.', true);
        const jaTem = seats.filter(l => { const a = lugarAtual(l.id); return a && !(a.tipo === 'setor' && a.setor === opc.value); }).length;
        if (jaTem && !confirm(`${jaTem} lugar(es) desta ilha já têm outra designação. Substituir todos por "${opc.value}"?`)) return;
        await acao(async () => { await api.salvarLugares(seats.map(l => ({ lugar: l.id, tipo: 'setor', setor: opc.value }))); await atualizarDepois(); }, `Ilha ${sel} designada a ${opc.value}.`);
      } }, 'Aplicar à ilha inteira'),
      h('button', { class: 'btn danger', id: 'mp-liberar-ilha', type: 'button', disabled: !ocup.length, onclick: async () => {
        if (!confirm(`Liberar todos os ${ocup.length} lugares designados da Ilha ${sel}?`)) return;
        await acao(async () => { await api.salvarLugares(seats.map(l => ({ lugar: l.id, tipo: 'livre' }))); await atualizarDepois(); }, `Ilha ${sel} liberada.`);
      } }, 'Liberar ilha')));
}

function viewMapa() {
  ui.mapa = h('div', { id: 'mapa-raiz' });
  return h('div', {},
    h('div', { class: 'page-head' }, h('div', {}, h('h1', { text: 'Mapa de lugares' }),
      h('p', { text: ehAdmin() ? 'Designe os lugares por ilha inteira ou lugar a lugar, a um setor ou a uma pessoa.' : 'Veja onde cada setor e cada pessoa estão acomodados. Somente o administrador altera o mapa.' }))),
    ui.mapa);
}

function atualizarMapa() {
  if (!ui.mapa || !document.body.contains(ui.mapa)) return;
  const adm = ehAdmin(), usados = [...new Set(S.lugares.map(l => l.setor).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const cont = setor => S.lugares.filter(l => l.setor === setor).length;
  const modoBtn = (m, rot) => h('button', { type: 'button', id: 'mp-modo-' + m, 'aria-pressed': String(S.mapa.modo === m), onclick: () => { if (S.mapa.modo !== m) { S.mapa.modo = m; S.mapa.sel = null; atualizarMapa(); } } }, rot);
  const legenda = h('div', { class: 'mapa-legenda' }, h('span', {}, h('i', { class: 'sw-cor', style: '--c:#e5e7eb;border:1px solid #9ca3af' }), `Livre (${LUGARES.length - S.lugares.length})`),
    usados.map(x => h('span', {}, h('i', { class: 'sw-cor', style: `--c:${corSetorMapa(x)}` }), `${x} (${cont(x)})`)),
    h('span', { class: 'hint' }, 'Contorno escuro = pessoa específica'));
  // resumo por setor
  const setoresF = [...new Set(pessoas().map(f => f.subsetor).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const linhasRes = setoresF.map(x => { const p = pessoas().filter(f => f.subsetor === x).length, l = cont(x), saldo = l - p;
    return h('tr', { 'data-setor': x }, h('td', {}, h('i', { class: 'sw-cor', style: `--c:${corSetorMapa(x)}` }), ' ', x), h('td', { class: 'c', text: p }), h('td', { class: 'c', text: l }),
      h('td', { class: 'c ' + (saldo < 0 ? 'neg' : saldo > 0 ? 'pos' : ''), text: saldo > 0 ? `+${saldo}` : String(saldo) })); });
  const designados = LUGARES.map(l => ({ l, a: lugarAtual(l.id) })).filter(x => x.a);
  subst(ui.mapa,
    S.lugaresIndisponivel ? h('div', { class: 'err', id: 'mapa-indisponivel', style: 'margin-bottom:12px', text: 'O mapa ainda não está ativado no banco de dados. Rode o arquivo atualizacao_03_lugares.sql no Supabase (veja o README) e recarregue a página.' }) : null,
    adm ? h('div', { class: 'mapa-barra' }, h('span', { class: 'hint', text: 'Designar:' }), h('div', { class: 'seg seg-btn', role: 'group', 'aria-label': 'Forma de designar' }, modoBtn('lugar', 'Por lugar'), modoBtn('ilha', 'Por ilha'))) : null,
    h('div', { class: 'mapa-grid' },
      h('div', { class: 'card mapa-card' }, desenharMapa(), legenda),
      h('div', { class: 'card panel mapa-painel', id: 'mapa-painel' }, painelMapa())),
    h('div', { class: 'card panel', style: 'margin-top:16px' }, h('h2', { style: 'font-size:17px;margin-bottom:10px', text: 'Lugares por setor' }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'mini-table', id: 'mapa-resumo' }, h('thead', {}, h('tr', {}, ['Setor', 'Pessoas', 'Lugares designados', 'Saldo'].map((c, i) => h('th', { class: i ? 'c' : '', text: c })))),
        h('tbody', {}, linhasRes))), h('p', { class: 'hint', style: 'margin:8px 0 0', text: 'Saldo = lugares designados menos pessoas do setor. Negativo significa que faltam lugares.' })),
    h('details', { class: 'card panel', style: 'margin-top:16px', id: 'mapa-lista' }, h('summary', { text: `Lista de lugares designados (${designados.length} de ${LUGARES.length})` }),
      designados.length ? h('div', { class: 'table-wrap', style: 'margin-top:10px' }, h('table', { class: 'mini-table' }, h('thead', {}, h('tr', {}, ['Ilha', 'Lugar', 'Designação'].map(c => h('th', { text: c })))),
        h('tbody', {}, designados.map(({ l, a }) => h('tr', { 'data-lugar-linha': l.id }, h('td', { text: `Ilha ${l.ilha}` }), h('td', { text: l.n }), h('td', { text: descLugar(a) })))))) : h('p', { class: 'hint', text: 'Nenhum lugar designado ainda.' })));
}

/* ================= COLABORADORES E ORGANIZAÇÃO ================= */
const COLS_ORG = [
  { k: 'matricula', t: 'Matrícula', tipo: 'texto' },
  { k: 'nome', t: 'Nome', tipo: 'texto' },
  { k: 'cargo', t: 'Cargo', tipo: 'lista' },
  { k: 'subsetor', t: 'Subsetor', tipo: 'lista' },
  { k: 'nivel', t: 'Nível de atuação', tipo: 'lista' },
  { k: 'admissao', t: 'Admissão', tipo: 'data' },
  { k: 'gestor', t: 'Gestor', tipo: 'gestor' },
  { k: 'horario_trabalho', t: 'Horário de trabalho', tipo: 'horario' },
  { k: 'horario_almoco', t: 'Horário de almoço', tipo: 'horario' },
  { k: 'regime', t: 'Regime de trabalho', tipo: 'lista' }
];
const LARG_COLS = { matricula: 6, nome: 14, cargo: 15, subsetor: 8, nivel: 8, admissao: 7, gestor: 10, horario_trabalho: 9, horario_almoco: 9, regime: 9 };
const PAL_EQUIPE = ['#B5E6A2', '#FF99CC', '#66FFFF', '#F1A983', '#FFC000', '#FFFF00', '#CCECFF', '#CC99FF', '#D0D0D0', '#E97132', '#9FD4A3', '#F4B6C2', '#B9D7EA', '#D7BDE2'];
/* cor da linha = cor da equipe do gestor da pessoa (como na planilha original); sem gestor na planilha, branca */
const corEquipeDe = f => { const sup = f.superior_id != null ? S.funcionarios.find(x => x.id === f.superior_id) : null; return (sup && sup.cor_equipe) || '#FFFFFF'; };
const proximaCorEquipe = () => { const usadas = new Set(S.funcionarios.map(x => (x.cor_equipe || '').toUpperCase())); return PAL_EQUIPE.find(c => !usadas.has(c.toUpperCase())) || '#E5E7EB'; };
async function garantirCorEquipe(supId) {
  const sup = supId != null ? S.funcionarios.find(x => x.id === supId) : null;
  if (sup && !sup.cor_equipe) { const cor = proximaCorEquipe(); await api.atualizarFuncionario(sup.id, { cor_equipe: cor }); sup.cor_equipe = cor; }
}
const RE_HORARIO = /^(-|\d{2}:\d{2} às \d{2}:\d{2})$/;
const normHorario = v => String(v || '').replace(/\s+à\s+/g, ' às ').replace(/\s+/g, ' ').trim();
const cargoCurto = c => String(c || '').replace(/\s+de sucesso do cliente/i, '').trim();
const gestorTexto = f => { const sup = f.superior_id != null ? S.funcionarios.find(x => x.id === f.superior_id) : null; return sup ? nomeExibicao(sup) : (f.gestor_nome || ''); };
const fmtAdm = iso => iso ? fmtData(String(iso).slice(0, 10)) : '';
const unicosOrg = k => [...new Set(S.funcionarios.map(f => f[k]).filter(v => v && v !== '-'))].sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));

function valorOrg(f, k) { return k === 'gestor' ? gestorTexto(f) : k === 'admissao' ? fmtAdm(f.admissao) : (f[k] == null ? '' : String(f[k])); }
function chaveOrdem(f, k) {
  if (k === 'admissao') return f.admissao || '9999';
  if (k === 'matricula') return f.matricula && /^\d+$/.test(f.matricula) ? f.matricula.padStart(10, '0') : '~';
  return norm(valorOrg(f, k)) || '~';
}
function filtrarOrg() {
  const o = S.org, t = norm(o.busca);
  const arr = S.funcionarios.filter(f => {
    if (o.tipo === 'pessoas' && f.vaga) return false;
    if (o.tipo === 'vagas' && !f.vaga) return false;
    if (o.sub && (f.subsetor || '') !== o.sub) return false;
    if (o.nivel && (f.nivel || '') !== o.nivel) return false;
    if (o.regime && (f.regime || '') !== o.regime) return false;
    if (o.gestor && gestorTexto(f) !== o.gestor) return false;
    if (t && !norm(`${f.nome} ${f.matricula || ''} ${f.cargo || ''} ${f.subsetor || ''} ${gestorTexto(f)}`).includes(t)) return false;
    return true;
  });
  const { col, dir } = o.sort;
  return arr.sort((a, b) => { const x = chaveOrdem(a, col), y = chaveOrdem(b, col); return (x < y ? -1 : x > y ? 1 : norm(a.nome).localeCompare(norm(b.nome))) * dir; });
}
function subordinadosDe(id) {
  const out = new Set(); const vai = x => S.funcionarios.filter(f => f.superior_id === x).forEach(f => { if (!out.has(f.id)) { out.add(f.id); vai(f.id); } }); vai(id); return out;
}

/* ----- edição de uma célula da planilha ----- */
function opcoesGestor(sel, excluirId) {
  const prop = pessoas().filter(p => p.id !== excluirId).sort(byNome);
  return [h('option', { value: '' }, '(sem gestor)'), prop.map(p => h('option', { value: String(p.id) }, `${nomeExibicao(p)}${p.apelido && norm(p.apelido) !== norm(nomeEnxuto(p.nome)) ? ' · ' + nomeEnxuto(p.nome) : ''}`)), h('option', { value: '__outro' }, 'Outro (gestor fora da planilha)...')];
}
async function salvarCelula(f, col, valor) {
  let patch; const v = typeof valor === 'string' ? valor.trim() : valor;
  if (col.k === 'nome') {
    if (!v) return toast('O nome não pode ficar vazio.', true);
    if (f.vaga && v.toLowerCase() !== 'vaga aberta') patch = { nome: v, vaga: false };
    else if (!f.vaga && v.toLowerCase() === 'vaga aberta') return toast('Para uma vaga, use o botão "Nova vaga". Aqui informe o nome da pessoa.', true);
    else patch = { nome: v };
  } else if (col.k === 'gestor') {
    if (valor.tipo === 'pessoa') { const p = S.funcionarios.find(x => x.id === valor.id); patch = { superior_id: p.id, gestor_nome: nomeExibicao(p) }; patch.__cor = p.id; }
    else if (valor.tipo === 'externo') patch = { superior_id: null, gestor_nome: valor.nome };
    else patch = { superior_id: null, gestor_nome: null };
  } else if (col.tipo === 'horario') {
    const h_ = normHorario(v);
    if (h_ && !RE_HORARIO.test(h_)) return toast('Use o formato 08:00 às 18:00 (ou - quando não houver).', true);
    patch = { [col.k]: h_ || null };
  } else if (col.k === 'admissao') patch = { admissao: v || null };
  else patch = { [col.k]: v || null };
  const corDe = patch.__cor; delete patch.__cor;
  const ok = await acao(async () => { await api.atualizarFuncionario(f.id, patch); if (corDe != null) await garantirCorEquipe(corDe); await atualizarDepois(); }, patch.vaga === false ? 'Vaga preenchida.' : 'Alteração salva.');
  if (!ok) atualizarOrg(true);
}
function iniciarEdicao(td, f, col) {
  if (!ehAdmin() || td.querySelector('.cel-edit')) return;
  let ed, feito = false;
  const restaurar = () => { feito = true; atualizarOrg(true); };
  const fim = salvar => { if (feito) return; feito = true; ed.classList.remove('cel-edit'); if (!salvar) { atualizarOrg(true); return; } enviar(); };
  const teclas = e => { if (e.key === 'Escape') { e.preventDefault(); fim(false); } else if (e.key === 'Enter' && col.tipo !== 'gestor') { e.preventDefault(); fim(true); } };
  let enviar;
  if (col.tipo === 'gestor') {
    ed = h('select', { class: 'cel-edit', 'aria-label': 'Gestor' }, opcoesGestor(null, f.id));
    ed.value = f.superior_id != null && S.funcionarios.some(x => x.id === f.superior_id) ? String(f.superior_id) : '';
    enviar = () => {
      if (ed.value === '__outro') { const nome = prompt('Nome do gestor (que não está na planilha):', f.gestor_nome || ''); if (nome === null || !nome.trim()) return atualizarOrg(true); return salvarCelula(f, col, { tipo: 'externo', nome: nome.trim() }); }
      if (ed.value === '') return salvarCelula(f, col, { tipo: 'nenhum' });
      return salvarCelula(f, col, { tipo: 'pessoa', id: Number(ed.value) });
    };
    ed.addEventListener('change', () => fim(true));
    ed.addEventListener('blur', () => setTimeout(() => fim(false), 150));
  } else {
    const atual = col.k === 'admissao' ? (f.admissao ? String(f.admissao).slice(0, 10) : '') : (f[col.k] == null ? '' : String(f[col.k]));
    const attrs = { class: 'cel-edit', type: col.tipo === 'data' ? 'date' : 'text', value: atual, maxlength: '200', 'aria-label': col.t };
    if (col.tipo === 'lista') attrs.list = 'dl-org-' + col.k;
    if (col.tipo === 'horario') { attrs.list = 'dl-org-horario'; attrs.placeholder = '08:00 às 18:00'; }
    ed = h('input', attrs);
    enviar = () => { if (ed.value.trim() === atual.trim()) return atualizarOrg(true); return salvarCelula(f, col, ed.value); };
    ed.addEventListener('blur', () => fim(true));
  }
  ed.addEventListener('keydown', teclas);
  td.classList.add('editando'); subst(td, ed); ed.focus(); if (ed.select) try { ed.select(); } catch { /* alguns tipos não permitem */ }
}

/* ----- formulário completo (novo, vaga, preencher vaga, editar) ----- */
function abrirFormColab({ modo, f = null, superior = null }) {
  const editar = modo === 'editar' || modo === 'preencher', ehVaga = modo === 'vaga' || (f && f.vaga && modo === 'editar');
  const v = k => (f && f[k] != null ? String(f[k]) : '');
  const campo = (id, rot, el, extra = '') => h('div', { class: 'field ' + extra }, h('label', { for: id, text: rot }), el);
  const inp = (id, val, extra = {}) => h('input', { id, type: 'text', value: val, maxlength: '200', autocomplete: 'off', ...extra });
  const dl = (id, k) => h('datalist', { id }, unicosOrg(k).map(x => h('option', { value: x })));
  const iNome = inp('fc-nome', modo === 'preencher' ? '' : (ehVaga ? 'Vaga aberta' : v('nome')), { placeholder: 'Nome completo', disabled: modo === 'vaga' || (modo === 'editar' && f.vaga) });
  const iMat = inp('fc-matricula', v('matricula'));
  const iCargo = inp('fc-cargo', v('cargo'), { list: 'dl-fc-cargo' }), iSub = inp('fc-subsetor', v('subsetor'), { list: 'dl-fc-sub' }), iNivel = inp('fc-nivel', v('nivel'), { list: 'dl-fc-nivel' });
  const iAdm = h('input', { id: 'fc-admissao', type: 'date', value: f && f.admissao ? String(f.admissao).slice(0, 10) : '' });
  const sGest = h('select', { id: 'fc-gestor' }, opcoesGestor(null, f ? f.id : null));
  const supInicial = f ? f.superior_id : superior;
  sGest.value = supInicial != null && S.funcionarios.some(x => x.id === supInicial) ? String(supInicial) : '';
  const iOutro = inp('fc-gestor-outro', f && f.superior_id == null ? (f.gestor_nome || '') : '', { placeholder: 'Nome do gestor' });
  const boxOutro = h('div', { class: 'field hidden', id: 'fc-outro-box' }, h('label', { for: 'fc-gestor-outro', text: 'Nome do gestor (fora da planilha)' }), iOutro);
  if (f && f.superior_id == null && f.gestor_nome && f.gestor_nome !== '-') { sGest.value = '__outro'; boxOutro.classList.remove('hidden'); }
  sGest.addEventListener('change', () => boxOutro.classList.toggle('hidden', sGest.value !== '__outro'));
  const iHor = inp('fc-horario', v('horario_trabalho'), { list: 'dl-fc-hor', placeholder: '08:00 às 18:00 ou -' }), iAlm = inp('fc-almoco', v('horario_almoco'), { list: 'dl-fc-hor', placeholder: '12:00 às 13:12 ou -' });
  const iReg = inp('fc-regime', v('regime'), { list: 'dl-fc-reg' });
  let corMexida = false, corLimpa = false;
  const iCor = h('input', { id: 'fc-cor', type: 'color', value: (f && f.cor_equipe) || '#ffffff', oninput: () => { corMexida = true; corLimpa = false; } });
  const limparCor = h('button', { class: 'linkbtn', type: 'button', id: 'fc-cor-limpar', onclick: () => { iCor.value = '#ffffff'; corLimpa = true; corMexida = false; } }, 'Sem cor');
  const erro = h('div', { class: 'err hidden', role: 'alert' });
  const titulo = { novo: 'Novo colaborador', vaga: 'Nova vaga', preencher: 'Preencher vaga', editar: ehVaga ? 'Editar vaga' : 'Editar colaborador' }[modo];
  const form = h('form', { id: 'form-colab', novalidate: true, onsubmit: async ev => {
    ev.preventDefault(); erro.classList.add('hidden');
    const nome = modo === 'vaga' || (modo === 'editar' && f.vaga) ? 'Vaga aberta' : iNome.value.trim();
    const hor = normHorario(iHor.value), alm = normHorario(iAlm.value);
    const falhas = [];
    if (!nome || (modo === 'preencher' && nome.toLowerCase() === 'vaga aberta')) falhas.push('informe o nome da pessoa');
    if ((modo === 'vaga' || ehVaga) && (!iCargo.value.trim() || !iSub.value.trim())) falhas.push('informe cargo e subsetor da vaga');
    if (hor && !RE_HORARIO.test(hor)) falhas.push('horário de trabalho no formato 08:00 às 18:00 (ou -)');
    if (alm && !RE_HORARIO.test(alm)) falhas.push('horário de almoço no formato 12:00 às 13:12 (ou -)');
    if (sGest.value === '__outro' && !iOutro.value.trim()) falhas.push('informe o nome do gestor');
    if (falhas.length) { erro.textContent = 'Verifique: ' + falhas.join('; ') + '.'; erro.classList.remove('hidden'); return; }
    const sup = sGest.value && sGest.value !== '__outro' ? S.funcionarios.find(x => x.id === Number(sGest.value)) : null;
    const dados = { nome, matricula: iMat.value.trim() || null, cargo: iCargo.value.trim() || null, subsetor: iSub.value.trim() || null, nivel: iNivel.value.trim() || null,
      admissao: iAdm.value || null, horario_trabalho: hor || null, horario_almoco: alm || null, regime: iReg.value.trim() || null,
      superior_id: sup ? sup.id : null, gestor_nome: sup ? nomeExibicao(sup) : (sGest.value === '__outro' ? iOutro.value.trim() : null) };
    if (corLimpa) dados.cor_equipe = null; else if (corMexida) dados.cor_equipe = iCor.value.toUpperCase();
    const b = $('#fc-salvar'); b.disabled = true;
    const ok = await acao(async () => {
      if (modo === 'novo' || modo === 'vaga') await api.criarFuncionario({ ...dados, vaga: modo === 'vaga' });
      else await api.atualizarFuncionario(f.id, { ...dados, vaga: modo === 'preencher' ? false : f.vaga });
      if (sup) await garantirCorEquipe(sup.id);
      await atualizarDepois();
    }, { novo: 'Colaborador incluído.', vaga: 'Vaga incluída.', preencher: 'Vaga preenchida.', editar: 'Alterações salvas.' }[modo]);
    if (ok) dlg.close(); else b.disabled = false;
  } },
    h('div', { class: 'form-grid' },
      campo('fc-nome', ehVaga ? 'Nome' : 'Nome', iNome, 'span-all'), campo('fc-matricula', 'Matrícula', iMat), campo('fc-admissao', 'Admissão', iAdm),
      campo('fc-cargo', 'Cargo', iCargo), campo('fc-subsetor', 'Subsetor', iSub), campo('fc-nivel', 'Nível de atuação', iNivel), campo('fc-gestor', 'Gestor', sGest), boxOutro,
      campo('fc-horario', 'Horário de trabalho', iHor), campo('fc-almoco', 'Horário de almoço', iAlm), campo('fc-regime', 'Regime de trabalho', iReg),
      ehVaga ? null : h('div', { class: 'field' }, h('label', { for: 'fc-cor', text: 'Cor da equipe que esta pessoa lidera' }), h('div', { class: 'cor-linha' }, iCor, limparCor), h('small', { text: 'Pinta, na planilha, as linhas de quem tem esta pessoa como gestor.' }))),
    dl('dl-fc-cargo', 'cargo'), dl('dl-fc-sub', 'subsetor'), dl('dl-fc-nivel', 'nivel'), dl('dl-fc-reg', 'regime'),
    h('datalist', { id: 'dl-fc-hor' }, [...new Set([...unicosOrg('horario_trabalho'), ...unicosOrg('horario_almoco')])].map(x => h('option', { value: x }))), erro);
  const extra = [];
  if (modo === 'editar' && f) {
    const nSub = S.funcionarios.filter(x => x.superior_id === f.id).length;
    extra.push(h('button', { class: 'btn danger', type: 'button', id: 'fc-excluir', style: 'margin-right:auto', onclick: () => excluirColab(f, () => dlg.close()) }, 'Excluir'));
    if (!f.vaga) { extra.push(h('button', { class: 'btn', type: 'button', id: 'fc-add-sub', onclick: () => { dlg.close(); abrirFormColab({ modo: 'novo', superior: f.id }); } }, 'Adicionar subordinado'),
      h('button', { class: 'btn', type: 'button', id: 'fc-add-vaga', onclick: () => { dlg.close(); abrirFormColab({ modo: 'vaga', superior: f.id }); } }, 'Adicionar vaga'));
      if (nSub) form.prepend(h('div', { class: 'hint', style: 'margin-bottom:8px', text: `${nSub} ${nSub === 1 ? 'pessoa tem' : 'pessoas têm'} esta pessoa como gestor.` }));
    }
  }
  const dlg = modal({ titulo, corpo: form, largo: true, rodape: [...extra, h('button', { class: 'btn', type: 'button', onclick: () => dlg.close() }, 'Cancelar'), h('button', { class: 'btn primary', id: 'fc-salvar', type: 'submit', form: 'form-colab' }, modo === 'preencher' ? 'Preencher vaga' : 'Salvar')] });
  setTimeout(() => { const alvo = modo === 'vaga' || (f && f.vaga && modo === 'editar') ? $('#fc-cargo') : $('#fc-nome'); if (alvo && !alvo.disabled) alvo.focus(); }, 30);
}
function excluirColab(f, depois) {
  const n = S.funcionarios.filter(x => x.superior_id === f.id).length;
  const quem = f.vaga ? `a vaga de ${cargoCurto(f.cargo) || 'sem cargo'} (${f.subsetor || 'sem subsetor'})` : f.nome;
  if (!confirm(`Excluir ${quem}?${n ? `\n\n${n} ${n === 1 ? 'pessoa fica' : 'pessoas ficam'} sem gestor.` : ''}${f.vaga ? '' : '\nOs avisos antigos continuam no quadro e o lugar no mapa é liberado.'}`)) return;
  acao(async () => { await api.excluirFuncionario(f.id); await atualizarDepois(); }, f.vaga ? 'Vaga excluída.' : 'Colaborador excluído.').then(ok => { if (ok && depois) depois(); });
}
function abrirFicha(f) {
  const linhas = COLS_ORG.map(c => [c.t, valorOrg(f, c.k) || '—']);
  modal({ titulo: f.vaga ? 'Vaga aberta' : f.nome, corpo: h('dl', { class: 'ficha' }, linhas.map(([k, vv]) => [h('dt', { text: k }), h('dd', { text: vv })])) });
}

/* ----- exportar CSV ----- */
function exportarCsv() {
  const lista = filtrarOrg(); const esc_ = x => { const s = String(x ?? ''); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const linhas = [COLS_ORG.map(c => c.t).join(';'), ...lista.map(f => COLS_ORG.map(c => esc_(c.k === 'admissao' ? fmtAdm(f.admissao) : valorOrg(f, c.k))).join(';'))];
  const blob = new Blob(['\ufeff' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `colaboradores-${hojeISO()}.csv` }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast(`${lista.length} linhas exportadas.`);
}

/* ----- tela ----- */
function viewOrg() {
  const o = S.org, adm = ehAdmin();
  ui.org = h('div', { id: 'org-raiz' });
  const sel = (id, rot, chave, valores, extra) => { const s = h('select', { id, onchange: e => { o[chave] = e.target.value; atualizarOrg(true); } }, h('option', { value: '' }, 'Todos'), valores.map(x => h('option', { value: x }, x))); s.value = o[chave]; return h('div', { class: 'field' }, h('label', { for: id, text: rot }), s); };
  const gestoresTxt = [...new Set(S.funcionarios.map(f => gestorTexto(f)).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const tipo = h('select', { id: 'of-tipo', onchange: e => { o.tipo = e.target.value; atualizarOrg(true); } }, h('option', { value: 'todos' }, 'Colaboradores e vagas'), h('option', { value: 'pessoas' }, 'Só colaboradores'), h('option', { value: 'vagas' }, 'Só vagas'));
  tipo.value = o.tipo;
  const busca = h('input', { id: 'of-busca', type: 'search', placeholder: o.visao === 'organograma' ? 'Buscar pessoa no organograma...' : 'Nome, matrícula, cargo...', autocomplete: 'off', value: o.busca, oninput: e => { o.busca = e.target.value; atualizarOrg(true); if (o.visao === 'organograma') buscarNoOrganograma(); } });
  const alternar = v => () => { if (o.visao !== v) { o.visao = v; o.autoAjuste = true; render(); } };
  return h('div', {},
    h('div', { class: 'page-head' }, h('div', {}, h('h1', { text: 'Colaboradores e Organização' }),
      h('p', { text: adm ? 'A planilha de colaboradores e o organograma, ambos editáveis. Clique em uma célula para alterar e use os botões para incluir colaboradores e vagas.' : 'A planilha de colaboradores e o organograma do setor. Somente o administrador altera.' })),
      h('div', { class: 'head-acoes' },
        h('div', { class: 'seg seg-btn', role: 'group', 'aria-label': 'Forma de visualizar' }, h('button', { type: 'button', id: 'org-v-planilha', 'aria-pressed': String(o.visao === 'planilha'), onclick: alternar('planilha') }, 'Planilha'), h('button', { type: 'button', id: 'org-v-org', 'aria-pressed': String(o.visao === 'organograma'), onclick: alternar('organograma') }, 'Organograma')),
        adm ? h('button', { class: 'btn primary', id: 'org-novo', onclick: () => abrirFormColab({ modo: 'novo' }) }, '+ Colaborador') : null,
        adm ? h('button', { class: 'btn primary', id: 'org-nova-vaga', onclick: () => abrirFormColab({ modo: 'vaga' }) }, '+ Vaga') : null,
        h('button', { class: 'btn', id: 'org-csv', onclick: exportarCsv }, 'Exportar CSV'),
        o.visao === 'organograma' ? h('div', { class: 'org-busca' }, h('label', { for: 'of-busca', class: 'sr-only', text: 'Buscar pessoa' }), busca) : null)),
    o.visao === 'planilha' ? h('div', { class: 'card panel' },
      h('div', { class: 'filters' },
        h('div', { class: 'field' }, h('label', { for: 'of-busca', text: 'Buscar' }), busca),
        o.visao === 'planilha' ? sel('of-sub', 'Subsetor', 'sub', unicosOrg('subsetor')) : null,
        o.visao === 'planilha' ? sel('of-nivel', 'Nível', 'nivel', unicosOrg('nivel')) : null,
        o.visao === 'planilha' ? sel('of-gestor', 'Gestor', 'gestor', gestoresTxt) : null,
        o.visao === 'planilha' ? sel('of-regime', 'Regime', 'regime', unicosOrg('regime')) : null,
        o.visao === 'planilha' ? h('div', { class: 'field' }, h('label', { for: 'of-tipo', text: 'Mostrar' }), tipo) : null),
      h('div', { class: 'filters-foot' }, o.visao === 'planilha' ? h('button', { class: 'linkbtn', type: 'button', onclick: () => { Object.assign(o, { busca: '', sub: '', nivel: '', gestor: '', regime: '', tipo: 'todos' }); render(); } }, 'Limpar filtros') : h('span', { class: 'hint', text: 'A busca localiza e destaca a pessoa no organograma.' }))) : null,
    S.colabIndisponivel ? h('div', { class: 'err', id: 'org-indisponivel', style: 'margin:12px 0', text: 'O banco de dados ainda não tem as colunas desta aba (horários, regime, vagas e gestor por pessoa). Rode o arquivo atualizacao_05_colaboradores.sql no Supabase (veja o README) e recarregue a página.' }) : null,
    ui.org);
}

function atualizarOrg(forcar) {
  if (!ui.org || !document.body.contains(ui.org)) return;
  if (!forcar && document.querySelector('.cel-edit')) return;   // não derruba uma edição em andamento
  const o = S.org;
  const listas = h('div', { class: 'hidden' }, ['cargo', 'subsetor', 'nivel', 'regime'].map(k => h('datalist', { id: 'dl-org-' + k }, unicosOrg(k).map(x => h('option', { value: x })))),
    h('datalist', { id: 'dl-org-horario' }, [...new Set([...unicosOrg('horario_trabalho'), ...unicosOrg('horario_almoco')])].map(x => h('option', { value: x }))));
  subst(ui.org, listas, o.visao === 'planilha' ? tabelaOrg() : organograma());
  if (o.visao === 'organograma' && o.autoAjuste) { ajustarOrg(); o.autoAjuste = false; }
  if (o.visao === 'organograma' && o.rolarPara) { const el = $(`.org-no[data-no="${o.rolarPara}"]`); if (el) el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' }); o.rolarPara = null; }
}

function tabelaOrg() {
  const o = S.org, adm = ehAdmin(), lista = filtrarOrg();
  const nPessoas = S.funcionarios.filter(f => !f.vaga).length, nVagas = S.funcionarios.length - nPessoas;
  const seta = k => o.sort.col === k ? (o.sort.dir === 1 ? ' ▲' : ' ▼') : '';
  const estiloBtn = 'background:none;border:0;color:inherit;font:inherit;font-weight:700;cursor:pointer;padding:0;text-transform:none;letter-spacing:0';
  const cab = COLS_ORG.map(c => h('th', { class: 'th-ord', 'data-col': c.k, 'aria-sort': o.sort.col === c.k ? (o.sort.dir === 1 ? 'ascending' : 'descending') : 'none' },
    h('button', { type: 'button', class: 'ord', style: estiloBtn, title: 'Ordenar por ' + c.t, onclick: () => { o.sort = { col: c.k, dir: o.sort.col === c.k ? -o.sort.dir : 1 }; atualizarOrg(true); } }, c.t + seta(c.k))));
  if (adm) cab.push(h('th', { class: 'th-acoes', 'aria-label': 'Ações' }));
  const linhas = lista.map(f => {
    const cels = COLS_ORG.map(c => {
      const txt = valorOrg(f, c.k);
      const td = h('td', { class: 'cel cel-' + c.k + (adm ? ' edit' : ''), 'data-col': c.k, tabindex: adm ? '0' : null, title: adm ? 'Clique para editar' : null,
        onclick: adm ? () => iniciarEdicao(td, f, c) : null, onkeydown: adm ? e => { if (e.key === 'Enter' && e.target === td) { e.preventDefault(); iniciarEdicao(td, f, c); } } : null }, txt || h('span', { class: 'vazio', text: '—' }));
      return td;
    });
    if (adm) cels.push(h('td', { class: 'col-acoes' }, h('span', { class: 'acoes' },
      f.vaga ? h('button', { class: 'ic', type: 'button', 'data-acao': 'preencher', title: 'Preencher a vaga', 'aria-label': 'Preencher a vaga', onclick: () => abrirFormColab({ modo: 'preencher', f }) }, '✓') : null,
      f.vaga ? h('button', { class: 'ic', type: 'button', 'data-acao': 'duplicar', title: 'Duplicar a vaga', 'aria-label': 'Duplicar a vaga', onclick: () => acao(async () => { await api.criarFuncionario({ ...f, id: undefined, nome: 'Vaga aberta', vaga: true, matricula: null, admissao: null, cor_equipe: null }); await atualizarDepois(); }, 'Vaga duplicada.') }, '⧉') : null,
      h('button', { class: 'ic ic-x', type: 'button', 'data-acao': 'excluir-colab', title: f.vaga ? 'Excluir a vaga' : 'Excluir colaborador', 'aria-label': f.vaga ? 'Excluir a vaga' : 'Excluir colaborador', onclick: () => excluirColab(f) }, '✕'))));
    return h('tr', { class: f.vaga ? 'linha-vaga' : '', 'data-id': f.id, style: `--linha:${corEquipeDe(f)}` }, cels);
  });
  const larg = k => `width:${LARG_COLS[k]}%`;
  return h('div', {},
    h('p', { class: 'meta-line', id: 'org-total', text: `${lista.length} ${lista.length === 1 ? 'linha' : 'linhas'}${lista.length !== S.funcionarios.length ? ` (de ${S.funcionarios.length})` : ''} · ${nPessoas} colaboradores e ${nVagas} ${nVagas === 1 ? 'vaga' : 'vagas'}` }),
    lista.length ? h('div', { class: 'table-wrap org-tabela' }, h('table', { id: 'org-tabela' },
      h('colgroup', {}, COLS_ORG.map(c => h('col', { style: larg(c.k) })), adm ? h('col', { style: 'width:5%' }) : null),
      h('thead', {}, h('tr', {}, cab)), h('tbody', {}, linhas))) : h('div', { class: 'empty', text: 'Nenhuma linha com esses filtros.' }));
}

/* ----- organograma ----- */
function arvoreOrg() {
  const por = new Map(S.funcionarios.map(f => [f.id, f])), filhos = new Map(), ext = new Map(), raizes = [];
  const no = f => ({ id: f.id, f, nome: f.nome, filhos: [] }); const nos = new Map(S.funcionarios.map(f => [f.id, no(f)]));
  S.funcionarios.forEach(f => {
    const n = nos.get(f.id);
    if (f.superior_id != null && por.has(f.superior_id)) nos.get(f.superior_id).filhos.push(n);
    else if (f.gestor_nome && f.gestor_nome.trim() && f.gestor_nome.trim() !== '-') {
      const k = norm(f.gestor_nome); if (!ext.has(k)) ext.set(k, { id: 'ext:' + k, f: null, nome: f.gestor_nome.trim(), filhos: [] }); ext.get(k).filhos.push(n);
    } else raizes.push(n);
  });
  const rank = { 'Head': 0, 'Coordenação': 1, 'Supervisão': 2, 'Ponto Focal': 3, 'Especialista': 4 };
  const tam = n => 1 + n.filhos.reduce((a, c) => a + tam(c), 0);
  const ordena = n => { n.filhos.sort((a, b) => ((b.filhos.length > 0) - (a.filhos.length > 0)) || (tam(b) - tam(a)) || ((rank[a.f && a.f.nivel] ?? 9) - (rank[b.f && b.f.nivel] ?? 9)) || ((a.f && a.f.vaga) - (b.f && b.f.vaga)) || norm(a.nome).localeCompare(norm(b.nome))); n.filhos.forEach(ordena); };
  const topo = [...ext.values(), ...raizes]; topo.forEach(ordena);
  topo.sort((a, b) => (tam(b) - tam(a)));
  return topo;
}
function percorrer(nos, fn, pai = null) { nos.forEach(n => { fn(n, pai); percorrer(n.filhos, fn, n); }); }
function expandirPadrao(topo) {
  const s = new Set(); percorrer(topo, n => { if (n.filhos.length && n.filhos.some(c => c.filhos.length)) s.add(n.id); if (!n.f && n.filhos.length) s.add(n.id); }); return s;
}
function organograma() {
  const o = S.org, adm = ehAdmin(), topo = arvoreOrg();
  if (!o.aberto) o.aberto = expandirPadrao(topo);
  const nTotal = S.funcionarios.length;
  const setores = [...new Set(S.funcionarios.map(f => f.subsetor).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const barra = h('div', { class: 'org-barra' },
    h('button', { class: 'btn sm', id: 'org-expandir', type: 'button', onclick: () => { const s = new Set(); percorrer(topo, n => { if (n.filhos.length) s.add(n.id); }); o.aberto = s; o.foco = null; o.autoAjuste = true; atualizarOrg(true); } }, 'Expandir tudo'),
    h('button', { class: 'btn sm', id: 'org-recolher', type: 'button', onclick: () => { o.aberto = expandirPadrao(topo); o.foco = null; o.autoAjuste = true; atualizarOrg(true); } }, 'Recolher equipes'),
    h('button', { class: 'btn sm', id: 'org-ajustar', type: 'button', onclick: () => { o.autoAjuste = true; atualizarOrg(true); } }, 'Ajustar à tela'),
    h('span', { class: 'org-zoom-ctl' }, h('button', { class: 'btn sm', id: 'org-zoom-menos', type: 'button', 'aria-label': 'Diminuir', onclick: () => { o.zoom = Math.max(0.3, +(o.zoom - 0.1).toFixed(2)); atualizarOrg(true); } }, '−'),
      h('span', { id: 'org-zoom-val', text: Math.round(o.zoom * 100) + '%' }), h('button', { class: 'btn sm', id: 'org-zoom-mais', type: 'button', 'aria-label': 'Aumentar', onclick: () => { o.zoom = Math.min(1.6, +(o.zoom + 0.1).toFixed(2)); atualizarOrg(true); } }, '+')),
    adm ? h('span', { class: 'hint', text: 'Arraste uma pessoa sobre o gestor dela para mudar a hierarquia. Clique para editar.' }) : h('span', { class: 'hint', text: 'Clique em uma pessoa para ver os dados.' }));
  const legenda = h('div', { class: 'org-legenda', id: 'org-legenda' }, h('span', { class: 'hint', text: 'Setores (clique para expandir e destacar):' }),
    setores.map(x => { const n = S.funcionarios.filter(f => f.subsetor === x).length; return h('button', { class: 'org-chip' + (o.foco === x ? ' ativo' : ''), type: 'button', 'data-setor': x, style: `--cor:${corSetorMapa(x)}`, 'aria-pressed': String(o.foco === x), onclick: () => focarSetor(x) }, h('i', { class: 'sw-cor', style: `--c:${corSetorMapa(x)}` }), `${x} (${n})`); }));
  const filhosOrg = n => {
    const folhas = n.filhos.every(c => !c.filhos.length);
    if (folhas && n.filhos.length > 6) { const cols = n.filhos.length <= 14 ? 3 : 4; return h('div', { class: 'org-equipe-wrap' }, h('div', { class: 'org-stub' }), h('div', { class: 'org-equipe', style: `--cols:${cols}`, 'data-equipe': String(n.id) }, n.filhos.map(c => h('div', { class: 'org-folha' }, caixaOrg(c))))); }
    return h('ul', {}, n.filhos.map(c => h('li', {}, caixaOrg(c), c.filhos.length && o.aberto.has(c.id) ? filhosOrg(c) : null)));
  };
  const raiz = h('ul', {}, topo.map(n => h('li', {}, caixaOrg(n), n.filhos.length && o.aberto.has(n.id) ? filhosOrg(n) : null)));
  return h('div', {}, barra, legenda, h('p', { class: 'meta-line', id: 'org-resumo', text: `${nTotal} posições no organograma (${S.funcionarios.filter(f => f.vaga).length} vagas)` }),
    h('div', { class: 'org-wrap' }, h('div', { class: 'org', id: 'organograma', style: `zoom:${o.zoom}` }, raiz)));
}
function avatarOrg() {
  return sv('svg', { viewBox: '0 0 64 64', 'aria-hidden': 'true', class: 'org-silhueta' }, sv('circle', { cx: 32, cy: 25, r: 11.5 }), sv('path', { d: 'M7 66c0-17 11-26 25-26s25 9 25 26z' }));
}
function caixaOrg(n) {
  const o = S.org, adm = ehAdmin(), f = n.f, ext = !f, aberto = o.aberto && o.aberto.has(n.id), arrasta = !ext && adm;
  const cor = f ? corSetorMapa(f.subsetor) : '#94a3b8';
  const apagado = o.foco && (!f || f.subsetor !== o.foco);
  const box = h('div', { class: 'org-no' + (ext ? ' ext' : '') + (f && f.vaga ? ' vaga' : '') + (o.achados && o.achados.has(n.id) ? ' achado' : '') + (apagado ? ' apagado' : ''), 'data-no': String(n.id), style: `--cor:${cor}`, tabindex: '0', role: 'button',
    draggable: arrasta ? 'true' : null, title: ext ? `${n.nome} (gestor fora da planilha)` : [f.vaga ? 'Vaga aberta' : f.nome, f.cargo, f.subsetor, f.horario_trabalho && f.horario_trabalho !== '-' ? 'Horário: ' + f.horario_trabalho : '', f.regime && f.regime !== '-' ? f.regime : ''].filter(Boolean).join(' · '),
    onclick: () => { if (ext) abrirExterno(n); else if (adm) abrirFormColab({ modo: 'editar', f }); else abrirFicha(f); },
    onkeydown: e => { if (e.key === 'Enter' && e.target === box) { e.preventDefault(); box.click(); } } },
    h('div', { class: 'org-avatar' }, avatarOrg(),
      n.filhos.length ? h('button', { class: 'org-toggle', type: 'button', 'aria-expanded': String(!!aberto), 'aria-label': aberto ? 'Recolher equipe' : `Mostrar ${n.filhos.length} subordinados`,
        onclick: e => { e.stopPropagation(); if (aberto) o.aberto.delete(n.id); else o.aberto.add(n.id); atualizarOrg(true); } }, aberto ? '−' : `+${n.filhos.length}`) : null),
    h('div', { class: 'org-nome', text: ext ? n.nome : (f.vaga ? 'Vaga aberta' : nomeExibicao(f)) }),
    h('div', { class: 'org-meta', text: ext ? 'Fora da planilha' : (f.vaga ? cargoCurto(f.cargo) : [f.nivel, f.subsetor].filter(Boolean).join(' · ')) || '—' }));
  if (arrasta) box.addEventListener('dragstart', e => { o.arrasto = { id: n.id, proibidos: new Set([n.id, ...subordinadosDe(n.id)]) }; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(n.id)); } catch { /* ok */ } box.classList.add('arrastando'); });
  if (arrasta) box.addEventListener('dragend', () => { o.arrasto = null; box.classList.remove('arrastando'); document.querySelectorAll('.org-no.alvo').forEach(x => x.classList.remove('alvo')); });
  if (adm) {
    box.addEventListener('dragover', e => { const a = o.arrasto; if (!a || (typeof n.id === 'number' && a.proibidos.has(n.id)) || (f && f.vaga)) return; e.preventDefault(); box.classList.add('alvo'); });
    box.addEventListener('dragleave', () => box.classList.remove('alvo'));
    box.addEventListener('drop', e => { e.preventDefault(); box.classList.remove('alvo'); const a = o.arrasto; if (a) moverNo(a.id, n); });
  }
  return box;
}
/* Clicar em um setor da legenda abre os caminhos até todos os seus integrantes e deixa os demais esmaecidos */
function focarSetor(setor) {
  const o = S.org;
  if (o.foco === setor) { o.foco = null; atualizarOrg(true); return; }
  o.foco = setor; const topo = arvoreOrg(), paiDe = new Map(); percorrer(topo, (n, pai) => paiDe.set(n.id, pai));
  if (!o.aberto) o.aberto = expandirPadrao(topo);
  percorrer(topo, n => { if (n.f && n.f.subsetor === setor) { let p = paiDe.get(n.id); while (p) { o.aberto.add(p.id); p = paiDe.get(p.id); } } });
  o.autoAjuste = true; atualizarOrg(true);
}
function ajustarOrg() {
  const wrap = $('.org-wrap'), org = $('#organograma'); if (!wrap || !org) return;
  const z0 = S.org.zoom || 1; org.style.zoom = 1; const natural = org.scrollWidth || 1;
  const z = Math.max(0.3, Math.min(1, +((wrap.clientWidth - 28) / natural).toFixed(2)));
  S.org.zoom = z; org.style.zoom = z; const v = $('#org-zoom-val'); if (v) v.textContent = Math.round(z * 100) + '%'; void z0;
}
async function moverNo(id, alvo) {
  const f = S.funcionarios.find(x => x.id === id); if (!f) return;
  const ext = !alvo.f, destino = ext ? alvo.nome : alvo.f.nome;
  if (!ext && alvo.f.id === f.superior_id) return;
  if (!confirm(`Mover ${f.vaga ? 'a vaga' : f.nome} para ficar sob ${destino}?`)) return;
  const patch = ext ? { superior_id: null, gestor_nome: alvo.nome } : { superior_id: alvo.f.id, gestor_nome: nomeExibicao(alvo.f) };
  await acao(async () => { await api.atualizarFuncionario(id, patch); if (!ext) await garantirCorEquipe(alvo.f.id); await atualizarDepois(); }, 'Organograma atualizado.');
}
function abrirExterno(n) {
  const adm = ehAdmin();
  const corpo = h('div', {}, h('p', { text: `${n.nome} aparece como gestor de ${n.filhos.length} ${n.filhos.length === 1 ? 'pessoa' : 'pessoas'}, mas não está na planilha de colaboradores.` }),
    adm ? h('p', { class: 'hint', text: 'Para editar essa pessoa no organograma, cadastre-a na planilha. Quem a tem como gestor passa a ficar ligado a ela.' }) : null);
  const dlg = modal({ titulo: n.nome, corpo, rodape: adm ? [h('button', { class: 'btn', type: 'button', onclick: () => dlg.close() }, 'Fechar'), h('button', { class: 'btn primary', id: 'org-cadastrar-ext', type: 'button', onclick: async () => {
    const ok = await acao(async () => { const id = await api.criarFuncionario({ nome: n.nome, cargo: null, subsetor: null }); await recarregar(); for (const c of n.filhos) await api.atualizarFuncionario(c.id, { superior_id: id, gestor_nome: n.nome }); await atualizarDepois(); }, `${n.nome} cadastrado(a) na planilha.`);
    if (ok) dlg.close();
  } }, 'Cadastrar na planilha')] : null });
}
function buscarNoOrganograma() {
  const o = S.org, t = norm(o.busca); o.achados = new Set();
  if (t) {
    const topo = arvoreOrg(); const ach = [];
    percorrer(topo, (n, pai) => { if (norm(`${n.nome} ${n.f ? n.f.cargo || '' : ''}`).includes(t)) ach.push([n, pai]); });
    const paiDe = new Map(); percorrer(topo, (n, pai) => paiDe.set(n.id, pai));
    if (!o.aberto) o.aberto = expandirPadrao(topo);
    ach.forEach(([n]) => { o.achados.add(n.id); let p = paiDe.get(n.id); while (p) { o.aberto.add(p.id); p = paiDe.get(p.id); } });
    if (ach.length) o.rolarPara = String(ach[0][0].id);
  }
  atualizarOrg(true);
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
  subst(corpoAdmin, h('div', { class: 'subtabs', role: 'tablist' }, sub('gestores', 'Gestores'), sub('naturezas', 'Natureza dos avisos')),
    S.painelAdmin === 'naturezas' ? painelNaturezas() : painelGestores());
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
  const func = h('select', { id: 'g-func' }, h('option', { value: '' }, 'Nenhum / não está na lista'), pessoas().sort(byNome).map(f => h('option', { value: f.id }, `${f.nome}${f.subsetor ? ' · ' + f.subsetor : ''}`)));
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
      h('td', { text: pessoas().filter(f => f.gestor_id === p.id).length }),
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

/* ================= início ================= */
async function boot() {
  subst($('#app'), centro(h('span', { class: 'spinner' }), ' Carregando...'));
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
    subst($('#app'), centro(h('h2', { text: 'Não foi possível iniciar' }), h('p', { text: erroAmigavel(e) })));
  }
}
boot();
})();
