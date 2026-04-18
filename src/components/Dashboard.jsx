import { useState, useEffect } from 'react';
import DataCard from './DataCard';
import CanTable from './CanTable';
import MapSection from './MapSection';
import ThemeToggle from './ThemeToggle';
import VehicleDataTable from './VehicleDataTable';


// === Estado inicial ===
const INITIAL_DATA = {
  modo: '--',
  rpm: '--',
  torque: '--',
  tempMotor: '--',
  tempBatt: '--',
  bmsCurrent: '--',
  bmsVoltage: '--',
  bmsSoc: '--',
  bmsSoH: '--',
  bmsTemp: '--',
  lastCoords: null,
  location: '—' // ou null, ou objeto { lat, lon }
};

// URL base da API
const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function Dashboard() {
  const [liveData, setLiveData] = useState(INITIAL_DATA);
  const [canMessages, setCanMessages] = useState([]);
  const [decodedMessages, setDecodedMessages] = useState([]);
  const [gpsStatus, setGpsStatus] = useState('GPS parado');
  const [watchId, setWatchId] = useState(null);
  const [motoPosition, setMotoPosition] = useState(null);


  const DEVICE_ID = 'esp32-moto-001'; // ajuste conforme seu deviceId real

  // === Funções auxiliares ===
  const updateLiveValues = (newData) => {
    setLiveData(prev => ({ ...prev, ...newData }));
  };

  const sendLocationToServer = async (lat, lon, accuracy) => {
    try {
      const res = await fetch(`${API_BASE}/api/device/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          accuracy,

        })
      });

      if (res.ok) {
        setGpsStatus(`📍 Enviado: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
        setMotoPosition({ lat, lon });
      } else {
        const text = await res.text();
        setGpsStatus(`❌ Erro (${res.status}): ${text.substring(0, 50)}`);
      }
    } catch (err) {
      setGpsStatus('🌐 Sem conexão com o servidor');
      console.error('Erro ao enviar GPS:', err);
    }
  };

  // === Geolocalização do celular ===
  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      setGpsStatus('❌ Geolocalização não suportada');
      return;
    }

    setGpsStatus('Aguardando localização...');
    setWatchId(
      navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setGpsStatus(`📡 Recebido: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${accuracy}m)`);
          sendLocationToServer(latitude, longitude, accuracy);
        },
        (err) => {
          let msg = '⚠️ GPS indisponível';
          switch (err.code) {
            case err.PERMISSION_DENIED: msg = '❌ Permissão negada'; break;
            case err.POSITION_UNAVAILABLE: msg = '❌ Indisponível'; break;
            case err.TIMEOUT: msg = '⏱️ Tempo esgotado'; break;
          }
          setGpsStatus(msg);
          stopGpsTracking();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      )
    );
  };

  const stopGpsTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setGpsStatus('GPS parado');
  };

  const toggleGps = () => {
    if (watchId === null) startGpsTracking();
    else stopGpsTracking();
  };

  /*
  // Dentro do componente Dashboard()
  const loadData = async () => {
    try {
      // Dados brutos CAN
      const canRes = await fetch(`${API_BASE}/api/can-data`);
      if (canRes.ok) {
        const data = await canRes.json();
        setCanMessages(
          (Array.isArray(data) ? data : []).map(m => ({
            ...m,
            timestamp: m.timestamp && !isNaN(Date.parse(m.timestamp))
              ? new Date(m.timestamp)
              : new Date()
          })).slice(0, 20)
        );
      }

      // Dados decodificados
      const decodedRes = await fetch(`${API_BASE}/api/decoded-can-data`);
      if (decodedRes.ok) {
        const frames = await decodedRes.json();
        if (Array.isArray(frames)) {
          // Atualiza painel (liveData)
          const panelData = { ...INITIAL_DATA };
          let gpsPos = null;

          for (const frame of frames) {
            if (frame.source === 'battery' && frame.decoded) {
              panelData.bmsCurrent = frame.decoded.current?.toFixed(2) ?? '--';
              panelData.bmsVoltage = frame.decoded.voltage?.toFixed(3) ?? '--';
              panelData.bmsSoc = frame.decoded.soc ?? '--';
              panelData.bmsSoH = frame.decoded.soh ?? '--';
              panelData.bmsTemp = frame.decoded.temperature ?? '--';
            } else if (frame.source === 'motorController' && frame.decoded) {
              panelData.modo = frame.decoded.modo ?? '--';
              panelData.rpm = frame.decoded.motorSpeedRpm ?? '--';
              panelData.torque = frame.decoded.motorTorque ?? '--';
              panelData.tempMotor = frame.decoded.motorTemperature ?? '--';
              panelData.tempBatt = frame.decoded.controllerTemperature ?? '--';
            }
            if (frame.decoded?.latitude && frame.decoded?.longitude) {
              gpsPos = { lat: frame.decoded.latitude, lon: frame.decoded.longitude };
            }
          }
          setLiveData(panelData);
          if (gpsPos) setMotoPosition(gpsPos);

          // Atualiza tabela de dados decodificados
          setDecodedMessages(
            frames.map(f => ({
              ...f,
              timestamp: f.timestamp && !isNaN(Date.parse(f.timestamp))
                ? new Date(f.timestamp)
                : new Date()
            })).slice(0, 20)
          );
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
    }
  };
  */
  // Função para extrair os últimos valores úteis de um array de registros
  // Função para extrair os últimos valores úteis de um array de registros
  function extractLatestLiveData(records) {
    const latest = {
      modo: '--',
      rpm: '--',
      torque: '--',
      tempMotor: '--',
      tempBatt: '--',
      bmsCurrent: '--',
      bmsVoltage: '--',
      bmsSoc: '--',
      bmsSoH: '--',
      bmsTemp: '--',
      location: '—'

    };

    // Percorre do mais recente ao mais antigo
    for (const record of records) {
      // Motor
      if (latest.rpm === '--' && record.motor?.rpm != null) latest.rpm = record.motor.rpm;
      if (latest.torque === '--' && record.motor?.torque != null) latest.torque = record.motor.torque;
      if (latest.tempMotor === '--' && record.motor?.motorTemp != null) latest.tempMotor = record.motor.motorTemp;
      if (latest.tempBatt === '--' && record.motor?.controlTemp != null) latest.tempBatt = record.motor.controlTemp;
      if (latest.modo === '--' && record.motor?.modo != null) latest.modo = record.motor.modo;

      // Bateria
      if (latest.bmsSoc === '--' && record.battery?.soc != null) latest.bmsSoc = record.battery.soc;
      if (latest.bmsSoH === '--' && record.battery?.soh != null) latest.bmsSoH = record.battery.soh;
      if (latest.bmsVoltage === '--' && record.battery?.voltage != null) latest.bmsVoltage = record.battery.voltage.toFixed(3);
      if (latest.bmsCurrent === '--' && record.battery?.current != null) latest.bmsCurrent = record.battery.current.toFixed(2);
      if (latest.bmsTemp === '--' && record.battery?.temperature != null) latest.bmsTemp = record.battery.temperature;


      if (record.location?.coordinates?.length === 2) {
        const [lon, lat] = record.location.coordinates;
        latest.location = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      }
      // Opcional: parar se todos os campos foram preenchidos
      // if (Object.values(latest).every(v => v !== '--' && v !== 'N/A')) break;
    }

    return latest;
  }

  // === Carregamento inicial (API) ===
  useEffect(() => {
    // Função que carrega todos os dados
    const loadData = async () => {
      try {
        // 1. Dados brutos CAN
        const canRes = await fetch(`${API_BASE}/api/can-data`);
        if (canRes.ok) {
          const data = await canRes.json();
          if (Array.isArray(data)) {
            setCanMessages(
              data.map(m => ({
                ...m,
                timestamp: m.timestamp && !isNaN(Date.parse(m.timestamp))
                  ? new Date(m.timestamp)
                  : new Date()
              })).slice(0, 20)
            );
          }
        }
        /*
        // 2. Dados decodificados
        const decodedRes = await fetch(`${API_BASE}/api/device`);
        if (decodedRes.ok) {
          const frames = await decodedRes.json();
          if (Array.isArray(frames)) {
            const panelData = { ...INITIAL_DATA };
            let gpsPos = null;

            for (const frame of frames) {
              if (frame.source === 'battery' && frame.decoded) {
                panelData.bmsCurrent = frame.decoded.current?.toFixed(2) ?? '--';
                panelData.bmsVoltage = frame.decoded.voltage?.toFixed(3) ?? '--';
                panelData.bmsSoc = frame.decoded.soc ?? '--';
                panelData.bmsSoH = frame.decoded.soh ?? '--';
                panelData.bmsTemp = frame.decoded.temperature ?? '--';
              } else if (frame.source === 'motorController' && frame.decoded) {
                panelData.rpm = frame.decoded.motorSpeedRpm ?? '--';
                panelData.torque = frame.decoded.motorTorque ?? '--';
                panelData.tempMotor = frame.decoded.motorTemperature ?? '--';
                panelData.tempBatt = frame.decoded.controllerTemperature ?? '--';
              }

              if (frame.decoded?.latitude && frame.decoded?.longitude) {
                gpsPos = { lat: frame.decoded.latitude, lon: frame.decoded.longitude };
              }
            }

            setLiveData(panelData);
            if (gpsPos) setMotoPosition(gpsPos);
            setDecodedMessages(
              frames.map(f => ({
                ...f,
                timestamp: f.timestamp && !isNaN(Date.parse(f.timestamp))
                  ? new Date(f.timestamp)
                  : new Date()
              })).slice(0, 20)
            );
          }
        }
        */

        // 3. Atualiza painel de dados (liveData) com os valores mais recentes
        // Carrega todos os registros de VehicleData
        const res = await fetch(`${API_BASE}/api/device`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const records = await res.json();
        if (!Array.isArray(records)) return;

        // Extrai os últimos valores úteis
        const latestValues = extractLatestLiveData(records);
        setLiveData(latestValues);

        // Também atualiza a tabela de registros brutos (se quiser)
        setDecodedMessages(records.slice(0, 20));

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };

    // Carrega imediatamente na montagem
    loadData();

    // Agenda atualizações a cada 2s
    const intervalId = setInterval(loadData, 2000);

    const latest = extractLatestLiveData(decodedMessages);
    setLiveData(latest); // atualiza todo o painel de uma vez
    // Limpa ao desmontar
    return () => clearInterval(intervalId);
  }, []);

  // === Download CSV ===
  const downloadCanData = () => {
    const link = document.createElement('a');
    link.href = `${API_BASE}/api/export-can-data-csv`;
    console.log('Iniciando download de CSV:', link.href);
    //link.download = `can-data-${Date.now()}.csv`;
    link.click();
  };

  // === Download CSV Decodificados ===
  const downloadDecodedData = () => {
    const link = document.createElement('a');
    link.href = `${API_BASE}/api/export-vehicle-data-csv`;
    console.log('Iniciando download de CSV:', link.href);
    //link.download = `vehicle-data-${Date.now()}.csv`;
    link.click();
  };



  return (
    <div className="container">
      <header>
        <h1>⚡ Voltz - Telemetria</h1>
        <div className="subtitle">Monitoramento em Tempo Real</div>
        <ThemeToggle />
      </header>

      {/* Painel de Dados */}
      <div className="data-panel">
        <DataCard title="Modo" value={liveData.modo} />
        <DataCard title="RPM" value={liveData.rpm} />
        <DataCard title="Torque" value={liveData.torque} unit="Nm" />
        <DataCard title="🌡️ Temp. Motor" value={liveData.tempMotor} unit="°C" />
        <DataCard title="🌡️​ Temp. Controlador" value={liveData.tempBatt} unit="°C" />
        <DataCard title="BMS Voltage" value={liveData.bmsVoltage} unit="V" />
        <DataCard title="BMS Current" value={liveData.bmsCurrent} unit="A" />
        <DataCard title="BMS SoC" value={liveData.bmsSoc} unit="%" />
        <DataCard title="BMS SoH" value={liveData.bmsSoH} unit="%" />
        <DataCard title="🌡️ BMS" value={liveData.bmsTemp} unit="°C" />
        <DataCard title="📍 Localização" value={liveData.location} />
      </div>

      {/* Tabela CAN */}
      <div className="can-section">
        <h2>📡 Rede CAN - Mensagens Recebidas</h2>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button id="download-can-data" onClick={downloadCanData}>
            Baixar 📥 CSV
          </button>
        </div>
        <CanTable messages={canMessages} />

      </div>

      {/* Tabela Decodificada */}
      <div className="can-section">
        <h2>📡 Mensagens Decodificadas</h2>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button id="download-vehicle-data" onClick={downloadDecodedData}>
            Baixar 📥 CSV
          </button>
        </div>
        <VehicleDataTable records={decodedMessages} />

      </div>

      {/* Mapa */}
      <MapSection position={motoPosition} />

      {/* Controle GPS */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button id="start-gps-btn" onClick={toggleGps}>
          {watchId === null ? '📍 Iniciar GPS do Celular' : '⏹️ Parar GPS'}
        </button>
        <div id="gps-status" style={{ marginTop: '8px', fontSize: '0.9rem' }}>
          {gpsStatus}
        </div>
      </div>

      <footer>
        © 2025 Sistema de Monitoramento Voltz | Dados da rede CAN via API
      </footer>
    </div>
  );
}