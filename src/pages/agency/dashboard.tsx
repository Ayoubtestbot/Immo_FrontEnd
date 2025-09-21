import { getSession, useSession } from 'next-auth/react';
import type { GetServerSideProps } from 'next';
import DashboardLayout from '@/components/DashboardLayout';

const AgencyDashboard = () => {
  const { data: session } = useSession();

  return (
    <DashboardLayout>
      <h1>Tableau de bord de l'agence</h1>
      <p>Bienvenue, {session?.user?.name || 'Utilisateur'} !</p>
      <p>Votre rôle est : {session?.user?.role}</p>
      {/* More dashboard widgets will go here */}
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session || (session.user.role !== 'AGENCY_OWNER' && session.user.role !== 'AGENCY_MEMBER')) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default AgencyDashboard;
