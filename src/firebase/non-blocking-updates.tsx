'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Initiates a setDoc operation. Does NOT block. Emits a custom error on permission failure.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: SetOptions) {
  const op = options ? setDoc(docRef, data, options) : setDoc(docRef, data);
  op.catch(error => {
    // Check if the error is a permission error before creating a custom one.
    if (error.code === 'permission-denied') {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: options && ('merge' in options || 'mergeFields' in options) ? 'update' : 'create',
            requestResourceData: data,
          })
        )
    } else {
        console.error("Firestore Error:", error);
    }
  });
}

/**
 * Initiates an addDoc operation. Does NOT block. Emits a custom error on permission failure.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  addDoc(colRef, data)
    .catch(error => {
      if (error.code === 'permission-denied') {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: colRef.path,
            operation: 'create',
            requestResourceData: data,
          })
        )
      } else {
        console.error("Firestore Error:", error);
      }
    });
}

/**
 * Initiates an updateDoc operation. Does NOT block. Emits a custom error on permission failure.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      if (error.code === 'permission-denied') {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: data,
          })
        )
      } else {
        console.error("Firestore Error:", error);
      }
    });
}

/**
 * Initiates a deleteDoc operation. Does NOT block. Emits a custom error on permission failure.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      if (error.code === 'permission-denied') {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
          })
        )
      } else {
        console.error("Firestore Error:", error);
      }
    });
}
