'use client'

import { useMemo, useState } from 'react'
import {
  Activity, Bell, BookOpenCheck, CalendarDays, ChevronDown, ClipboardCheck,
  FileCheck2, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2,
  Sparkles, Users2, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { attentionItems, demoActivities, demoParticipants, etoserTasks, type ActivityItem, type ParticipantItem, type Role, type TaskItem } from '@/lib/demo-data'

type LiveData = {
  profile?: { id:string; full_name:string; app_role:string; region?:string|null; cohort?:string|null }
  counts?: { participants:number; regions:number; activities:number; assignments:number; completion:number }
  activities?: ActivityItem[]
  participants?: ParticipantItem[]
  tasks?: TaskItem[]
  points?: number
}
type NavKey = 'dashboard'|'activities'|'participants'|'tasks'|'calendar'

const roleNames: Record<Role,string> = {
  tim_pusat:'Tim Pusat',
  fasilitator:'Fasilitator',
  etoser:'Etoser'
}

export function Workspace({
  demo=false,
  initialRole='tim_pusat',
  liveData
}: {
  demo?:boolean
  initialRole?:Role
  liveData?:LiveData
}) {
  const [role,setRole] = useState<Role>(initialRole)
  const [nav,setNav] = useState<NavKey>('dashboard')
  const [query,setQuery] = useState('')
  const [mobile,setMobile] = useState(false)
  const [modal,setModal] = useState(false)
  const [selectedTask,setSelectedTask] = useState<TaskItem|null>(null)
  const [activities,setActivities] = useState<ActivityItem[]>(liveData?.activities?.length ? liveData.activities : demoActivities)
  const [tasks,setTasks] = useState<TaskItem[]>(liveData?.tasks?.length ? liveData.tasks : etoserTasks)

  const effectiveRole = demo ? role : ((liveData?.profile?.app_role as Role) || initialRole)
  const participants = liveData?.participants?.length ? liveData.participants : demoParticipants
  const filteredParticipants = useMemo(
    ()=>participants.filter(p => `${p.name} ${p.region} ${p.cohort}`.toLowerCase().includes(query.toLowerCase())),
    [participants,query]
  )

  async function logout(){
    const supabase=createClient()
    if(supabase) await supabase.auth.signOut()
    window.location.href='/'
  }

  const navItems = effectiveRole==='etoser'
    ? [
        {k:'dashboard',l:'Beranda',i:LayoutDashboard},
        {k:'tasks',l:'Tugas',i:ClipboardCheck},
        {k:'activities',l:'Agenda',i:CalendarDays},
        {k:'calendar',l:'Riwayat',i:Activity}
      ]
    : [
        {k:'dashboard',l:'Dashboard',i:LayoutDashboard},
        {k:'activities',l:'Aktivitas',i:CalendarDays},
        {k:'participants',l:'Etoser',i:Users2},
        {k:'tasks',l:'Monitoring',i:ClipboardCheck},
        {k:'calendar',l:'Kalender',i:BookOpenCheck}
      ]

  return (
    <div className="workspace">
      <aside className={`sidebar ${mobile?'open':''}`}>
        <div className="sidebar-head">
          <div className="brand brand-white">
            <span className="brand-mark">E</span>
            <div><strong>ETOS Pembinaan</strong><small>Management System</small></div>
          </div>
          <button className="sidebar-close" onClick={()=>setMobile(false)}><X/></button>
        </div>

        <div className="role-box">
          <span className="role-avatar">{effectiveRole==='tim_pusat'?'TP':effectiveRole==='fasilitator'?'FS':'ET'}</span>
          <div><small>Ruang kerja</small><strong>{roleNames[effectiveRole]}</strong></div>
          <ChevronDown size={16}/>
        </div>

        <nav className="side-nav">
          {navItems.map(({k,l,i:Icon})=>(
            <button key={k} onClick={()=>{setNav(k as NavKey);setMobile(false)}} className={nav===k?'active':''}>
              <Icon size={19}/><span>{l}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button><Settings2 size={18}/>Pengaturan</button>
          {!demo&&<button onClick={logout}><LogOut size={18}/>Keluar</button>}
          <div className="system-note">
            <Sparkles size={17}/>
            <div><strong>Activity-driven</strong><span>Aktivitas baru tanpa coding ulang.</span></div>
          </div>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <button className="mobile-menu" onClick={()=>setMobile(true)}><Menu/></button>
          <div className="top-search">
            <Search size={18}/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari Etoser, aktivitas, wilayah..."/>
          </div>
          <div className="top-actions">
            {demo&&(
              <div className="role-switch">
                <button className={role==='tim_pusat'?'active':''} onClick={()=>{setRole('tim_pusat');setNav('dashboard')}}>Pusat</button>
                <button className={role==='fasilitator'?'active':''} onClick={()=>{setRole('fasilitator');setNav('dashboard')}}>Fasilitator</button>
                <button className={role==='etoser'?'active':''} onClick={()=>{setRole('etoser');setNav('dashboard')}}>Etoser</button>
              </div>
            )}
            <button className="notification-button"><Bell size={19}/><i/></button>
            <div className="user-chip">
              <span>{effectiveRole==='tim_pusat'?'TP':effectiveRole==='fasilitator'?'FS':'ET'}</span>
              <div>
                <strong>{liveData?.profile?.full_name || (effectiveRole==='tim_pusat'?'Tim Pembinaan ETOS':effectiveRole==='fasilitator'?'Fasilitator Palu':'Alya Rahma')}</strong>
                <small>{roleNames[effectiveRole]}</small>
              </div>
            </div>
          </div>
        </header>

        <div className="workspace-content">
          {nav==='dashboard' && <Dashboard role={effectiveRole} demo={demo} liveData={liveData} tasks={tasks} setNav={setNav}/>}
          {nav==='activities' && <Activities role={effectiveRole} activities={activities} onCreate={()=>setModal(true)}/>}
          {nav==='participants' && effectiveRole!=='etoser' && <Participants participants={filteredParticipants}/>}
          {nav==='tasks' && <Tasks role={effectiveRole} participants={filteredParticipants} tasks={tasks} onTask={setSelectedTask}/>}
          {nav==='calendar' && <CalendarView role={effectiveRole} activities={activities}/>}
        </div>
      </main>

      {modal&&(
        <CreateActivityModal
          demo={demo}
          close={()=>setModal(false)}
          onCreated={a=>{setActivities(v=>[a,...v]);setModal(false)}}
        />
      )}
      {selectedTask&&(
        <TaskActionModal
          demo={demo}
          task={selectedTask}
          profileId={liveData?.profile?.id}
          close={()=>setSelectedTask(null)}
          onUpdated={(id,status,statusKey)=>{
            setTasks(items=>items.map(t=>t.id===id?{...t,status,statusKey,action:statusKey==='verified'?'Lihat':statusKey==='submitted'?'Lihat':t.action}:t))
            setSelectedTask(null)
          }}
        />
      )}
    </div>
  )
}

function Dashboard({role,demo,liveData,tasks,setNav}:{role:Role;demo:boolean;liveData?:LiveData;tasks:TaskItem[];setNav:(v:NavKey)=>void}){
  if(role==='etoser') return <EtoserDashboard setNav={setNav} tasks={tasks} liveData={liveData}/>

  const facilitator=role==='fasilitator'
  const counts=liveData?.counts
  const stats = facilitator
    ? [
        {v:'18',l:'Etoser aktif',d:'+2 semester ini'},
        {v:'94%',l:'Kehadiran',d:'+4% dari bulan lalu'},
        {v:'88%',l:'Tugas selesai',d:'16 dari 18 on-track'},
        {v:'3',l:'Perlu tindak lanjut',d:'Prioritas minggu ini'}
      ]
    : [
        {v:String(counts?.participants||342),l:'Etoser aktif',d:`${counts?.regions||17} wilayah aktif`},
        {v:'91%',l:'Kehadiran',d:'+3% dari September'},
        {v:`${counts?.completion||84}%`,l:'Tugas selesai',d:`${counts?.assignments||864} assignment`},
        {v:'23',l:'Perlu tindak lanjut',d:'Prioritas minggu ini'}
      ]

  return (
    <>
      <div className="page-title-row">
        <div>
          <span className="eyebrow">{facilitator?'WILAYAH PALU':'COMMAND CENTER NASIONAL'}</span>
          <h1>{facilitator?'Ringkasan pembinaan wilayah':'Pembinaan Oktober 2026'}</h1>
          <p>{facilitator?'Pantau progres Etoser dan pekerjaan fasilitator dari satu tempat.':'Lihat kondisi pembinaan nasional tanpa membuka banyak sheet dan folder.'}</p>
        </div>
        <button className="primary-button" onClick={()=>setNav('activities')}><Plus size={17}/>Kelola aktivitas</button>
      </div>

      {demo&&(
        <div className="demo-banner">
          <Sparkles size={18}/>
          <div><strong>Mode Demo</strong><span>Data contoh untuk memperlihatkan alur aplikasi kepada tim ETOS.</span></div>
        </div>
      )}

      <div className="stats-grid">
        {stats.map((s,i)=>(
          <article className={`stat-card stat-${i}`} key={s.l}>
            <span>{s.l}</span><strong>{s.v}</strong><small>{s.d}</small><div className="stat-line"/>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel attention-panel">
          <div className="panel-head">
            <div><span className="eyebrow">BUTUH AKSI</span><h2>Perlu ditindaklanjuti</h2></div>
            <button className="text-button" onClick={()=>setNav('participants')}>Lihat semua</button>
          </div>
          <div className="attention-list">
            {attentionItems.map(a=>(
              <div className="attention-row" key={a.name}>
                <span className="avatar">{a.name.split(' ').map(v=>v[0]).slice(0,2).join('')}</span>
                <div><strong>{a.name}</strong><span>{a.region} • {a.issue}</span></div>
                <span className={`status ${a.severity==='Prioritas'?'danger':'warn'}`}>{a.severity}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel progress-panel">
          <div className="panel-head">
            <div><span className="eyebrow">PROGRESS</span><h2>Per wilayah</h2></div>
            <button className="filter-chip">Oktober <ChevronDown size={14}/></button>
          </div>
          {([['Palu',92],['Makassar',86],['Padang',83],['Jambi',78],['Medan',73]] as [string,number][]).map(([name,val])=>(
            <div className="region-progress" key={name}>
              <div><span>{name}</span><strong>{val}%</strong></div>
              <div className="progress-track"><i style={{width:`${val}%`}}/></div>
            </div>
          ))}
        </section>
      </div>

      <section className="panel activity-panel">
        <div className="panel-head">
          <div><span className="eyebrow">AKTIVITAS AKTIF</span><h2>Agenda pembinaan terdekat</h2></div>
          <button className="text-button" onClick={()=>setNav('activities')}>Semua aktivitas</button>
        </div>
        <div className="activity-table">
          <div className="activity-table-head"><span>Aktivitas</span><span>Target</span><span>Tanggal</span><span>Progress</span><span>Status</span></div>
          {(liveData?.activities?.length ? liveData.activities : demoActivities).slice(0,3).map(a=>(
            <div className="activity-table-row" key={a.id}>
              <div><i className={`activity-dot ${a.tone}`}/><span><strong>{a.title}</strong><small>{a.category}</small></span></div>
              <span>{a.scope}</span>
              <span>{a.date}</span>
              <span><b>{a.progress}%</b><div className="progress-track mini"><i style={{width:`${a.progress}%`}}/></div></span>
              <span className="status success">{a.status}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function EtoserDashboard({setNav,tasks,liveData}:{setNav:(v:NavKey)=>void;tasks:TaskItem[];liveData?:LiveData}){
  const firstName=liveData?.profile?.full_name?.split(' ')[0]||'Alya'
  const openTasks=tasks.filter(t=>!['verified','submitted','under_review'].includes(t.statusKey)).length
  return (
    <>
      <div className="page-title-row">
        <div><span className="eyebrow">RUANG ETOSER</span><h1>Selamat datang, {firstName} 👋</h1><p>{openTasks} hal masih perlu kamu selesaikan.</p></div>
        <div className="points-card"><span>Credit Perform</span><strong>{liveData?.points??920}</strong><small>Riwayat poin transparan</small></div>
      </div>

      <div className="etoser-hero">
        <div><span className="eyebrow light">FOKUS MINGGU INI</span><h2>Workshop Community Empowerment Vol. 2</h2><p>Sabtu, 10 Oktober • 08.00–13.00 WITA</p></div>
        <span className="status glass">Akan datang</span>
      </div>

      <div className="stats-grid etoser-stats">
        <article className="stat-card"><span>Kehadiran</span><strong>96%</strong><small>12 dari 13 agenda</small></article>
        <article className="stat-card"><span>Tugas selesai</span><strong>94%</strong><small>17 dari 18 tugas</small></article>
        <article className="stat-card"><span>Jurnal</span><strong>6/6</strong><small>Semua lengkap</small></article>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div><span className="eyebrow">TUGAS SAYA</span><h2>Yang perlu diselesaikan</h2></div>
          <button className="text-button" onClick={()=>setNav('tasks')}>Lihat semua</button>
        </div>
        <div className="task-list">
          {tasks.slice(0,4).map(t=>(
            <div className="task-row" key={t.title}>
              <span className={`task-icon ${t.status==='Selesai'?'done':''}`}><FileCheck2/></span>
              <div><strong>{t.title}</strong><span>{t.meta}</span></div>
              <span className={`status ${t.status==='Selesai'?'success':t.status.includes('Belum')?'warn':''}`}>{t.status}</span>
              <button className="secondary-button">{t.action}</button>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function Activities({role,activities,onCreate}:{role:Role;activities:ActivityItem[];onCreate:()=>void}){
  return (
    <>
      <div className="page-title-row">
        <div>
          <span className="eyebrow">AKTIVITAS</span>
          <h1>{role==='etoser'?'Agenda pembinaan':'Kelola aktivitas pembinaan'}</h1>
          <p>{role==='etoser'?'Semua agenda dan kewajiban pembinaanmu dalam satu tempat.':'Buat aktivitas sekali, sistem membentuk assignment dan monitoring otomatis.'}</p>
        </div>
        {role!=='etoser'&&<button className="primary-button" onClick={onCreate}><Plus size={17}/>Buat aktivitas</button>}
      </div>

      <div className="filter-row">
        <button className="filter-chip active">Semua</button>
        <button className="filter-chip">Workshop</button>
        <button className="filter-chip">Nasional</button>
        <button className="filter-chip">Wilayah</button>
        <button className="filter-chip">Jurnal</button>
      </div>

      <div className="activity-cards">
        {activities.map(a=>(
          <article className="activity-card" key={a.id}>
            <div className={`activity-card-accent ${a.tone}`}/>
            <div className="activity-card-top"><span className="activity-category">{a.category}</span><span className={`status ${a.status==='Berlangsung'?'success':''}`}>{a.status}</span></div>
            <h3>{a.title}</h3>
            <p>{a.scope} • {a.date} • {a.time}</p>
            <div className="activity-meta">
              <div><span>Progress</span><strong>{a.progress}%</strong></div>
              <div className="progress-track"><i style={{width:`${a.progress}%`}}/></div>
            </div>
            <button className="secondary-button full">Buka detail</button>
          </article>
        ))}
      </div>
    </>
  )
}

function Participants({participants}:{participants:ParticipantItem[]}){
  return (
    <>
      <div className="page-title-row">
        <div><span className="eyebrow">DATA ETOSER</span><h1>Profil & progres Etoser</h1><p>Cari satu nama dan lihat perjalanan pembinaannya tanpa membuka banyak file.</p></div>
        <button className="secondary-button"><Plus size={17}/>Tambah Etoser</button>
      </div>

      <div className="participant-grid">
        {participants.map(p=>(
          <article className="participant-card" key={p.id}>
            <div className="participant-top">
              <span className="avatar large">{p.name.split(' ').map(v=>v[0]).slice(0,2).join('')}</span>
              <div><h3>{p.name}</h3><p>{p.code} • {p.region} • Angkatan {p.cohort}</p></div>
              <span className={`status ${p.status==='Prioritas'?'danger':p.status==='Perlu perhatian'?'warn':'success'}`}>{p.status}</span>
            </div>
            <div className="participant-metrics">
              <div><span>Kehadiran</span><strong>{p.attendance}%</strong></div>
              <div><span>Tugas</span><strong>{p.completion}%</strong></div>
              <div><span>Credit</span><strong>{p.points}</strong></div>
            </div>
            <button className="secondary-button full">Buka profil 360°</button>
          </article>
        ))}
      </div>
    </>
  )
}

function Tasks({role,participants,tasks,onTask}:{role:Role;participants:ParticipantItem[];tasks:TaskItem[];onTask:(task:TaskItem)=>void}){
  if(role==='etoser'){
    const columns=[
      {name:'Belum selesai',keys:['not_started','in_progress','late','revision']},
      {name:'Menunggu review',keys:['submitted','under_review']},
      {name:'Selesai',keys:['verified']}
    ]
    return (
      <>
        <div className="page-title-row">
          <div><span className="eyebrow">TUGAS SAYA</span><h1>Kewajiban pembinaan</h1><p>Prioritas, deadline, dan riwayat submission dalam satu alur.</p></div>
        </div>
        <div className="task-board">
          {columns.map(col=>{
            const items=tasks.filter(t=>col.keys.includes(t.statusKey))
            return (
              <section className="task-column" key={col.name}>
                <div className="task-column-head"><h3>{col.name}</h3><span>{items.length}</span></div>
                {items.length===0&&<div className="empty-mini">Tidak ada tugas pada status ini.</div>}
                {items.map(t=>(
                  <article className="board-card" key={t.id}>
                    <span className="activity-category">{t.requirementType==='attendance'?'Presensi':t.requirementType==='journal'?'Jurnal':'Tugas'}</span>
                    <h4>{t.title}</h4>
                    <p>{t.activityTitle}</p>
                    <p>{t.meta}</p>
                    <div className="board-card-actions">
                      <span className={`status ${t.statusKey==='late'||t.statusKey==='revision'?'danger':t.statusKey==='verified'?'success':'warn'}`}>{t.status}</span>
                      <button className="secondary-button" onClick={()=>onTask(t)}>{t.action}</button>
                    </div>
                  </article>
                ))}
              </section>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-title-row">
        <div><span className="eyebrow">MONITORING</span><h1>Matriks progres otomatis</h1><p>Tampilan familiar seperti spreadsheet, tetapi status berasal dari aktivitas peserta.</p></div>
      </div>
      <section className="panel">
        <div className="monitor-table">
          <div className="monitor-head"><span>Etoser</span><span>Kehadiran</span><span>Tugas</span><span>Credit</span><span>Status</span><span>Wilayah</span></div>
          {participants.map(p=>(
            <div className="monitor-row" key={p.id}>
              <div><span className="avatar">{p.name.slice(0,2).toUpperCase()}</span><strong>{p.name}</strong></div>
              <span className={p.attendance>=85?'check-ok':'check-warn'}>{p.attendance}%</span>
              <span className={p.completion>=80?'check-ok':'check-late'}>{p.completion}%</span>
              <span>{p.points}</span>
              <span className={`status ${p.status==='Prioritas'?'danger':p.status==='Perlu perhatian'?'warn':'success'}`}>{p.status}</span>
              <span>{p.region}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function CalendarView({role,activities}:{role:Role;activities:ActivityItem[]}){
  return (
    <>
      <div className="page-title-row">
        <div><span className="eyebrow">KALENDER</span><h1>{role==='etoser'?'Riwayat & agenda':'Kalender pembinaan'}</h1><p>Lihat rangkaian kegiatan dan deadline dalam satu timeline.</p></div>
      </div>
      <section className="calendar-layout">
        <div className="calendar-card">
          <div className="calendar-month"><button>‹</button><strong>Oktober 2026</strong><button>›</button></div>
          <div className="calendar-week">{['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d=><span key={d}>{d}</span>)}</div>
          <div className="calendar-days">
            {Array.from({length:35},(_,i)=>{
              const n=i-2
              return <button key={i} className={n===8?'today':n===10||n===15||n===18||n===22?'has-event':''}>{n>0&&n<=31?n:''}</button>
            })}
          </div>
        </div>
        <div className="timeline-card">
          <span className="eyebrow">AGENDA BULAN INI</span>
          {activities.map(a=>(
            <div className="timeline-item" key={a.id}>
              <span className={`timeline-dot ${a.tone}`}/>
              <div><strong>{a.title}</strong><span>{a.date} • {a.time}</span></div>
              <span className="status">{a.category}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function CreateActivityModal({demo,close,onCreated}:{demo:boolean;close:()=>void;onCreated:(a:ActivityItem)=>void}){
  const [title,setTitle]=useState('')
  const [category,setCategory]=useState('Workshop')
  const [scope,setScope]=useState('cohort_2025')
  const [date,setDate]=useState('2026-10-24')
  const [requirements,setRequirements]=useState<Record<string,boolean>>({attendance:true,worksheet:true,journal:true})
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  const scopeLabel:Record<string,string>={
    all:'Semua Etoser',
    cohort_2025:'Angkatan 2025',
    cohort_2026:'Angkatan 2026',
    own_region:'Wilayah saya'
  }

  function toggleRequirement(key:string){
    setRequirements(v=>({...v,[key]:!v[key]}))
  }

  async function save(){
    if(!title.trim()){
      setError('Nama aktivitas wajib diisi.')
      return
    }
    const selected=Object.entries(requirements).filter(([,v])=>v).map(([k])=>k)
    if(selected.length===0){
      setError('Pilih minimal satu kewajiban aktivitas.')
      return
    }

    setLoading(true)
    setError('')

    const display:ActivityItem={
      id:`local-${Date.now()}`,
      title,
      category,
      date:new Date(`${date}T00:00:00+08:00`).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}),
      time:'08.00–13.00',
      scope:scopeLabel[scope]||'Target terpilih',
      status:'Terjadwal',
      progress:0,
      tone:category==='Jurnal'?'teal':category==='Pembinaan Wilayah'?'amber':'blue'
    }

    if(demo){
      setLoading(false)
      onCreated(display)
      return
    }

    const supabase=createClient()
    if(!supabase){
      setLoading(false)
      setError('Supabase belum terkonfigurasi.')
      return
    }

    const {data:prof,error:profileError}=await supabase
      .from('profiles')
      .select('id,app_role,region_id')
      .single()

    if(profileError||!prof){
      setLoading(false)
      setError('Profil pengguna tidak ditemukan.')
      return
    }

    const startIso=`${date}T08:00:00+08:00`
    const endIso=`${date}T13:00:00+08:00`
    const deadlineDate=new Date(`${date}T23:59:00+08:00`)
    deadlineDate.setDate(deadlineDate.getDate()+2)
    const deadlineIso=deadlineDate.toISOString()

    const {data:activity,error:activityError}=await supabase
      .from('activities')
      .insert({
        title,
        category,
        description:'Dibuat melalui Activity Builder ETOS Pembinaan.',
        delivery_mode:'offline',
        start_at:startIso,
        end_at:endIso,
        deadline:deadlineIso,
        status:'scheduled',
        created_by:prof.id,
        owner_region_id:prof.app_role==='fasilitator'?prof.region_id:null
      })
      .select('id,title,category,start_at,status')
      .single()

    if(activityError||!activity){
      setLoading(false)
      setError(activityError?.message||'Aktivitas gagal dibuat.')
      return
    }

    async function cleanup(message:string){
      await supabase.from('activities').delete().eq('id',activity.id)
      setLoading(false)
      setError(message)
    }

    let targetPayload:any={activity_id:activity.id,target_type:'all'}
    if(scope==='cohort_2025'||scope==='cohort_2026'){
      const year=scope==='cohort_2025'?2025:2026
      const {data:cohort}=await supabase.from('cohorts').select('id').eq('year',year).single()
      if(!cohort){ await cleanup('Angkatan target belum tersedia.'); return }
      targetPayload={activity_id:activity.id,target_type:'cohort',cohort_id:cohort.id}
    }else if(scope==='own_region'){
      if(!prof.region_id){ await cleanup('Akun ini belum memiliki wilayah.'); return }
      targetPayload={activity_id:activity.id,target_type:'region',region_id:prof.region_id}
    }

    const {error:targetError}=await supabase.from('activity_targets').insert(targetPayload)
    if(targetError){ await cleanup(targetError.message); return }

    const labels:Record<string,string>={
      attendance:'Presensi',
      worksheet:'Worksheet',
      journal:'Jurnal / Refleksi'
    }
    const reqPayload=selected.map((type,index)=>({
      activity_id:activity.id,
      title:`${labels[type]} — ${title}`,
      requirement_type:type,
      instructions:type==='attendance'
        ? 'Lakukan check-in pada waktu kegiatan.'
        : type==='worksheet'
          ? 'Lengkapi worksheet sesuai instruksi kegiatan.'
          : 'Tuliskan insight dan refleksi setelah mengikuti kegiatan.',
      due_at:type==='attendance'?endIso:deadlineIso,
      sort_order:index+1
    }))

    const {error:reqError}=await supabase.from('activity_requirements').insert(reqPayload)
    if(reqError){ await cleanup(reqError.message); return }

    if(selected.includes('attendance')){
      const {error:sessionError}=await supabase.from('attendance_sessions').insert({
        activity_id:activity.id,
        title:`Presensi — ${title}`,
        opens_at:startIso,
        closes_at:endIso,
        active:true
      })
      if(sessionError){ await cleanup(sessionError.message); return }
    }

    const {error:assignmentError}=await supabase.rpc('generate_activity_assignments',{p_activity_id:activity.id})
    if(assignmentError){ await cleanup(assignmentError.message); return }

    setLoading(false)
    onCreated({...display,id:activity.id})
  }

  return (
    <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
      <div className="modal">
        <div className="modal-head">
          <div><span className="eyebrow">ACTIVITY BUILDER</span><h2>Buat aktivitas pembinaan</h2><p>Satu aktivitas akan menghasilkan agenda, kewajiban peserta, dan monitoring otomatis.</p></div>
          <button className="icon-button" onClick={close}><X/></button>
        </div>
        <div className="modal-form">
          <label>Nama aktivitas<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Contoh: Workshop Community Empowerment Vol. 3"/></label>
          <div className="form-grid">
            <label>Kategori<select value={category} onChange={e=>setCategory(e.target.value)}><option>Workshop</option><option>Pembinaan Nasional</option><option>Pembinaan Wilayah</option><option>Jurnal</option><option>Assessment</option></select></label>
            <label>Target<select value={scope} onChange={e=>setScope(e.target.value)}><option value="cohort_2025">Angkatan 2025</option><option value="cohort_2026">Angkatan 2026</option><option value="all">Semua Etoser</option><option value="own_region">Wilayah saya</option></select></label>
          </div>
          <label>Tanggal kegiatan<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
          <div className="requirement-preview">
            <strong>Kewajiban peserta</strong>
            <p>Pilih apa saja yang harus diselesaikan Etoser pada aktivitas ini.</p>
            <div>
              {[
                ['attendance','Presensi'],
                ['worksheet','Worksheet'],
                ['journal','Jurnal / Refleksi']
              ].map(([key,label])=>(
                <button type="button" key={key} onClick={()=>toggleRequirement(key)} className={`requirement-choice ${requirements[key]?'active':''}`}>
                  {requirements[key]?'✓ ':''}{label}
                </button>
              ))}
            </div>
          </div>
          {error&&<div className="form-error">{error}</div>}
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={close}>Batal</button>
          <button className="primary-button" onClick={save} disabled={loading}><Plus size={17}/>{loading?'Membentuk assignment...':'Buat & bagikan aktivitas'}</button>
        </div>
      </div>
    </div>
  )
}

function TaskActionModal({demo,task,profileId,close,onUpdated}:{demo:boolean;task:TaskItem;profileId?:string;close:()=>void;onUpdated:(id:string,status:string,statusKey:string)=>void}){
  const [text,setText]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  async function submit(){
    if(task.statusKey==='verified'||task.statusKey==='submitted'||task.statusKey==='under_review'){
      close()
      return
    }

    setLoading(true)
    setError('')

    if(demo){
      setLoading(false)
      onUpdated(task.id,task.requirementType==='attendance'?'Selesai':'Menunggu review',task.requirementType==='attendance'?'verified':'submitted')
      return
    }

    const supabase=createClient()
    if(!supabase||!profileId||!task.assignmentId||!task.activityId){
      setLoading(false)
      setError('Data tugas belum lengkap.')
      return
    }

    if(task.requirementType==='attendance'){
      const {data:session,error:sessionError}=await supabase
        .from('attendance_sessions')
        .select('id,opens_at,closes_at')
        .eq('activity_id',task.activityId)
        .eq('active',true)
        .maybeSingle()

      if(sessionError||!session){
        setLoading(false)
        setError('Sesi presensi belum dibuka oleh pengelola.')
        return
      }

      const now=Date.now()
      if(session.opens_at&&now<new Date(session.opens_at).getTime()){
        setLoading(false)
        setError('Presensi belum dibuka.')
        return
      }
      if(session.closes_at&&now>new Date(session.closes_at).getTime()){
        setLoading(false)
        setError('Waktu presensi sudah ditutup.')
        return
      }

      const {error:attendanceError}=await supabase.from('attendance_records').upsert({
        session_id:session.id,
        activity_id:task.activityId,
        profile_id:profileId,
        status:'present',
        checked_in_at:new Date().toISOString()
      },{onConflict:'session_id,profile_id'})

      if(attendanceError){
        setLoading(false)
        setError(attendanceError.message)
        return
      }

      setLoading(false)
      onUpdated(task.id,'Selesai','verified')
      return
    }

    if(!text.trim()){
      setLoading(false)
      setError('Isi jawaban atau refleksi terlebih dahulu.')
      return
    }

    const {data:versions}=await supabase
      .from('submissions')
      .select('version')
      .eq('assignment_id',task.assignmentId)
      .order('version',{ascending:false})
      .limit(1)

    const version=((versions?.[0]?.version as number|undefined)||0)+1
    const {error:submissionError}=await supabase.from('submissions').insert({
      assignment_id:task.assignmentId,
      profile_id:profileId,
      version,
      response_text:text,
      response_data:{source:'web_app'},
      status:'submitted',
      submitted_at:new Date().toISOString()
    })

    if(submissionError){
      setLoading(false)
      setError(submissionError.message)
      return
    }

    setLoading(false)
    onUpdated(task.id,'Menunggu review','submitted')
  }

  return (
    <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
      <div className="modal task-modal">
        <div className="modal-head">
          <div><span className="eyebrow">{task.requirementType==='attendance'?'PRESENSI':'SUBMISSION'}</span><h2>{task.title}</h2><p>{task.activityTitle} • {task.meta}</p></div>
          <button className="icon-button" onClick={close}><X/></button>
        </div>
        <div className="modal-form">
          {task.instructions&&<div className="instruction-box">{task.instructions}</div>}
          {task.requirementType==='attendance' ? (
            <div className="checkin-box"><strong>Check-in kegiatan</strong><p>Tekan tombol di bawah saat sesi presensi sedang dibuka.</p></div>
          ) : (
            <label>Jawaban / refleksi
              <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Tuliskan jawaban, insight, atau refleksi di sini..." rows={8}/>
            </label>
          )}
          {error&&<div className="form-error">{error}</div>}
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={close}>Tutup</button>
          {!['verified','submitted','under_review'].includes(task.statusKey)&&(
            <button className="primary-button" onClick={submit} disabled={loading}>
              {loading?'Menyimpan...':task.requirementType==='attendance'?'Check-in sekarang':'Kirim tugas'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
