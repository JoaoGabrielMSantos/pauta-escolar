/**
 * Human-readable catalogue of the design tokens, used by Storybook (Foundations)
 * and by /dev/design-system. Values must mirror src/styles/tokens.css and the
 * `@theme` block of src/app/globals.css — the CSS is the source of truth for the app.
 */

export interface ColorToken {
  /** Tailwind color name, e.g. `ink` → `text-ink`, `bg-ink`. */
  name: string
  hex: string
  usage: string
}

export interface ColorGroup {
  title: string
  tokens: readonly ColorToken[]
}

export const colorGroups: readonly ColorGroup[] = [
  {
    title: 'Texto',
    tokens: [
      { name: 'ink', hex: '#0D1523', usage: 'Texto principal' },
      { name: 'ink-2', hex: '#33425B', usage: 'Texto secundário forte' },
      {
        name: 'muted',
        hex: '#607084',
        usage: 'Texto secundário (mínimo AA para texto pequeno; ajustado de #6B7C93, ADR-0007)',
      },
      {
        name: 'subtle',
        hex: '#93A1B5',
        usage: 'Só texto grande ou decorativo, estados desabilitados e elementos não textuais',
      },
    ],
  },
  {
    title: 'Linhas e superfícies',
    tokens: [
      { name: 'line', hex: '#E4E9F0', usage: 'Bordas de cards e inputs' },
      { name: 'line-soft', hex: '#EFF2F7', usage: 'Divisores internos, fundo de chips neutros' },
      { name: 'line-strong', hex: '#C8D4E6', usage: 'Bordas em hover, inputs vazios' },
      { name: 'bg', hex: '#F4F6FA', usage: 'Fundo da aplicação' },
      { name: 'surface', hex: '#FFFFFF', usage: 'Cards' },
      { name: 'surface-2', hex: '#FBFCFE', usage: 'Inputs' },
      { name: 'surface-header', hex: '#FAFBFD', usage: 'Cabeçalhos de tabela' },
      { name: 'surface-inset', hex: '#F7F9FC', usage: 'Blocos internos' },
    ],
  },
  {
    title: 'Primária',
    tokens: [
      { name: 'primary', hex: '#1F4FD8', usage: 'Ação primária, foco, links' },
      { name: 'primary-hover', hex: '#1A3FAE', usage: 'Hover do primário' },
      { name: 'primary-tint', hex: '#EAEFFD', usage: 'Fundos de destaque azul' },
      { name: 'primary-tint-border', hex: '#C9D8FA', usage: 'Borda sobre tint' },
      { name: 'primary-on-tint', hex: '#1B3A8F', usage: 'Texto sobre tint' },
    ],
  },
  {
    title: 'Semânticas',
    tokens: [
      {
        name: 'petrol',
        hex: '#0C7A6B',
        usage: 'Secundária: remanejar, comunicados (ajustado de #0E8B7A, ADR-0007)',
      },
      { name: 'petrol-tint', hex: '#E4F2EF', usage: 'Tint petróleo' },
      {
        name: 'success',
        hex: '#117D56',
        usage: 'Aprovado, presente, aceito (ajustado de #12855C, ADR-0007)',
      },
      { name: 'success-tint', hex: '#E7F3ED', usage: 'Tint sucesso' },
      { name: 'success-border', hex: '#CDE7DA', usage: 'Borda do toast de sucesso' },
      { name: 'warning', hex: '#8A5A0B', usage: 'Atenção, pendente, justificada' },
      { name: 'warning-tint', hex: '#FBF1E1', usage: 'Tint atenção' },
      { name: 'danger', hex: '#BE3A34', usage: 'Erro, falta, recuperação, cancelar' },
      { name: 'danger-tint', hex: '#FBEBEA', usage: 'Tint perigo' },
      { name: 'danger-border', hex: '#F1C9C6', usage: 'Borda do toast de erro' },
      { name: 'danger-field', hex: '#FEF8F8', usage: 'Fundo de campo inválido' },
      { name: 'violet', hex: '#4A3E9E', usage: 'Status Transferido' },
      { name: 'violet-tint', hex: '#EDEBF8', usage: 'Tint violeta' },
    ],
  },
  {
    title: 'Painel escuro',
    tokens: [
      { name: 'panel-text', hex: '#E8EDF6', usage: 'Texto sobre o painel escuro' },
      { name: 'panel-nav', hex: '#B9C7DD', usage: 'Itens de navegação inativos' },
      { name: 'panel-muted', hex: '#8CA2C6', usage: 'Texto de apoio no painel' },
      { name: 'panel-label', hex: '#6E86AC', usage: 'Rótulos de grupo na sidebar' },
      { name: 'panel-accent', hex: '#2EC5A5', usage: 'Ponto do item ativo' },
    ],
  },
] as const

export interface TypeToken {
  name: string
  family: 'display' | 'sans' | 'mono'
  className: string
  spec: string
  sample: string
}

export const typeScale: readonly TypeToken[] = [
  {
    name: 'KPI',
    family: 'display',
    className: 'font-display text-kpi font-semibold tabular-nums',
    spec: 'Sora 34px / 600 · −1.2px · tabular-nums',
    sample: '412',
  },
  {
    name: 'Título de página',
    family: 'display',
    className: 'font-display text-page-title font-semibold',
    spec: 'Sora 22px / 600 · −0.4px (19px no mobile)',
    sample: 'Painel da secretaria',
  },
  {
    name: 'Título de card',
    family: 'display',
    className: 'font-display text-card-title font-semibold',
    spec: 'Sora 15–15.5px / 600',
    sample: 'Alunos em risco',
  },
  {
    name: 'Corpo',
    family: 'sans',
    className: 'font-sans text-body',
    spec: 'Instrument Sans 13.5px / 400 · line-height 1.55',
    sample: 'Secretaria, professores e famílias trabalham sobre o mesmo registro.',
  },
  {
    name: 'Rótulo',
    family: 'sans',
    className: 'font-sans text-label font-medium',
    spec: 'Instrument Sans 12px / 500',
    sample: 'Código da escola',
  },
  {
    name: 'Cabeçalho de tabela',
    family: 'sans',
    className: 'font-sans text-table-head font-semibold uppercase',
    spec: 'Instrument Sans 11px / 600 · uppercase · 0.7px',
    sample: 'Média do trimestre',
  },
  {
    name: 'Dados',
    family: 'mono',
    className: 'font-mono text-body-sm tabular-nums',
    spec: 'IBM Plex Mono 11–15px',
    sample: '2026-00418 · 22/09 · 6,5',
  },
] as const

export interface ScalarToken {
  name: string
  value: string
  usage: string
}

export const radii: readonly ScalarToken[] = [
  { name: 'rounded-card', value: '16px', usage: 'Cards' },
  { name: 'rounded-modal', value: '18px', usage: 'Modais' },
  { name: 'rounded-sheet', value: '20px', usage: 'Bottom sheet (topo)' },
  { name: 'rounded-control', value: '10px', usage: 'Inputs e botões' },
  { name: 'rounded-grade', value: '8px', usage: 'Pill de nota' },
  { name: 'rounded-chip', value: '999px', usage: 'Chips e pills de status' },
] as const

export const shadows: readonly ScalarToken[] = [
  { name: 'shadow-card', value: '0 1px 2px …, 0 14px 32px -26px …', usage: 'Cards' },
  {
    name: 'shadow-primary',
    value: '0 10px 22px -14px rgba(31,79,216,.9)',
    usage: 'Botão primário',
  },
  { name: 'shadow-modal', value: '0 40px 90px -30px rgba(9,15,26,.6)', usage: 'Modais' },
  { name: 'shadow-panel', value: '-30px 0 70px -30px rgba(9,15,26,.5)', usage: 'Painel lateral' },
  { name: 'shadow-segment', value: '0 1px 3px rgba(13,21,35,.12)', usage: 'Segmento ativo' },
  { name: 'shadow-focus', value: '0 0 0 3px rgba(31,79,216,.14)', usage: 'Anel de foco de input' },
] as const

export const spacing: readonly ScalarToken[] = [
  { name: 'Grade', value: '4px', usage: 'Todos os espaçamentos são múltiplos de 4px' },
  { name: 'Gaps usuais', value: '6 · 8 · 10 · 12 · 14 · 16 · 18 · 20px', usage: 'Entre elementos' },
  { name: 'Padding de card', value: '16–18px', usage: 'Cards' },
  { name: 'Página (desktop)', value: '24px 28px 48px', usage: '≥ 1080px' },
  { name: 'Página (tablet)', value: '20px', usage: '720–1079px' },
  { name: 'Página (mobile)', value: '16px 14px 96px', usage: '< 720px, acima da nav inferior' },
  { name: 'Alvo de toque', value: '44px', usage: 'Botões, inputs, selects, navegação' },
  { name: 'Chip de filtro', value: '36px', usage: 'Altura mínima' },
  { name: 'Ação inline', value: '32px', usage: 'Ações de linha no desktop' },
] as const

export const motion: readonly ScalarToken[] = [
  {
    name: 'Troca de módulo',
    value: '200ms · ease-out-expo',
    usage: 'Só o <main>: opacidade + translateY 7px',
  },
  {
    name: 'Cascata',
    value: '220ms · delay 30ms + min(i,14)×30ms',
    usage: 'Só na entrada da tela, máx. 40 itens',
  },
  { name: 'Contagem de KPI', value: '750ms · ease-out cúbico', usage: 'De 0 ao valor' },
  {
    name: 'Abrir modal/painel',
    value: '220ms · ease-out-expo',
    usage: 'Modal: scale .96 + 6px; painel: 28px',
  },
  {
    name: 'Fechar modal/painel',
    value: '140ms · ease-in-fast',
    usage: 'Fecha mais rápido do que abre',
  },
  { name: 'Overlay', value: '180ms', usage: 'Opacidade' },
  { name: 'Check de sucesso', value: '320ms + 340ms (delay 120ms)', usage: 'Círculo + traço' },
  { name: 'Hover/foco', value: '120ms ease-out', usage: 'Cor, fundo, borda, sombra' },
  { name: 'Toast', value: '3,6s', usage: 'Tempo até sumir' },
] as const
