import { redirect } from 'next/navigation'
import { Workspace } from '@/components/workspace'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

function normalizeRole(role:string):Role {
  if(role==='fasilitator') return 'fasilitator'
  if(role==='etoser') return 'etoser'
  return 'tim_pusat'
}

export default async function AppPage(){
  const supabase=await createClient()
  if(!supabase) redirect('/login')

  const { data: { user } } = await supabase.auth.getUser()
  if(!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id,full_name,app_role,region_id,cohort_id,regions(name),cohorts(label)')
    .eq('auth_user_id',user.id)
    .single()

  if(!profile) redirect('/login')

  const [
    {count:participants},
    {count:regions},
    {count:assignments},
    {data:activityRows},
    {data:assignmentRows},
    {data:profileRows}
  ] = await Promise.all([
    supabase.from('profiles').select('*',{count:'exact',head:true}).eq('app_role','etoser').eq('active',true),
    supabase.from('regions').select('*',{count:'exact',head:true}).eq('active',true),
    supabase.from('assignments').select('*',{count:'exact',head:true}),
    supabase.from('activities').select('id,title,category,start_at,status').order('start_at',{ascending:true}).limit(8),
    supabase.from('assignments').select('status').limit(1000),
    supabase.from('profiles').select('id,full_name,participant_code,app_role,regions(name),cohorts(year)').eq('app_role','etoser').limit(30),
  ])

  const done=(assignmentRows||[]).filter(a=>a.status==='verified'||a.status==='submitted').length
  const completion=assignmentRows?.length ? Math.round(done/assignmentRows.length*100) : 0

  const activities=(activityRows||[]).map((a:any)=>({
    id:a.id,
    title:a.title,
    category:a.category,
    date:a.start_at ? new Date(a.start_at).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : 'Belum dijadwalkan',
    time:a.start_at ? new Date(a.start_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '-',
    scope:'Target terpilih',
    status:a.status==='scheduled'?'Terjadwal':a.status==='ongoing'?'Berlangsung':a.status,
    progress:0,
    tone:'blue'
  }))

  const participantsData=(profileRows||[]).map((p:any)=>({
    id:p.id,
    name:p.full_name,
    code:p.participant_code||'-',
    region:p.regions?.name||'-',
    cohort:String(p.cohorts?.year||'-'),
    attendance:90,
    completion:85,
    points:850,
    status:'Aman'
  }))

  const liveData={
    profile:{
      id:profile.id,
      full_name:profile.full_name,
      app_role:profile.app_role,
      region:(profile.regions as any)?.name||null,
      cohort:(profile.cohorts as any)?.label||null
    },
    counts:{
      participants:participants||0,
      regions:regions||0,
      activities:activityRows?.length||0,
      assignments:assignments||0,
      completion
    },
    activities,
    participants:participantsData
  }

  return <Workspace liveData={liveData} initialRole={normalizeRole(profile.app_role)}/>
}
