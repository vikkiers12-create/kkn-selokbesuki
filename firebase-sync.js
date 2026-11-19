// ============================================================
//  firebase-sync.js
//  Sinkronisasi otomatis DesaDB (localStorage) ↔ Firebase RTDB
//  Load file ini SETELAH shared-data.js
// ============================================================

// ⚠️ GANTI dengan URL Firebase project Anda!
// Format: https://NAMA-PROJECT-default-rtdb.firebaseio.com
const FIREBASE_DB_URL = 'https://YOUR-PROJECT-default-rtdb.firebaseio.com';

// Key-key yang di-sync ke Firebase (kecuali session & admin password)
const SYNC_KEYS = [
  'desa_profil',
  'desa_stats',
  'desa_aset',
  'desa_umkm',
  'desa_sejarah',
  'desa_pesan',
];

// ---- Status sync ----
let isSyncing = false;
let syncQueue = [];

// ---- Patch DesaDB._set agar auto-sync ke Firebase ----
const _originalSet = DesaDB._set.bind(DesaDB);
DesaDB._set = function (key, val) {
  const result = _originalSet(key, val);
  if (SYNC_KEYS.includes(key)) {
    pushToFirebase(key, val);
  }
  return result;
};

// ---- Push satu key ke Firebase ----
async function pushToFirebase(key, val) {
  if (!FIREBASE_DB_URL || FIREBASE_DB_URL.includes('YOUR-PROJECT')) return;
  try {
    await fetch(`${FIREBASE_DB_URL}/${key}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(val),
    });
  } catch (e) {
    console.warn(`[Firebase] Gagal push ${key}:`, e.message);
  }
}

// ---- Pull semua data dari Firebase ke localStorage ----
async function pullFromFirebase() {
  if (!FIREBASE_DB_URL || FIREBASE_DB_URL.includes('YOUR-PROJECT')) {
    console.info('[Firebase] URL belum dikonfigurasi, pakai localStorage saja.');
    return;
  }

  try {
    const res = await fetch(`${FIREBASE_DB_URL}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data && typeof data === 'object') {
      SYNC_KEYS.forEach(key => {
        if (data[key] !== undefined) {
          _originalSet(key, data[key]);
        }
      });
      console.info('[Firebase] ✅ Data berhasil disinkronkan dari Firebase.');
    }
  } catch (e) {
    console.warn('[Firebase] Pull gagal, lanjut pakai localStorage:', e.message);
  }
}

// ---- Real-time listener via Server-Sent Events (Firebase SSE) ----
function listenRealtime() {
  if (!FIREBASE_DB_URL || FIREBASE_DB_URL.includes('YOUR-PROJECT')) return;

  const evtSource = new EventSource(`${FIREBASE_DB_URL}.json?accept=text/event-stream`);

  evtSource.addEventListener('put', (e) => {
    try {
      const payload = JSON.parse(e.data);
      if (payload.data && typeof payload.data === 'object') {
        SYNC_KEYS.forEach(key => {
          if (payload.data[key] !== undefined) {
            _originalSet(key, payload.data[key]);
          }
        });
        // Trigger re-render jika ada fungsi refresh terdaftar
        if (typeof window.onFirebaseUpdate === 'function') {
          window.onFirebaseUpdate();
        }
      }
    } catch {}
  });

  evtSource.onerror = () => {
    evtSource.close();
    // Retry setelah 10 detik
    setTimeout(listenRealtime, 10000);
  };
}

// ---- Inisialisasi ----
(async () => {
  await pullFromFirebase();
  listenRealtime();
})();

// ---- Export helper untuk admin ----
window.FirebaseSync = {
  push: pushToFirebase,
  pull: pullFromFirebase,
  pushAll: async () => {
    for (const key of SYNC_KEYS) {
      const val = DesaDB._get(key, null);
      if (val !== null) await pushToFirebase(key, val);
    }
    console.info('[Firebase] ✅ Semua data di-push ke Firebase.');
  },
};
