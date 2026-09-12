import type {Metadata} from 'next';

export const metadata:Metadata={
 title:{absolute:'Sample Repair Booking Demo | RepairSlot'},
 description:'Explore a sample appliance-repair booking flow. This demonstration uses sample data and does not reserve a technician appointment.',
 alternates:{canonical:'/book/demo'},
 robots:{index:false,follow:true,noarchive:true},
};

export default function DemoLayout({children}:{children:React.ReactNode}){
 return children;
}
