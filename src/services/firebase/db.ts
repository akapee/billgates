import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { db } from "../../config/firebase";

// Fungsi untuk mendapatkan semua dokumen dari sebuah collection
export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Fungsi untuk mendapatkan satu dokumen berdasarkan ID
export const getDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

// Fungsi untuk menambahkan dokumen baru
export const addDocument = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
};

// Fungsi untuk mengupdate dokumen
export const updateDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
};

// Fungsi untuk menghapus dokumen
export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};
