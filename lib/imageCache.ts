"use client";

const DB_NAME = "brand-image-trace-cache";
const STORE_NAME = "images";
const DB_VERSION = 1;

interface CachedImageRecord {
  variantId: string;
  src: string;
  updatedAt: string;
}

function canUseIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openImageDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "variantId" });
      }
    };

    request.onerror = () => reject(request.error ?? new Error("Unable to open image cache."));
    request.onsuccess = () => resolve(request.result);
  });
}

function withImageStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void
) {
  return new Promise<T | undefined>((resolve, reject) => {
    openImageDb()
      .then((db) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = run(store);

        transaction.oncomplete = () => {
          db.close();
          resolve(request ? request.result : undefined);
        };
        transaction.onerror = () => {
          db.close();
          reject(transaction.error ?? new Error("Image cache transaction failed."));
        };
        transaction.onabort = () => {
          db.close();
          reject(transaction.error ?? new Error("Image cache transaction aborted."));
        };
      })
      .catch(reject);
  });
}

export async function cacheImageSource(variantId: string, src: string) {
  if (!src) return;

  await withImageStore("readwrite", (store) =>
    store.put({
      variantId,
      src,
      updatedAt: new Date().toISOString()
    } satisfies CachedImageRecord)
  );
}

export async function loadCachedImageSources(variantIds: string[]) {
  const uniqueIds = [...new Set(variantIds)].filter(Boolean);
  const sources: Record<string, string> = {};

  await Promise.all(
    uniqueIds.map(async (variantId) => {
      const record = await withImageStore<CachedImageRecord>("readonly", (store) => store.get(variantId));
      if (record?.src) sources[variantId] = record.src;
    })
  );

  return sources;
}

export async function clearImageCache() {
  await withImageStore("readwrite", (store) => store.clear());
}
