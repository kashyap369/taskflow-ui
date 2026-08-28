import { Injectable } from '@angular/core';

export interface PlannerRecoveryRecord {
  key: string;
  projectId: number;
  baseRevision: number;
  sceneJson: string;
  pending: boolean;
  savedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PlannerRecoveryStore {
  private static readonly databaseName = 'taskflow-planner';
  private static readonly storeName = 'scene-recovery';
  private databasePromise: Promise<IDBDatabase | null> | null = null;

  async isAvailable(): Promise<boolean> {
    return (await this.openDatabase()) !== null;
  }

  async read(key: string): Promise<PlannerRecoveryRecord | null> {
    const database = await this.openDatabase();
    if (!database) {
      return null;
    }

    return new Promise((resolve) => {
      const request = database
        .transaction(PlannerRecoveryStore.storeName, 'readonly')
        .objectStore(PlannerRecoveryStore.storeName)
        .get(key);

      request.onsuccess = () => resolve((request.result as PlannerRecoveryRecord) ?? null);
      request.onerror = () => resolve(null);
    });
  }

  async write(record: PlannerRecoveryRecord): Promise<boolean> {
    const database = await this.openDatabase();
    if (!database) {
      return false;
    }

    return new Promise<boolean>((resolve) => {
      const transaction = database.transaction(PlannerRecoveryStore.storeName, 'readwrite');
      transaction.objectStore(PlannerRecoveryStore.storeName).put(record);
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
      transaction.onabort = () => resolve(false);
    });
  }

  private openDatabase(): Promise<IDBDatabase | null> {
    if (this.databasePromise) {
      return this.databasePromise;
    }

    this.databasePromise = new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        resolve(null);
        return;
      }

      const request = indexedDB.open(PlannerRecoveryStore.databaseName, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(PlannerRecoveryStore.storeName)) {
          request.result.createObjectStore(PlannerRecoveryStore.storeName, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });

    return this.databasePromise;
  }
}
