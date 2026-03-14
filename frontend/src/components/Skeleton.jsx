export default function Skeleton() {
  return (
    <>
      <style>{`
        .skeleton-wrap {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem;
        }
        .skeleton-nav {
          height: 62px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 2.5rem;
        }
        .skeleton-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }
        .skeleton-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 1.75rem;
          height: 120px;
          position: relative;
          overflow: hidden;
        }
        .skeleton-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.03) 50%, transparent 75%);
          animation: shimmer 1.5s infinite;
        }
        .skeleton-chart-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }
        .skeleton-chart {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          height: 260px;
          position: relative;
          overflow: hidden;
        }
        .skeleton-chart::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.03) 50%, transparent 75%);
          animation: shimmer 1.5s infinite;
        }
        .skeleton-line {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 18px;
          height: 64px;
          margin-bottom: 0.6rem;
          position: relative;
          overflow: hidden;
        }
        .skeleton-line::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.03) 50%, transparent 75%);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#030306' }}>
        <div className="skeleton-nav" />
        <div className="skeleton-wrap">
          <div className="skeleton-cards">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
          <div className="skeleton-chart-row">
            <div className="skeleton-chart" />
            <div className="skeleton-chart" />
          </div>
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </div>
    </>
  )
}
