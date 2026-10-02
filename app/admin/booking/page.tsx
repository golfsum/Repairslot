import type { Metadata } from 'next';
import OperatorBooking from './OperatorBooking';
export const metadata:Metadata={title:'Booking operations',robots:{index:false,follow:false}};
export default function Page(){return <OperatorBooking/>;}
