/**
 * Fixed backdrop layer rendered behind the entire app.
 *
 * Two blurred gradient orbs drift slowly in dark mode (purely CSS — no JS,
 * no React state). In light mode the orbs hide and a soft top-radial gradient
 * substitutes, keeping the surface clean.
 *
 * pointer-events: none so it never intercepts clicks.
 */
export default function AppBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Light-mode soft gradient */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(168,85,247,0.10), transparent 60%)',
        }}
      />
      {/* Dark-mode orbs */}
      <div
        className="absolute hidden h-[380px] w-[380px] rounded-full opacity-[0.35] blur-[60px] dark:block animate-orbDrift1"
        style={{
          top: '-120px',
          left: '-80px',
          background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute hidden h-[320px] w-[320px] rounded-full opacity-[0.25] blur-[60px] dark:block animate-orbDrift2"
        style={{
          bottom: '-100px',
          right: '-60px',
          background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
