'use client';

import { useMemo, useState } from 'react';

export default function Calculator(){
  const [calls,setCalls]=useState(200);
  const [missed,setMissed]=useState(20);
  const [bookRate,setBookRate]=useState(45);
  const [jobValue,setJobValue]=useState(250);
  const result=useMemo(()=>{
    const missedCalls=calls*(missed/100);
    const jobs=missedCalls*(bookRate/100);
    return {missedCalls,jobs,revenue:jobs*jobValue};
  },[calls,missed,bookRate,jobValue]);
  const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
  return <div className="calcCard">
    <div className="calcFields">
      <label>Inbound calls per month<input type="number" min="0" value={calls} onChange={e=>setCalls(Number(e.target.value))}/></label>
      <label>Missed call rate (%)<input type="number" min="0" max="100" value={missed} onChange={e=>setMissed(Number(e.target.value))}/></label>
      <label>Percent of answered calls that become jobs<input type="number" min="0" max="100" value={bookRate} onChange={e=>setBookRate(Number(e.target.value))}/></label>
      <label>Average repair job value<input type="number" min="0" value={jobValue} onChange={e=>setJobValue(Number(e.target.value))}/></label>
    </div>
    <div className="calcResult"><span>Estimated monthly revenue at risk</span><strong>{money.format(result.revenue)}</strong><p>About {Math.round(result.missedCalls)} missed calls × {bookRate}% booking rate ≈ {result.jobs.toFixed(1)} potential jobs.</p><a className="button full" href="/book/demo">See how RepairSlot can recover bookings</a></div>
  </div>
}