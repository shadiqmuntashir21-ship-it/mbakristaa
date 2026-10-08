'use client'

import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, UserRound } from 'lucide-react'
import type { DemoPortal } from '@/lib/demo-portal'
import { portalConfig } from '@/lib/demo-portal'

export function DemoPortalLogin({portal}:{portal:DemoPortal}) {
  const info=portalConfig[portal]
  const [username,setUsername]=useState('')
  const [pin,setPin]=useState('')
  const [showPin,setShowPin]=useState(false)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  async function submit(e:React.FormEvent){
    e.preventDefault()
    setLoading(true)
    setError('')
    try{
      const res=await fetch('/api/demo-login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({portal,username,pin})
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
    <main className={'portal-login portal-login-'+portal}>
      <div className="portal-login-orb portal-login-orb-a"/>
      <div className="portal-login-orb portal-login-orb-b"/>
      <section className="portal-login-shell">
        <div className="portal-login-brand">
          <span className="brand-mark">E</span>
          <div><strong>ETOS Pembinaan</strong><small>Management System • Uji Coba</small></div>
        </div>

        <div className="portal-login-copy">
          <span className="portal-access-badge"><LockKeyhole size={14}/>{info.accent} Access</span>
          <h1>{info.welcome}</h1>
          <p>{info.description}</p>
          <div className="portal-login-note">
            <strong>Akses terpisah</strong>
            <span>Portal ini hanya menerima akun {info.title}. Akun dari portal lain tidak dapat masuk melalui tautan ini.</span>
          </div>
        </div>

        <form className="portal-login-card" onSubmit={submit}>
          <div className="portal-login-card-head">
            <span>{info.subtitle}</span>
            <h2>Masuk ke ruang kerja</h2>
            <p>Gunakan username dan PIN uji coba yang diberikan admin.</p>
          </div>

          <label>
            Username
            <div className="portal-field"><UserRound size={18}/><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="contoh: fasil.palu" autoComplete="username"/></div>
          </label>
          <label>
            PIN
            <div className="portal-field"><KeyRound size={18}/><input value={pin} onChange={e=>setPin(e.target.value)} type={showPin?'text':'password'} inputMode="numeric" placeholder="Masukkan PIN" autoComplete="current-password"/><button type="button" onClick={()=>setShowPin(v=>!v)}>{showPin?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>
          </label>

          {error&&<div className="portal-login-error">{error}</div>}
          <button className="portal-login-submit" disabled={loading}>{loading?'Memverifikasi akses...':<>Masuk ke {info.title}<ArrowRight size={17}/></>}</button>
          <small className="portal-login-foot">Data pada portal ini merupakan dataset simulasi untuk pengujian alur aplikasi.</small>
        </form>
      </section>
    </main>
  )
}
