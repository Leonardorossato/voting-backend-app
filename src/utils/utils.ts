import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export const createPollID = () => {
  const id = uuidv4();
  const hash = createHash('md5').update(id).digest('hex');
  return hash.substr(0, 6);
};

export const createUserID = () => uuidv4();
export const createNominationID = () => uuidv4();
