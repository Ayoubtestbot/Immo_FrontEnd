import type { GetServerSideProps, NextPage } from 'next';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import FeaturesSection from '@/components/FeaturesSection';
import AboutSection from '@/components/AboutSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import type { Plan } from '@prisma/client';

type HomePageProps = {
  plans: Plan[];
};

const HomePage: NextPage<HomePageProps> = ({ plans }) => {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <FeaturesSection />
        <PricingSection plans={plans} />
        <TestimonialsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const plans = await prisma.plan.findMany({});

  return {
    props: {
      plans: JSON.parse(JSON.stringify(plans)),
    },
  };
};

export default HomePage;