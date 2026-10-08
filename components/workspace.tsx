'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity, Bell, BookOpenCheck, CalendarDays, ChevronDown, ClipboardCheck,
  FileCheck2, FileText, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2,
  ShieldCheck, Sparkles, UserCog, Users2, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { attentionItems, demoActivities, demoParticipants, demoReviewQueue, etoserTasks, type ActivityItem, type ParticipantItem, type ReviewItem, type Role, type TaskItem } from '@/lib/demo-data'

type NotificationItem = { id:string; type:string; title:string; message:string; href?:string|null; readAt?:string|null; createdAt:string }
type ReportItem = { id:string; profileId:string; profileName:string; participantCode:string; region:string; periodMonth:string; status:string; submittedAt?:string|null; feedback?:string|null; reviewedAt?:string|null; content:Record<string,unknown> }
type ManagedProfile = { id:string; fullName:string; email?:string|null; participantCode?:string|null; role:string; active:boolean; regionId?:string|null; cohortId?:string|null; region?:string|null; cohort?:number|null }
type RegionOption = {id:string;name:string;code:string}
type CohortOption = {id:string;year:number;label:string}
type AuditItem = {id:number;actorName:string;action:string;entityType:string;entityId?:string|null;createdAt:string}

export type LiveData = {
  profile?: { id:string; full_name:string; app_role:string; region?:string|null; cohort?:string|null }
  counts?: { participants:number; regions:number; activities:number; assignments:number; completion:number }
  activities?: ActivityItem[]
  participants?: ParticipantItem[]
  tasks?: TaskItem[]
  points?: number
  reviewQueue?: ReviewItem[]
  notifications?: NotificationItem[]
  reports?: ReportItem[]
  managedProfiles?: ManagedProfile[]
  regions?: RegionOption[]
  cohorts?: CohortOption[]
  auditLogs?: AuditItem[]
}
type NavKey = 'dashboard'|'activities'|'participants'|'tasks'|'reports'|'management'|'audit'|'calendar'

const roleNames: Record<Role,string> = {
  tim_pusat:'Tim Pusat',
  fasilitator:'Fasilitator',
  etoser:'Etoser'
}

export function Workspace({
  demo=false,
  lockRole=false,
  initialRole='tim_pusat',
  liveData
}: {
  demo?:boolean
  lockRole?:boolean
  initialRole?:Role
  liveData?:LiveData
}) {
  const [role,setRole] = useState<Role>(initialRole)
  const [nav,setNav] = useState<NavKey>('dashboard')
  const [query,setQuery] = useState('')
  const [mobile,setMobile] = useState(false)
  const [modal,setModal] = useState(false)
  const [selectedTask,setSelectedTask] = useState<TaskItem|null>(null)
  const [selectedReview,setSelectedReview] = useState<ReviewItem|null>(null)
  const [activities,setActivities] = useState<ActivityItem[]>(liveData?.activities?.length ? liveData.activities : demoActivities)
  const [tasks,setTasks] = useState<TaskItem[]>(liveData?.tasks?.length ? liveData.tasks : etoserTasks)
  const [reports,setReports] = useState<ReportItem[]>(liveData?.reports||[])
  const [managedProfiles,setManagedProfiles] = useState<ManagedProfile[]>(liveData?.managedProfiles||[])
  const [regions,setRegions] = useState<RegionOption[]>(liveData?.regions||[])
  const [cohorts,setCohorts] = useState<CohortOption[]>(liveData?.cohorts||[])
  const [notifications,setNotifications] = useState<NotificationItem[]>(
    liveData?.notifications?.length ? liveData.notifications :
    demo ? [
      {id:'dn1',type:'warning',title:'Tugas mendekati deadline',message:'Worksheet Workshop CE Vol. 2 perlu diselesaikan sebelum 12 Oktober.',href:'/demo',readAt:null,createdAt:new Date().toISOString()},
      {id:'dn2',type:'success',title:'Jurnal diverifikasi',message:'Jurnal Interaksi Masyarakat sudah diverifikasi fasilitator.',href:'/demo',readAt:new Date().toISOString(),createdAt:new Date().toISOString()}
    ] : []
  )
  const [notificationOpen,setNotificationOpen] = useState(false)

  const rawRole=liveData?.profile?.app_role||initialRole
  const effectiveRole:Role = demo ? role : rawRole==='fasilitator' ? 'fasilitator' : rawRole==='etoser' ? 'etoser' : 'tim_pusat'
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

  async function markNotificationRead(id:string){
    const now=new Date().toISOString()
    setNotifications(items=>items.map(n=>n.id===id?{...n,readAt:now}:n))
    if(demo) return
    const supabase=createClient()
    if(supabase) await supabase.from('notifications').update({read_at:now}).eq('id',id)
  }

  const navItems = effectiveRole==='etoser'
    ? [
        {k:'dashboard',l:'Beranda',i:LayoutDashboard},
        {k:'tasks',l:'Tugas',i:ClipboardCheck},
        {k:'activities',l:'Agenda',i:CalendarDays},
        {k:'reports',l:'Laporan Bulanan',i:FileText},
        {k:'calendar',l:'Riwayat',i:Activity}
      ]
    : [
        {k:'dashboard',l:'Dashboard',i:LayoutDashboard},
        {k:'activities',l:'Aktivitas',i:CalendarDays},
        {k:'participants',l:'Etoser',i:Users2},
        {k:'tasks',l:'Monitoring',i:ClipboardCheck},
        {k:'reports',l:'Laporan',i:FileText},
        ...(rawRole==='superadmin' ? [{k:'management',l:'Pengguna & Master',i:UserCog}] : []),
        ...(effectiveRole==='tim_pusat' ? [{k:'audit',l:'Audit Aktivitas',i:ShieldCheck}] : []),
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
            {demo&&!lockRole&&(
              <div className="role-switch">
                <button className={role==='tim_pusat'?'active':''} onClick={()=>{setRole('tim_pusat');setNav('dashboard')}}>Pusat</button>
                <button className={role==='fasilitator'?'active':''} onClick={()=>{setRole('fasilitator');setNav('dashboard')}}>Fasilitator</button>
                <button className={role==='etoser'?'active':''} onClick={()=>{setRole('etoser');setNav('dashboard')}}>Etoser</button>
              </div>
            )}
            <div className="notification-shell">
              <button className="notification-button" onClick={()=>setNotificationOpen(v=>!v)}>
                <Bell size={19}/>
                {notifications.some(n=>!n.readAt)&&<i/>}
              </button>
              {notificationOpen&&(
                <div className="notification-popover">
                  <div className="notification-head">
                    <div><span className="eyebrow">NOTIFIKASI</span><strong>Pusat informasi</strong></div>
                    <span>{notifications.filter(n=>!n.readAt).length} baru</span>
                  </div>
                  <div className="notification-list">
                    {notifications.length===0&&<div className="empty-notification">Belum ada notifikasi.</div>}
                    {notifications.map(n=>(
                      <button key={n.id} className={`notification-item ${n.readAt?'':'unread'}`} onClick={()=>markNotificationRead(n.id)}>
                        <span className={`notification-dot ${n.type}`}/>
                        <div><strong>{n.title}</strong><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString('id-ID',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</small></div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
          {nav==='tasks' && <Tasks role={effectiveRole} participants={filteredParticipants} tasks={tasks} reviewQueue={liveData?.reviewQueue?.length?liveData.reviewQueue:demoReviewQueue} profileId={liveData?.profile?.id} demo={demo} onTask={setSelectedTask} onReview={setSelectedReview}/>}
          {nav==='reports' && <MonthlyReports role={effectiveRole} profileId={liveData?.profile?.id} reports={reports} setReports={setReports} demo={demo}/>}
          {nav==='management' && rawRole==='superadmin' && <UserManagement currentProfileId={liveData?.profile?.id} profiles={managedProfiles} setProfiles={setManagedProfiles} regions={regions} setRegions={setRegions} cohorts={cohorts} setCohorts={setCohorts} demo={demo}/>}
          {nav==='audit' && effectiveRole==='tim_pusat' && <AuditTrail items={liveData?.auditLogs||[]}/>}
          {nav==='calendar' && <CalendarView role={effectiveRole} activities={activities}/>}
        </div>
      </main>

      {modal&&(
        <CreateActivityModal
          demo={demo}
          profile={liveData?.profile}
          close={()=>setModal(false)}
          onCreated={a=>{setActivities(v=>[a,...v]);setModal(false)}}
        />
      )}
      {selectedReview&&(
        <ReviewModal
          demo={demo}
          review={selectedReview}
          reviewerId={liveData?.profile?.id}
          close={()=>setSelectedReview(null)}
          onUpdated={()=>setSelectedReview(null)}
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
  const pdata=liveData?.participants||[]
  const avgAttendance=pdata.length?Math.round(pdata.reduce((sum,p)=>sum+p.attendance,0)/pdata.length):91
  const attentionCount=pdata.filter(p=>p.status!=='Aman').length
  const stats = [
    {v:String(counts?.participants||pdata.length||342),l:'Etoser aktif',d:facilitator?(liveData?.profile?.region||'Wilayah'):`${counts?.regions||17} wilayah aktif`},
    {v:`${avgAttendance}%`,l:'Kehadiran',d:'Rata-rata histori 6 bulan'},
    {v:`${counts?.completion||84}%`,l:'Tugas selesai',d:`${counts?.assignments||0} assignment tercatat`},
    {v:String(attentionCount),l:'Perlu tindak lanjut',d:'Prioritas berdasarkan histori'}
  ]

  return (
    <>
      <div className="page-title-row">
        <div>
          <span className="eyebrow">{facilitator?`WILAYAH ${(liveData?.profile?.region||'').toUpperCase()}`:'COMMAND CENTER NASIONAL'}</span>
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
  const [selected,setSelected]=useState<ParticipantItem|null>(null)
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
            <button className="secondary-button full" onClick={()=>setSelected(p)}>Buka profil 360°</button>
          </article>
        ))}
      </div>
      {selected&&<ParticipantDetailModal participant={selected} close={()=>setSelected(null)}/>}
    </>
  )
}

function Tasks({role,participants,tasks,reviewQueue,profileId,demo,onTask,onReview}:{role:Role;participants:ParticipantItem[];tasks:TaskItem[];reviewQueue:ReviewItem[];profileId?:string;demo:boolean;onTask:(task:TaskItem)=>void;onReview:(review:ReviewItem)=>void}){
  function exportMonitoring(){
    const header=['Nama','Kode','Wilayah','Angkatan','Kehadiran','Tugas','Credit','Status']
    const rows=participants.map(p=>[p.name,p.code,p.region,p.cohort,`${p.attendance}%`,`${p.completion}%`,String(p.points),p.status])
    const csv=[header,...rows].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url
    a.download='monitoring-etos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

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
        <button className="secondary-button" onClick={exportMonitoring}>Export CSV</button>
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

      <section className="panel review-panel">
        <div className="panel-head">
          <div><span className="eyebrow">ANTRIAN REVIEW</span><h2>Submission menunggu verifikasi</h2></div>
          <span className="status warn">{reviewQueue.length} submission</span>
        </div>
        {reviewQueue.length===0&&<div className="empty-review">Tidak ada submission yang menunggu review.</div>}
        <div className="review-list">
          {reviewQueue.map(item=>(
            <div className="review-row" key={item.id}>
              <span className="avatar">{item.profileName.split(' ').map(v=>v[0]).slice(0,2).join('')}</span>
              <div className="review-copy">
                <strong>{item.profileName}</strong>
                <span>{item.region} • {item.taskTitle}</span>
                <small>{item.activityTitle} • {item.submittedAt}</small>
              </div>
              <button className="secondary-button" onClick={()=>onReview(item)}>Review</button>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function ParticipantDetailModal({participant,close}:{participant:ParticipantItem;close:()=>void}){
  return (
    <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
      <div className="modal participant-detail-modal">
        <div className="modal-head">
          <div><span className="eyebrow">PROFIL 360° ETOSER</span><h2>{participant.name}</h2><p>{participant.code} • {participant.region} • Angkatan {participant.cohort}</p></div>
          <button className="icon-button" onClick={close}><X/></button>
        </div>
        <div className="profile-detail-body">
          <div className="profile-score-grid">
            <div><span>Kehadiran</span><strong>{participant.attendance}%</strong></div>
            <div><span>Tugas selesai</span><strong>{participant.completion}%</strong></div>
            <div><span>Credit Perform</span><strong>{participant.points}</strong></div>
          </div>
          <div className="profile-timeline">
            <strong>Ringkasan pembinaan</strong>
            <p>Status saat ini: <span className={`status ${participant.status==='Prioritas'?'danger':participant.status==='Perlu perhatian'?'warn':'success'}`}>{participant.status}</span></p>
            <p>Seluruh aktivitas, presensi, worksheet, jurnal, assessment, laporan, dan feedback akan membentuk histori peserta di profil ini.</p>
          </div>
        </div>
        <div className="modal-actions"><button className="primary-button" onClick={close}>Tutup</button></div>
      </div>
    </div>
  )
}


function MonthlyReports({role,profileId,reports,setReports,demo}:{role:Role;profileId?:string;reports:ReportItem[];setReports:React.Dispatch<React.SetStateAction<ReportItem[]>>;demo:boolean}){
  const now=new Date()
  const defaultPeriod=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`
  const [period,setPeriod]=useState(defaultPeriod)
  const [summary,setSummary]=useState('')
  const [achievement,setAchievement]=useState('')
  const [obstacle,setObstacle]=useState('')
  const [followUp,setFollowUp]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [reviewing,setReviewing]=useState<ReportItem|null>(null)
  const ownReport=reports.find(r=>r.profileId===profileId&&r.periodMonth===period)

  useEffect(()=>{
    if(!ownReport){setSummary('');setAchievement('');setObstacle('');setFollowUp('');return}
    setSummary(String(ownReport.content.summary||''))
    setAchievement(String(ownReport.content.achievement||''))
    setObstacle(String(ownReport.content.obstacle||''))
    setFollowUp(String(ownReport.content.follow_up||''))
  },[ownReport?.id,period])

  async function save(status:'draft'|'submitted'){
    if(!profileId)return
    if(status==='submitted'&&!summary.trim()){setError('Ringkasan pembinaan wajib diisi sebelum dikirim.');return}
    setLoading(true);setError('')
    const payload={profile_id:profileId,period_month:period,content:{summary,achievement,obstacle,follow_up:followUp},status,submitted_at:status==='submitted'?new Date().toISOString():null}
    if(demo){
      const next:ReportItem={id:ownReport?.id||`demo-report-${period}`,profileId,profileName:'Alya Rahma',participantCode:'ETS-PAL-2501',region:'Palu',periodMonth:period,status,submittedAt:payload.submitted_at,feedback:ownReport?.feedback||null,reviewedAt:null,content:payload.content}
      setReports(items=>[next,...items.filter(r=>r.id!==next.id)]);setLoading(false);return
    }
    const supabase=createClient()
    if(!supabase){setLoading(false);setError('Supabase belum terkonfigurasi.');return}
    const {data,error:saveError}=await supabase.from('monthly_reports').upsert(payload,{onConflict:'profile_id,period_month'}).select('id,profile_id,period_month,status,submitted_at,feedback,reviewed_at,content').single()
    if(saveError||!data){setLoading(false);setError(saveError?.message||'Laporan gagal disimpan.');return}
    const next:ReportItem={id:data.id,profileId:data.profile_id,profileName:'Saya',participantCode:'-',region:'-',periodMonth:data.period_month,status:data.status,submittedAt:data.submitted_at,feedback:data.feedback,reviewedAt:data.reviewed_at,content:(data.content||{}) as Record<string,unknown>}
    setReports(items=>[next,...items.filter(r=>r.id!==next.id)]);setLoading(false)
  }

  if(role==='etoser'){
    const ownReports=reports.filter(r=>r.profileId===profileId)
    return <>
      <div className="page-title-row"><div><span className="eyebrow">LAPORAN BULANAN</span><h1>Catatan perkembangan pembinaan</h1><p>Simpan progres, tantangan, dan tindak lanjut setiap bulan dalam satu histori.</p></div></div>
      <div className="report-layout">
        <section className="panel report-editor">
          <div className="panel-head"><div><span className="eyebrow">EDITOR LAPORAN</span><h2>Periode laporan</h2></div><input type="month" value={period.slice(0,7)} onChange={e=>setPeriod(`${e.target.value}-01`)}/></div>
          {ownReport?.feedback&&<div className={`report-feedback ${ownReport.status==='revision'?'warn':''}`}><strong>Feedback reviewer</strong><p>{ownReport.feedback}</p></div>}
          <div className="report-form">
            <label>Ringkasan pembinaan<textarea rows={5} value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Apa proses pembinaan yang paling penting bulan ini?"/></label>
            <label>Capaian / perkembangan<textarea rows={4} value={achievement} onChange={e=>setAchievement(e.target.value)} placeholder="Tuliskan capaian utama..."/></label>
            <label>Tantangan<textarea rows={4} value={obstacle} onChange={e=>setObstacle(e.target.value)} placeholder="Kendala atau hal yang perlu dukungan..."/></label>
            <label>Tindak lanjut<textarea rows={4} value={followUp} onChange={e=>setFollowUp(e.target.value)} placeholder="Apa yang akan dilakukan berikutnya?"/></label>
            {error&&<div className="form-error">{error}</div>}
            <div className="report-actions"><button className="secondary-button" disabled={loading} onClick={()=>save('draft')}>Simpan draft</button><button className="primary-button" disabled={loading} onClick={()=>save('submitted')}>{loading?'Menyimpan...':'Kirim laporan'}</button></div>
          </div>
        </section>
        <section className="panel report-history">
          <div className="panel-head"><div><span className="eyebrow">HISTORI</span><h2>Laporan sebelumnya</h2></div></div>
          {ownReports.length===0&&<div className="empty-review">Belum ada laporan tersimpan.</div>}
          {ownReports.map(r=><div className="report-history-row" key={r.id}><div><strong>{new Date(r.periodMonth).toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</strong><span>{String(r.content.summary||'Belum ada ringkasan').slice(0,85)}</span></div><span className={`status ${r.status==='revision'?'danger':r.status==='reviewed'||r.status==='completed'?'success':'warn'}`}>{r.status}</span></div>)}
        </section>
      </div>
    </>
  }

  const queue=reports.filter(r=>['submitted','revision','reviewed','completed'].includes(r.status))
  return <>
    <div className="page-title-row"><div><span className="eyebrow">LAPORAN ETOSER</span><h1>Review laporan bulanan</h1><p>Pantau laporan perkembangan tanpa memindahkan data ke file rekap lain.</p></div></div>
    <section className="panel"><div className="review-list">
      {queue.length===0&&<div className="empty-review">Belum ada laporan yang perlu ditampilkan.</div>}
      {queue.map(r=><div className="review-row" key={r.id}><span className="avatar">{r.profileName.split(' ').map(v=>v[0]).slice(0,2).join('')}</span><div className="review-copy"><strong>{r.profileName}</strong><span>{r.region} • {new Date(r.periodMonth).toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</span><small>{String(r.content.summary||'Belum ada ringkasan').slice(0,110)}</small></div><span className={`status ${r.status==='revision'?'danger':r.status==='reviewed'||r.status==='completed'?'success':'warn'}`}>{r.status}</span><button className="secondary-button" onClick={()=>setReviewing(r)}>Buka</button></div>)}
    </div></section>
    {reviewing&&<ReportReviewModal demo={demo} report={reviewing} reviewerId={profileId} close={()=>setReviewing(null)} onUpdated={updated=>{setReports(items=>items.map(r=>r.id===updated.id?updated:r));setReviewing(null)}}/>}
  </>
}

function ReportReviewModal({demo,report,reviewerId,close,onUpdated}:{demo:boolean;report:ReportItem;reviewerId?:string;close:()=>void;onUpdated:(report:ReportItem)=>void}){
  const [feedback,setFeedback]=useState(report.feedback||'')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  async function decide(status:'reviewed'|'revision'){
    setLoading(true);setError('')
    const reviewedAt=new Date().toISOString()
    if(demo){setLoading(false);onUpdated({...report,status,feedback,reviewedAt});return}
    const supabase=createClient()
    if(!supabase||!reviewerId){setLoading(false);setError('Reviewer tidak tersedia.');return}
    const {error:updateError}=await supabase.from('monthly_reports').update({status,feedback:feedback||null,reviewer_id:reviewerId,reviewed_at:reviewedAt}).eq('id',report.id)
    if(updateError){setLoading(false);setError(updateError.message);return}
    setLoading(false);onUpdated({...report,status,feedback,reviewedAt})
  }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal review-modal">
    <div className="modal-head"><div><span className="eyebrow">REVIEW LAPORAN</span><h2>{report.profileName}</h2><p>{report.region} • {new Date(report.periodMonth).toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</p></div><button className="icon-button" onClick={close}><X/></button></div>
    <div className="modal-form">
      <div className="submission-answer"><span>Ringkasan</span><p>{String(report.content.summary||'-')}</p></div>
      <div className="report-read-grid"><div><strong>Capaian</strong><p>{String(report.content.achievement||'-')}</p></div><div><strong>Tantangan</strong><p>{String(report.content.obstacle||'-')}</p></div><div><strong>Tindak lanjut</strong><p>{String(report.content.follow_up||'-')}</p></div></div>
      <label>Feedback reviewer<textarea rows={5} value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Berikan penguatan atau arahan revisi..."/></label>
      {error&&<div className="form-error">{error}</div>}
    </div>
    <div className="modal-actions"><button className="secondary-button" disabled={loading} onClick={()=>decide('revision')}>Minta revisi</button><button className="primary-button" disabled={loading} onClick={()=>decide('reviewed')}>{loading?'Menyimpan...':'Tandai direview'}</button></div>
  </div></div>
}

function UserManagement({currentProfileId,profiles,setProfiles,regions,setRegions,cohorts,setCohorts,demo}:{currentProfileId?:string;profiles:ManagedProfile[];setProfiles:React.Dispatch<React.SetStateAction<ManagedProfile[]>>;regions:RegionOption[];setRegions:React.Dispatch<React.SetStateAction<RegionOption[]>>;cohorts:CohortOption[];setCohorts:React.Dispatch<React.SetStateAction<CohortOption[]>>;demo:boolean}){
  const [regionName,setRegionName]=useState('')
  const [cohortYear,setCohortYear]=useState('')
  const [masterError,setMasterError]=useState('')
  async function addRegion(){
    const name=regionName.trim();if(!name)return
    const code=name.toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,'')
    if(demo){setRegions(items=>[...items,{id:`demo-region-${Date.now()}`,name,code}]);setRegionName('');return}
    const supabase=createClient();if(!supabase)return
    const {data,error}=await supabase.from('regions').insert({name,code}).select('id,name,code').single()
    if(error||!data){setMasterError(error?.message||'Wilayah gagal ditambahkan.');return}
    setRegions(items=>[...items,data]);setRegionName('');setMasterError('')
  }
  async function addCohort(){
    const year=Number(cohortYear);if(!year||year<2020||year>2100)return
    if(demo){setCohorts(items=>[{id:`demo-cohort-${Date.now()}`,year,label:`Angkatan ${year}`},...items]);setCohortYear('');return}
    const supabase=createClient();if(!supabase)return
    const {data,error}=await supabase.from('cohorts').insert({year,label:`Angkatan ${year}`}).select('id,year,label').single()
    if(error||!data){setMasterError(error?.message||'Angkatan gagal ditambahkan.');return}
    setCohorts(items=>[data,...items]);setCohortYear('');setMasterError('')
  }
  return <>
    <div className="page-title-row"><div><span className="eyebrow">SUPERADMIN</span><h1>Pengguna & data master</h1><p>Kelola role, status akun, wilayah, dan angkatan dari satu tempat.</p></div></div>
    <div className="master-grid">
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">WILAYAH</span><h2>Tambah wilayah</h2></div></div><div className="inline-create"><input value={regionName} onChange={e=>setRegionName(e.target.value)} placeholder="Nama wilayah"/><button className="primary-button" onClick={addRegion}>Tambah</button></div><div className="master-chips">{regions.map(r=><span key={r.id}>{r.name}</span>)}</div></section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">ANGKATAN</span><h2>Tambah angkatan</h2></div></div><div className="inline-create"><input type="number" value={cohortYear} onChange={e=>setCohortYear(e.target.value)} placeholder="2027"/><button className="primary-button" onClick={addCohort}>Tambah</button></div><div className="master-chips">{cohorts.map(c=><span key={c.id}>{c.label}</span>)}</div></section>
    </div>
    {masterError&&<div className="form-error master-error">{masterError}</div>}
    <section className="panel user-admin-panel"><div className="panel-head"><div><span className="eyebrow">AKUN</span><h2>{profiles.length} profil terdaftar</h2></div></div><div className="user-admin-list">{profiles.map(p=><ManagedProfileRow key={p.id} profile={p} currentProfileId={currentProfileId} regions={regions} cohorts={cohorts} demo={demo} onSaved={updated=>setProfiles(items=>items.map(i=>i.id===updated.id?updated:i))}/>)}</div></section>
  </>
}

function ManagedProfileRow({profile,currentProfileId,regions,cohorts,demo,onSaved}:{profile:ManagedProfile;currentProfileId?:string;regions:RegionOption[];cohorts:CohortOption[];demo:boolean;onSaved:(profile:ManagedProfile)=>void}){
  const [role,setRole]=useState(profile.role)
  const [regionId,setRegionId]=useState(profile.regionId||'')
  const [cohortId,setCohortId]=useState(profile.cohortId||'')
  const [active,setActive]=useState(profile.active)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  async function save(){
    setSaving(true);setMessage('')
    const updated={...profile,role,regionId:regionId||null,cohortId:cohortId||null,active}
    if(demo){setSaving(false);setMessage('Tersimpan');onSaved(updated);return}
    const supabase=createClient();if(!supabase){setSaving(false);return}
    const {error}=await supabase.from('profiles').update({app_role:role,region_id:regionId||null,cohort_id:cohortId||null,active}).eq('id',profile.id)
    setSaving(false);if(error){setMessage(error.message);return}
    setMessage('Tersimpan');onSaved(updated)
  }
  const isSelf=profile.id===currentProfileId
  return <div className="user-admin-row">
    <div className="user-admin-person"><span className="avatar">{profile.fullName.split(' ').map(v=>v[0]).slice(0,2).join('')}</span><div><strong>{profile.fullName}</strong><span>{profile.email||profile.participantCode||'Tanpa email'}</span></div></div>
    <select value={role} disabled={isSelf} onChange={e=>setRole(e.target.value)}><option value="etoser">Etoser</option><option value="fasilitator">Fasilitator</option><option value="pic">PIC</option><option value="tim_pusat">Tim Pusat</option><option value="superadmin">Superadmin</option></select>
    <select value={regionId} onChange={e=>setRegionId(e.target.value)}><option value="">Tanpa wilayah</option>{regions.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>
    <select value={cohortId} onChange={e=>setCohortId(e.target.value)}><option value="">Tanpa angkatan</option>{cohorts.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select>
    <label className="active-toggle"><input type="checkbox" checked={active} disabled={isSelf} onChange={e=>setActive(e.target.checked)}/><span>Aktif</span></label>
    <button className="secondary-button" onClick={save} disabled={saving}>{saving?'...':'Simpan'}</button>
    {message&&<small className={message==='Tersimpan'?'save-ok':'save-error'}>{message}</small>}
  </div>
}

function AuditTrail({items}:{items:AuditItem[]}){
  const labels:Record<string,string>={insert:'Membuat',update:'Mengubah',delete:'Menghapus'}
  return <>
    <div className="page-title-row"><div><span className="eyebrow">AUDIT TRAIL</span><h1>Riwayat perubahan sistem</h1><p>Jejak perubahan operasional untuk transparansi dan penelusuran masalah.</p></div></div>
    <section className="panel audit-panel">
      {items.length===0&&<div className="empty-review">Belum ada aktivitas audit.</div>}
      {items.map(item=><div className="audit-row" key={item.id}><span className={`audit-action ${item.action}`}>{labels[item.action]||item.action}</span><div><strong>{item.actorName}</strong><span>{item.entityType.replaceAll('_',' ')}{item.entityId?` • ${item.entityId.slice(0,8)}`:''}</span></div><time>{new Date(item.createdAt).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</time></div>)}
    </section>
  </>
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

function CreateActivityModal({demo,profile,close,onCreated}:{demo:boolean;profile?:LiveData['profile'];close:()=>void;onCreated:(a:ActivityItem)=>void}){
  const [title,setTitle]=useState('')
  const [category,setCategory]=useState('Workshop')
  const [scope,setScope]=useState(profile?.app_role==='fasilitator'?'own_region':'cohort_2025')
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

    if(!profile?.id){
      setLoading(false)
      setError('Profil pengguna tidak ditemukan.')
      return
    }

    const prof={
      id:profile.id,
      app_role:profile.app_role,
      region_id:null as string|null
    }

    if(profile.app_role==='fasilitator'){
      const {data:row,error:profileError}=await supabase
        .from('profiles')
        .select('region_id')
        .eq('id',profile.id)
        .single()

      if(profileError||!row?.region_id){
        setLoading(false)
        setError('Wilayah fasilitator belum dikonfigurasi.')
        return
      }
      prof.region_id=row.region_id
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

    const db=supabase
    const activityId=activity.id

    async function cleanup(message:string){
      await db.from('activities').delete().eq('id',activityId)
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
            <label>Target<select value={scope} onChange={e=>setScope(e.target.value)}>
              {profile?.app_role==='fasilitator' ? (
                <option value="own_region">Wilayah saya</option>
              ) : (
                <>
                  <option value="cohort_2025">Angkatan 2025</option>
                  <option value="cohort_2026">Angkatan 2026</option>
                  <option value="all">Semua Etoser</option>
                  <option value="own_region">Wilayah saya</option>
                </>
              )}
            </select></label>
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

function ReviewModal({demo,review,reviewerId,close,onUpdated}:{demo:boolean;review:ReviewItem;reviewerId?:string;close:()=>void;onUpdated:()=>void}){
  const [feedback,setFeedback]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  async function decide(decision:'verified'|'revision'){
    setLoading(true)
    setError('')
    if(demo){
      setLoading(false)
      onUpdated()
      return
    }
    const supabase=createClient()
    if(!supabase||!reviewerId){
      setLoading(false)
      setError('Profil reviewer tidak tersedia.')
      return
    }
    const {error:insertError}=await supabase.from('reviews').insert({
      submission_id:review.submissionId,
      reviewer_id:reviewerId,
      decision,
      feedback:feedback.trim()||null
    })
    if(insertError){
      setLoading(false)
      setError(insertError.message)
      return
    }
    setLoading(false)
    onUpdated()
  }

  return (
    <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
      <div className="modal review-modal">
        <div className="modal-head">
          <div><span className="eyebrow">REVIEW SUBMISSION</span><h2>{review.taskTitle}</h2><p>{review.profileName} • {review.region} • {review.submittedAt}</p></div>
          <button className="icon-button" onClick={close}><X/></button>
        </div>
        <div className="modal-form">
          <div className="submission-answer"><span>Jawaban Etoser</span><p>{review.responseText}</p></div>
          <label>Feedback fasilitator / reviewer
            <textarea rows={5} value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Berikan catatan, penguatan, atau instruksi revisi..."/>
          </label>
          {error&&<div className="form-error">{error}</div>}
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={()=>decide('revision')} disabled={loading}>Minta revisi</button>
          <button className="primary-button" onClick={()=>decide('verified')} disabled={loading}>{loading?'Menyimpan...':'Verifikasi submission'}</button>
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
