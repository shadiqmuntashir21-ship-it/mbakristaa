import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { demoCookieName, isDemoPortal } from '@/lib/demo-portal'

export async function POST(request:Request){
  const body=await request.json().catch(()=>({}))
  if(!isDemoPortal(body?.portal)) return NextResponse.json({ok:false},{status:400})
  const store=await cookies()
  const token=store.get(demoCookieName(body.portal))?.value
  if(token){
    const supabase=await createClient()
    if(supabase) await supabase.rpc('demo_logout',{p_token:token})
  }
  const response=NextResponse.json({ok:true})
  response.cookies.set(demoCookieName(body.portal),'',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0})
  return response
}
