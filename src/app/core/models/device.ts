export interface RawDevice {
  id: string | null;
  code: string | null;
  name: string | null;
  type: string | null;
  area: string | null;
  status: string | null;
  lastSeen: string | null;
  vendor: string | null;
}

export interface Device {
  id: string;
  code: string;
  name: string;
  type: string;
  area: string;
  status: 'running' | 'stopped' | 'fault' | 'unknown';
  lastSeen: string | null;
  vendor: string;
}