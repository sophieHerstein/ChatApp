import { EStatus } from './status';

export interface IMessage {
  id: number;
  message: string;
  time: string;
  sentByMe: boolean;
  status: EStatus;
}
