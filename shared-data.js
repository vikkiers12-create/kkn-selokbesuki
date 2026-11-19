// ============================================================
//  shared-data.js  — Data layer bersama antara web publik & admin
//  Menggunakan localStorage sebagai "database" sederhana
// ============================================================

const STORAGE_KEYS = {
  PROFIL:   'desa_profil',
  ASET:     'desa_aset',
  UMKM:     'desa_umkm',
  SEJARAH:  'desa_sejarah',
  PESAN:    'desa_pesan',
  STATS:    'desa_stats',
  ADMIN:    'desa_admin',
  SESSION:  'desa_session',
};

// ---- Default Data ----
const DEFAULT_PROFIL = {
  nama: 'SelokBesuki',
  kecamatan: 'Ciawi',
  kabupaten: 'Bogor',
  provinsi: 'Jawa Barat',
  kodePos: '16760',
  kodeDesa: '3201120001',
  luas: '842 Ha',
  ketinggian: '620 m dpl',
  visi: 'Terwujudnya Desa SelokBesuki yang Maju, Mandiri, dan Sejahtera Berbasis Potensi Lokal dan Nilai Budaya.',
  misi: [
    'Meningkatkan kualitas pelayanan publik yang transparan dan akuntabel',
    'Mengembangkan potensi ekonomi lokal melalui UMKM dan pertanian',
    'Membangun infrastruktur desa yang merata dan berkelanjutan',
    'Melestarikan budaya dan kearifan lokal masyarakat desa',
    'Meningkatkan kualitas pendidikan dan kesehatan warga',
  ],
  kepala: 'Bapak Hendra Gunawan',
  telepon: '(0251) 8123-456',
  email: 'desa.sukamaju@bogorkab.go.id',
  alamat: 'Jl. Raya Sukamaju No. 1, Desa Sukamaju, Kec. Ciawi, Kab. Bogor 16760',
  jamPelayanan: 'Senin – Jumat: 08.00 – 15.00 WIB | Sabtu: 08.00 – 12.00 WIB',
  heroSubtitle: 'Desa yang asri, sejuk, dan penuh potensi di kaki Gunung Gede Pangrango. Bersama membangun desa yang mandiri, inovatif, dan berbudaya.',
};

const DEFAULT_STATS = {
  penduduk: 4280,
  kk: 1240,
  dusun: 6,
  umkmAktif: 42,
};

const DEFAULT_ASET = [
  { id: 1, nama: 'Balai Desa', kategori: 'tanah', emoji: '🏛️', deskripsi: 'Gedung pusat pelayanan administrasi dan pertemuan warga seluas 480 m².', detail: '480 m²', kondisi: 'baik', gradien: 'linear-gradient(135deg,#166534,#22c55e)' },
  { id: 2, nama: 'Masjid Al-Ikhlas', kategori: 'fasilitas', emoji: '🕌', deskripsi: 'Masjid utama desa berkapasitas 500 jemaah, dibangun tahun 1905 dan direnovasi 2018.', detail: '500 jemaah', kondisi: 'baik', gradien: 'linear-gradient(135deg,#1e40af,#60a5fa)' },
  { id: 3, nama: 'SDN Sukamaju 01 & 02', kategori: 'fasilitas', emoji: '🏫', deskripsi: 'Dua sekolah dasar negeri dengan total 24 ruang kelas dan 680 siswa aktif.', detail: '24 kelas', kondisi: 'baik', gradien: 'linear-gradient(135deg,#b45309,#fbbf24)' },
  { id: 4, nama: 'Puskesmas Pembantu', kategori: 'fasilitas', emoji: '🏥', deskripsi: 'Fasilitas kesehatan tingkat pertama yang melayani warga setiap hari kerja.', detail: 'Senin–Sabtu', kondisi: 'baik', gradien: 'linear-gradient(135deg,#9d174d,#f472b6)' },
  { id: 5, nama: 'Tanah Kas Desa', kategori: 'tanah', emoji: '🌾', deskripsi: 'Lahan milik desa seluas 12,4 Ha yang dikelola untuk pertanian dan disewakan kepada warga.', detail: '12,4 Ha', kondisi: 'baik', gradien: 'linear-gradient(135deg,#064e3b,#34d399)' },
  { id: 6, nama: 'Kendaraan Operasional', kategori: 'kendaraan', emoji: '🚛', deskripsi: '1 unit mobil dinas, 2 motor operasional, dan 1 truk sampah untuk layanan kebersihan.', detail: '4 unit', kondisi: 'sedang', gradien: 'linear-gradient(135deg,#374151,#9ca3af)' },
  { id: 7, nama: 'Lapangan Olahraga', kategori: 'fasilitas', emoji: '⚽', deskripsi: 'Lapangan sepak bola, bulu tangkis, dan voli yang digunakan aktif oleh warga dan pemuda desa.', detail: '3 lapangan', kondisi: 'baik', gradien: 'linear-gradient(135deg,#1d4ed8,#38bdf8)' },
  { id: 8, nama: 'Sumber Mata Air', kategori: 'alam', emoji: '💧', deskripsi: '3 titik mata air yang mensuplai kebutuhan air bersih warga dan sistem irigasi pertanian.', detail: '3 titik', kondisi: 'baik', gradien: 'linear-gradient(135deg,#0369a1,#67e8f9)' },
  { id: 9, nama: 'Hutan Desa', kategori: 'alam', emoji: '🌳', deskripsi: 'Area hutan lindung seluas 45 Ha yang dikelola bersama masyarakat dan Perhutani.', detail: '45 Ha', kondisi: 'baik', gradien: 'linear-gradient(135deg,#365314,#a3e635)' },
  { id: 10, nama: 'Gedung BUMDes', kategori: 'tanah', emoji: '🏢', deskripsi: 'Kantor Badan Usaha Milik Desa yang mengelola simpan pinjam dan usaha desa lainnya.', detail: '120 m²', kondisi: 'baik', gradien: 'linear-gradient(135deg,#7c3aed,#c4b5fd)' },
  { id: 11, nama: 'Posyandu & PAUD', kategori: 'fasilitas', emoji: '👶', deskripsi: '8 pos pelayanan terpadu dan 3 PAUD yang tersebar di setiap dusun untuk pelayanan balita.', detail: '11 unit', kondisi: 'baik', gradien: 'linear-gradient(135deg,#be123c,#fb7185)' },
  { id: 12, nama: 'Alat Mesin Pertanian', kategori: 'kendaraan', emoji: '🚜', deskripsi: 'Traktor, combine harvester, dan pompa irigasi yang dapat dipinjam petani lokal.', detail: '8 unit', kondisi: 'sedang', gradien: 'linear-gradient(135deg,#92400e,#fcd34d)' },
];

const DEFAULT_UMKM = [
  { id: 1, nama: 'Keripik Singkong Bu Ani', kategori: 'kuliner', emoji: '🍢', pemilik: 'Hj. Sumiati', deskripsi: 'Keripik singkong dengan 8 varian rasa, diproduksi secara rumahan sejak 2010. Sudah masuk toko oleh-oleh Bogor.', tags: ['📦 Tersedia Online', '🏆 Produk Unggulan'], gradien: 'linear-gradient(135deg,#92400e,#f59e0b)' },
  { id: 2, nama: 'Anyaman Bambu Karya Desa', kategori: 'kerajinan', emoji: '🧺', pemilik: 'Kelompok Tani Maju Bersama', deskripsi: 'Produk anyaman bambu (tas, nampan, hiasan dinding) buatan tangan pengrajin lokal. Ekspor ke Bali dan Jakarta.', tags: ['🌿 Ramah Lingkungan', '🚢 Ekspor'], gradien: 'linear-gradient(135deg,#1e3a5f,#3b82f6)' },
  { id: 3, nama: 'Teh Organik Pegunungan', kategori: 'pertanian', emoji: '🍵', pemilik: 'Pak Darto', deskripsi: 'Teh hijau dan teh hitam organik tanpa pestisida dari kebun rakyat di lereng gunung. Bersertifikat organik.', tags: ['🌱 Organik', '📜 Bersertifikat'], gradien: 'linear-gradient(135deg,#064e3b,#10b981)' },
  { id: 4, nama: 'Dodol & Kue Tradisional', kategori: 'kuliner', emoji: '🍰', pemilik: 'Ibu Komariah', deskripsi: 'Aneka kue tradisional: dodol, wajik, ampyang, dan rangginang. Tersedia dalam kemasan cantik untuk oleh-oleh.', tags: ['🎁 Oleh-oleh', '✅ PIRT'], gradien: 'linear-gradient(135deg,#7c2d12,#fb923c)' },
  { id: 5, nama: 'Konveksi & Bordir Sukamaju', kategori: 'kerajinan', emoji: '🧵', pemilik: 'CV. Maju Jaya', deskripsi: 'Menerima pesanan seragam, kaos sablon, tas, dan bordir custom dengan kapasitas 2.000 pcs/bulan.', tags: ['👕 Custom Order', '📦 Kapasitas Besar'], gradien: 'linear-gradient(135deg,#312e81,#818cf8)' },
  { id: 6, nama: 'Sayuran Hidroponik Desa', kategori: 'pertanian', emoji: '🥬', pemilik: 'Poktan Hidroponik Muda', deskripsi: 'Sayuran hidroponik segar (selada, kangkung, bayam) yang dipanen setiap hari dan langsung dikirim ke pasar.', tags: ['🌊 Hidroponik', '🏪 Supply Supermarket'], gradien: 'linear-gradient(135deg,#365314,#86efac)' },
  { id: 7, nama: 'Bengkel Las & Mekanik Desa', kategori: 'jasa', emoji: '🔧', pemilik: 'Pak Ujang', deskripsi: 'Layanan las listrik, perbaikan alat pertanian, dan perawatan kendaraan roda dua & empat.', tags: ['⚙️ Alat Pertanian', '🕐 Buka 7 hari'], gradien: 'linear-gradient(135deg,#0f172a,#475569)' },
  { id: 8, nama: 'Kopi Robusta Gunung Gede', kategori: 'kuliner', emoji: '☕', pemilik: 'Mas Ridwan', deskripsi: 'Kopi robusta single origin dari ketinggian 700 mdpl. Tersedia biji dan bubuk, roasting on demand.', tags: ['☕ Single Origin', '📦 Tersedia Online'], gradien: 'linear-gradient(135deg,#4a1942,#c084fc)' },
];

const DEFAULT_SEJARAH = [
  { id: 1, tahun: '1847', judul: 'Berdirinya Kampung', deskripsi: 'Raden Sukarno Wijoyo memimpin rombongan dan membuka lahan di kaki Gunung Gede, mendirikan pemukiman pertama.', aktif: false },
  { id: 2, tahun: '1905', judul: 'Pembangunan Masjid Pertama', deskripsi: 'Masjid Al-Ikhlas dibangun sebagai pusat kegiatan keagamaan dan sosial masyarakat desa.', aktif: false },
  { id: 3, tahun: '1945', judul: 'Perjuangan Kemerdekaan', deskripsi: 'Pemuda desa turut berjuang melawan penjajah. Monumen Perjuangan didirikan untuk mengenang para pahlawan.', aktif: false },
  { id: 4, tahun: '1950', judul: 'Desa Resmi Otonom', deskripsi: 'Pemerintah menetapkan Sukamaju sebagai desa otonom dengan kepala desa pertama: Bapak Kartadinata.', aktif: false },
  { id: 5, tahun: '1980', judul: 'Era Pembangunan', deskripsi: 'Program repelita membawa irigasi teknis, listrik desa, dan jalan beraspal pertama ke Sukamaju.', aktif: false },
  { id: 6, tahun: '2015', judul: 'Dana Desa & Digitalisasi', deskripsi: 'Implementasi Dana Desa mendorong pembangunan pesat. Website desa dan sistem administrasi digital mulai dijalankan.', aktif: false },
  { id: 7, tahun: '2024', judul: 'Desa Maju & Mandiri', deskripsi: 'Sukamaju meraih predikat "Desa Berkembang" dari Kemendes dan terus berinovasi dalam pelayanan warga.', aktif: true },
];

const DEFAULT_ADMIN = { username: 'admin', password: 'admin123', nama: 'Administrator Desa' };

// ---- Storage helpers ----
const DesaDB = {
  _get(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  _set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch { return false; }
  },

  // Init defaults if first run
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PROFIL))   this._set(STORAGE_KEYS.PROFIL,  DEFAULT_PROFIL);
    if (!localStorage.getItem(STORAGE_KEYS.STATS))    this._set(STORAGE_KEYS.STATS,   DEFAULT_STATS);
    if (!localStorage.getItem(STORAGE_KEYS.ASET))     this._set(STORAGE_KEYS.ASET,    DEFAULT_ASET);
    if (!localStorage.getItem(STORAGE_KEYS.UMKM))     this._set(STORAGE_KEYS.UMKM,    DEFAULT_UMKM);
    if (!localStorage.getItem(STORAGE_KEYS.SEJARAH))  this._set(STORAGE_KEYS.SEJARAH, DEFAULT_SEJARAH);
    if (!localStorage.getItem(STORAGE_KEYS.PESAN))    this._set(STORAGE_KEYS.PESAN,   []);
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN))    this._set(STORAGE_KEYS.ADMIN,   DEFAULT_ADMIN);
  },

  // --- Profil ---
  getProfil()         { return this._get(STORAGE_KEYS.PROFIL, DEFAULT_PROFIL); },
  setProfil(data)     { return this._set(STORAGE_KEYS.PROFIL, data); },

  // --- Stats ---
  getStats()          { return this._get(STORAGE_KEYS.STATS, DEFAULT_STATS); },
  setStats(data)      { return this._set(STORAGE_KEYS.STATS, data); },

  // --- Aset ---
  getAset()           { return this._get(STORAGE_KEYS.ASET, DEFAULT_ASET); },
  addAset(item)       {
    const list = this.getAset();
    item.id = Date.now();
    list.push(item);
    return this._set(STORAGE_KEYS.ASET, list);
  },
  updateAset(id, data) {
    const list = this.getAset().map(a => a.id === id ? { ...a, ...data } : a);
    return this._set(STORAGE_KEYS.ASET, list);
  },
  deleteAset(id)      {
    return this._set(STORAGE_KEYS.ASET, this.getAset().filter(a => a.id !== id));
  },

  // --- UMKM ---
  getUMKM()           { return this._get(STORAGE_KEYS.UMKM, DEFAULT_UMKM); },
  addUMKM(item)       {
    const list = this.getUMKM();
    item.id = Date.now();
    list.push(item);
    return this._set(STORAGE_KEYS.UMKM, list);
  },
  updateUMKM(id, data) {
    const list = this.getUMKM().map(u => u.id === id ? { ...u, ...data } : u);
    return this._set(STORAGE_KEYS.UMKM, list);
  },
  deleteUMKM(id)      {
    return this._set(STORAGE_KEYS.UMKM, this.getUMKM().filter(u => u.id !== id));
  },

  // --- Sejarah ---
  getSejarah()        { return this._get(STORAGE_KEYS.SEJARAH, DEFAULT_SEJARAH); },
  addSejarah(item)    {
    const list = this.getSejarah();
    item.id = Date.now();
    list.push(item);
    list.sort((a, b) => parseInt(a.tahun) - parseInt(b.tahun));
    return this._set(STORAGE_KEYS.SEJARAH, list);
  },
  updateSejarah(id, data) {
    let list = this.getSejarah().map(s => s.id === id ? { ...s, ...data } : s);
    list.sort((a, b) => parseInt(a.tahun) - parseInt(b.tahun));
    return this._set(STORAGE_KEYS.SEJARAH, list);
  },
  deleteSejarah(id)   {
    return this._set(STORAGE_KEYS.SEJARAH, this.getSejarah().filter(s => s.id !== id));
  },

  // --- Pesan ---
  getPesan()          { return this._get(STORAGE_KEYS.PESAN, []); },
  addPesan(msg)       {
    const list = this.getPesan();
    msg.id = Date.now();
    msg.waktu = new Date().toISOString();
    msg.dibaca = false;
    list.unshift(msg);
    return this._set(STORAGE_KEYS.PESAN, list);
  },
  bacaPesan(id)       {
    const list = this.getPesan().map(p => p.id === id ? { ...p, dibaca: true } : p);
    return this._set(STORAGE_KEYS.PESAN, list);
  },
  hapusPesan(id)      {
    return this._set(STORAGE_KEYS.PESAN, this.getPesan().filter(p => p.id !== id));
  },
  countUnread()       { return this.getPesan().filter(p => !p.dibaca).length; },

  // --- Auth ---
  getAdmin()          { return this._get(STORAGE_KEYS.ADMIN, DEFAULT_ADMIN); },
  setAdmin(data)      { return this._set(STORAGE_KEYS.ADMIN, data); },
  login(user, pass)   {
    const adm = this.getAdmin();
    if (adm.username === user && adm.password === pass) {
      this._set(STORAGE_KEYS.SESSION, { loggedIn: true, time: Date.now(), nama: adm.nama });
      return true;
    }
    return false;
  },
  logout()            { localStorage.removeItem(STORAGE_KEYS.SESSION); },
  isLoggedIn()        {
    const s = this._get(STORAGE_KEYS.SESSION, null);
    if (!s || !s.loggedIn) return false;
    // Session 8 jam
    if (Date.now() - s.time > 8 * 60 * 60 * 1000) { this.logout(); return false; }
    return true;
  },
  getSession()        { return this._get(STORAGE_KEYS.SESSION, {}); },

  // --- Log aktivitas ---
  _LOG_KEY: 'desa_activity_log',
  logActivity(action) {
    const logs = this._get(this._LOG_KEY, []);
    logs.unshift({ action, waktu: new Date().toISOString() });
    if (logs.length > 50) logs.pop();
    this._set(this._LOG_KEY, logs);
  },
  getActivityLog()    { return this._get(this._LOG_KEY, []); },
};
