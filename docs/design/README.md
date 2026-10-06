# Handoff: Pauta Escolar — SaaS multi-tenant de gestão escolar (v2)

## Overview
Pauta Escolar é um sistema SaaS multi-tenant de gestão escolar (Ensino Fundamental II e Médio, Brasil). Cada escola é um tenant isolado. Há quatro perfis dentro da escola — **Secretaria (admin), Professor, Aluno, Responsável** — e um perfil de **super-admin da plataforma**, fora de qualquer escola.

Esta v2 acrescenta ao fluxo existente: fila de justificativas de falta, log de auditoria, convites de acesso, ciclo de vida da matrícula, retificação de notas, travamento de notas após fechamento, lançamento de recuperação, primeiro acesso com LGPD, painel do super-admin com assistente de nova escola, animações funcionais, responsividade (mobile-first para Aluno/Responsável), estados de sistema (toasts, skeletons, confirmações, vazios) e ergonomia/acessibilidade (lançamento de notas e chamada operáveis por teclado).

Todo o texto da interface está em **português do Brasil** e deve ser mantido.

## About the Design Files
Os arquivos deste pacote são **referências de design feitas em HTML** — protótipos que mostram aparência e comportamento pretendidos, **não código de produção para copiar**. A tarefa é **recriar estes designs no ambiente do codebase de destino** (React, Vue etc.) usando seus padrões e bibliotecas. Se ainda não houver codebase, recomenda-se **React + TypeScript** (Next.js ou Vite), com um design system próprio implementando os tokens abaixo.

O protótipo é um único arquivo `Secretaria Premium v2.dc.html` (abre direto no navegador; depende de `support.js` na mesma pasta). Ele contém:
- o **template** (marcação com estilos inline e holes `{{ }}`) entre `<x-dc>` e `</x-dc>`;
- a **lógica** numa classe `Component` dentro de `<script type="text/x-dc" data-dc-script>` — `renderVals()` calcula tudo que o template exibe. Leia esse bloco para regras de negócio exatas (cálculo de médias, recuperação, validações, mensagens de toast).

Use o seletor de papel na tela de login para navegar entre perfis. O painel **Tweaks** do protótipo expõe: `dispositivo` (Automático/Celular/Tablet/Desktop), `estadoTela` (Normal/Carregando/Vazio), `regraRecuperacao`, `mediaMinima` e demais props existentes.

## Fidelity
**High-fidelity.** Cores, tipografia, espaçamentos, raios, sombras, copy e interações são finais. Recriar com fidelidade de pixel usando as bibliotecas do codebase. Dados exibidos são fictícios (mock).

---

## Design Tokens

### Cores
| Token | Hex | Uso |
|---|---|---|
| ink | `#0D1523` | texto principal |
| ink-2 | `#33425B` | texto secundário forte |
| muted | `#6B7C93` | texto secundário (mín. para texto pequeno) |
| subtle | `#93A1B5` | metadados grandes/decorativos apenas |
| line | `#E4E9F0` | bordas de cards/inputs |
| line-soft | `#EFF2F7` | divisores internos, fundo de chips neutros |
| line-strong | `#C8D4E6` | bordas hover, inputs vazios |
| bg | `#F4F6FA` | fundo da aplicação |
| surface | `#FFFFFF` | cards |
| surface-2 | `#FBFCFE` / `#FAFBFD` / `#F7F9FC` | inputs, cabeçalhos de tabela, blocos internos |
| primary | `#1F4FD8` | ação primária, foco, links |
| primary-hover | `#1A3FAE` | hover do primário |
| primary-tint | `#EAEFFD` | fundos de destaque azul; borda `#C9D8FA`; texto sobre tint `#1B3A8F` |
| petrol | `#0E8B7A` | secundária (remanejar, comunicados); tint `#E4F2EF`; hover `#0B7163` |
| success | `#12855C` | aprovado/presente/aceito; tint `#E7F3ED`; hover `#0E6E4C`; borda toast `#CDE7DA` |
| warning | `#8A5A0B` | atenção/pendente/justificada; tint `#FBF1E1` |
| danger | `#BE3A34` | erro/falta/recuperação/cancelar; tint `#FBEBEA`; hover `#A1302B`; borda `#F1C9C6`; fundo campo inválido `#FEF8F8` |
| violet | `#4A3E9E` | status Transferido; tint `#EDEBF8` |
| dark-panel | gradiente `185deg, #14213A → #0C1424 55% → #080E1A` | painel esquerdo do login/primeiro acesso, sidebar |
| overlay | `rgba(9,15,26,0.36)` painéis · `0.44` wizard · `0.5` confirmação |

### Tipografia
- **Sora** (display): títulos de página 22px/600 (19px no mobile), letter-spacing −0.4px; títulos de card 15–15.5px/600; KPIs 34px/600, −1.2px, `tabular-nums`.
- **Instrument Sans** (interface): corpo 13–13.5px/400, line-height 1.55; labels 12px/500; botões 13px/500; cabeçalhos de tabela 11px/600 uppercase, letter-spacing 0.7px.
- **IBM Plex Mono** (dados): notas, matrículas, datas, códigos, contadores — 11–15px.
- Google Fonts: `Sora:wght@400;500;600;700`, `Instrument+Sans:wght@400;500;600`, `IBM+Plex+Mono:wght@400;500;600`.

### Espaçamento, raio, sombra
- Grade de 4px; gaps usuais 6/8/10/12/14/16/18/20px. Padding de card 16–18px; de página 24px 28px 48px (desktop), 20px (tablet), 16px 14px 96px (mobile, para não ficar sob a nav inferior).
- Raios: card 16px · modal 18px · bottom sheet 20px no topo · input/botão 10px · chip 999px · pill de nota 8px · avatar 50%.
- Sombra de card: `0 1px 2px rgba(13,21,35,0.04), 0 14px 32px -26px rgba(13,21,35,0.4)`.
- Sombra de botão primário: `0 10px 22px -14px rgba(31,79,216,0.9)`.
- Sombra de modal: `0 40px 90px -30px rgba(9,15,26,0.6)`; painel lateral: `-30px 0 70px -30px rgba(9,15,26,0.5)`.
- **Alvo de toque mínimo 44px** em todos os botões, inputs, selects e itens de navegação (chips de filtro 36px, ações inline de linha 32px no desktop).

### Componentes base (repetidos em todas as telas)
- **Botão primário**: min-height 44, padding 10×16, raio 10, fundo primary, texto branco 13/500.
- **Botão secundário**: min-height 44, padding 10×14, borda line, fundo branco, texto ink-2; hover borda line-strong.
- **Chip de filtro**: min-height 36, padding 7×13, raio 999; ativo = fundo ink `#0D1523` + texto branco; inativo = branco + borda line.
- **Pill de status**: 11.5px/500, padding 4×10, raio 999, cor + tint do status.
- **Input**: min-height 44, padding 10×12, raio 10, borda line, fundo `#FBFCFE`; foco: fundo branco, borda primary (ou cor semântica do contexto).
- **Toggle**: trilho 36×22, raio 999, bolinha 18px branca; ligado = success, desligado = line-strong.
- **Estado vazio**: card centralizado, padding 44×24; ícone em quadrado 52px raio 14 com tint; título Sora 16/600; texto 13px muted, max-width 400; CTA opcional.

---

## Screens / Views

Navegação lateral por papel (sidebar 252px desktop, 216px tablet; vira nav inferior no mobile — ver Responsividade). Badges vermelhos `#BE3A34` com contador em IBM Plex Mono.

**Secretaria**: Painel · Turmas · Professores (badge: convites não aceitos) · Alunos · Nova matrícula · **Pedidos**: Justificativas de falta (badge pendentes), Retificações de nota (badge pendentes) · Boletins · Frequência · Ocorrências · Comunicados · **Sistema**: Log de auditoria, Configurações, Composição da nota, Design system.
**Professor**: Minhas turmas · Lançar notas · Recuperação · Chamada · Ocorrências · Comunicados.
**Aluno**: Minhas matérias · Comunicados · Minhas notas · Minha frequência · Ocorrências.
**Responsável**: Boletim · Frequência · Ocorrências · Comunicados · Justificar falta. Troca de dependente (chips) no topo.

### Novas telas

**1. Justificativas de falta (Secretaria)** — fila de justificativas enviadas pelos responsáveis.
- Topo: chips de filtro `Pendentes | Aprovadas | Recusadas | Todas` à esquerda; resumo à direita (ponto colorido + número Sora 15/600 + rótulo).
- Card por pedido, grid 3 colunas `minmax(0,1fr) minmax(0,1.4fr) 272px` (1 coluna em tablet/mobile): (a) avatar 40px + nome do aluno + chip de turma + "por {responsável} · {quando}"; (b) "Falta em {data}" em mono + aula, motivo, botão de anexo (mono, ícone ▤) ou aviso âmbar "Sem anexo — declaração do responsável"; (c) ações.
- Ações: **"✓ Aprovar e abonar"** (success) e **"Recusar…"** (secundário com texto danger). Recusar abre, no mesmo card, textarea "Motivo da recusa (o responsável vê)" — **mínimo 10 caracteres** para habilitar "Enviar recusa" (fica `#C8D4E6` desabilitado). Decidido: pill de status + texto ("Falta abonada no diário · responsável avisado no portal" ou "Motivo enviado ao responsável: …").
- Uma justificativa enviada pelo Responsável na tela "Justificar falta" entra no topo desta fila.

**2. Retificações de nota (Secretaria)** — mesma estrutura da fila acima.
- Coluna central: aluno, "2º tri · Prova trimestral", comparação **Atual** (mono 16/600 riscado, fundo line-soft) → **Proposta** (primary sobre tint) + delta em success, e a justificativa do professor com borda esquerda 2px line.
- Aprovar: toast "Retificação aprovada — nota de {nome} passa de X para Y." Recusa exige motivo ≥ 10 caracteres ("o professor vê").
- Pedidos enviados pelo Professor (tela Lançar notas) entram no topo.

**3. Log de auditoria (Secretaria)**
- Barra de filtros em card: select **Usuário** (Todos + nomes), chips **Tipo de ação** (`Todos · Nota alterada · Matrícula · Acesso · Configuração`), segmented **Período** (`Hoje · 7 dias · 30 dias`), contador "N registros · período" e botão "Exportar CSV".
- Tabela (min-width 900, rolagem horizontal): `Quando` (mono 12px) · `Quem` (avatar 30 + nome + papel) · `Tipo` (tag colorida: Nota alterada=primary, Matrícula=petrol, Acesso=ink-2, Configuração=warning) · `O quê` (ação + alvo) · `Anterior → novo` (valor anterior em pill danger riscado → novo em pill success; "—" quando não se aplica).
- Vazio: "Nenhum registro com esses filtros" + "Limpar filtros".

**4. Convites de acesso**
- **Professores**: botão "+ Convidar professor" e texto âmbar "N convites aguardando aceite". Nova coluna de convite em cada linha: pill `Aceito` (success) / `Pendente` (warning) / `Expirado` (danger) + subtexto ("enviado 20/09 · expira em 5 dias") + botão "Reenviar" quando não aceito.
- Painel lateral "Convidar professor" (440px, desliza da direita): nome completo, e-mail institucional; botão habilita com nome ≥ 5 caracteres e e-mail válido. Ao enviar: professor entra na lista com status Pendente; toast "Convite enviado para {email} — válido por 7 dias."
- **Nova matrícula**: seção "02" virou "Contato e endereço"; nova seção **"04 · Responsáveis vinculados"** com 1+ responsáveis (nome, parentesco select, e-mail, toggle "Convite enviado ao concluir" / "Sem acesso ao portal"), "Remover" quando houver mais de um, botão tracejado "+ Vincular outro responsável". "Concluir matrícula" mostra um toast com o número de convites enviados.

**5. Ficha do aluno (ciclo de vida da matrícula)** — aberta ao clicar numa linha/card em Alunos.
- Cabeçalho em card: avatar 56px gradiente, nome Sora 19/600, matrícula mono, turma, pill de status grande (`Ativo` success · `Transferido` violet · `Cancelado` danger · `Remanejado` petrol).
- Coluna esquerda: **Dados da matrícula** (grid auto-fit 150px), **Responsáveis e acesso ao portal** (status do convite + "Reenviar convite"), **Histórico da matrícula** (linha do tempo com pontos coloridos; nova ação entra no topo).
- Coluna direita "Situação da matrícula": três cartões-ação expansíveis — **Remanejar de turma** (escolher turma de destino com vagas + motivo opcional → "Confirmar remanejamento"), **Transferir para outra escola** (escola de destino ≥ 5 caracteres + toggle "Gerar histórico escolar e declaração de transferência" → "Registrar transferência"), **Cancelar matrícula** (chips de motivo → "Cancelar matrícula…" abre diálogo de confirmação).
- Se Transferido/Cancelado: aviso no tint do status + "Reativar matrícula". O status reflete na lista de Alunos (coluna Status e turma atual).

**6. Lançar notas (Professor) — alterada**
- Tabela tipo planilha (ver Ergonomia). Botões "Salvar rascunho" (secundário) e **"Fechar lançamento…"** (primário → diálogo de confirmação).
- **Após fechar**: pill "■ Fechado em 22/09", faixa cinza "Notas travadas. Para corrigir uma nota, use 'Solicitar retificação'…", inputs `readOnly` com fundo `#F4F6FA`, texto muted, `cursor: not-allowed`; botão "Lançar recuperação →". Em cada linha, "Solicitar retificação" → painel lateral (categoria em chips, nota atual vs. nota proposta com teto da categoria, justificativa ≥ 20 caracteres). Após o envio, a linha mostra o pill "◷ Retificação pedida".

**7. Recuperação (Professor)**
- Topo: card tint azul "Regra da escola · {regra}" com explicação em linguagem simples; card com turma/trimestre, "N alunos abaixo de 6,0" e "Salvar recuperação".
- Tabela: Aluno · Média tri (pill danger) · Recuperação (input mono 96px) · → · **Média final** (pill colorido pela nota) · Resultado (pill "✓ Aprovado na recuperação" / "↓ Segue abaixo da média" / "Aguardando nota") + **fórmula visível** em mono ("maior entre 4,5 e 6,5").
- Regras (configuráveis pela escola): `Substitui se for maior` → max(média, rec); `Média entre as duas` → (média+rec)/2; `Substitui, limitada à média mínima` → max(média, min(rec, mínima)). Nota > 10 = campo vermelho + toast de erro ao salvar.
- Lista = alunos com todas as notas preenchidas e total < média mínima.

**8. Comunicados (todos os papéis)**
- Secretaria: compositor em card (título Sora 16, texto, chips de público `Toda a escola · Responsáveis · Professores · 9º B`, "Alcance: 412 famílias e 23 professores", "Publicar" habilitado com título ≥ 4 e texto ≥ 10 caracteres). Cada comunicado mostra a barra "% leram".
- Aluno/Responsável: pill "● Novo" + "Marcar como lido" → "✓ Lido". Coluna única, max-width 820.

**9. Primeiro acesso (fora do app)** — chegada pelo link do convite.
- Desktop: 2 colunas (painel escuro com contexto do convite | formulário branco). Tablet/mobile: empilhado.
- Formulário: bloco de dados para conferência (nome, vínculo, e-mail, CPF mascarado) + "Algum dado errado? Fale com a secretaria"; telefone; senha com **medidor de força de 3 segmentos** (danger/warning/success) e regras ✓ (8+ caracteres, maiúscula, número); confirmação com feedback "✓ As senhas conferem"; bloco **"Privacidade e dados de menores (LGPD)"** com texto curto, link para a política e checkbox obrigatório.
- "Ativar conta" só habilita com senha forte + confirmação igual + aceite. Sucesso: check animado 64px, "Conta ativada", "Entrar no portal".

**10. Painel da plataforma (super-admin)** — fora de qualquer escola.
- Header escuro próprio ("Plataforma · fora de qualquer escola"). Título "Escolas", "+ Nova escola".
- 4 KPIs (escolas, ativas, em implantação/teste, alunos atendidos), chips de status (`Todas · Ativa · Em implantação · Teste · Suspensa`), tabela: escola (sigla colorida + nome + `codigo.pauta.app`), cidade, rede, alunos, desde, status, "Gerenciar".
- **Assistente "Nova escola"** (modal 620px, 3 etapas com stepper): (1) Instituição — nome, código de acesso auto-gerado a partir das iniciais + UF (editável) com sufixo `.pauta.app`, cidade/UF; (2) Avaliação e calendário — escala (`0 a 10 · 0 a 100 · Conceitos A–E`), períodos (`Bimestres · Trimestres · Semestres`), média mínima, início/fim; (3) Convidar a secretaria — nome + e-mail + resumo. Final: check animado, "Escola criada", escola entra na lista como "Em implantação".

**11. Configurações — alterada**: card "Código do tenant" com borda danger suave; código atual, novo código validado (`^[a-z0-9-]{3,20}$`, diferente do atual), "Alterar código…" abre confirmação que exige **digitar o código atual**.

**12. Notificações** — botão de sino no cabeçalho (44px, ponto vermelho quando há itens) abre painel lateral com itens por papel (clique navega para a tela relacionada), "Marcar todas como lidas" e estado vazio "Tudo em dia".

### Telas existentes alteradas (resumo)
Login (atalhos "Primeiro acesso por convite" e "Painel da plataforma") · Shell (header sticky, sidebar → nav inferior no mobile, sino de notificações) · Painel (skeleton + contagem dos KPIs) · Professores (coluna de convite) · Alunos (coluna Status, linha clicável → ficha, cards no mobile, vazio, skeleton) · Nova matrícula (responsáveis) · Chamada/Frequência (Salvar chamada, teclado, cards no mobile) · Configurações (código do tenant) · Lançar notas (planilha, travamento, retificação) · Mural da turma e Atividades (estados vazios) · Minhas matérias (skeleton) · Boletim e Minhas notas (cards no mobile) · Minha frequência (layout mobile) · Justificar falta (toast; envio entra na fila).

---

## Interactions & Behavior

### Animações (todas com Web Animations API no protótipo)
- **Troca de módulo**: apenas o `<main>` anima — opacity 0→1 + translateY(7px→0), **200ms**, `cubic-bezier(0.16, 1, 0.3, 1)`. Sidebar e header não animam. Sem transição de página inteira.
- **Cascata**: filhos diretos de containers marcados (`data-stagger`) — opacity + translateY(6px), 220ms, delay `30ms + min(i,14) × 30ms`, máx. 40 itens. **Somente na entrada da tela** (não em re-render/filtro).
- **KPIs**: contagem de 0 ao valor em 750ms, ease-out cúbico; valores não numéricos aparecem direto.
- **Modais/painéis**: abrir 220ms (modal: scale 0.96 + translateY 6px; painel lateral: translateX 28px; bottom sheet: translateY 28px; overlay opacity 180ms). **Fechar 140ms** com `cubic-bezier(0.4, 0, 1, 1)` — mais rápido que abrir.
- **Check de sucesso**: círculo success scale 0.6→1 (320ms) + traço SVG desenhado via stroke-dashoffset (340ms, delay 120ms). Usado em toasts de sucesso, primeiro acesso e assistente.
- **Hover/foco**: transição de cor/fundo/borda/sombra **120ms ease-out**.
- **prefers-reduced-motion: reduce**: remove todos os deslocamentos/escala; mantém só opacidade; desliga a contagem dos KPIs e o shimmer dos skeletons.

### Estados de sistema
- **Toasts**: canto inferior direito (mobile: acima da nav inferior, 84px do rodapé, largura total menos 16px). Card branco, raio 14, borda `#CDE7DA` (sucesso, com check animado) ou `#F1C9C6` (erro, círculo "!" danger). Somem em 3,6s; botão ×. `role="status" aria-live="polite"`. Exemplos: "Chamada salva — 9º B, 22/09. Responsáveis dos ausentes foram avisados." / "Não foi possível salvar: 2 notas acima do teto da categoria. Corrija os campos em vermelho."
- **Skeletons**: Painel (4 KPIs + 2 cards), tabelas (Alunos, Auditoria), cards (Minhas matérias, Comunicados). Shimmer linear 1.2s `#EFF2F7 → #F7F9FC`. No protótipo aparecem por 560ms ao entrar na tela; em produção, enquanto a requisição estiver pendente. `aria-busy="true"`.
- **Diálogo de confirmação** (`role="alertdialog"`, 460px): ícone 44px (◆ primary ou ! danger), título, linha de contexto em mono, lista de consequências, "Voltar" + ação. Usado em: **Fechar lançamento** (alerta se há alunos com campos vazios), **Cancelar matrícula** (botão danger), **Alterar código do tenant** (danger + exige digitar o código atual).
- **Estados vazios**: Comunicados, Mural da turma, Notificações, Atividades, Alunos (com CTA "+ Matricular aluno" e "Limpar busca"), filas de pedidos, auditoria, recuperação, escolas.

### Validações
Nota > teto da categoria (borda e fundo vermelhos + "! máx X" abaixo do campo, `role="alert"`) · recuperação > 10 · recusa ≥ 10 caracteres · justificativa de retificação ≥ 20 · ocorrência ≥ 20 · e-mail `/.+@.+\..+/` · senha 8+/maiúscula/número · código do tenant `^[a-z0-9-]{3,20}$`. Botões ficam desabilitados com fundo `#93A1B5`/`#C8D4E6` até a validação passar.

### Responsividade
Breakpoints: **mobile < 720px**, **tablet 720–1079px**, **desktop ≥ 1080px**.
- **Mobile**: sidebar some → **nav inferior fixa** (fundo branco 95% + blur, itens 54px de altura com ícone + rótulo curto + badge). Até 5 itens; se o papel tiver mais de 5, mostra 4 + **"Mais"** (bottom sheet com o restante + "Sair da conta"). Busca ⌘K, seletor de trimestre e breadcrumb ocultos. Responsável: **chips de dependente** logo abaixo do header.
- Tabelas → **cards empilhados** no mobile: Boletim (secretaria e aluno: disciplina, média em pill, 3 trimestres, situação), Alunos, Chamada (card por aluno com os 3 botões em grid), Minha frequência (ausências compactas). Tabelas largas restantes (Auditoria, Professores, Escolas) mantêm rolagem horizontal.
- **Tablet**: sidebar 216px; grids de 2 colunas (filas de pedidos, ficha, matrícula, login) passam a 1 coluna.

---

## Ergonomia & Acessibilidade

### Lançamento de notas (planilha)
- **Enter** / ↓ desce para o mesmo campo do próximo aluno; **Shift+Enter** / ↑ sobe; **Tab** avança para a próxima categoria (ordem natural do DOM). Foco seleciona o conteúdo.
- **Cabeçalho fixo** (sticky top) e **coluna de nomes fixa** (sticky left, 236px) dentro de um container com rolagem própria (max-height 72vh).
- Validação inline imediata contra o teto da categoria. Cada input tem `aria-label="{aluno}, {categoria}"`.

### Chamada por teclado
- Cada aluno é um `role="radiogroup"` com 3 `role="radio"` (Presente/Falta/Justificada) e `aria-checked`. **Roving tabindex**: Tab entra uma vez por aluno, direto na opção marcada.
- Teclas: **P / F / J** marcam e avançam para o próximo aluno; **← →** trocam a opção; **↑ ↓ / Enter** mudam de aluno. Faixa de dica com os atalhos acima da lista.

### Situação não depende só de cor
Toda situação tem ícone + texto: `✓ Aprovado`, `! Atenção`, `↓ Recuperação`, `↓ Abaixo da média`, `✓ Aprovado na recuperação`, `↓ Segue abaixo da média`. Status de convite/matrícula sempre como texto em pill.

### Foco visível
`:focus-visible { outline: 2px solid #1F4FD8; outline-offset: 2px }` em todos os interativos; inputs também ganham borda primary + `box-shadow: 0 0 0 3px rgba(31,79,216,0.14)`. Linhas clicáveis de tabela têm `role="button" tabIndex=0`. Modais com `aria-modal`, botões de fechar com `aria-label`.

---

## State Management
Estado principal (ver `state = {…}` na classe `Component`):
- Sessão: `role` (`admin|professor|aluno|responsavel`), `screen`, `dep` (dependente ativo), `tab` (aba da matéria).
- UI global: `loading`, `toast {texto,tipo}`, `confirm {titulo,texto,itens,label,perigo,exige,acao}`, `painel` (`convite|retif|notif|mais|wizard|null`).
- Pedidos: `justs{id:{s:'ok'|'nao',motivo}}`, `retifs{…}`, `retNovas[]`, `retEnviados{alunoId}`, filtros.
- Auditoria: `audUser`, `audTipo`, `audPeriodo`.
- Convites: `convites{email:'novo'|'reenviado'}`, `profsNovos[]`, `matResps[]`.
- Matrícula: `alunoStatus{matricula:{s,obs,turma,escola}}`, `fichaId`, `fichaAcao`.
- Notas: `notas{alunoId:[...]}`, `fechado`, `recNotas{alunoId}`; frequência: `presencas{alunoId:'P'|'F'|'J'}`.
- Plataforma: `tenantsNovos[]`, `wizPasso` (1–4) e campos do assistente; `tenantCodigo`.
- Comunicados: `comNovos[]`, `comLidos{}`; notificações: `notifLidas`.

Backend sugerido (não prototipado): todas as entidades com `tenant_id`; toda mutação de nota/matrícula/configuração e todo login gravam em `audit_log (user, role, type, action, target, before, after, at)`; convites com token, `status` e `expires_at` (7 dias); notas com `locked_at` por turma/disciplina/período; `grade_correction_requests` com estado e decisão; `absence_justifications` com anexo; regra de recuperação e média mínima por tenant.

## Assets
Nenhuma imagem raster. Ícones são glifos Unicode (◱ ▤ ✎ ◍ ◷ ◑ ▦ ! ◉ ≡ ⚙ ◇ ↻ ✓ ■ ⋯) — **substituir por uma biblioteca de ícones do codebase** (ex.: Lucide) mantendo o significado. Único SVG: o check animado (path `M5 12.5l4.5 4.5L19 7.5`, stroke 3, round). Fontes via Google Fonts.

## Files
- `Secretaria Premium v2.dc.html` — protótipo completo (todas as telas, papéis, estados e lógica).
- `support.js` — runtime necessário para abrir o protótipo localmente (não faz parte da implementação).
