import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

export const databaseService = {
  // Generic CRUD operations
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async update(collectionName, docId, data) {
    try {
      await updateDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async delete(collectionName, docId) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getAll(collectionName, queryConstraints = []) {
    try {
      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getById(collectionName, docId) {
    try {
      const docSnap = await getDoc(doc(db, collectionName, docId));
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: 'Document not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Real-time listener
  subscribe(collectionName, queryConstraints = [], callback) {
    const q = query(collection(db, collectionName), ...queryConstraints);
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  }
};