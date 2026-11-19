/* =============================================
   script.js — Web Publik Desa Sukamaju
   Data dibaca dari localStorage (terhubung ke admin panel)
============================================= */

// --- Load shared data layer ---
// shared-data.js harus sudah ter-load sebelum script ini

// =============================================
//  INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  DesaDB.init();
  applyProfilToDom();
  applyStatsToDom();
  renderAsetPublik();
  renderUMKMPublik();
  renderSejarahPublik();
  initNavbar();
  initHamburger();
  initScrollReveal();
  initFilter();
  initContactForm();
  initBackToTop();
});

// =============================================
//  APPLY PROFIL & STATS
// =============================================
function applyProfilToDom() {
  const p = DesaDB.getProfil();

  // Judul & metadata
  document.title = `Desa ${p.nama} — Portal Resmi`;
  safeSet('.nav-title', `Desa ${p.nama}`);
  safeSet('.nav-sub', `Kec. ${p.kecamatan}, Kab. ${p.kabupaten}`);

  // Hero
  safeSet('.hero-title', `Selamat Datang di\n`);
  const heroTitleEl = document.querySelector('.hero-title');
  if (heroTitleEl) {
    heroTitleEl.innerHTML = `Selamat Datang di<br><span class="highlight">Desa ${esc(p.nama)}</span>`;
  }
  safeSet('.hero-desc', p.heroSubtitle);

  // Footer brand
  const fbEl = document.querySelector('.footer-brand strong');
  if (fbEl) fbEl.textContent = `Desa ${p.nama}`;
  const fbP = document.querySelector('.footer-brand p');
  if (fbP) fbP.innerHTML = `Kecamatan ${esc(p.kecamatan)}, Kabupaten ${esc(p.kabupaten)}<br>Provinsi ${esc(p.provinsi)}`;

  // Profil identitas
  setTable([
    ['Nama Desa', p.nama],
    ['Kecamatan', p.kecamatan],
    ['Kabupaten', p.kabupaten],
    ['Provinsi', p.provinsi],
    ['Kode Pos', p.kodePos],
    ['Kode Desa', p.kodeDesa],
    ['Luas Wilayah', p.luas],
    ['Ketinggian', p.ketinggian],
  ], '.info-table');

  // Visi
  const visiEl = document.querySelector('.visi-misi blockquote');
  if (visiEl) visiEl.textContent = `"${p.visi}"`;

  // Misi
  const misiEl = document.querySelector('.misi-list');
  if (misiEl && p.misi?.length) {
    misiEl.innerHTML = p.misi.map(m => `<li>${esc(m)}</li>`).join('');
  }

  // Kepala desa
  const kepalaEl = document.querySelector('.perangkat-item.kepala strong');
  if (kepalaEl) kepalaEl.textContent = p.kepala;

  // Kontak
  const kontakItems = document.querySelectorAll('.kontak-item');
  if (kontakItems.length >= 4) {
    kontakItems[0].querySelector('p').textContent = p.alamat;
    kontakItems[1].querySelector('p').textContent = p.telepon;
    kontakItems[2].querySelector('p').textContent = p.email;
    kontakItems[3].querySelector('p').innerHTML   = p.jamPelayanan.replace('|','<br>');
  }

  // Footer copyright
  const fbottom = document.querySelector('.footer-bottom p');
  if (fbottom) fbottom.textContent = `© ${new Date().getFullYear()} Pemerintah Desa ${p.nama}. Hak Cipta Dilindungi. | Dikelola oleh Perangkat Desa ${p.nama}`;

}

function applyStatsToDom() {
  const s = DesaDB.getStats();
  const nums = document.querySelectorAll('.stat-num');
  const labels = ['penduduk','kk','dusun','umkmAktif'];
  const formatted = [
    s.penduduk.toLocaleString('id'),
    s.kk.toLocaleString('id'),
    String(s.dusun),
    String(s.umkmAktif),
  ];
  nums.forEach((el, i) => { if (formatted[i] !== undefined) el.textContent = formatted[i]; });
}

// =============================================
//  ASET PUBLIK (render dari data)
// =============================================
function renderAsetPublik() {
  const asetGrid = document.getElementById('asetGrid');
  if (!asetGrid) return;

  const asetList = DesaDB.getAset();
  const KATEGORI_LABEL = { tanah:'Tanah &amp; Bangunan', kendaraan:'Kendaraan', fasilitas:'Fasilitas Umum', alam:'Sumber Daya Alam' };
  const KONDISI_LABEL  = { baik:'Kondisi Baik', sedang:'Perlu Servis', rusak:'Perlu Perbaikan' };

  asetGrid.innerHTML = asetList.map(a => `
    <div class="aset-card" data-kategori="${a.kategori}">
      <div class="aset-img" style="background:${a.gradien||'linear-gradient(135deg,#166534,#22c55e)'}">${a.emoji||'📦'}</div>
      <div class="aset-body">
        <span class="aset-tag">${KATEGORI_LABEL[a.kategori]||a.kategori}</span>
        <h4>${esc(a.nama)}</h4>
        <p>${esc(a.deskripsi)}</p>
        <div class="aset-meta">
          <span>📐 ${esc(a.detail)}</span>
          <span class="aset-status ${a.kondisi}">${KONDISI_LABEL[a.kondisi]||a.kondisi}</span>
        </div>
      </div>
    </div>`).join('');

  // Update summary
  const totalBaik = asetList.filter(a => a.kondisi === 'baik').length;
  const pctBaik   = asetList.length ? Math.round(totalBaik / asetList.length * 100) : 0;
  const sumNums   = document.querySelectorAll('.sum-num');
  if (sumNums.length >= 2) {
    sumNums[1].textContent = asetList.length;
    if (sumNums[2]) sumNums[2].textContent = pctBaik + '%';
  }
}

// =============================================
//  UMKM PUBLIK (render dari data)
// =============================================
function renderUMKMPublik() {
  const umkmGrid = document.getElementById('umkmGrid');
  if (!umkmGrid) return;

  const umkmList = DesaDB.getUMKM();
  const KAT_LABEL = { kuliner:'Kuliner', kerajinan:'Kerajinan', pertanian:'Pertanian', jasa:'Jasa' };

  umkmGrid.innerHTML = umkmList.map(u => `
    <div class="umkm-card" data-uk="${u.kategori}">
      <div class="umkm-banner" style="background:${u.gradien||'linear-gradient(135deg,#064e3b,#10b981)'}">
        <span class="umkm-emoji">${u.emoji||'🏪'}</span>
        <span class="umkm-kat-badge">${KAT_LABEL[u.kategori]||u.kategori}</span>
      </div>
      <div class="umkm-body">
        <h4>${esc(u.nama)}</h4>
        <p class="umkm-pemilik">👤 ${esc(u.pemilik)}</p>
        <p>${esc(u.deskripsi)}</p>
        <div class="umkm-tags">${(u.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div>
        <a href="#kontak" class="umkm-btn">Hubungi</a>
      </div>
    </div>`).join('');

  // Update stat UMKM aktif
  const stats = DesaDB.getStats();
  const statNums = document.querySelectorAll('.stat-num');
  if (statNums[3]) statNums[3].textContent = stats.umkmAktif;
}

// =============================================
//  SEJARAH PUBLIK (render dari data)
// =============================================
function renderSejarahPublik() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const list = DesaDB.getSejarah();
  if (!list.length) return;

  // Narasi
  const narasi = document.querySelector('.narasi-card');
  if (narasi) {
    const p = DesaDB.getProfil();
    narasi.innerHTML = `
      <div class="quote-mark">"</div>
      <p>Desa <strong>${esc(p.nama)}</strong> bermula dari perkampungan kecil yang terbentuk sekitar tahun <strong>${esc(list[0].tahun)}</strong>.</p>
      <p>Perjalanan panjang menuju desa yang mandiri dan berbudaya menjadi semangat yang terus diwariskan turun-temurun oleh warga.</p>
      <p>Hingga kini desa terus berkembang dengan berbagai inovasi dan program pembangunan yang berpihak kepada masyarakat.</p>`;
  }

  timeline.innerHTML = list.map(s => `
    <div class="timeline-item${s.aktif?' active':''}">
      <div class="tl-dot"></div>
      <div class="tl-content">
        <span class="tl-year">${esc(s.tahun)}</span>
        <h4>${esc(s.judul)}</h4>
        <p>${esc(s.deskripsi)}</p>
      </div>
    </div>`).join('');
}

// =============================================
//  NAVBAR
// =============================================
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - navbar.offsetHeight - 30) current = s.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  });
}

// =============================================
//  HAMBURGER
// =============================================
function initHamburger() {
  const hamburger  = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');
  if (!hamburger) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksEl.classList.toggle('open');
  });
  navLinksEl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinksEl.classList.remove('open');
    });
  });
}

// =============================================
//  FILTER (Aset & UMKM)
// =============================================
function initFilter() {
  // Aset filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      document.querySelectorAll('.aset-card').forEach(card => {
        const show = f === 'all' || card.dataset.kategori === f;
        card.classList.toggle('hidden', !show);
      });
    });
  });

  // UMKM filter
  document.querySelectorAll('.uk-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.uk-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const f = item.getAttribute('data-uk');
      document.querySelectorAll('.umkm-card').forEach(card => {
        const show = f === 'all' || card.dataset.uk === f;
        card.classList.toggle('hidden', !show);
      });
    });
  });
}

// =============================================
//  SCROLL REVEAL
// =============================================
function initScrollReveal() {
  document.querySelectorAll('.profil-card, .aset-card, .umkm-card, .kontak-item, .timeline-item').forEach(el => {
    el.classList.add('reveal');
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Bar animation
  const landUse = document.querySelector('.land-use');
  if (landUse) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        document.querySelectorAll('.bar-fill').forEach(f => {
          f.style.animation = 'barGrow 1.2s ease both';
        });
      }
    }, { threshold: 0.3 }).observe(landUse);
  }

  // Stats counter
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      document.querySelectorAll('.stat-num').forEach(el => {
        const raw = el.textContent.trim();
        const m = raw.match(/^([\d.,]+)(.*)/);
        if (!m) return;
        const num = parseFloat(m[1].replace(',','.'));
        const suf = m[2];
        animateCounter(el, num, suf);
      });
    }, { threshold: 0.5 }).observe(heroStats);
  }
}

function animateCounter(el, target, suffix='') {
  const dur = 1800;
  const start = performance.now();
  const isInt = Number.isInteger(target);
  const update = t => {
    const p = Math.min((t - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = (isInt ? Math.floor(target * ease) : (target * ease).toFixed(1)) + suffix;
    if (p < 1) requestAnimationFrame(update);
    else el.textContent = (isInt ? target : target.toFixed(1)) + suffix;
  };
  requestAnimationFrame(update);
}

// =============================================
//  CONTACT FORM — simpan pesan ke localStorage
// =============================================
function initContactForm() {
  const form = document.getElementById('kontakForm');
  const btn  = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = form.querySelectorAll('input, select, textarea');
    const nama    = inputs[0]?.value.trim();
    const telepon = inputs[1]?.value.trim();
    const email   = inputs[2]?.value.trim();
    const keperluan = inputs[3]?.value;
    const pesan   = inputs[4]?.value.trim();

    if (!nama) {
      inputs[0].focus();
      inputs[0].style.borderColor = '#ef4444';
      setTimeout(() => inputs[0].style.borderColor = '', 2000);
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Mengirim…';

    setTimeout(() => {
      DesaDB.addPesan({ nama, telepon, email, keperluan, pesan });
      btn.textContent = '✅ Pesan Terkirim!';
      btn.style.background = '#16a34a';
      form.reset();
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Kirim Pesan ✉️';
        btn.style.background = '';
      }, 3000);
    }, 1000);
  });
}

// =============================================
//  BACK TO TOP
// =============================================
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Smooth scroll for all nav anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const tgt = document.querySelector(a.getAttribute('href'));
      if (tgt) {
        e.preventDefault();
        const navbar = document.getElementById('navbar');
        const offset = navbar ? navbar.offsetHeight : 70;
        window.scrollTo({ top: tgt.offsetTop - offset - 8, behavior: 'smooth' });
      }
    });
  });
}

// =============================================
//  UTILS
// =============================================
function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function safeSet(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function setTable(rows, selector) {
  const tbl = document.querySelector(selector);
  if (!tbl) return;
  tbl.innerHTML = rows.map(([label, val]) => `
    <tr>
      <td style="color:var(--gray-500);width:45%;padding:.55rem 0;font-size:.88rem">${esc(label)}</td>
      <td style="font-size:.88rem"><strong>${esc(val)}</strong></td>
    </tr>`).join('');
}

// Trigger scroll event on load
window.dispatchEvent(new Event('scroll'));
