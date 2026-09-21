import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';
import InfoBand from '@/components/home/InfoBand';
import Subsidiaries from '@/components/home/Subsidiaries';
import Welcome from '@/components/home/Welcome';
import Services from '@/components/home/Services';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import LatestUpdates from '@/components/home/LatestUpdates';
import SpecialOffers from '@/components/home/SpecialOffers';
import Testimonials from '@/components/home/Testimonials';
import CtaBanner from '@/components/home/CtaBanner';
import Footer from '@/components/home/Footer';

export default function Home() {
  return (
    <div className='overflow-x-hidden'>
      <Navbar />
      
    <main className="w-full flex flex-col">
      <Hero />
      <InfoBand />
      <Subsidiaries />
      <Welcome />
      <Services />
      <WhyChooseUs />
      <LatestUpdates />
      <SpecialOffers />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </main>
    </div>
  );
}