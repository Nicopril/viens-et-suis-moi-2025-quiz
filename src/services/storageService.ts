import { getDoc, setDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase'; // Chemin corrigé selon ta structure

// Type pour les scores utilisateur
export type UserScores = Record<number, Record<string, number>>;

/**
 * Sauvegarde les scores utilisateur dans Firestore
 */
export const saveUserScores = async (scores: UserScores): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Utilisateur non authentifié");
  }

  const userRef = doc(db, 'scores', user.uid);
  await setDoc(userRef, scores, { merge: true });
};

/**
 * Récupère les scores utilisateur depuis Firestore
 */
export const getUserScores = async (): Promise<UserScores> => {
  const user = auth.currentUser;
  if (!user) return {};

  const userRef = doc(db, 'scores', user.uid);
  const docSnap = await getDoc(userRef);

  return docSnap.exists() ? (docSnap.data() as UserScores) : {};
};
/**
 * Récupère le dernier gagnant de la semaine depuis Firestore
 */
export const getLatestWinner = async (): Promise<string | null> => {
  const docRef = doc(db, 'weekly', 'latestWinner');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data?.winner || null;
  }

  return null;
};
