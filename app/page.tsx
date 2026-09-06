"use client";
import { useRef, useState } from "react";

export default function Home(){
 const [prompt,setPrompt]=useState("A cinematic premium energy drink commercial on a futuristic city rooftop at golden hour");
 const [resolution,setResolution]=useState("480p"),[aspect,setAspect]=useState("16:9"),[busy,setBusy]=useState(false),[out,setOut]=useState<any>(null),[err,setErr]=useState("");
 const [email,setEmail]=useState(""),[name,setName]=useState(""),[newKey,setNewKey]=useState<any>(null),[apiKey,setApiKey]=useState(""),[plan,setPlan]=useState("starter");
 const canvasRef=useRef<HTMLCanvasElement>(null);
 async function generate(){
  setBusy(true);setOut(null);setErr("");
  try{
   const r=await fetch("/api/video/generate",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},body:JSON.stringify({prompt,resolution,aspectRatio:aspect})});
   const d=await r.json(); if(!r.ok) throw Error(d.error||"Generation failed");
   if(d.videoUrl){ setOut({...d,videoUrl:d.videoUrl,downloadUrl:d.videoUrl}); return; }
   if(d.status && d.status!=="LOCAL_RENDER"){ setOut({...d,message:`AI video job accepted. Request ID: ${d.requestId||"—"}`}); return; }
   const canvas=canvasRef.current; if(!canvas) throw Error("Video canvas is unavailable.");
   const vertical=aspect==="9:16", square=aspect==="1:1";
   canvas.width=vertical?480:square?480:640; canvas.height=vertical?854:square?480:360;
   const ctx=canvas.getContext("2d")!;
   const stream=canvas.captureStream(30);
   const mime=MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm";
   const recorder=new MediaRecorder(stream,{mimeType:mime}); const chunks:BlobPart[]=[];
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   const done=new Promise<Blob>(resolve=>recorder.onstop=()=>resolve(new Blob(chunks,{type:mime})));
   recorder.start(); const start=performance.now(); const duration=6000;
   function frame(now:number){
    const t=Math.min(1,(now-start)/duration), w=canvas.width,h=canvas.height;
    const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,"#111827"); g.addColorStop(1,"#6d28d9"); ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    const x=w*(0.2+0.6*t), y=h*(0.25+0.12*Math.sin(t*Math.PI*2));
    ctx.beginPath();ctx.arc(x,y,Math.min(w,h)*0.13,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,.16)";ctx.fill();
    ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font=`700 ${Math.max(22,Math.round(w/20))}px Arial`;
    const words=prompt.slice(0,70); ctx.fillText(words,w/2,h*0.67);
    ctx.font=`500 ${Math.max(15,Math.round(w/34))}px Arial`;ctx.fillStyle="rgba(255,255,255,.8)";ctx.fillText("ViralMovie",w/2,h*0.76);
    if(now-start<duration) requestAnimationFrame(frame); else recorder.stop();
   }
   requestAnimationFrame(frame); const blob=await done; const url=URL.createObjectURL(blob); setOut({...d,videoUrl:url,downloadUrl:url,message:"Local test video generated successfully."});
  }catch(e:any){setErr(e.message||"Generation failed")}finally{setBusy(false)}
 }
 async function createKey(){setErr("");setNewKey(null);try{const r=await fetch("/api/keys/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,name})});const d=await r.json();if(!r.ok)throw Error(d.error);setNewKey(d);setApiKey(d.key)}catch(e:any){setErr(e.message)}}
 async function buy(){try{const r=await fetch("/api/billing/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,plan,apiKey})});const d=await r.json();if(!r.ok)throw Error(d.error);location.href=d.url}catch(e:any){setErr(e.message)}}
 return <main className="shell"><nav><div className="logo">ViralMovie <span>API</span></div><div className="links"><a href="#generate">Generate</a><a href="#keys">API Keys</a><a href="#pricing">Pricing</a></div></nav>
 <section className="hero"><div className="badge">VIRALMOVIE VIDEO API</div><h1>Build your own <span className="grad">video API.</span></h1><p className="sub">ViralMovie creates its own API keys. Use local mode for free testing or connect a supported AI video provider for real generation.</p></section>
 <section className="grid" id="generate"><div className="card"><h2>Generate test video</h2><div className="muted">1 credit per render. VIDEO_PROVIDER=local creates a browser WebM test; VIDEO_PROVIDER=8scale sends the job to the configured AI provider.</div><label>Prompt</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)}/><div className="row"><div><label>Resolution</label><select value={resolution} onChange={e=>setResolution(e.target.value)}><option>480p</option><option>720p</option></select></div><div><label>Aspect ratio</label><select value={aspect} onChange={e=>setAspect(e.target.value)}><option>16:9</option><option>9:16</option><option>1:1</option></select></div></div><button className="btn" disabled={busy||!prompt.trim()||!apiKey} onClick={generate}>{busy?"Rendering…":"Generate test video"}</button>{!apiKey&&<div className="status">Create an API key first.</div>}{err&&<div className="status">Error: {err}</div>}{out&&<div className="status"><b>{out.message}</b><video src={out.videoUrl} controls playsInline style={{width:"100%",borderRadius:12,marginTop:12}}/><a className="btn" style={{display:"inline-block",marginTop:12,textDecoration:"none"}} href={out.downloadUrl} download="viralmovie-test.webm">Download video</a></div>}<canvas ref={canvasRef} style={{display:"none"}}/></div>
 <div className="card" id="keys"><h2>Customer API key</h2><p className="muted">Create a test key with 10 free credits. ViralMovie generates the key itself.</p><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="My app"/><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email"/><button className="btn" onClick={createKey}>Create API key · FREE</button>{newKey&&<div className="status"><b>Your API key</b><div className="code" style={{marginTop:8,wordBreak:"break-all"}}>{newKey.key}</div><p className="muted">10 credits included. Save this key now.</p></div>}</div></section>
 <section className="grid" id="pricing"><div className="card"><h2>Public API</h2><p className="muted">Your key authenticates requests to ViralMovie.</p><pre className="code">{`POST /api/v1/video/generate\nAuthorization: Bearer vm_live_xxx\nContent-Type: application/json\n\n{\n  "prompt": "cinematic coffee commercial",\n  "resolution": "480p",\n  "aspect_ratio": "16:9"\n}`}</pre></div><div className="card"><h2>Buy API credits</h2><p className="muted">Stripe checkout is ready. Credits are added by the verified webhook.</p><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email"/><select value={plan} onChange={e=>setPlan(e.target.value)}><option value="starter">Starter · 100 credits · €9</option><option value="pro">Pro · 500 credits · €29</option><option value="business">Business · 2,000 credits · €99</option></select><button className="btn" onClick={buy}>Pay with Stripe</button></div></section>
 <section className="card"><h2>Current architecture</h2><div className="kpis"><div className="kpi"><b>Customer key</b><span>vm_live_…</span></div><div className="kpi"><b>Credits</b><span>1 render = 1 credit</span></div><div className="kpi"><b>Stripe</b><span>Payments → credits</span></div><div className="kpi"><b>Video</b><span>Local or configured AI provider</span></div></div></section><div className="footer">ViralMovie API · independent test build</div></main>
}
