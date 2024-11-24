import mongoose, { Document, Schema } from 'mongoose';

export interface IParty extends Document {
  name: string;
  size: number;
  status: 'waiting' | 'ready' | 'in_service' | 'completed';
  sessionId: string;
  createdAt: Date;
  serviceStartTime: Date;
  serviceEndTime: Date;
}

const partySchema = new Schema<IParty>({
  name: { type: String, required: true },
  size: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['waiting', 'ready', 'in_service', 'completed'],
    default: 'waiting',
  },
  sessionId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  serviceStartTime: { type: Date },
  serviceEndTime: { type: Date },
});

export default mongoose.model<IParty>('Party', partySchema);
