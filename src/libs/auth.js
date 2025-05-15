// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import * as RestApi from '@/utils/restApiUtil'
import NextAuth from 'next-auth'
import { authConfig } from './authConfig'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '@/app/api/client/client.api'

//const prisma = new PrismaClient()

export const authOptions = {
  ...authConfig,
  // adapter: PrismaAdapter(prisma),

  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      // name: 'Credentials',
      // type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      // credentials: {},
      async authorize(credentials) {
        /*
         * You need to provide your own logic here that takes the credentials submitted and returns either
         * an object representing a user or value that is false/null if the credentials are invalid.
         * For e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
         * You can also use the `req` object to obtain additional parameters (i.e., the request IP address)
         */
        console.log('credentials')
        const { email, password, mobile, loginMethod } = credentials

        if (loginMethod === 'mobile') {
          try {
            const result = await RestApi.post(`${API_URLS.v0.USERS_MOBILE_LOGIN}`, {email})
            // const result = await clientApi.getUserProfileByEmail(email)
            console.log('result of mobile signin: ', result)
            if (result?.status === 'success') {
              const { profile, user } = result?.result
              let userData = { id: profile?._id, firstname: profile?.firstname, lastname: profile?.lastname, email: profile?.email, image: profile?.image, phone: profile?.phone, name: profile?.firstname + " " + profile?.lastname }
              console.log('user data to be send to session: ', userData)
              return userData
            } else {
              throw new Error(result?.message)
            }
          } catch (e) {
            throw new Error(e?.message)
          }
        }
        else {
          try {
            // ** Login API Call to match the user credentials and receive user data in response along with his role
            const result = await RestApi.post(API_URLS.v0.USERS_LOGIN, { email, password })
            // const result = await clientApi.loginUser(email, password)

            console.log('CREDENTIALS LOGIN RESULT in auth.js : ', result)
            if (result?.status === 'success') {
              // ** Set the user data in the session
              // console.log('User result in credentials signin in auth.js :', result.result)
              return result.result

            } else {
              throw new Error(result?.message)
              // return { error: result?.message }
            }

            /*
             * Please unset all the sensitive information of the user either from API response or before returning
             * user data below. Below return statement will set the user object in the token and the same is set in
             * the session which will be accessible all over the app.
             */
            //}
          } catch (e) {
            throw new Error(e?.message)
            // return { error: e?.message }
          }
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent'
        }
      },
    })

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user, trigger, session }) {
      // console.log('TOKEN: ', token);
      // console.log('USER: ', user);
      if (token.email) {
        try {
          const result = await RestApi.get(`${API_URLS.v0.USERS_PROFILE}/${token.email}`)
          // const result = await clientApi.getUserProfileByEmail(token.email)
          const { profile, user } = result?.result
          if (result?.status === 'success') {
            token.id = user?._id
            token.roles = user?.roles
            token.geoRoles = user?.geoRoles
            token.referralToken = user?.referralToken
            token.loginCount = user?.loginCount
            token.memberId = user?.memberId
            token.name = profile?.firstname + " " + profile?.lastname
            token.firstname = profile?.firstname
            token.lastname = profile?.lastname
            token.image = profile?.image
          } else {
            console.log("Error fetching user profile data for jwt", result?.message)
          }
        } catch (error) {
          console.log("Error fetching user profile data for jwt(catch): ", error)
        }
      }

      if (trigger === 'update' && session) {
        console.log("$$$$$$$$$$ Trigger update $$$$$$", session.currentGameId)
        token.currentGameId = session.currentGameId;
      }
      return token
    },
    async session({ session, token, trigger, newSession }) {
      //currentlyl not working in nextauth v5 beta.
      if (trigger === "update") {
        // Make sure the updated value is reflected on the client
        session.currentGameId = token.currentGameId
        // console.log(" %%%%%%%%%%% Updated the session.name  %%%%%%%%%%% ",session.currentGameId)
      }

      /*************** */
      //NOTE : if the token.currentGameId exists then only it will set .no invalid values like null appear.
      session.currentGameId = token.currentGameId;
      /************ */

      if (session.user) {
        session.user.name = token.name
        session.user.email = token.email
        if (token.firstname) {
          session.user.firstname = token.firstname
        }
        if (token.lastname) {
          session.user.lastname = token.lastname
        }
        if (token.image) {
          session.user.image = token.image
        }
        if (token.roles) {
          session.user.roles = token.roles
        }
        if (token.geoRoles) {
          session.user.geoRoles = token.roles
        }
        if (token.referralToken) {
          session.user.referralToken = token.referralToken
        }
        if (token.memberId) {
          session.user.memberId = token.memberId
        }
        if (token.loginCount) {
          session.user.loginCount = token.loginCount
        }
      }

      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // return true
        if (user) {
          // Create or Update User
          console.log('USER IN GOOGLE SIGNIN: ', user)
          try {
            const nameParts = user?.name.trim().split(' ')
            const lastname = nameParts?.pop() // Removes and returns the last word
            const firstname = nameParts?.join(' ')

            let data = {
              email: user?.email
            }
            if (firstname) {
              data.firstname = firstname
            }
            if (lastname) {
              data.lastname = lastname
            }
            if (user.image) {
              data.image = user.image
            }

            console.log(data)

            const result = await RestApi.post(API_URLS.v0.USERS_SIGNIN_WITH_GOOGLE, data)
            // const result = await clientApi.addOrUpdateUserByGoogleSignin(data)

            console.log('USERS_SIGNIN_WITH_GOOGLE user creation Result is....', result)

            if (result?.status === 'success') {

            } else {
              console.error('User profile create/update failed.', result?.message)
              return false
              // throw new Error(result?.message || 'Signup error')
            }
          } catch (err) {
            console.error('Signup Error (catch block):', err)
          }
          console.log('RETURNING TRUE FOR GOOGLE SIGNIN')

          return true
        }
        console.log('RETURNING FALSE FOR GOOGLE SIGNIN')
        return false
      }
      if (account?.provider === 'credentials') {
        if (user) {
          console.log('RETURNING TRUE FOR CREDENTIALS SIGNIN')
          return true
        }
        return false
      }
      return true
    }
  },
  pages: {
    signIn: '/login'
  },

  secret: process.env.NEXTAUTH_SECRET
}

export const { signIn, signOut, handlers, auth } = NextAuth({ ...authOptions })
