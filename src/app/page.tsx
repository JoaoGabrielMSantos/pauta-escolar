// Provisional home: the real landing page is built in M9 (docs/PLAN.md §10).
export default function Home() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col justify-between gap-12 overflow-hidden bg-(image:--panel-gradient) px-5 py-8 text-panel-text tablet:px-12 tablet:py-11">
      <div
        aria-hidden="true"
        className="absolute -top-36 -left-24 -z-10 size-105 rounded-full bg-[radial-gradient(circle,rgb(31_79_216/0.5),rgb(31_79_216/0)_68%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 -bottom-44 -z-10 size-115 rounded-full bg-[radial-gradient(circle,rgb(46_197_165/0.26),rgb(46_197_165/0)_70%)]"
      />

      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-[11px] bg-[linear-gradient(150deg,#ffffff,#cfddf7)] font-display text-[17px] font-bold text-ink"
        >
          P
        </span>
        <span className="font-display text-[17px] font-semibold">Pauta Escolar</span>
      </div>

      <div className="max-w-110">
        <h1 className="mb-4 font-display text-[30px] leading-[1.14] font-semibold tracking-[-1.2px] text-pretty tablet:text-[38px]">
          O diário de classe da sua escola, organizado e auditável.
        </h1>
        <p className="text-[15px] leading-[1.65] text-panel-nav">
          Cada instituição em ambiente próprio. Secretaria, professores e famílias trabalham sobre o
          mesmo registro — cada um com o que lhe cabe.
        </p>
        <div className="my-7 h-px bg-white/15" />
        <p className="text-label text-panel-muted">
          Em construção · marco M0 (fundação). Acompanhe o plano no repositório.
        </p>
      </div>

      <p className="text-label text-panel-muted">
        Dados isolados por tenant · todo acesso registrado em log de auditoria
      </p>
    </main>
  )
}
