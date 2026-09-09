'use client';
import {useMemo,useState} from 'react';

export default function Calculator({labels,defaults,resultLabel,formulaKey,explain}:{labels:[string,string,string];defaults:[number,number,number];resultLabel:string;formulaKey:string;explain:string}){
 const [a,setA]=useState(defaults[0]),[b,setB]=useState(defaults[1]),[c,setC]=useState(defaults[2]);
 const result=useMemo(()=>{switch(formulaKey){
  case 'booking':return a*Math.max(c-b,0)/100;
  case 'afterhours':return a*b/100*c;
  case 'techcapacity':return a*b*c;
  case 'windowcapacity':return c>0?a*b/c:0;
  case 'avgjob':return a>0?Math.max(b-c,0)/a:0;
  case 'noshow':return a*b/100*c;
  case 'leadresponse':return a*b/100*c;
  case 'abandonment':return a*b/100*c/100;
  case 'marketingroi':return a>0?(b*c-a)/a*100:0;
  default:return 0}},[a,b,c,formulaKey]);
 const money=['afterhours','avgjob','noshow','leadresponse'].includes(formulaKey);
 const pct=formulaKey==='marketingroi';
 const display=pct?`${result.toFixed(1)}%`:money?`$${result.toLocaleString(undefined,{maximumFractionDigits:0})}`:result.toLocaleString(undefined,{maximumFractionDigits:1});
 return <div className="calcCard"><div className="calcInputs">{labels.map((label,i)=>{const v=[a,b,c][i];const setter=[setA,setB,setC][i];return <label key={label}>{label}<input type="number" min="0" value={v} onChange={e=>setter(Number(e.target.value))}/></label>})}</div><div className="calcResult"><span>{resultLabel}</span><strong>{display}</strong><p>{explain}</p></div></div>
}