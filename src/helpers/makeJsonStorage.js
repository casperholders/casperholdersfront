/**
 * Create a generic JSON storage.
 *
 * @param {string} key
 * @param {Storage} storage
 *
 * @returns {object}
 */
export default function makeJsonStorage(key, storage = window.localStorage) {
  return {
    get: () => {
      const storageContent = storage.getItem(key);

      return storageContent ? JSON.parse(storageContent) : undefined;
    },
    set: (value) => {
      if (value === undefined) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, JSON.stringify(value));
      }
    },
  };
}
