import { LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'

export default function Home(){
  return (
    <main className="internal-entry">
      <div className="internal-entry-orb a"/>
      <div className="internal-entry-orb b"/>
      <section className="internal-entry-card">
        <div className="portal-login-brand">
          <span className="brand-mark">E</span>
          <div><strong>ETOS Pembinaan</strong><small>Management System</small></div>
        </div>
        <span className="internal-badge"><Sparkles size={14}/> Portal Internal • Uji Coba</span>
        <h1>Ruang kerja pembinaan ETOS.</h1>
        <p>Portal ini digunakan untuk simulasi alur pembinaan, monitoring, pendampingan, laporan, dokumen, dan evaluasi. Silakan masuk melalui tautan akses yang diberikan admin sesuai peran Anda.</p>
        <div className="internal-entry-points">
          <span><LockKeyhole size={16}/> Akses Pusat, Fasilitator, dan Etoser dipisahkan.</span>
          <span><ShieldCheck size={16}/> Dataset simulasi memuat histori pembinaan sekitar enam bulan.</span>
        </div>
        <small>Tidak ada pemilihan role di halaman ini. Setiap pengguna menerima tautan portal masing-masing.</small>
      </section>
    </main>
  )
}
