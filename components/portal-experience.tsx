'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileArchive, FileCheck2, LogOut, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Workspace, type LiveData } from '@/components/workspace'
import type { Role } from '@/lib/demo-data'
import type { DemoPortal } from '@/lib/demo-portal'

type PortalDocument = {
  id:string
  title:string
  category:string
  fileName:string
  mimeType:string
  sizeBytes:number
  content:string
  createdAt:string
  region?:string|null
  profileName?:string|null
}

type PortalSnapshot = LiveData & {documents?:PortalDocument[]}

const tourCopy:Record<DemoPortal,{title:string;text:string;hint:string}[]> = {
  pusat:[
    {title:'Command Center nasional',text:'Dashboard sudah berisi histori sekitar enam bulan dari 17 wilayah dan tiga angkatan.',hint:'Mulai dari ringkasan nasional dan daftar peserta yang perlu perhatian.'},
    {title:'Aktivitas & monitoring',text:'Coba buka Aktivitas, Monitoring, Laporan, dan kalender untuk melihat alur pembinaan yang sudah berjalan.',hint:'Pada mode uji coba, aksi eksplorasi tidak merusak dataset dasar.'},
    {title:'Profil & evaluasi',text:'Setiap Etoser memiliki histori presensi, tugas, laporan, feedback, dan Credit Perform.',hint:'Gunakan pencarian untuk melihat peserta lintas wilayah dan angkatan.'},
    {title:'Dokumen & backup',text:'Gunakan utilitas di kanan bawah untuk membuka arsip dokumen dan mengunduh snapshot data portal Pusat.',hint:'Backup hanya mengambil data yang tersedia pada scope akun ini.'},
  ],
  fasil:[
    {title:'Ruang kerja wilayah',text:'Fasilitator hanya melihat Etoser dan aktivitas yang relevan dengan wilayah akunnya.',hint:'Akun Fasil Palu tidak dapat membuka data Fasil Makassar atau Pusat.'},
    {title:'Pantau kebutuhan pendampingan',text:'Monitoring menggabungkan kehadiran, tugas, laporan, dan status perhatian dari histori enam bulan.',hint:'Prioritaskan peserta dengan status Perlu perhatian atau Prioritas.'},
    {title:'Coba kelola agenda',text:'Menu Aktivitas dapat dipakai untuk mencoba membuat agenda wilayah, lengkap dengan kewajiban peserta.',hint:'Perubahan eksplorasi pada mode demo bersifat simulasi lokal.'},
    {title:'Arsip & backup wilayah',text:'Dokumen dan backup yang tersedia hanya berasal dari scope wilayahmu.',hint:'Gunakan tombol Dokumen dan Backup di kanan bawah.'},
  ],
  etoser:[
    {title:'Ruang pribadi Etoser',text:'Beranda hanya memuat progres, agenda, tugas, dan Credit Perform milik akun ini.',hint:'Data Etoser lain tidak ikut ditampilkan.'},
    {title:'Tugas pembinaan',text:'Status tugas menunjukkan mana yang selesai, menunggu review, revisi, atau terlambat.',hint:'Coba buka menu Tugas untuk melihat perjalanan enam bulan.'},
    {title:'Laporan & feedback',text:'Laporan bulanan, feedback reviewer, dan histori agenda tetap tersedia untuk ditinjau kembali.',hint:'Buka Laporan Bulanan dan Riwayat.'},
    {title:'Dokumen & backup personal',text:'Kamu dapat melihat arsip sendiri dan mengunduh snapshot data pribadi untuk simulasi backup.',hint:'Gunakan utilitas di kanan bawah.'},
  ],
}

export function PortalExperience({portal,role,liveData}:{portal:DemoPortal;role:Role;liveData:PortalSnapshot}) {
  const [tour,setTour]=useState(false)
  const [step,setStep]=useState(0)
  const [docsOpen,setDocsOpen]=useState(false)
  const documents=liveData.documents||[]

  useEffect(()=>{
    const key='etos-portal-tour-'+portal+'-'+(liveData.profile?.id||'guest')
    if(!window.localStorage.getItem(key)){setStep(0);setTour(true)}
  },[portal,liveData.profile?.id])

  const tourItems=tourCopy[portal]
  const current=tourItems[Math.min(step,tourItems.length-1)]

  function closeTour(){
    window.localStorage.setItem('etos-portal-tour-'+portal+'-'+(liveData.profile?.id||'guest'),'done')
    setTour(false)
  }

  async function logout(){
    await fetch('/api/demo-logout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({portal})})
    window.location.href='/' + portal
  }

  function backup(){
    const payload={
      generated_at:new Date().toISOString(),
      portal,
      account:liveData.profile,
      scope_note:portal==='pusat'?'Backup nasional':portal==='fasil'?'Backup wilayah':'Backup personal Etoser',
      data:liveData
    }
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url
    a.download='ETOS_Backup_'+portal+'_'+new Date().toISOString().slice(0,10)+'.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Workspace demo lockRole initialRole={role} liveData={liveData}/>
      <div className="portal-utility-dock">
        <button onClick={()=>{setStep(0);setTour(true)}}><Sparkles size={18}/><span>Tour</span></button>
        <button onClick={()=>setDocsOpen(true)}><FileCheck2 size={18}/><span>Dokumen</span><i>{documents.length}</i></button>
        <button onClick={backup}><ShieldCheck size={18}/><span>Backup</span></button>
        <button onClick={logout}><LogOut size={18}/><span>Keluar</span></button>
      </div>

      {tour&&<div className="tour-backdrop">
        <div className="tour-card">
          <div className="tour-progress">{tourItems.map((_,i)=><i className={i<=step?'active':''} key={i}/>)}</div>
          <span className="tour-kicker">PANDUAN INTERAKTIF</span>
          <h2>{current.title}</h2>
          <p>{current.text}</p>
          <div className="tour-hint"><Sparkles size={17}/><span>{current.hint}</span></div>
          <div className="tour-actions"><button className="text-button" onClick={closeTour}>Lewati</button>{step<tourItems.length-1?<button className="primary-button" onClick={()=>setStep(step+1)}>Lanjut</button>:<button className="primary-button" onClick={closeTour}>Mulai menggunakan</button>}</div>
        </div>
      </div>}

      {docsOpen&&<div className="portal-drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setDocsOpen(false)}}>
        <aside className="portal-doc-drawer">
          <div className="portal-doc-head"><div><span className="eyebrow">ARSIP DOKUMEN</span><h2>Dokumen dalam scope akun</h2><p>{documents.length} dokumen terbaru dari histori pembinaan.</p></div><button onClick={()=>setDocsOpen(false)}><X size={20}/></button></div>
          <div className="portal-doc-list">
            {documents.length===0&&<div className="empty-review">Belum ada dokumen.</div>}
            {documents.map(doc=><article key={doc.id}>
              <span className="portal-file-icon"><FileArchive size={19}/></span>
              <div><strong>{doc.title}</strong><span>{doc.profileName||doc.region||'ETOS Pembinaan'}</span><small>{doc.fileName} • {Math.max(1,Math.round(doc.sizeBytes/1024))} KB</small></div>
              <button onClick={()=>{
                const blob=new Blob([doc.title+'\n\n'+doc.content+'\n\nSumber demo: '+doc.fileName],{type:'text/plain;charset=utf-8'})
                const url=URL.createObjectURL(blob)
                const a=document.createElement('a')
                a.href=url
                a.download=doc.fileName.replace(/\.[^.]+$/,'')+'_DEMO.txt'
                a.click()
                URL.revokeObjectURL(url)
              }}>Unduh</button>
            </article>)}
          </div>
        </aside>
      </div>}
    </>
  )
}
