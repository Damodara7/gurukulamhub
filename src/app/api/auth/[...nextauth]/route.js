import { handlers } from '@/libs/auth'

const logAuthRequest = request => {
  const url = new URL(request.url)

  // #region agent log
  fetch('http://127.0.0.1:7807/ingest/5483f88f-691f-4d49-acf2-5336b9e7918b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f4770a'},body:JSON.stringify({sessionId:'f4770a',runId:'pre-fix',hypothesisId:'H2,H3',location:'src/app/api/auth/[...nextauth]/route.js:request',message:'NextAuth route received request',data:{method:request.method,pathname:url.pathname,searchKeys:Array.from(url.searchParams.keys()),errorParam:url.searchParams.get('error'),host:request.headers.get('host'),forwardedHost:request.headers.get('x-forwarded-host'),forwardedProto:request.headers.get('x-forwarded-proto')},timestamp:Date.now()})}).catch(()=>{})
  console.info('[agent-auth-debug]',{runId:'pre-fix',hypothesisId:'H2,H3',location:'src/app/api/auth/[...nextauth]/route.js:request',message:'NextAuth route received request',data:{method:request.method,pathname:url.pathname,searchKeys:Array.from(url.searchParams.keys()),errorParam:url.searchParams.get('error'),host:request.headers.get('host'),forwardedHost:request.headers.get('x-forwarded-host'),forwardedProto:request.headers.get('x-forwarded-proto')}})
  // #endregion
}

export async function GET(request) {
  logAuthRequest(request)

  return handlers.GET(request)
}

export async function POST(request) {
  logAuthRequest(request)

  return handlers.POST(request)
}
