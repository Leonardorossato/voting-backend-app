export type CreatePollField = {
  topic: string;
  votesPerVoter: number;
  name: string;
};

export type JoinPollField = {
  poldId: string;
  name: string;
};

export type RejoinPollField = {
  polId: string;
  userId: string;
  name: string;
};
