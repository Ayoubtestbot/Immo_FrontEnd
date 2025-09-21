import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { Session } from 'next-auth';

// Define a new type for the inner function that receives the session
type AuthedServerSideProps<P extends { [key: string]: any }> = (
  context: GetServerSidePropsContext,
  session: Session
) => Promise<GetServerSidePropsResult<P>>;

export function withAuth<P extends { [key:string]: any }>(handler: AuthedServerSideProps<P>, roles: string[]): GetServerSideProps<P> {
  return async (context: GetServerSidePropsContext) => {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session || !roles.includes(session.user.role)) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return handler(context, session);
  };
}
