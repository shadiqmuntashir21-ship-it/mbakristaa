import { redirect } from 'next/navigation'
import { Workspace } from '@/components/workspace'
import { createClient } from '@/lib/supabase/server'
import type { Role, TaskItem } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

function normalizeRole(role:string):Role {
  if(role==='fasilitator') return 'fasilitator'
  if(role==='etoser') return 'etoser'
  return 'tim_pusat'
}

const statusLabel:Record<string,string> = {
  not_started:'Belum dimulai',
  in_progress:'Sedang dikerjakan',
  submitted:'Menunggu review',
  under_review:'Sedang direview',
  verified:'Selesai',
  revision:'Perlu revisi',
  late:'Terlambat',
  cancelled:'Dibatalkan'
}

function statusAction(status:string,type:string){
  if(status==='verified') return 'Lihat'
  if(type==='attendance') return 'Check-in'
  if(status==='revision') return 'Perbaiki'
  if(status==='submitted'||status==='under_review') return 'Lihat'
  return 'Kerjakan'
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
    {data:profileRows},
    {data:progressRows},
    {data:attendanceRows},
    {data:taskRows},
    {data:pointRows}
  ] = await Promise.all([
    supabase.from('profiles').select('*',{count:'exact',head:true}).eq('app_role','etoser').eq('active',true),
    supabase.from('regions').select('*',{count:'exact',head:true}).eq('active',true),
    supabase.from('assignments').select('*',{count:'exact',head:true}),
    supabase.from('activities').select('id,title,category,start_at,end_at,status').order('start_at',{ascending:true}).limit(12),
    supabase.from('assignments').select('activity_id,status').limit(3000),
    supabase.from('profiles').select('id,full_name,participant_code,app_role,regions(name),cohorts(year)').eq('app_role','etoser').limit(100),
    supabase.from('participant_progress_summary').select('*').limit(100),
    supabase.from('attendance_records').select('profile_id,status').limit(3000),
    supabase
      .from('assignments')
      .select('id,activity_id,status,due_at,activity_requirements(title,requirement_type,instructions),activities(title,start_at)')
      .eq('profile_id',profile.id)
      .order('due_at',{ascending:true}),
    supabase.from('point_transactions').select('points').eq('profile_id',profile.id)
  ])

  const allAssignments=assignmentRows||[]
  const done=allAssignments.filter(a=>['submitted','under_review','verified'].includes(a.status)).length
  const completion=allAssignments.length ? Math.round(done/allAssignments.length*100) : 0

  const activityStats=new Map<string,{total:number,done:number}>()
  for(const row of allAssignments){
    const current=activityStats.get(row.activity_id)||{total:0,done:0}
    current.total+=1
    if(['submitted','under_review','verified'].includes(row.status)) current.done+=1
    activityStats.set(row.activity_id,current)
  }

  const activities=(activityRows||[]).map((a:any)=>{
    const stat=activityStats.get(a.id)
    return {
      id:a.id,
      title:a.title,
      category:a.category,
      date:a.start_at ? new Date(a.start_at).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Makassar'}) : 'Belum dijadwalkan',
      time:a.start_at ? new Date(a.start_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Makassar'}) : '-',
      scope:'Target terpilih',
      status:a.status==='scheduled'?'Terjadwal':a.status==='ongoing'?'Berlangsung':a.status==='completed'?'Selesai':a.status,
      progress:stat?.total ? Math.round(stat.done/stat.total*100) : 0,
      tone:a.category.toLowerCase().includes('jurnal')?'teal':a.category.toLowerCase().includes('wilayah')?'amber':'blue'
    }
  })

  const progressMap=new Map((progressRows||[]).map((r:any)=>[r.profile_id,r]))
  const attendanceMap=new Map<string,{total:number,present:number}>()
  for(const row of attendanceRows||[]){
    const current=attendanceMap.get(row.profile_id)||{total:0,present:0}
    current.total+=1
    if(['present','late','excused','sick'].includes(row.status)) current.present+=1
    attendanceMap.set(row.profile_id,current)
  }

  const participantsData=(profileRows||[]).map((p:any)=>{
    const pr:any=progressMap.get(p.id)
    const at=attendanceMap.get(p.id)
    const completionRate=pr?.total_assignments ? Math.round(Number(pr.completed_or_submitted)/Number(pr.total_assignments)*100) : 0
    const attention=Number(pr?.needs_attention||0)
    return {
      id:p.id,
      name:p.full_name,
      code:p.participant_code||'-',
      region:p.regions?.name||'-',
      cohort:String(p.cohorts?.year||'-'),
      attendance:at?.total ? Math.round(at.present/at.total*100) : 0,
      completion:completionRate,
      points:Number(pr?.credit_points||0),
      status:attention>=2?'Prioritas':attention===1?'Perlu perhatian':'Aman'
    }
  })

  const tasks:TaskItem[]=(taskRows||[]).map((row:any)=>{
    const req=row.activity_requirements
    const activity=row.activities
    const requirementType=(req?.requirement_type||'text') as TaskItem['requirementType']
    const due=row.due_at
      ? new Date(row.due_at).toLocaleString('id-ID',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Makassar'})
      : 'Tanpa deadline'

    return {
      id:row.id,
      assignmentId:row.id,
      activityId:row.activity_id,
      activityTitle:activity?.title||'Aktivitas Pembinaan',
      title:req?.title||activity?.title||'Tugas Pembinaan',
      requirementType,
      instructions:req?.instructions||undefined,
      meta:`Deadline ${due}`,
      status:statusLabel[row.status]||row.status,
      statusKey:row.status,
      action:statusAction(row.status,requirementType)
    }
  })

  const points=(pointRows||[]).reduce((sum,row)=>sum+Number(row.points||0),0)

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
    participants:participantsData,
    tasks,
    points
  }

  return <Workspace liveData={liveData} initialRole={normalizeRole(profile.app_role)}/>
}
