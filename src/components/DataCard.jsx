export default function DataCard({ title, value, unit, badge }) {
  const displayValue = value ?? '--';

  return (
    <div className="data-card">
      <h2>{title}</h2>
      {!badge && <div className="value">{displayValue}</div>}
      {unit && !badge && <div className="unit">{unit}</div>}
      {badge && <div className={`mode-badge ${badge.toLowerCase()}`}>{badge}</div>}
    </div>
  );
}