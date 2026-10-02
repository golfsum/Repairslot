import { ZodError } from 'zod';
import { AppError } from './config';

export async function jsonBody(request: Request) {
  if(!request.headers.get('content-type')?.startsWith('application/json')) throw new AppError(415,'JSON is required.');
  const text=await boundedText(request);
  try{return JSON.parse(text);}catch{throw new AppError(400,'Invalid JSON.');}
}
export async function boundedText(request: Request,limit=16000) {
  const reader=request.body?.getReader();if(!reader)return '';
  const chunks:Uint8Array[]=[];let size=0;
  try{while(true){const next=await reader.read();if(next.done)break;size+=next.value.byteLength;if(size>limit){await reader.cancel();throw new AppError(413,'Request too large.');}chunks.push(next.value);}}finally{reader.releaseLock();}
  return Buffer.concat(chunks).toString('utf8');
}
export function failure(error: unknown) {
  if(error instanceof ZodError) return Response.json({error:'Please check the supplied fields.'},{status:400,headers:{'Cache-Control':'no-store'}});
  const status=error instanceof AppError ? error.status : 503;
  if(!(error instanceof AppError)) console.error('RepairSlot request failed',{code:typeof error==='object' && error && 'code' in error ? String(error.code):'internal'});
  return Response.json({error:error instanceof AppError ? error.message:'Service temporarily unavailable. Please try again later.'},{status,headers:{'Cache-Control':'no-store',...(status===401?{'WWW-Authenticate':'Basic realm="RepairSlot Admin"'}:{})}});
}
