import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { demoCookieName, isDemoPortal } from '@/lib/demo-portal'

export async function POST(request:Request){
  try{
    const body=await request.json()
    if(!isDemoPortal(body?.portal)) return NextResponse.json({ok:false,error:'Portal tidak valid.'},{status:400})
    const username=String(body?.username||'').trim()
    const pin=String(body?.pin||'').trim()
    if(!username||!pin) return NextResponse.json({ok:false,error:'Username dan PIN wajib diisi.'},{status:400})

    const supabase=await createClient()
    if(!supabase) return NextResponse.json({ok:false,error:'Konfigurasi database belum tersedia.'},{status:500})

    const {data,error}=await supabase.rpc('demo_login',{p_portal:body.portal,p_username:username,p_pin:pin})
    if(error){
      console.error('demo_login RPC failed',error.message)
      return NextResponse.json({ok:false,error:'Sistem login sedang bermasalah. Silakan coba kembali.'},{status:500})
    }
    const session=Array.isArray(data)?data[0]:null
    if(!session?.token) return NextResponse.json({ok:false,error:'Username atau PIN tidak sesuai untuk portal ini.'},{status:401})

    const response=NextResponse.json({ok:true,portal:body.portal,name:session.full_name})
    response.cookies.set(demoCookieName(body.portal),session.token,{
      httpOnly:true,
      secure:true,
      sameSite:'lax',
      path:'/',
      maxAge:60*60*12
    })
    return response
  }catch{
    return NextResponse.json({ok:false,error:'Login tidak dapat diproses.'},{status:400})
  }
}
