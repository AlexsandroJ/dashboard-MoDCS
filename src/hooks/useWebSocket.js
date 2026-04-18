import { useEffect, useRef } from 'react';

const useWebSocket = (onMessage, onConnect, onDisconnect) => {
  const wsRef = useRef(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🔌 Dashboard conectado ao WebSocket');
      ws.send('🔌 Dashboard conectado ao WebSocket!');
      if (onConnect) onConnect();
    };

    ws.onmessage = (event) => {
      if (onMessage) onMessage(event);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket desconectado');
      if (onDisconnect) onDisconnect();
      // Reconexão automática
      setTimeout(() => {
        // Recarrega a página ou reconecta conforme sua lógica
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('❌ Erro no WebSocket:', error);
    };

    return () => {
      ws.close();
    };
  }, [onMessage, onConnect, onDisconnect]);

  return wsRef;
};

export default useWebSocket;