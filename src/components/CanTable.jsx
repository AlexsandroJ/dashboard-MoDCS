import { formatTimestamp } from '../utils/helpers';

export default function CanTable({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <div className="can-table-container">
        <table>
          <tbody>
            <tr>
              <td colSpan="3" className="empty">
                Nenhum frame CAN recebido.
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
            <th>ID</th>
            <th>Dados (Hex)</th>
          </tr>
        </thead>
        <tbody id="can-body">
          {messages.map((msg, i) => (
            <tr key={i} className="highlight">
              <td>{formatTimestamp(msg.timestamp)}</td>
              <td>0x{msg.canId.toString(16).toUpperCase()}</td>
              <td>{Array.isArray(msg.data) ? msg.data.join(', ') : msg.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}