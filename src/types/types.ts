import { Request } from 'express';
import { Socket } from 'socket.io';

export type CreatePollField = {
  topic: string;
  votesPerVoter: number;
  name: string;
};

export type JoinPollField = {
  pollId: string;
  name: string;
};

export type RejoinPollField = {
  pollId: string;
  userId: string;
  name: string;
};

export type CreatePollData = {
  pollId: string;
  userId: string;
  votesPerVoter: number;
  topic: string;
};

export type AddParticipantData = {
  pollId: string;
  userId: string;
  name: string;
};

export type AuthPayload = {
  userId: string;
  pollId: string;
  name: string;
};

export type RequestWithAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;
