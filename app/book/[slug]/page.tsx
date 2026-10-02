import type { Metadata } from 'next';
import BookingForm from './BookingForm';
export const metadata:Metadata={title:'Book a repair',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function BookingPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;return <BookingForm slug={slug}/>;
}
