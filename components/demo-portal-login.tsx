'use client'

import { useState } from 'react'
import {
  ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck,
  Sparkles, UserRound
} from 'lucide-react'
import type { DemoPortal } from '@/lib/demo-portal'
import { portalConfig } from '@/lib/demo-portal'

const visualCopy:Record<DemoPortal,{
  eyebrow:string
  headline:string
  text:string
  stats:{value:string;label:string}[]
}> = {
  pusat:{
    eyebrow:'ETOS NATIONAL COMMAND CENTER',
    headline:'Satu pandangan untuk seluruh pembinaan.',
    text:'Pantau progres lintas wilayah, review laporan, dan lihat perjalanan pembinaan secara utuh dari satu ruang kerja.',
    stats:[
      {value:'17',label:'Wilayah aktif'},
      {value:'3',label:'Angkatan'},
      {value:'6 bln',label:'Histori simulasi'},
    ]
  },
  fasil:{
    eyebrow:'ETOS REGIONAL WORKSPACE',
    headline:'Pendampingan yang lebih dekat dan terarah.',
    text:'Lihat siapa yang perlu dibantu, review progres Etoser, dan kelola agenda wilayah tanpa berpindah-pindah rekap.',
    stats:[
      {value:'1',label:'Wilayah akun'},
      {value:'360°',label:'Profil Etoser'},
      {value:'Live',label:'Monitoring'},
    ]
  },
  etoser:{
    eyebrow:'ETOS PERSONAL JOURNEY',
    headline:'Semua perjalanan pembinaanmu, dalam satu ruang.',
    text:'Agenda, tugas, laporan, feedback, Credit Perform, dan histori perkembangan tersusun rapi untuk kamu ikuti.',
    stats:[
      {value:'1',label:'Ruang pribadi'},
      {value:'6 bln',label:'Riwayat'},
      {value:'100%',label:'Scope personal'},
    ]
  }
}

export function DemoPortalLogin({portal}:{portal:DemoPortal}) {
  const info=portalConfig[portal]
  const visual=visualCopy[portal]
  const [username,setUsername]=useState('')
  const [pin,setPin]=useState('')
  const [showPin,setShowPin]=useState(false)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  async function submit(e:React.FormEvent){
    e.preventDefault()
    if(!username.trim()||!pin.trim()){
      setError('Username dan PIN wajib diisi.')
      return
    }
    setLoading(true)
    setError('')
    try{
      const res=await fetch('/api/demo-login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({portal,username:username.trim(),pin:pin.trim()})
      })
      const body=await res.json()
      if(!res.ok||!body?.ok) throw new Error(body?.error||'Username atau PIN tidak sesuai.')
      window.location.href='/' + portal
    }catch(err){
      setError(err instanceof Error?err.message:'Login gagal.')
      setLoading(false)
    }
  }

  return (
    <main className={'portal-auth portal-auth-'+portal}>
      <section className="portal-auth-left">
        <div className="portal-auth-left-inner">
          <header className="portal-auth-brand">
            <span className="portal-auth-logo">E</span>
            <div>
              <strong>ETOS Pembinaan</strong>
              <small>Management System</small>
            </div>
          </header>

          <div className="portal-auth-mobile-visual">
            <span>{visual.eyebrow}</span>
            <strong>{visual.headline}</strong>
          </div>

          <div className="portal-auth-form-wrap">
            <div className="portal-auth-heading">
              <span className="portal-auth-kicker"><ShieldCheck size={14}/> AKSES {info.title.toUpperCase()}</span>
              <h1>Selamat datang kembali.</h1>
              <p>Masukkan username dan PIN uji coba untuk membuka ruang kerja {info.title}.</p>
            </div>

            <form className="portal-auth-form" onSubmit={submit}>
              <label>
                <span>Username</span>
                <div className="portal-auth-input">
                  <UserRound size={18}/>
                  <input
                    value={username}
                    onChange={e=>setUsername(e.target.value)}
                    placeholder={portal==='pusat'?'pusat.nasional':portal==='fasil'?'fasil.palu':'etoser.alya'}
                    autoComplete="username"
                    spellCheck={false}
                  />
                </div>
              </label>

              <label>
                <span>PIN Akses</span>
                <div className="portal-auth-input">
                  <KeyRound size={18}/>
                  <input
                    value={pin}
                    onChange={e=>setPin(e.target.value.replace(/\D/g,''))}
                    type={showPin?'text':'password'}
                    inputMode="numeric"
                    placeholder="Masukkan PIN"
                    autoComplete="current-password"
                  />
                  <button type="button" className="portal-auth-eye" onClick={()=>setShowPin(v=>!v)} aria-label={showPin?'Sembunyikan PIN':'Tampilkan PIN'}>
                    {showPin?<EyeOff size={17}/>:<Eye size={17}/>}
                  </button>
                </div>
              </label>

              {error&&<div className="portal-auth-error">{error}</div>}

              <button className="portal-auth-submit" disabled={loading}>
                <span>{loading?'Memverifikasi akses...':'Masuk ke Dashboard'}</span>
                {!loading&&<ArrowRight size={17}/>}
              </button>

              <div className="portal-auth-security">
                <CheckCircle2 size={15}/>
                <span>Akses portal terkunci sesuai peran. Akun dari portal lain tidak dapat digunakan di sini.</span>
              </div>
            </form>
          </div>

          <footer className="portal-auth-foot">
            <span>ETOS Pembinaan • Lingkungan Uji Coba 2026</span>
            <span>Username + PIN</span>
          </footer>
        </div>
      </section>

      <section className="portal-auth-visual">
        <div className="portal-auth-grid"/>
        <div className="portal-auth-orb one"/>
        <div className="portal-auth-orb two"/>

        <div className="portal-auth-visual-top">
          <span className="portal-auth-live"><i/> DATA SIMULASI AKTIF</span>
          <span>{info.subtitle}</span>
        </div>

        <div className="portal-auth-story-card">
          <span className="portal-auth-story-eyebrow">{visual.eyebrow}</span>
          <h2>{visual.headline}</h2>
          <p>{visual.text}</p>
          <div className="portal-auth-stats">
            {visual.stats.map(item=>(
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="portal-auth-visual-bottom">
          <Sparkles size={15}/>
          <span>Simulasi sistem pembinaan yang telah berjalan ±6 bulan.</span>
        </div>
      </section>
    </main>
  )
}
