import {NextResponse} from "next/server"
import {consumeKey} from "@/lib/store"
import {generateWithProvider} from "@/lib/provider"
export const runtime="nodejs"
export async function POST(req:Request){
 try{
  const auth=req.headers.get("authorization")||""; if(!/^Bearer\s+vm_live_[a-f0-9]{48}$/i.test(auth))return NextResponse.json({ok:false,error:"Valid ViralMovie API key required."},{status:401})
  const customerKey=auth.replace(/^Bearer\s+/i,"").trim(), body=await req.json(); const prompt=String(body?.prompt||"").trim(); if(!prompt||prompt.length>2000)return NextResponse.json({ok:false,error:"Prompt is required and must be 1-2000 characters."},{status:400})
  const duration=Math.min(10,Math.max(1,Number(body?.duration)||6)); const resolution=["480p","720p"].includes(body?.resolution)?body.resolution:"480p"; const aspectRatio=["16:9","9:16","1:1"].includes(body?.aspectRatio)?body.aspectRatio:"16:9"
  const debit=await consumeKey(customerKey,1); if(!debit.ok)return NextResponse.json(debit,{status:402})
  try{const job=await generateWithProvider({prompt,duration,resolution,aspectRatio}); return NextResponse.json({ok:true,...job,creditsRemaining:debit.key?.credits??null,render:{durationSeconds:duration,resolution,aspectRatio,prompt}})}
  catch(e){await (await import("@/lib/store")).refundKey(customerKey,1); throw e}
 }catch(e:any){return NextResponse.json({ok:false,error:e?.message||"Video generation failed."},{status:500})}
}
