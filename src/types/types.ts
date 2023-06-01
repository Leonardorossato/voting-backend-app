export type CreatePollField = {
  topic: string;
  votesPerVoter: number;
  name: string;
};

export type JoinPollField = {
  polldId: string;
  name: string;
};

export type RejoinPollField = {
  pollId: string;
  userId: string;
  name: string;
};

export type AddParticipantData = {
  pollId: string;
  userId: string;
  name: string;
};
