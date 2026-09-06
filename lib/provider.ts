export type VideoJob={requestId:string; status:string; videoUrl?:string|null; providerResponse?:unknown}
export async function generateWithProvider(input:{prompt:string;duration:number;resolution:string;aspectRatio:string}):Promise<VideoJob>{
 const provider=(process.env.VIDEO_PROVIDER||"local").toLowerCase()
 if(provider==="8scale"){
  const key=process.env.EIGHTSCALE_API_KEY
  if(!key)throw new Error("VIDEO_PROVIDER=8scale but EIGHTSCALE_API_KEY is missing.")
  const r=await fetch(process.env.EIGHTSCALE_VIDEO_URL||"https://8scale.run/wan-2.2/14b/text-to-video",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({prompt:input.prompt,duration:input.duration,resolution:input.resolution,aspectRatio:input.aspectRatio}),cache:"no-store"})
  const data=await r.json().catch(()=>({})); if(!r.ok)throw new Error(data?.error||`Video provider error (${r.status})`)
  return {requestId:String(data.requestId||data.id||crypto.randomUUID()),status:String(data.status||"IN_QUEUE"),videoUrl:data.videoUrl||data.url||null,providerResponse:data}
 }
 return {requestId:crypto.randomUUID(),status:"LOCAL_RENDER",videoUrl:null,providerResponse:{provider:"local"}}
}
