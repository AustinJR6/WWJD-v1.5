import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from './firebase';

// Initialize Firestore with our existing Firebase app
const db = getFirestore(app);

/**
 * Persist a message to Firestore so conversations can be revisited.
 * The timestamp uses the device clock for simplicity.
 */
export async function saveMessage(
  userId: string,
  text: string,
  from: 'user' | 'ai'
): Promise<void> {
  await addDoc(collection(db, 'messages'), {
    userId,
    text,
    from,
    timestamp: Date.now(),
  });
}
