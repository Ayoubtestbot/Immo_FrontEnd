import 'next';

declare module 'next' {
  interface NextApiRequest {
    session?: import('next-auth').Session;
  }
}
