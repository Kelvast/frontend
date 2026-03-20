'use client';

import { useGameStore } from './game-store';

let ws: WebSocket | null = null;

export const connectWS = (token: string) => {
  const url = process.env.NEXT_PUBLIC_MMO_SERVER_URL || 'ws://localhost:8080';
  
  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('MMO WS Connected');
    useGameStore.getState().setConnected(true);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'init':
        useGameStore.getState().setMyId(data.id);
        useGameStore.getState().setNearbyPlayers(data.players);
        break;
        
      case 'player_update':
        // Update specific player position
        const currentPlayers = useGameStore.getState().nearbyPlayers;
        const updatedPlayers = currentPlayers.map(p => 
          p.id === data.playerId 
            ? { ...p, position: data.position }
            : p
        );
        useGameStore.getState().setNearbyPlayers(updatedPlayers);
        break;
        
      case 'player_join':
        useGameStore.getState().addNearbyPlayer(data.player);
        break;
        
      case 'player_leave':
        useGameStore.getState().removeNearbyPlayer(data.playerId);
        break;
    }
  };

  ws.onclose = () => {
    console.log('MMO WS Disconnected');
    useGameStore.getState().setConnected(false);
  };

  ws.onerror = (error) => {
    console.error('WS Error:', error);
  };
};

export const sendPlayerUpdate = (position: { x: number; y: number; z: number }) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'player_move',
      position
    }));
  }
};
