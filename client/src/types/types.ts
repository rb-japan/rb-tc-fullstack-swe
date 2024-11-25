export interface Party {
  _id: string;
  name: string;
  size: number;
  status: 'waiting' | 'ready' | 'in_service' | 'completed';
  sessionId: string;
  serviceStartTime?: Date;
  serviceEndTime?: Date;
  createdAt: Date;
  __v?: number;
  message?: string;
}
