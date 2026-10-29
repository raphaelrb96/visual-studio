import type {
  QueryConstraint,
  DocumentData,
  WithFieldValue,
  UpdateData,
} from 'firebase/firestore';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc as firestoreSetDoc,
  addDoc as firestoreAddDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { VideoProject, CREDIT_COSTS } from '@/types/studio';

export interface UserCredits {
  plan: 'free' | 'creator' | 'pro';
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
}

export async function getCollection<T = any>(
  path: string,
  ...constraints: any[]
): Promise<Array<T & { id: string }>> {
  const ref = collection(db, path);
  const q = constraints.length ? query(ref, ...constraints) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as T) }));
}

export async function getDocument<T = any>(
  path: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const ref = doc(db, path, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as T) };
}

export async function setDocument<T extends Record<string, any>>(
  path: string,
  id: string,
  data: T
): Promise<void> {
  const ref = doc(db, path, id);
  await firestoreSetDoc(ref, data, { merge: true });
}

export async function addDocument<T extends Record<string, any>>(
  path: string,
  data: T
): Promise<string> {
  const ref = await firestoreAddDoc(collection(db, path), data);
  return ref.id;
}

export async function updateDocument<T extends Record<string, any>>(
  path: string,
  id: string,
  data: any
): Promise<void> {
  await firestoreUpdateDoc(doc(db, path, id), data);
}

export async function deleteDocument(path: string, id: string): Promise<void> {
  await firestoreDeleteDoc(doc(db, path, id));
}

/**
 * Retorna os créditos reais do usuário a partir do Firestore
 */
export async function getUserCredits(userId: string): Promise<UserCredits> {
  try {
    const userDoc = await getDocument<{
      plan?: string;
      credits?: number;
      usedCredits?: number;
    }>('users', userId);

    if (userDoc) {
      const plan = (userDoc.plan as any) || 'free';
      // Saldo inicial generoso de créditos (Ex: Free: 25 créditos; Creator: 150 créditos; Pro: 400 créditos)
      const defaultTotal = plan === 'creator' ? 180 : plan === 'pro' ? 450 : 25;
      const total = typeof userDoc.credits === 'number' ? userDoc.credits : defaultTotal;
      const used = typeof userDoc.usedCredits === 'number' ? userDoc.usedCredits : 0;
      return {
        plan,
        totalCredits: total,
        usedCredits: used,
        availableCredits: Math.max(0, total - used),
      };
    }
  } catch (err) {
    console.error('Erro ao buscar créditos do usuário:', err);
  }

  return {
    plan: 'free',
    totalCredits: 25,
    usedCredits: 0,
    availableCredits: 25,
  };
}

/**
 * Deduz créditos do usuário registrando o consumo
 */
export async function deductUserCredits(userId: string, amount: number): Promise<boolean> {
  try {
    const current = await getUserCredits(userId);
    if (current.availableCredits < amount) {
      return false;
    }
    await updateDocument('users', userId, {
      usedCredits: current.usedCredits + amount,
    });
    return true;
  } catch (err) {
    console.error('Erro ao debitar créditos:', err);
    return false;
  }
}

/**
 * Busca todos os projetos do usuário (incluindo rascunhos em progresso)
 */
export async function getUserProjects(userId: string): Promise<VideoProject[]> {
  try {
    const records = await getCollection<VideoProject>(
      'projects',
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    return records;
  } catch {
    try {
      return await getCollection<VideoProject>('projects', where('userId', '==', userId));
    } catch {
      return [];
    }
  }
}

/**
 * Salva ou atualiza o estado atual do projeto na etapa em que ele está
 */
export async function saveProjectState(project: Partial<VideoProject> & { id: string; userId: string }): Promise<void> {
  await setDocument('projects', project.id, {
    ...project,
    updatedAt: new Date().toISOString(),
  });
}

export interface VideoRecord {
  id: string;
  userId: string;
  title: string;
  videoUrl?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  aspectRatio?: string;
  format?: string;
  preset?: string;
  duration?: number;
}

export async function getUserVideos(userId: string): Promise<VideoRecord[]> {
  try {
    const projects = await getUserProjects(userId);
    return projects.map((p) => ({
      id: p.id,
      userId: p.userId,
      title: p.title || 'Vídeo Sem Título',
      videoUrl: p.videoUrl,
      status: p.status || 'draft',
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt,
      aspectRatio: p.aspectRatio,
      duration: p.scenes ? p.scenes.reduce((acc, s) => acc + (s.durationSec || 4), 0) : 0,
    }));
  } catch (err) {
    console.error('Erro ao buscar vídeos do usuário:', err);
    return [];
  }
}

export { where, orderBy, limit, CREDIT_COSTS };
