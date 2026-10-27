import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc as firestoreAddDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export async function getCollection(path, ...constraints) {
  const ref = collection(db, path);
  const q = constraints.length ? query(ref, ...constraints) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getDocument(path, id) {
  const ref = doc(db, path, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addDocument(path, data) {
  const ref = await firestoreAddDoc(collection(db, path), data);
  return ref.id;
}

export async function updateDocument(path, id, data) {
  await firestoreUpdateDoc(doc(db, path, id), data);
}

export async function deleteDocument(path, id) {
  await firestoreDeleteDoc(doc(db, path, id));
}

export { where, orderBy };
