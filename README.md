# Gestão CS

Site interno para os gestores do CS registrarem ausências, férias, atestados e outras informações que afetam a rotina do setor, com aprovação do administrador, e para registrarem diariamente os atendimentos que avaliaram.

- **Aba "Quadro de avisos"**: avisos por funcionário, com filtros de Gestor, Funcionário, Setor e Data.
- **Aba "Análise de atendimentos"**: registro diário dos atendimentos avaliados, com filtro para cada campo.
- **Login** com dois perfis: **Administrador** (você) e **Supervisor**.

O site em si (HTML, CSS e JavaScript) fica no **GitHub Pages**. O GitHub Pages só hospeda páginas estáticas e **não guarda dados nem faz login**. Por isso os dados e o login ficam no **Supabase** (serviço de banco de dados na nuvem, com plano gratuito). As regras de quem pode ver, criar e apagar cada coisa estão **no banco**, não na tela: mesmo que alguém altere o site no navegador, o banco recusa o que não é permitido.

## O que cada perfil faz

| | Administrador | Supervisor |
|---|---|---|
| Ver o quadro de avisos (aprovados) | Sim | Sim |
| Criar aviso | Para qualquer pessoa. Publica direto | Só para o seu time e para si mesmo. **Vai para a sua aprovação** |
| Aprovar ou recusar avisos | Sim | Não |
| Excluir aviso | Qualquer um | Só os do seu time. **Não os que são sobre ele mesmo** |
| Ver e criar análises de atendimento | Vê as de todos | Vê só as suas |
| Excluir análise de atendimento | Sim | **Não** |
| Criar e excluir perfis de gestores | Sim | Não |
| Editar a lista "Natureza do aviso" e as equipes | Sim | Não |

Decisões que tomei e que você pode mudar (me peça, ou veja a seção "Ajustes comuns"):

1. A aprovação vale para os **avisos do quadro**. Os registros da aba de análise aparecem na hora, sem aprovação.
2. Cada supervisor vê **só as análises que ele mesmo registrou**. Você vê todas.
3. Avisos **recusados** ficam visíveis só para você e para quem enviou (com o motivo).

## Passo a passo para colocar no ar

Reserve cerca de 40 minutos. Você não precisa saber programar.

### 1. Criar o projeto no Supabase

1. Acesse **supabase.com**, crie uma conta (pode entrar com o GitHub) e clique em **New project**.
2. Dê um nome (por exemplo `gestao-cs`), escolha uma senha para o banco (guarde-a) e a região **South America (São Paulo)**.
3. Espere o projeto terminar de ser criado.

### 2. Criar as tabelas e as regras de acesso

1. No menu do Supabase, abra **SQL Editor** e clique em **New query**.
2. Abra o arquivo `supabase/schema.sql` deste projeto, copie **todo** o conteúdo, cole no editor e clique em **Run**.
3. Deve aparecer "Success". Esse arquivo não tem dados de pessoas.

### 3. Ajustar o login

1. Vá em **Authentication** e abra a configuração de **Email** (em *Sign In / Providers* ou *Providers*).
2. **Desmarque "Confirm email"** e salve. Isso é seguro aqui: ninguém consegue criar acesso sem um **código de convite** gerado por você.
3. Mantenha ativada a opção que permite novos cadastros (*Allow new users to sign up*). O banco só aceita quem tem convite.

### 4. Carregar funcionários e gestores

1. Abra o arquivo `dados_iniciais.sql` (ele veio separado do projeto, de propósito).
2. Nas duas primeiras linhas marcadas com `>>>`, troque os textos `COLOQUE_...` pelo **seu e-mail corporativo** e por **um código secreto que você inventar** (8 a 12 letras ou números). Anote o código.
3. Cole o conteúdo no **SQL Editor** (nova query) e clique em **Run**.
4. Esse arquivo cadastra os funcionários, os 10 gestores da sua planilha e o seu perfil de administrador. **Não envie este arquivo ao GitHub**: ele tem nomes e e-mails de pessoas.

### 5. Conectar o site ao Supabase

Você vai copiar **2 informações** do Supabase e colar no arquivo `config.js`.

**5.1. Pegar as duas informações no Supabase**

1. Abra o seu projeto no Supabase e clique no botão **Connect** (fica na barra de cima, ao lado do nome do projeto).
2. Na janela que abrir, procure estas duas informações:
   - **Project URL**: um endereço no formato `https://abcdefghijkl.supabase.co`.
   - **Publishable key**: um texto longo que começa com `sb_publishable_`.
3. Clique no ícone de copiar ao lado de cada uma e cole num bloco de notas por enquanto.

Se não achar no **Connect**, vá em **Project Settings** (engrenagem, no menu da esquerda) e abra **API Keys**:
- A **Project URL** aparece em **Project Settings > Data API** (ou **API**).
- A chave fica na aba **Publishable and secret API keys**, no campo **Publishable key**. Se aparecer um botão **Create new API keys**, clique nele e depois copie a publishable key.
- Se o seu projeto só mostrar chaves antigas (aba **Legacy API Keys**), pode usar a chave **anon public**, que começa com `eyJ`. Ela funciona igual, mas o Supabase vai aposentá-la até o fim de 2026. Prefira a `sb_publishable_`.

**Cuidado:** use só a chave **publishable** (ou a `anon`). **Nunca** use a **secret** (`sb_secret_...`) nem a **service_role**: elas dão acesso total ao banco e não podem ficar no site.

**5.2. Colar no `config.js`**

1. Abra o arquivo `config.js` com o **Bloco de Notas** (clique com o botão direito no arquivo > Abrir com > Bloco de Notas).
2. Cole cada valor **entre as aspas**, sem apagar as aspas, as vírgulas nem o ponto e vírgula. Fica assim:

```js
window.GESTAO_CS_CONFIG = {
  supabaseUrl: "https://abcdefghijkl.supabase.co",
  supabaseAnonKey: "sb_publishable_AbCdEf1234567890"
};
```

3. Confira: sem espaço antes ou depois do texto colado, sem quebra de linha no meio, e a URL **sem barra no final** (`.supabase.co` e pronto).
4. Salve o arquivo (Ctrl+S). No Bloco de Notas, mantenha o nome `config.js`; se ele tentar salvar como `config.js.txt`, escolha **Tipo: Todos os arquivos**.

**5.3. Como saber se deu certo**

Abra o `index.html` no navegador (ou o endereço do GitHub Pages depois de publicar):
- Se **não aparecer** a faixa amarela "Modo demonstração" e a tela de login não tiver os botões "Administrador / Supervisora Ana", a conexão está configurada.
- Se aparecer "Modo demonstração", o `config.js` ainda está vazio ou não foi salvo.
- Se aparecer um erro na tela, confira o passo 5.2 (aspas e espaços).

**Depois de publicar no GitHub:** quando você trocar o `config.js` no repositório, espere 1 a 3 minutos e atualize a página com **Ctrl+F5**.

### 6. Publicar no GitHub Pages

1. No GitHub, crie um repositório (ex.: `gestao-cs`). No plano gratuito, o Pages exige repositório **público**. Tudo bem: o site não contém dado de ninguém, só código. Os dados ficam protegidos por login no Supabase.
2. Envie para o repositório: `index.html`, `app.js`, `style.css`, `config.js`, `README.md`, `.gitignore` e a pasta `supabase` (com o `schema.sql`). **Não envie o `dados_iniciais.sql`.**
3. Em **Settings > Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve. Em alguns minutos o endereço aparece, algo como `https://seu-usuario.github.io/gestao-cs/`.
4. De volta ao Supabase, em **Authentication > URL Configuration**, coloque esse endereço em **Site URL** e também em **Redirect URLs**. Isso faz funcionar o link de "Esqueci minha senha".

### 7. Seu primeiro acesso

1. Abra o endereço do site e clique na aba **Primeiro acesso**.
2. Informe o seu e-mail (o mesmo do passo 4), o código secreto e crie a sua senha (mínimo 8 caracteres).
3. Pronto: você entra como administrador. O código só funciona uma vez e vale 7 dias.

### 8. Dar acesso aos gestores

1. Clique em **Administração > Gestores**. Os 10 gestores da sua planilha já aparecem como **Aguardando primeiro acesso**.
2. Em cada um, clique em **Novo código**, depois em **Copiar mensagem pronta** e envie pelo Teams.
3. O gestor abre o site, usa **Primeiro acesso** com o e-mail dele e o código, e cria a própria senha. Você nunca vê a senha de ninguém.

Para criar um gestor novo: **Administração > Gestores > Adicionar gestor** (nome, e-mail, perfil e, se ele também estiver na lista de funcionários, o vínculo). Depois, em **Funcionários**, escolha o gestor de cada pessoa do time dele.
Para apagar um gestor que saiu: botão **Excluir** na mesma tela. Ele perde o acesso na hora e o time dele fica sem gestor até você reatribuir.

## Pontos de atenção

- **Atestado é dado de saúde (LGPD).** O formulário orienta a não escrever diagnóstico ou CID. Vale combinar isso com o time e alinhar com o jurídico/DPO.
- **Projeto gratuito do Supabase pausa após cerca de 7 dias sem uso.** Com o uso diário do time isso não deve ocorrer, mas, depois de feriados longos, pode ser preciso reativar o projeto no painel do Supabase.
- **E-mails do Supabase têm limite no plano gratuito.** Servem para o "Esqueci minha senha" de vez em quando. Se o time crescer, configure um servidor de e-mail próprio em *Project Settings > Auth > SMTP*.
- **Quem exclui um gestor no site não apaga o login dele no Supabase**, só o acesso aos dados. Se quiser limpar de vez: *Authentication > Users*.
- O e-mail cadastrado para a Bárbara na sua planilha é `barbara.magalhes@...` (sem o "a" em "magalhaes"). Confira se é isso mesmo, porque o primeiro acesso exige o e-mail exatamente igual.
- Helder e Mariana estão na lista de gestores, mas **nenhum funcionário da sua planilha está sob o nome deles**. Até você vincular pessoas a eles (Administração > Funcionários), só conseguem criar avisos sobre si mesmos.
- Três funcionários têm gestor que não usa o site (Mariane Crespi e Rômulo Reis). Só você cria avisos sobre eles.

## Ajustes comuns

- **Mudar quem vê as análises:** no `supabase/schema.sql`, a regra `analises_ler` define isso. Para todos os supervisores verem tudo, troque a condição por `public.meu_perfil_id() is not null`.
- **Exigir aprovação também para as análises:** peça que eu ajuste. Exige uma coluna de status e uma tela de aprovação.
- **Cores e textos:** `style.css` e `app.js`.

## Testar sem Supabase (modo demonstração)

Se o `config.js` estiver vazio, o site abre em **modo demonstração**, com dados fictícios guardados só no navegador. Dá para abrir o `index.html` direto no computador para conhecer as telas. Contas: `admin@demo.com`, `ana@demo.com` e `bruno@demo.com`, todas com a senha `demo`.

## Estrutura dos arquivos

```
index.html        página principal
app.js            toda a lógica do site
style.css         aparência
config.js         endereço e chave do Supabase (você preenche)
supabase/schema.sql   tabelas, regras de acesso e funções (rodar uma vez)
dados_iniciais.sql    funcionários e gestores (rodar uma vez; NÃO enviar ao GitHub)
```
