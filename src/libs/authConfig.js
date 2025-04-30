
export const authConfig = {
  session: {
    strategy: 'jwt',
  },
  providers: [],
  secret: process.env.NEXTAUTH_SECRET

}
