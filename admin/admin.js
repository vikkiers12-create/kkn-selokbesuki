/* =============================================
   admin.js — Logic Panel Admin Desa Sukamaju
============================================= */

// --- Auth guard ---
DesaDB.init();
if (!DesaDB.isLoggedIn()) location.href = 'index.html';

// --- DOM refs ---
const pageContent  = document.getElementById('pageContent');
const topbarTitle  = document.getElementById('topbarTitle');
const topbarUser   = document.getElementById('topbarUser');
const unreadBadge  = document.getElementById('unreadBadge');
const sidebar      = document.getElementById('sidebar');
const sidebarToggle= document.getElementById('sidebarToggle');
const toast        = document.getElementById('toast');
const modalOverlay = document.getElementById('modalOverlay');
const modal        = document.getElementById('modal');
const modalTitle   = document.getElementById('modalTitle');
const modalBody    = document.getElementById('modalBody');
const modalSaveBtn = document.getElementById('modalSaveBtn');
const modalCancelBtn=document.getElementById('modalCancelBtn');
const modalClose   = document.getElementById('modalClose');
const confirmOverlay=document.getElementById('confirmOverlay');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMsg   = document.getElementById('confirmMsg');
const confirmYes   = document.getElementById('confirmYes');
const confirmNo    = document.getElementById('confirmNo');
const topbarTime   = document.getElementById('topbarTime');

// --- Setup user display ---
const session = DesaDB.getSession();
topbarUser.textContent = '👤 ' + (session.nama || 'Admin');

// --- Clock ---
function updateClock() {
  const now = new Date();
  topbarTime.textContent = now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
}
updateClock();
setInterval(updateClock, 1000);

// --- Sidebar toggle ---
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebar.classList.toggle('collapsed');
  document.querySelector('.main-wrapper').classList.toggle('full');
});

// --- Logout ---
document.getElementById('logoutBtn').addEventListener('click', () => {
  DesaDB.logActivity('Logout');
  DesaDB.logout();
  location.href = 'index.html';
});

// --- Unread badge ---
function refreshUnread() {
  const n = DesaDB.countUnread();
  if (n > 0) { unreadBadge.textContent = n; unreadBadge.classList.remove('hidden'); }
  else unreadBadge.classList.add('hidden');
}
refreshUnread();

// --- Toast helper ---
let toastTimer;
function showToast(msg, type = 'success') {
  toast.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  toast.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// --- Modal helpers ---
let _onModalSave = null;
function openModal(title, bodyHTML, onSave, saveLabel = 'Simpan') {
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  modalSaveBtn.textContent = saveLabel;
  _onModalSave = onSave;
  modalOverlay.classList.remove('hidden');
  modalSaveBtn.classList.remove('hidden');
  document.getElementById('modalFooter').classList.remove('hidden');
}
function openModalViewOnly(title, bodyHTML) {
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  modalSaveBtn.classList.add('hidden');
  _onModalSave = null;
  modalOverlay.classList.remove('hidden');
}
function closeModal() { modalOverlay.classList.add('hidden'); }
modalClose.addEventListener('click', closeModal);
modalCancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
modalSaveBtn.addEventListener('click', () => { if (_onModalSave) _onModalSave(); });

// --- Confirm dialog ---
function confirmDelete(msg, onConfirm) {
  confirmMsg.textContent = msg;
  confirmOverlay.classList.remove('hidden');
  confirmYes.onclick = () => { confirmOverlay.classList.add('hidden'); onConfirm(); };
  confirmNo.onclick  = () => confirmOverlay.classList.add('hidden');
}

// --- Router ---
const pages = {
  dashboard: renderDashboard,
  profil:    renderProfil,
  sejarah:   renderSejarah,
  aset:      renderAset,
  umkm:      renderUMKM,
  pesan:     renderPesan,
  log:       renderLog,
  setelan:   renderSetelan,
};

const pageTitles = {
  dashboard: '📊 Dashboard',
  profil:    '🏡 Profil Desa',
  sejarah:   '📜 Sejarah Desa',
  aset:      '🏛️ Aset Desa',
  umkm:      '🛒 UMKM',
  pesan:     '✉️ Pesan Masuk',
  log:       '🕐 Log Aktivitas',
  setelan:   '⚙️ Pengaturan',
};

function navigate(page) {
  document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
  const link = document.querySelector(`.sb-link[data-page="${page}"]`);
  if (link) link.classList.add('active');
  topbarTitle.textContent = pageTitles[page] || page;
  if (pages[page]) pages[page]();
  // Close sidebar on mobile
  if (window.innerWidth < 769) sidebar.classList.remove('open');
}

document.querySelectorAll('.sb-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigate(link.getAttribute('data-page'));
  });
});

// Initial page from hash
const initPage = location.hash.replace('#', '') || 'dashboard';
navigate(initPage in pages ? initPage : 'dashboard');

// =============================================
//  PAGE: DASHBOARD
// =============================================
function renderDashboard() {
  const profil = DesaDB.getProfil();
  const stats  = DesaDB.getStats();
  const aset   = DesaDB.getAset();
  const umkm   = DesaDB.getUMKM();
  const pesan  = DesaDB.getPesan();
  const logs   = DesaDB.getActivityLog().slice(0, 5);

  const unread = pesan.filter(p => !p.dibaca).length;

  pageContent.innerHTML = `
    <!-- Welcome banner -->
    <div class="dash-welcome">
      <div>
        <h2>Selamat Datang, ${session.nama || 'Admin'}! 👋</h2>
        <p>Panel Admin Desa ${profil.nama} — ${profil.kecamatan}, ${profil.kabupaten}</p>
        <p style="margin-top:.5rem;font-size:.78rem;opacity:.6">${new Date().toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>
      <div class="dash-welcome-emoji">🌾</div>
    </div>

    <!-- Stats row -->
    <div class="grid-4" style="margin-bottom:1.5rem">
      ${dashStat('👥', stats.penduduk.toLocaleString('id'), 'Penduduk', '#dcfce7', '#16a34a')}
      ${dashStat('🏠', stats.kk.toLocaleString('id'), 'Kepala Keluarga', '#e0f2fe', '#0284c7')}
      ${dashStat('🏛️', aset.length, 'Total Aset', '#f3e8ff', '#9333ea')}
      ${dashStat('🛒', umkm.length, 'UMKM Terdaftar', '#fef3c7', '#b45309')}
    </div>

    <div class="grid-2" style="margin-bottom:1.5rem">
      <!-- Pesan terbaru -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <span class="card-title" style="margin-bottom:0">✉️ Pesan Masuk ${unread > 0 ? `<span class="badge badge-red" style="margin-left:.4rem">${unread} baru</span>` : ''}</span>
          <button class="btn btn-sm btn-outline" onclick="navigate('pesan')">Lihat Semua</button>
        </div>
        ${pesan.length === 0 ? `<div class="empty-state"><div class="es-icon">📭</div><p>Belum ada pesan masuk</p></div>` :
          pesan.slice(0, 4).map(p => `
            <div class="pesan-card ${!p.dibaca ? 'unread' : ''}">
              <div class="pesan-header">
                <span class="pesan-nama">${escHtml(p.nama)}</span>
                <span class="pesan-waktu">${fmtTime(p.waktu)}</span>
              </div>
              <div class="pesan-keperluan"><span class="badge badge-sky">${escHtml(p.keperluan||'—')}</span></div>
              <div class="pesan-isi">${escHtml((p.pesan||'').substring(0,80))}${(p.pesan||'').length>80?'…':''}</div>
            </div>`).join('')
        }
      </div>

      <!-- Log aktivitas -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <span class="card-title" style="margin-bottom:0">🕐 Aktivitas Terbaru</span>
          <button class="btn btn-sm btn-outline" onclick="navigate('log')">Semua Log</button>
        </div>
        ${logs.length === 0 ? `<div class="empty-state"><p>Belum ada log</p></div>` :
          logs.map(l => `
            <div class="log-item">
              <div class="log-dot"></div>
              <div>
                <div class="log-action">${escHtml(l.action)}</div>
                <div class="log-time">${fmtTime(l.waktu)}</div>
              </div>
            </div>`).join('')
        }
      </div>
    </div>

    <!-- Quick links -->
    <div class="card">
      <span class="card-title">⚡ Akses Cepat</span>
      <div style="display:flex;flex-wrap:wrap;gap:.6rem">
        ${[
          ['🏡','Profil Desa','profil'],
          ['🏛️','Tambah Aset','aset'],
          ['🛒','Tambah UMKM','umkm'],
          ['📜','Sejarah','sejarah'],
          ['✉️','Pesan','pesan'],
          ['⚙️','Pengaturan','setelan'],
        ].map(([ico,lbl,page])=>`
          <button class="btn btn-secondary" onclick="navigate('${page}')">${ico} ${lbl}</button>
        `).join('')}
        <a href="../index.html" target="_blank" class="btn btn-outline">🌐 Web Publik</a>
      </div>
    </div>
  `;
}

function dashStat(icon, value, label, bg, color) {
  return `
    <div class="stat-card-admin">
      <div class="stat-icon-wrap" style="background:${bg}"><span style="font-size:1.5rem">${icon}</span></div>
      <div>
        <div class="stat-num-admin" style="color:${color}">${value}</div>
        <div class="stat-label-admin">${label}</div>
      </div>
    </div>`;
}

// =============================================
//  PAGE: PROFIL DESA
// =============================================
function renderProfil() {
  const p = DesaDB.getProfil();
  const s = DesaDB.getStats();

  pageContent.innerHTML = `
    <div class="page-header">
      <div><h2>🏡 Profil Desa</h2><p>Edit informasi utama desa yang tampil di halaman publik</p></div>
      <button class="btn btn-primary" id="saveProfil">💾 Simpan Semua Perubahan</button>
    </div>

    <div class="grid-2">
      <!-- Identitas -->
      <div class="card">
        <div class="profil-section-title">📋 Identitas Desa</div>
        ${field('Nama Desa','p_nama',p.nama)}
        ${field('Kecamatan','p_kec',p.kecamatan)}
        ${field('Kabupaten','p_kab',p.kabupaten)}
        ${field('Provinsi','p_prov',p.provinsi)}
        ${field('Kode Pos','p_kodepos',p.kodePos)}
        ${field('Kode Desa','p_kodedesa',p.kodeDesa)}
        ${field('Luas Wilayah','p_luas',p.luas)}
        ${field('Ketinggian','p_tinggi',p.ketinggian)}
      </div>

      <!-- Kontak -->
      <div class="card">
        <div class="profil-section-title">📞 Kontak & Kepemimpinan</div>
        ${field('Nama Kepala Desa','p_kepala',p.kepala)}
        ${field('Nomor Telepon','p_telp',p.telepon)}
        ${field('Email','p_email',p.email)}
        ${fieldTA('Alamat Kantor','p_alamat',p.alamat,2)}
        ${field('Jam Pelayanan','p_jam',p.jamPelayanan)}

        <div class="profil-section-title" style="margin-top:1.25rem">📊 Statistik Desa</div>
        <div class="form-row">
          ${field('Jumlah Penduduk','s_penduduk',s.penduduk,'number')}
          ${field('Jumlah KK','s_kk',s.kk,'number')}
        </div>
        <div class="form-row">
          ${field('Jumlah Dusun','s_dusun',s.dusun,'number')}
          ${field('UMKM Aktif','s_umkm',s.umkmAktif,'number')}
        </div>
      </div>

      <!-- Visi -->
      <div class="card">
        <div class="profil-section-title">🎯 Visi Desa</div>
        ${fieldTA('Visi','p_visi',p.visi,3)}

        <div class="profil-section-title" style="margin-top:1.25rem">📝 Misi Desa</div>
        <div id="misiList">
          ${p.misi.map((m,i)=>`
            <div class="form-group" style="display:flex;gap:.4rem;align-items:flex-start">
              <textarea id="misi_${i}" rows="2" style="flex:1;padding:.5rem .8rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.84rem;outline:none;resize:vertical">${escHtml(m)}</textarea>
              <button class="btn btn-sm btn-danger" onclick="removeMisi(${i})">✕</button>
            </div>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" onclick="addMisi()" style="margin-top:.4rem">+ Tambah Misi</button>
      </div>

      <!-- Hero subtitle -->
      <div class="card">
        <div class="profil-section-title">🖼️ Tampilan Hero (Halaman Utama)</div>
        ${fieldTA('Deskripsi Hero','p_hero',p.heroSubtitle,3)}
        <small style="color:var(--gray-400);font-size:.72rem">Teks deskripsi yang muncul di bawah judul halaman utama web publik.</small>
      </div>
    </div>
  `;

  document.getElementById('saveProfil').addEventListener('click', () => {
    const misiItems = [];
    document.querySelectorAll('[id^="misi_"]').forEach(el => {
      if (el.value.trim()) misiItems.push(el.value.trim());
    });

    const newProfil = {
      ...DesaDB.getProfil(),
      nama: v('p_nama'), kecamatan: v('p_kec'), kabupaten: v('p_kab'),
      provinsi: v('p_prov'), kodePos: v('p_kodepos'), kodeDesa: v('p_kodedesa'),
      luas: v('p_luas'), ketinggian: v('p_tinggi'),
      kepala: v('p_kepala'), telepon: v('p_telp'), email: v('p_email'),
      alamat: v('p_alamat'), jamPelayanan: v('p_jam'),
      visi: v('p_visi'), misi: misiItems,
      heroSubtitle: v('p_hero'),
    };
    const newStats = {
      penduduk: parseInt(v('s_penduduk')) || 0,
      kk:       parseInt(v('s_kk')) || 0,
      dusun:    parseInt(v('s_dusun')) || 0,
      umkmAktif:parseInt(v('s_umkm')) || 0,
    };
    DesaDB.setProfil(newProfil);
    DesaDB.setStats(newStats);
    DesaDB.logActivity('Update profil desa');
    showToast('Profil desa berhasil disimpan!');
  });
}

let _misiCount = 0;
function addMisi() {
  _misiCount++;
  const idx = document.querySelectorAll('[id^="misi_"]').length;
  const div = document.createElement('div');
  div.className = 'form-group';
  div.style.cssText = 'display:flex;gap:.4rem;align-items:flex-start';
  div.innerHTML = `
    <textarea id="misi_${idx}" rows="2" style="flex:1;padding:.5rem .8rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.84rem;outline:none;resize:vertical" placeholder="Tuliskan poin misi…"></textarea>
    <button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">✕</button>`;
  document.getElementById('misiList').appendChild(div);
}
function removeMisi(idx) {
  const el = document.getElementById(`misi_${idx}`);
  if (el) el.parentElement.remove();
}

// =============================================
//  PAGE: SEJARAH
// =============================================
function renderSejarah() {
  const list = DesaDB.getSejarah();
  pageContent.innerHTML = `
    <div class="page-header">
      <div><h2>📜 Sejarah Desa</h2><p>Kelola timeline sejarah yang tampil di halaman publik</p></div>
      <button class="btn btn-primary" onclick="openSejarahModal()">+ Tambah Peristiwa</button>
    </div>
    <div class="card">
      <div class="timeline-admin-list" id="sejarahList">${renderSejarahList(list)}</div>
      ${list.length===0?`<div class="empty-state"><div class="es-icon">📜</div><p>Belum ada peristiwa sejarah</p></div>`:''}
    </div>`;
}

function renderSejarahList(list) {
  return list.map(s => `
    <div class="tl-admin-item" id="sl_${s.id}">
      <span class="tl-year-pill">${escHtml(s.tahun)}</span>
      <div class="tl-admin-info">
        <strong>${escHtml(s.judul)}</strong>
        <span>${escHtml(s.deskripsi.substring(0,80))}${s.deskripsi.length>80?'…':''}</span>
      </div>
      <div class="tl-admin-actions">
        <button class="btn btn-sm btn-secondary" onclick="editSejarah(${s.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="delSejarah(${s.id})">🗑️</button>
      </div>
    </div>`).join('');
}

function openSejarahModal(id) {
  const item = id ? DesaDB.getSejarah().find(s=>s.id===id) : {};
  openModal(
    id ? 'Edit Peristiwa' : 'Tambah Peristiwa Sejarah',
    `<div class="form-group">${fld('Tahun','sej_tahun',item.tahun||'','text','Contoh: 1945')}</div>
     <div class="form-group">${fld('Judul Peristiwa','sej_judul',item.judul||'','text','Contoh: Proklamasi Kemerdekaan')}</div>
     <div class="form-group"><label>Deskripsi</label><textarea id="sej_deskripsi" rows="4" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none;resize:vertical">${escHtml(item.deskripsi||'')}</textarea></div>
     <div class="form-group"><label style="display:flex;align-items:center;gap:.5rem;cursor:pointer"><input type="checkbox" id="sej_aktif" ${item.aktif?'checked':''}> Tandai sebagai peristiwa terkini</label></div>`,
    () => {
      const data = {
        tahun:    document.getElementById('sej_tahun').value.trim(),
        judul:    document.getElementById('sej_judul').value.trim(),
        deskripsi:document.getElementById('sej_deskripsi').value.trim(),
        aktif:    document.getElementById('sej_aktif').checked,
      };
      if (!data.tahun || !data.judul) { showToast('Tahun dan judul wajib diisi','error'); return; }
      if (id) DesaDB.updateSejarah(id, data); else DesaDB.addSejarah(data);
      DesaDB.logActivity(`${id?'Update':'Tambah'} sejarah: ${data.judul}`);
      closeModal();
      showToast(`Peristiwa "${data.judul}" berhasil ${id?'diperbarui':'ditambahkan'}!`);
      renderSejarah();
    }
  );
}
function editSejarah(id) { openSejarahModal(id); }
function delSejarah(id) {
  const item = DesaDB.getSejarah().find(s=>s.id===id);
  confirmDelete(`Hapus peristiwa "${item?.judul||'ini'}"?`, () => {
    DesaDB.deleteSejarah(id);
    DesaDB.logActivity(`Hapus sejarah: ${item?.judul}`);
    showToast('Peristiwa berhasil dihapus!');
    renderSejarah();
  });
}

// =============================================
//  PAGE: ASET
// =============================================
const ASET_KATEGORI = { tanah:'Tanah & Bangunan', kendaraan:'Kendaraan', fasilitas:'Fasilitas Umum', alam:'Sumber Daya Alam' };
const KONDISI_MAP   = { baik:'badge-green', sedang:'badge-amber', rusak:'badge-red' };
const ASET_EMOJIS   = ['🏛️','🕌','🏫','🏥','🌾','🚛','⚽','💧','🌳','🏢','👶','🚜','🏗️','⛽','🌊','🛖','🔌','🏟️'];

function renderAset() {
  const list = DesaDB.getAset();
  pageContent.innerHTML = `
    <div class="page-header">
      <div><h2>🏛️ Aset Desa</h2><p>${list.length} aset terdaftar</p></div>
      <button class="btn btn-primary" onclick="openAsetModal()">+ Tambah Aset</button>
    </div>
    <div class="card">
      <div class="table-toolbar">
        <input class="search-input" id="asetSearch" placeholder="🔍 Cari aset…">
        <select id="asetKatFilter" class="btn btn-secondary" style="cursor:pointer;font-size:.84rem">
          <option value="">Semua Kategori</option>
          ${Object.entries(ASET_KATEGORI).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
        </select>
      </div>
      <div class="tbl-wrap">
        <table class="admin-table" id="asetTable">
          <thead><tr><th>Ikon</th><th>Nama Aset</th><th>Kategori</th><th>Detail</th><th>Kondisi</th><th>Aksi</th></tr></thead>
          <tbody id="asetBody">${renderAsetRows(list)}</tbody>
        </table>
      </div>
    </div>`;

  document.getElementById('asetSearch').addEventListener('input', filterAset);
  document.getElementById('asetKatFilter').addEventListener('change', filterAset);
}

function renderAsetRows(list) {
  if (!list.length) return `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--gray-400)">Tidak ada aset ditemukan</td></tr>`;
  return list.map(a => `
    <tr id="ar_${a.id}">
      <td style="font-size:1.5rem">${a.emoji||'📦'}</td>
      <td><strong>${escHtml(a.nama)}</strong><div style="font-size:.75rem;color:var(--gray-400)">${escHtml(a.deskripsi.substring(0,60))}…</div></td>
      <td><span class="badge badge-sky">${ASET_KATEGORI[a.kategori]||a.kategori}</span></td>
      <td>${escHtml(a.detail)}</td>
      <td><span class="badge ${KONDISI_MAP[a.kondisi]||'badge-gray'}">${a.kondisi}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editAset(${a.id})">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="delAset(${a.id})" style="margin-left:.3rem">🗑️</button>
      </td>
    </tr>`).join('');
}

function filterAset() {
  const q   = document.getElementById('asetSearch').value.toLowerCase();
  const kat = document.getElementById('asetKatFilter').value;
  const filtered = DesaDB.getAset().filter(a =>
    (!kat || a.kategori === kat) &&
    (!q || a.nama.toLowerCase().includes(q) || a.deskripsi.toLowerCase().includes(q))
  );
  document.getElementById('asetBody').innerHTML = renderAsetRows(filtered);
}

function openAsetModal(id) {
  const item = id ? DesaDB.getAset().find(a=>a.id===id) : { emoji:'🏛️', kondisi:'baik', kategori:'tanah' };
  openModal(
    id ? 'Edit Aset' : 'Tambah Aset Baru',
    `<div class="form-row">
       <div class="form-group">${fld('Nama Aset','as_nama',item.nama||'','text','Nama aset...')}</div>
       <div class="form-group"><label>Kategori</label><select id="as_kat" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none">
         ${Object.entries(ASET_KATEGORI).map(([k,v])=>`<option value="${k}"${item.kategori===k?' selected':''}>${v}</option>`).join('')}
       </select></div>
     </div>
     <div class="form-group"><label>Deskripsi</label><textarea id="as_desk" rows="3" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none;resize:vertical">${escHtml(item.deskripsi||'')}</textarea></div>
     <div class="form-row">
       <div class="form-group">${fld('Detail/Ukuran','as_detail',item.detail||'','text','Contoh: 480 m²')}</div>
       <div class="form-group"><label>Kondisi</label><select id="as_kondisi" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none">
         <option value="baik"${item.kondisi==='baik'?' selected':''}>✅ Baik</option>
         <option value="sedang"${item.kondisi==='sedang'?' selected':''}>⚠️ Sedang</option>
         <option value="rusak"${item.kondisi==='rusak'?' selected':''}>❌ Rusak</option>
       </select></div>
     </div>
     <div class="form-group">
       <label>Ikon Emoji <small style="color:var(--gray-400)">(klik untuk pilih)</small></label>
       <div id="emojiSelected" style="font-size:2rem;margin-bottom:.5rem">${item.emoji||'📦'}</div>
       <div class="emoji-grid">${ASET_EMOJIS.map(e=>`<button type="button" class="emoji-pick${item.emoji===e?' selected':''}" onclick="selectEmoji(this,'as_emoji','${e}')">${e}</button>`).join('')}</div>
       <input type="hidden" id="as_emoji" value="${item.emoji||'📦'}">
     </div>`,
    () => {
      const data = {
        nama:     document.getElementById('as_nama').value.trim(),
        kategori: document.getElementById('as_kat').value,
        deskripsi:document.getElementById('as_desk').value.trim(),
        detail:   document.getElementById('as_detail').value.trim(),
        kondisi:  document.getElementById('as_kondisi').value,
        emoji:    document.getElementById('as_emoji').value,
        gradien:  item.gradien||'linear-gradient(135deg,#166534,#22c55e)',
      };
      if (!data.nama) { showToast('Nama aset wajib diisi','error'); return; }
      if (id) DesaDB.updateAset(id, data); else DesaDB.addAset(data);
      DesaDB.logActivity(`${id?'Update':'Tambah'} aset: ${data.nama}`);
      closeModal();
      showToast(`Aset "${data.nama}" berhasil ${id?'diperbarui':'ditambahkan'}!`);
      renderAset();
    }
  );
}
function editAset(id) { openAsetModal(id); }
function delAset(id) {
  const item = DesaDB.getAset().find(a=>a.id===id);
  confirmDelete(`Hapus aset "${item?.nama||'ini'}"?`, () => {
    DesaDB.deleteAset(id);
    DesaDB.logActivity(`Hapus aset: ${item?.nama}`);
    showToast('Aset berhasil dihapus!');
    renderAset();
  });
}
function selectEmoji(btn, inputId, emoji) {
  document.querySelectorAll('.emoji-pick').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById(inputId).value = emoji;
  document.getElementById('emojiSelected').textContent = emoji;
}

// =============================================
//  PAGE: UMKM
// =============================================
const UMKM_KAT = { kuliner:'🍽️ Kuliner', kerajinan:'🎨 Kerajinan', pertanian:'🌾 Pertanian', jasa:'🛠️ Jasa' };
const UMKM_EMOJIS = ['🍢','🧺','🍵','🍰','🧵','🥬','🔧','☕','🌶️','🍞','🛍️','🏺','🎨','🪴','🐄','🫙','🧃','🛒'];

function renderUMKM() {
  const list = DesaDB.getUMKM();
  pageContent.innerHTML = `
    <div class="page-header">
      <div><h2>🛒 UMKM</h2><p>${list.length} UMKM terdaftar</p></div>
      <button class="btn btn-primary" onclick="openUMKMModal()">+ Tambah UMKM</button>
    </div>
    <div class="card">
      <div class="table-toolbar">
        <input class="search-input" id="umkmSearch" placeholder="🔍 Cari UMKM…">
        <select id="umkmKatFilter" class="btn btn-secondary" style="cursor:pointer;font-size:.84rem">
          <option value="">Semua Kategori</option>
          ${Object.entries(UMKM_KAT).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
        </select>
      </div>
      <div class="tbl-wrap">
        <table class="admin-table">
          <thead><tr><th>Ikon</th><th>Nama UMKM</th><th>Kategori</th><th>Pemilik</th><th>Aksi</th></tr></thead>
          <tbody id="umkmBody">${renderUMKMRows(list)}</tbody>
        </table>
      </div>
    </div>`;

  document.getElementById('umkmSearch').addEventListener('input', filterUMKM);
  document.getElementById('umkmKatFilter').addEventListener('change', filterUMKM);
}

function renderUMKMRows(list) {
  if (!list.length) return `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--gray-400)">Tidak ada UMKM ditemukan</td></tr>`;
  return list.map(u => `
    <tr>
      <td style="font-size:1.5rem">${u.emoji||'🏪'}</td>
      <td><strong>${escHtml(u.nama)}</strong></td>
      <td><span class="badge badge-purple">${UMKM_KAT[u.kategori]||u.kategori}</span></td>
      <td>${escHtml(u.pemilik)}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editUMKM(${u.id})">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="delUMKM(${u.id})" style="margin-left:.3rem">🗑️</button>
      </td>
    </tr>`).join('');
}

function filterUMKM() {
  const q   = document.getElementById('umkmSearch').value.toLowerCase();
  const kat = document.getElementById('umkmKatFilter').value;
  const filtered = DesaDB.getUMKM().filter(u =>
    (!kat || u.kategori === kat) &&
    (!q || u.nama.toLowerCase().includes(q) || u.pemilik.toLowerCase().includes(q))
  );
  document.getElementById('umkmBody').innerHTML = renderUMKMRows(filtered);
}

function openUMKMModal(id) {
  const item = id ? DesaDB.getUMKM().find(u=>u.id===id) : { emoji:'🏪', kategori:'kuliner' };
  openModal(
    id ? 'Edit UMKM' : 'Tambah UMKM Baru',
    `<div class="form-row">
       <div class="form-group">${fld('Nama UMKM','um_nama',item.nama||'','text','Nama usaha...')}</div>
       <div class="form-group"><label>Kategori</label><select id="um_kat" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none">
         ${Object.entries(UMKM_KAT).map(([k,v])=>`<option value="${k}"${item.kategori===k?' selected':''}>${v}</option>`).join('')}
       </select></div>
     </div>
     <div class="form-group">${fld('Nama Pemilik','um_pemilik',item.pemilik||'','text','Nama pemilik / kelompok')}</div>
     <div class="form-group"><label>Deskripsi Usaha</label><textarea id="um_desk" rows="3" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none;resize:vertical">${escHtml(item.deskripsi||'')}</textarea></div>
     <div class="form-group">
       <label>Tag/Label <small style="color:var(--gray-400)">(pisah dengan koma)</small></label>
       <input type="text" id="um_tags" value="${(item.tags||[]).join(', ')}" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none" placeholder="Contoh: 📦 Online, 🏆 Unggulan">
     </div>
     <div class="form-group">
       <label>Ikon Emoji</label>
       <div id="umEmojiSelected" style="font-size:2rem;margin-bottom:.5rem">${item.emoji||'🏪'}</div>
       <div class="emoji-grid">${UMKM_EMOJIS.map(e=>`<button type="button" class="emoji-pick${item.emoji===e?' selected':''}" onclick="selectEmoji(this,'um_emoji','${e}');document.getElementById('umEmojiSelected').textContent='${e}'">${e}</button>`).join('')}</div>
       <input type="hidden" id="um_emoji" value="${item.emoji||'🏪'}">
     </div>`,
    () => {
      const tagsRaw = document.getElementById('um_tags').value;
      const tags    = tagsRaw.split(',').map(t=>t.trim()).filter(Boolean);
      const data = {
        nama:     document.getElementById('um_nama').value.trim(),
        kategori: document.getElementById('um_kat').value,
        pemilik:  document.getElementById('um_pemilik').value.trim(),
        deskripsi:document.getElementById('um_desk').value.trim(),
        tags,
        emoji:    document.getElementById('um_emoji').value,
        gradien:  item.gradien||'linear-gradient(135deg,#064e3b,#10b981)',
      };
      if (!data.nama || !data.pemilik) { showToast('Nama dan pemilik wajib diisi','error'); return; }
      if (id) DesaDB.updateUMKM(id, data); else DesaDB.addUMKM(data);
      DesaDB.logActivity(`${id?'Update':'Tambah'} UMKM: ${data.nama}`);
      closeModal();
      showToast(`UMKM "${data.nama}" berhasil ${id?'diperbarui':'ditambahkan'}!`);
      renderUMKM();
    }
  );
}
function editUMKM(id) { openUMKMModal(id); }
function delUMKM(id) {
  const item = DesaDB.getUMKM().find(u=>u.id===id);
  confirmDelete(`Hapus UMKM "${item?.nama||'ini'}"?`, () => {
    DesaDB.deleteUMKM(id);
    DesaDB.logActivity(`Hapus UMKM: ${item?.nama}`);
    showToast('UMKM berhasil dihapus!');
    renderUMKM();
  });
}

// =============================================
//  PAGE: PESAN
// =============================================
function renderPesan() {
  const list = DesaDB.getPesan();
  refreshUnread();
  pageContent.innerHTML = `
    <div class="page-header">
      <div><h2>✉️ Pesan Masuk</h2><p>${list.length} pesan, ${DesaDB.countUnread()} belum dibaca</p></div>
      ${list.length>0?`<button class="btn btn-secondary" onclick="hapusSemuaPesan()">🗑️ Hapus Semua</button>`:''}
    </div>
    ${list.length===0
      ? `<div class="card"><div class="empty-state"><div class="es-icon">📭</div><p>Belum ada pesan masuk dari web publik.</p></div></div>`
      : `<div id="pesanList">${list.map(p=>renderPesanCard(p)).join('')}</div>`
    }`;
}

function renderPesanCard(p) {
  return `
    <div class="pesan-card ${!p.dibaca?'unread':''}" id="pc_${p.id}">
      <div class="pesan-header">
        <span class="pesan-nama">👤 ${escHtml(p.nama)}</span>
        <span class="pesan-waktu">${fmtTime(p.waktu)}</span>
      </div>
      <div style="font-size:.78rem;color:var(--gray-500);margin-bottom:.35rem">
        📞 ${escHtml(p.telepon||'—')} &nbsp;|&nbsp; 📧 ${escHtml(p.email||'—')}
      </div>
      <div class="pesan-keperluan"><span class="badge badge-sky">${escHtml(p.keperluan||'Lainnya')}</span> ${!p.dibaca?`<span class="badge badge-red">Baru</span>`:''}</div>
      <div class="pesan-isi" style="margin-top:.4rem">${escHtml(p.pesan||'—')}</div>
      <div class="pesan-actions">
        ${!p.dibaca?`<button class="btn btn-sm btn-secondary" onclick="bacaPesan(${p.id})">✅ Tandai Dibaca</button>`:''}
        <button class="btn btn-sm btn-danger" onclick="hapusPesan(${p.id})">🗑️ Hapus</button>
      </div>
    </div>`;
}

function bacaPesan(id) {
  DesaDB.bacaPesan(id);
  refreshUnread();
  renderPesan();
}
function hapusPesan(id) {
  confirmDelete('Hapus pesan ini?', () => {
    DesaDB.hapusPesan(id);
    showToast('Pesan dihapus!');
    renderPesan();
  });
}
function hapusSemuaPesan() {
  confirmDelete('Hapus SEMUA pesan? Tindakan ini tidak dapat dibatalkan.', () => {
    DesaDB._set('desa_pesan', []);
    showToast('Semua pesan dihapus!');
    renderPesan();
  });
}

// =============================================
//  PAGE: LOG
// =============================================
function renderLog() {
  const logs = DesaDB.getActivityLog();
  pageContent.innerHTML = `
    <div class="page-header">
      <div><h2>🕐 Log Aktivitas</h2><p>${logs.length} entri tercatat</p></div>
      ${logs.length>0?`<button class="btn btn-secondary" onclick="clearLog()">🗑️ Hapus Log</button>`:''}
    </div>
    <div class="card">
      ${logs.length===0
        ? `<div class="empty-state"><div class="es-icon">🕐</div><p>Belum ada aktivitas</p></div>`
        : logs.map(l=>`
            <div class="log-item">
              <div class="log-dot"></div>
              <div>
                <div class="log-action">${escHtml(l.action)}</div>
                <div class="log-time">${fmtTime(l.waktu)}</div>
              </div>
            </div>`).join('')}
    </div>`;
}
function clearLog() {
  confirmDelete('Hapus semua log aktivitas?', () => {
    DesaDB._set(DesaDB._LOG_KEY, []);
    showToast('Log dihapus!');
    renderLog();
  });
}

// =============================================
//  PAGE: SETELAN
// =============================================
function renderSetelan() {
  const adm = DesaDB.getAdmin();
  pageContent.innerHTML = `
    <div class="page-header">
      <div><h2>⚙️ Pengaturan Admin</h2><p>Kelola akun dan preferensi panel admin</p></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="profil-section-title">👤 Informasi Akun</div>
        <div class="form-group">${fld('Nama Administrator','set_nama',adm.nama)}</div>
        <div class="form-group">${fld('Username Login','set_user',adm.username)}</div>
        <button class="btn btn-primary" onclick="saveAkun()">💾 Simpan Informasi</button>
      </div>
      <div class="card">
        <div class="profil-section-title">🔒 Ganti Password</div>
        <div class="form-group"><label>Password Lama</label><input type="password" id="pass_old" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none" placeholder="Password saat ini"></div>
        <div class="form-group"><label>Password Baru</label><input type="password" id="pass_new" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none" placeholder="Password baru (min 6 karakter)"></div>
        <div class="form-group"><label>Konfirmasi Password Baru</label><input type="password" id="pass_confirm" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none" placeholder="Ulangi password baru"></div>
        <button class="btn btn-primary" onclick="gantiPassword()">🔑 Ganti Password</button>
      </div>
      <div class="card">
        <div class="profil-section-title">💾 Data Management</div>
        <p style="font-size:.84rem;color:var(--gray-600);margin-bottom:1rem">Export atau reset data desa yang tersimpan di browser.</p>
        <div style="display:flex;gap:.6rem;flex-wrap:wrap">
          <button class="btn btn-secondary" onclick="exportData()">📤 Export Data (JSON)</button>
          <button class="btn btn-danger" onclick="resetData()">⚠️ Reset Semua Data</button>
        </div>
      </div>
      <div class="card">
        <div class="profil-section-title">ℹ️ Informasi Sistem</div>
        <table style="width:100%;font-size:.84rem;border-collapse:collapse">
          <tr><td style="padding:.4rem 0;color:var(--gray-500)">Versi</td><td><strong>1.0.0</strong></td></tr>
          <tr><td style="padding:.4rem 0;color:var(--gray-500)">Platform</td><td><strong>Web Browser</strong></td></tr>
          <tr><td style="padding:.4rem 0;color:var(--gray-500)">Storage</td><td><strong>localStorage</strong></td></tr>
          <tr><td style="padding:.4rem 0;color:var(--gray-500)">Total Aset</td><td><strong>${DesaDB.getAset().length} item</strong></td></tr>
          <tr><td style="padding:.4rem 0;color:var(--gray-500)">Total UMKM</td><td><strong>${DesaDB.getUMKM().length} item</strong></td></tr>
        </table>
      </div>
    </div>`;
}

function saveAkun() {
  const adm = DesaDB.getAdmin();
  adm.nama     = document.getElementById('set_nama').value.trim();
  adm.username = document.getElementById('set_user').value.trim();
  if (!adm.nama || !adm.username) { showToast('Nama dan username wajib diisi','error'); return; }
  DesaDB.setAdmin(adm);
  DesaDB.logActivity('Update informasi akun admin');
  showToast('Informasi akun berhasil disimpan!');
  topbarUser.textContent = '👤 ' + adm.nama;
}

function gantiPassword() {
  const adm     = DesaDB.getAdmin();
  const oldPass = document.getElementById('pass_old').value;
  const newPass = document.getElementById('pass_new').value;
  const confirm = document.getElementById('pass_confirm').value;
  if (oldPass !== adm.password) { showToast('Password lama salah!','error'); return; }
  if (newPass.length < 6)       { showToast('Password baru minimal 6 karakter!','error'); return; }
  if (newPass !== confirm)      { showToast('Konfirmasi password tidak cocok!','error'); return; }
  adm.password = newPass;
  DesaDB.setAdmin(adm);
  DesaDB.logActivity('Ganti password admin');
  showToast('Password berhasil diubah!');
  document.getElementById('pass_old').value = '';
  document.getElementById('pass_new').value = '';
  document.getElementById('pass_confirm').value = '';
}

function exportData() {
  const data = {
    profil: DesaDB.getProfil(),
    stats:  DesaDB.getStats(),
    aset:   DesaDB.getAset(),
    umkm:   DesaDB.getUMKM(),
    sejarah:DesaDB.getSejarah(),
    exportAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `data-desa-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
  showToast('Data berhasil diexport!');
}

function resetData() {
  confirmDelete('RESET semua data ke default? Semua perubahan akan hilang!', () => {
    ['desa_profil','desa_stats','desa_aset','desa_umkm','desa_sejarah','desa_pesan','desa_activity_log'].forEach(k => localStorage.removeItem(k));
    DesaDB.init();
    DesaDB.logActivity('Reset semua data ke default');
    showToast('Data berhasil direset ke default!');
    renderSetelan();
  });
}

// =============================================
//  UTILS
// =============================================
function escHtml(str) {
  return String(str||'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function fmtTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) + ' ' +
         d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
}

function v(id) { const el = document.getElementById(id); return el ? el.value : ''; }

function field(label, id, val, type='text') {
  return `<div class="form-group">
    <label>${label}</label>
    <input type="${type}" id="${id}" value="${escHtml(val)}" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none">
  </div>`;
}

function fieldTA(label, id, val, rows=3) {
  return `<div class="form-group">
    <label>${label}</label>
    <textarea id="${id}" rows="${rows}" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none;resize:vertical">${escHtml(val)}</textarea>
  </div>`;
}

function fld(label, id, val='', type='text', placeholder='') {
  return `<label>${label}</label><input type="${type}" id="${id}" value="${escHtml(val)}" placeholder="${escHtml(placeholder)}" style="width:100%;padding:.6rem .9rem;border:1.5px solid var(--gray-300);border-radius:.5rem;font-size:.88rem;outline:none">`;
}

// Expose globals needed by inline onclick
window.navigate = navigate;
window.openSejarahModal = openSejarahModal;
window.editSejarah = editSejarah;
window.delSejarah = delSejarah;
window.openAsetModal = openAsetModal;
window.editAset = editAset;
window.delAset = delAset;
window.selectEmoji = selectEmoji;
window.openUMKMModal = openUMKMModal;
window.editUMKM = editUMKM;
window.delUMKM = delUMKM;
window.bacaPesan = bacaPesan;
window.hapusPesan = hapusPesan;
window.hapusSemuaPesan = hapusSemuaPesan;
window.clearLog = clearLog;
window.saveAkun = saveAkun;
window.gantiPassword = gantiPassword;
window.exportData = exportData;
window.resetData = resetData;
window.removeMisi = removeMisi;
window.addMisi = addMisi;
