// components/VehicleDataTable.jsx
import { formatTimestamp } from '../utils/helpers';

export default function VehicleDataTable({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="can-table-container">
        <table>
          <tbody>
            <tr>
              <td colSpan="10" className="empty">
                Nenhum dado de veículo recebido.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="can-table-container">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Modo</th>
            <th>RPM</th>
            <th>Torque</th>
            <th>SoC (%)</th>
            <th>Temp. Motor (°C)</th>
            <th>Temp. Bateria (°C)</th>
            <th>Tensão (V)</th>
            <th>Corrente (A)</th>
            <th>Localização</th> {/* Nova coluna */}
          </tr>
        </thead>
        <tbody id="vehicle-data-body">
          {records.map((record, i) => {
            const hasLocation = record.location?.coordinates?.length === 2;
            const lat = hasLocation ? record.location.coordinates[1].toFixed(6) : null;
            const lon = hasLocation ? record.location.coordinates[0].toFixed(6) : null;

            return (
              <tr key={i} className="highlight">
                <td>{formatTimestamp(record.timestamp)}</td>
                <td>{record.motor?.modo ?? '—'}</td>
                <td>{record.motor?.rpm != null ? record.motor.rpm.toFixed(2) : '—'}</td>
                <td>{record.motor?.torque != null ? record.motor.torque.toFixed(2) : '—'}</td>
                <td>{record.battery?.soc != null ? record.battery.soc.toFixed(2) : '—'}</td>
                <td>{record.motor?.motorTemp != null ? record.motor.motorTemp.toFixed(2) : '—'}</td>
                <td>{record.battery?.temperature != null ? record.battery.temperature.toFixed(2) : '—'}</td>
                <td>{record.battery?.voltage != null ? record.battery.voltage.toFixed(2) : '—'}</td>
                <td>{record.battery?.current != null ? record.battery.current.toFixed(2) : '—'}</td>
                <td>
                  {hasLocation ? (
                    <span title={`Lat: ${lat}, Lon: ${lon}`}>
                      {lat}, {lon}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}