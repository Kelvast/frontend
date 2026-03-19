export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  id: number;
  uuid: string;
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  hp: number;
  pathLen: number;
  facing: number;
}

export interface StoredPlayer {
  name: string;
  email: string;
  passwordHash: string;
  x: number;
  y: number;
  lastSeen: number;
}

export type PacketType = 'login' | 'register' | 'resume' | 'position' | 'logout';
