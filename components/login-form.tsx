'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const supabase = createClient()
    if (!supabase) {
      setError('Konfigurasi Supabase belum tersedia pada environment deployment.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError('Email atau kata sandi belum sesuai.')
      return
    }

    window.location.href = '/app'
  }

  return (
    <main className="login-page">
      <div className="login-ambient login-ambient-a" />
      <div className="login-ambient login-ambient-b" />
      <section className="login-card">
        <Link href="/" className="back-link"><ArrowLeft size={16}/> Kembali</Link>
        <div className="brand brand-login">
          <span className="brand-mark">E</span>
          <div><strong>ETOS Pembinaan</strong><small>Management System</small></div>
        </div>

        <div className="login-heading">
          <span className="eyebrow">AKSES TEROTORISASI</span>
          <h1>Masuk ke ruang kerja</h1>
          <p>Gunakan akun yang terdaftar untuk mengakses dashboard sesuai peran Anda.</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <label>
            Email
            <div className="input-wrap">
              <Mail size={18}/>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@etos.id"/>
            </div>
          </label>

          <label>
            Kata sandi
            <div className="input-wrap">
              <LockKeyhole size={18}/>
              <input type={show?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Masukkan kata sandi"/>
              <button type="button" className="icon-button" onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button>
            </div>
          </label>

          {error && <div className="form-error">{error}</div>}
          <button className="primary-button full" disabled={loading}>{loading?'Memeriksa akun...':'Masuk ke sistem'}</button>
        </form>

        <div className="login-demo">
          <span>Belum memiliki akun operasional?</span>
          <Link href="/demo">Buka mode demo</Link>
        </div>
      </section>
    </main>
  )
}
