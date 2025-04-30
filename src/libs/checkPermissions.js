import { authOptions } from '@/libs/auth';
import * as permissionUtils from '@/utils/permissionUtils';
import * as clientApi from '@/app/api/client/client.api';
// import { getSession } from 'next-auth/react';
import NextAuth from 'next-auth'
import { authConfig } from '@/libs/authConfig'
import * as RestApi from '@/utils/restApiUtil';
import { API_URLS } from '@/configs/apiConfig';

const { auth } = NextAuth(authConfig)

// Singleton to cache roles fetching
let rolesPromise = null;

const fetchRoles = async () => {
    if (!rolesPromise) {
        // rolesPromise = clientApi.getAllRoles().then(response => response?.result || ['USER']);
        const rolesResult = await RestApi.get(`${API_URLS.v0.ROLE}`)
        rolesPromise = rolesResult.result || null;
    }
    return rolesPromise;
};

export const checkFeaturePermission = async (feature, action) => {
    try {
        const session = await auth();
        if (!session) {
            return { status: 'error', message: 'Unauthorized', result: null };
        }
        console.log({ session })

        // const userResult = await clientApi.getUserByEmail(session.email)
        const userResult = await RestApi.get(`${API_URLS.v0.USER}/${session.user.email}`)

        const userRoles = userResult?.result?.roles || ['USER'];
        console.log('userRoles:', userRoles);

        // Fetch roles (using lazy initialization)
        let cachedRoles = await fetchRoles();
        if (!cachedRoles) {
            cachedRoles = ['USER']
        }

        console.log('cachedRoles:', cachedRoles);

        const hasPermission = permissionUtils.hasPermission(
            cachedRoles,
            userRoles,
            feature,
            action
        );

        console.log('feature:', feature);
        console.log('action:', action);
        console.log('hasPermission:', hasPermission);

        if (!hasPermission) {
            console.log('No permission');
            return { status: 'error', message: 'Access Denied', result: null };
        }

        console.log('Permission granted');
        return { status: 'success', message: 'Has Access', result: hasPermission };
    } catch (error) {
        console.error('Permission check error:', error);
        return { status: 'error', message: 'Internal Server Error', result: null };
    }
};



// // import { authOptions } from '@/libs/auth'; // Ensure this points to your NextAuth configuration
// // import * as permissionUtils from '@/utils/permissionUtils';
// // import * as clientApi from '@/app/api/client/client.api';
// // import { getSession } from 'next-auth/react';

// // export const checkPermissions = async (feature, action) => {
// //     try {
// //         // Use the request context to fetch the session
// //         const session = await getSession(authOptions);
// //         if (!session) {
// //             return { status: 'error', message: 'Unauthorized', result: null };
// //         }

// //         const userRoles = session.user.roles || ['USER'];
// //         console.log('userRoles:', userRoles);

// //         const rolesResponse = await clientApi.getAllRoles();
// //         const roles = rolesResponse?.result || ['USER'];

// //         // Check for permissions
// //         const hasPermission = permissionUtils.hasPermission(
// //             roles,
// //             userRoles,
// //             feature,
// //             action
// //         );

// //         if (!hasPermission) {
// //             return { status: 'error', message: 'Access Denied', result: null };
// //         }

// //         return { status: 'success', message: 'Has Access', result: hasPermission };
// //     } catch (error) {
// //         console.error('Permission check error:', error);
// //         return { status: 'error', message: 'Internal Server Error', result: null };
// //     }
// // };

