import { cookies } from 'next/headers'
import { DemoPortalLogin } from '@/components/demo-portal-login'
import { PortalExperience } from '@/components/portal-experience'
import { createClient } from '@/lib/supabase/server'
import { demoCookieName, type DemoPortal } from '@/lib/demo-portal'
import type { Role } from '@/lib/demo-data'

export async function DemoPortal({portal}:{portal:DemoPortal}) {
  const cookieStore=await cookies()
  const token=cookieStore.get(demoCookieName(portal))?.value

  if(!token) return <DemoPortalLogin portal={portal}/>

  const supabase=await createClient()
  if(!supabase) return <DemoPortalLogin portal={portal}/>

  const {data,error}=await supabase.rpc('demo_snapshot',{p_token:token,p_portal:portal})
  if(error||!data) return <DemoPortalLogin portal={portal}/>

  const snapshot=data as any
  const role:Role=portal==='fasil'?'fasilitator':portal==='etoser'?'etoser':'tim_pusat'
  return <PortalExperience portal={portal} role={role} liveData={snapshot}/>
}
