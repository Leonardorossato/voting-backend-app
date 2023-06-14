export interface Participants {
  [participantId: string]: string;
}

export interface Nomination {
  userId: string;
  text: string;
}

export type Nominations = {
  [nominationId: string]: Nomination;
};

export interface Poll {
  id: string;
  topic: string;
  votesPerVoter: number;
  participants: Participants;
  adminId: string;
  nom;
  hasStarted: boolean;
}
