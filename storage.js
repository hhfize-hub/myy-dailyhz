/* MY DAILY — local storage + IndexedDB music storage */
const Storage = (() => {
  const KEY = 'mydaily_professional_2026';
  const defaults = {
    tasks: [], schedules: [], routines: [], habits: [],
    settings: { language: 'id', focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, volume: .7 },
    statistics: { focusSessions: 0, focusSeconds: 0 }
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!saved) return clone(defaults);
      return { ...clone(defaults), ...saved, settings: { ...defaults.settings, ...(saved.settings || {}) }, statistics: { ...defaults.statistics, ...(saved.statistics || {}) } };
    } catch { return clone(defaults); }
  }
  let data = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { console.warn('Storage full?', e); return false; } }
  function get(key) { return data[key]; }
  function set(key, value) { data[key] = value; save(); return value; }
  function update(key, callback) { data[key] = callback(data[key]); save(); return data[key]; }
  function getAll() { return clone(data); }
  function reset() { data = clone(defaults); save(); }
  function exportData() { return clone(data); }
  function importData(value) { if (!value || typeof value !== 'object') throw Error('Invalid backup'); data = { ...clone(defaults), ...value, settings: { ...defaults.settings, ...(value.settings || {}) }, statistics: { ...defaults.statistics, ...(value.statistics || {}) } }; save(); }
  const DB = 'mydaily_music_db', STORE = 'tracks';
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function musicSave(track) { const db = await openDB(); return new Promise((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(track); tx.oncomplete = () => resolve(true); tx.onerror = () => reject(tx.error); }); }
  async function musicList() { const db = await openDB(); return new Promise((resolve, reject) => { const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll(); req.onsuccess = () => resolve(req.result || []); req.onerror = () => reject(req.error); }); }
  async function musicDelete(id) { const db = await openDB(); return new Promise((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(id); tx.oncomplete = () => resolve(true); tx.onerror = () => reject(tx.error); }); }
  return { get, set, update, getAll, reset, save, exportData, importData, musicSave, musicList, musicDelete };
})();
