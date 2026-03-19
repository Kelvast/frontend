import { useGameStore } from './game-store';

const SERVER_URL = process.env.NEXT_PUBLIC_MMO_SERVER_URL ?? 'ws://localhost:8080';

let socket: WebSocket | null = null;

export function connectWS(token?: string): WebSocket {
  socket?.close();
  
  socket = new WebSocket(SERVER_URL);
  
  socket.onopen = () => {
    const store = useGameStore.getState();
    store.setConnected(true);
    
    if (token) {
      socket!.send(JSON.stringify({ type: 'resume', token }));
    } else {
      // Trigger login UI or use stored session
      const session = localStorage.getItem('mmo_session');
      if (session) {
        socket!.send(JSON.stringify({ type: 'resume', token: JSON.parse(session).token }));
      }
    }
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    const store = useGameStore.getState();
    
    if (data.type === 'loginSuccess' || data.type === 'resumeSuccess') {
      store.setMyId(data.id);
      localStorage.setItem('mmo_session', JSON.stringify({
        token: data.sessionToken,
        expiresAt: data.sessionExpiresAt
      }));
    } else if (data.type === 'state') {
      store.syncPlayers(data.players);
    }
  };

  socket.onclose = () => {
    useGameStore.getState().setConnected(false);
  };

  socket.onerror = (error) => {
    console.error('WS Error:', error);
  };

  return socket;
}

export function sendPosition(x: number, y: number) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'position', x, y }));
  }
}

export function disconnectWS() {
  socket?.close();
  socket = null;
}
