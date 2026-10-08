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
    {data:pointRows},
    {data:reviewRows},
    {data:notificationRows},
    {data:reportRows},
    {data:managementRows},
    {data:regionRows},
    {data:cohortRows},
    {data:auditRows}
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
    supabase.from('point_transactions').select('points').eq('profile_id',profile.id),
    supabase
      .from('submissions')
      .select('id,status,submitted_at,response_text,profiles(full_name,regions(name)),assignments(activity_requirements(title),activities(title))')
      .in('status',['submitted','under_review'])
      .order('submitted_at',{ascending:true})
      .limit(30),
    supabase.from('notifications').select('id,type,title,message,href,read_at,created_at').eq('profile_id',profile.id).order('created_at',{ascending:false}).limit(20),
    supabase.from('monthly_reports').select('id,profile_id,period_month,status,submitted_at,feedback,reviewed_at,content,profiles(full_name,participant_code,regions(name))').order('period_month',{ascending:false}).limit(120),
    supabase.from('profiles').select('id,full_name,email,participant_code,app_role,active,region_id,cohort_id,regions(name),cohorts(year)').order('full_name').limit(300),
    supabase.from('regions').select('id,name,code').eq('active',true).order('name'),
    supabase.from('cohorts').select('id,year,label').eq('active',true).order('year',{ascending:false}),
    supabase.from('audit_logs').select('id,actor_profile_id,action,entity_type,entity_id,created_at').order('created_at',{ascending:false}).limit(80)
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

  const reviewQueue=(reviewRows||[]).map((row:any)=>({
    id:row.id,
    submissionId:row.id,
    profileName:row.profiles?.full_name||'Etoser',
    region:row.profiles?.regions?.name||'-',
    activityTitle:row.assignments?.activities?.title||'Aktivitas Pembinaan',
    taskTitle:row.assignments?.activity_requirements?.title||'Submission',
    submittedAt:row.submitted_at
      ? new Date(row.submitted_at).toLocaleString('id-ID',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Makassar'})
      : '-',
    responseText:row.response_text||'Tidak ada jawaban teks.',
    status:row.status
  }))

  const notifications=(notificationRows||[]).map((row:any)=>({id:row.id,type:row.type,title:row.title,message:row.message,href:row.href,readAt:row.read_at,createdAt:row.created_at}))
  const reports=(reportRows||[]).map((row:any)=>({
    id:row.id,profileId:row.profile_id,profileName:row.profiles?.full_name||profile.full_name,
    participantCode:row.profiles?.participant_code||'-',region:row.profiles?.regions?.name||'-',
    periodMonth:row.period_month,status:row.status,submittedAt:row.submitted_at,feedback:row.feedback,
    reviewedAt:row.reviewed_at,content:(row.content||{}) as Record<string,unknown>
  }))
  const managedProfiles=(managementRows||[]).map((row:any)=>({
    id:row.id,fullName:row.full_name,email:row.email,participantCode:row.participant_code,role:row.app_role,
    active:row.active,regionId:row.region_id,cohortId:row.cohort_id,region:row.regions?.name||null,cohort:row.cohorts?.year||null
  }))
  const regionsData=(regionRows||[]).map((row:any)=>({id:row.id,name:row.name,code:row.code}))
  const cohortsData=(cohortRows||[]).map((row:any)=>({id:row.id,year:row.year,label:row.label}))
  const actorNameMap=new Map(managedProfiles.map((p:any)=>[p.id,p.fullName]))
  const auditLogs=(auditRows||[]).map((row:any)=>({
    id:row.id,actorName:actorNameMap.get(row.actor_profile_id)||'Sistem',action:row.action,
    entityType:row.entity_type,entityId:row.entity_id,createdAt:row.created_at
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
    participants:participantsData,
    tasks,
    points,
    reviewQueue,
    notifications,
    reports,
    managedProfiles,
    regions:regionsData,
    cohorts:cohortsData,
    auditLogs
  }

  return <Workspace liveData={liveData} initialRole={normalizeRole(profile.app_role)}/>
}
