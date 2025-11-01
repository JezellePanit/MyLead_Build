// utils/firestoreHelper.js
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

/**
 * Subscribe to a Firestore document with automatic error handling.
 * @param {string} collectionName - Firestore collection name
 * @param {string} id - Document ID
 * @param {function} onSuccess - Callback when data is received
 * @param {function} onError - Callback when an error occurs
 * @returns {function} Unsubscribe function
 */
export const subscribeToDoc = (collectionName, id, onSuccess, onError) => {
  try {
    const docRef = doc(db, collectionName, id);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onSuccess(snapshot.data());
        } else {
          onError('Document not found.');
        }
      },
      (err) => {
        console.error(`Firestore error in ${collectionName}:`, err);
        onError('Error fetching data. Please try again later.');
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Unexpected Firestore error:', err);
    onError('Unexpected error occurred while loading data.');
  }
};

/**
 * Fetch a single Firestore document once (not realtime).
 * @param {string} collectionName - Firestore collection
 * @param {string} id - Document ID
 * @returns {Promise<object|null>} Data or null
 */
export const fetchDocOnce = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
  } catch (err) {
    console.error(`❌ Error fetching ${collectionName}/${id}:`, err);
    throw new Error('Failed to load data from Firestore.');
  }
};
