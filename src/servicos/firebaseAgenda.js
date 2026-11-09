
import { getFirestore } from 'firebase/firestore/lite';

import { app } from './firebaseApp.js';

export const dbAgenda = getFirestore(app);
