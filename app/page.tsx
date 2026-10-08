import Link from 'next/link'
import { ArrowRight, BarChart3, CheckCircle2, ClipboardCheck, Layers3, ShieldCheck, Sparkles, Users2 } from 'lucide-react'

const capabilities = [
  { icon: Layers3, title: 'Aktivitas dinamis', text: 'Buat workshop, jurnal, assessment, atau agenda baru tanpa menambah fitur setiap bulan.' },
  { icon: ClipboardCheck, title: 'Monitoring otomatis', text: 'Presensi, worksheet, jurnal, dan laporan langsung membentuk status peserta secara otomatis.' },
  { icon: Users2, title: 'Satu profil Etoser', text: 'Riwayat pembinaan, progres, feedback, dan credit perform tersedia dalam satu tempat.' },
  { icon: BarChart3, title: 'Command Center nasional', text: 'Tim Pusat melihat progres per wilayah, angkatan, aktivitas, dan peserta yang perlu ditindaklanjuti.' },
]

export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <div className="brand">
          <span className="brand-mark">E</span>
          <div><strong>ETOS Pembinaan</strong><small>Management System</small></div>
        </div>
        <div className="nav-actions">
          <Link className="ghost-button" href="/login">Masuk</Link>
          <Link className="primary-button" href="/demo">Lihat Demo <ArrowRight size={16}/></Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="hero-badge"><Sparkles size={15}/> Sistem pembinaan terintegrasi</div>
          <h1>Satu ruang kerja untuk seluruh <span>perjalanan pembinaan Etoser.</span></h1>
          <p>Agenda, presensi, tugas, worksheet, jurnal, laporan, feedback, monitoring, dan evaluasi—terhubung dalam satu alur yang rapi.</p>
          <div className="hero-actions">
            <Link className="primary-button large" href="/demo">Buka Demo Interaktif <ArrowRight size={18}/></Link>
            <Link className="text-button" href="/login">Masuk sebagai pengguna</Link>
          </div>
          <div className="trust-row">
            <span><CheckCircle2/> Activity-driven</span>
            <span><ShieldCheck/> Role-based access</span>
            <span><CheckCircle2/> Mobile-first</span>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-top">
            <div><span className="mini-label">PEMBINAAN OKTOBER 2026</span><h3>Command Center</h3></div>
            <span className="live-pill">● Live</span>
          </div>
          <div className="mini-stats">
            <div><strong>342</strong><span>Etoser aktif</span></div>
            <div><strong>91%</strong><span>Kehadiran</span></div>
            <div><strong>84%</strong><span>Tugas selesai</span></div>
          </div>
          <div className="attention-preview">
            <div className="section-mini-title">Perlu perhatian</div>
            <div className="preview-row"><span className="avatar">RA</span><div><strong>Rizky Akbar</strong><small>Worksheet terlambat 3 hari</small></div><span className="status danger">Prioritas</span></div>
            <div className="preview-row"><span className="avatar">FR</span><div><strong>Fikri Ramadhan</strong><small>2 tugas belum selesai</small></div><span className="status warn">Pantau</span></div>
          </div>
          <div className="progress-preview">
            <div><span>Progress nasional</span><strong>84%</strong></div>
            <div className="progress-track"><i style={{width:'84%'}}/></div>
          </div>
        </div>
      </section>

      <section className="problem-strip">
        <span>Dari proses tersebar:</span><strong>Form → Sheet → Drive → Cek manual → Rekap</strong><ArrowRight/>
        <span>menjadi:</span><strong>Etoser → ETOS Pembinaan → Monitoring otomatis</strong>
      </section>

      <section className="capability-section">
        <div className="section-heading">
          <span className="eyebrow">CARA KERJA BARU</span>
          <h2>Bukan spreadsheet yang dipindahkan ke browser.</h2>
          <p>Sistem dibangun berdasarkan mekanisme aktivitas, sehingga terus relevan walau program ETOS berubah.</p>
        </div>
        <div className="capability-grid">
          {capabilities.map(({icon:Icon,title,text})=><article key={title}><span className="feature-icon"><Icon/></span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="brand"><span className="brand-mark">E</span><div><strong>ETOS Pembinaan</strong><small>Operating system untuk pembinaan</small></div></div>
        <p>Dirancang untuk membuat Etoser fokus bertumbuh, Fasilitator fokus mendampingi, dan Tim Pusat fokus mengambil keputusan.</p>
      </footer>
    </main>
  )
}
