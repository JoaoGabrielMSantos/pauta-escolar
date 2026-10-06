## O quê / por quê

<!-- Resumo da mudança e da motivação. Marco (M0…M9) e links para PLAN/ADR quando aplicável. -->

## Telas

<!-- Prints ou GIFs em 390px, 768px e 1280px, lado a lado com o protótipo quando a tela existir nele. -->

## Checklist

- [ ] Testes verdes (`pnpm lint && pnpm typecheck && pnpm test && pnpm e2e`)
- [ ] `src/domain` com 100% de cobertura
- [ ] Acessibilidade: axe sem violações; navegação por teclado verificada
- [ ] Fidelidade visual comparada com o protótipo (390 / 768 / 1280px)
- [ ] Supabase advisors (security + performance) zerados, se mexeu no banco
- [ ] Migrations novas e reversíveis (nenhuma migration mergeada foi editada)
- [ ] Testes pgTAP de isolamento e papéis atualizados, se mexeu no banco
- [ ] Sem segredos, sem PII em logs; textos da UI em pt-BR
- [ ] `CLAUDE.md` / ADRs atualizados quando houver decisão nova

## Como testar

<!-- Passo a passo para revisar localmente. -->

## Pendências

<!-- O que ficou para depois, com o marco em que entra. -->
