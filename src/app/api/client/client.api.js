'use server'

import * as RestApi from '@/utils/restApiUtil' // Assuming RestApi and ApiUrls are defined
import { API_URLS } from '@/configs/apiConfig'
// import * as permissionUtils from '@/utils/permissionUtils'
import { PERMISSIONS_LOOKUP } from '@/configs/permissions-lookup'
import { FEATURES_LOOKUP } from '@/configs/features-lookup'
import { checkFeaturePermission } from '@/libs/checkPermissions'

// const featurePermissions = [
//   { key: 'hasHomePermission', feature: FEATURES_LOOKUP.HOME },
//   { key: 'hasPublicQuizzesPermission', feature: FEATURES_LOOKUP.PUBLIC_QUIZZES },
//   { key: 'hasPublicGamesPermission', feature: FEATURES_LOOKUP.PUBLIC_GAMES },
//   { key: 'hasMyQuizzesPermission', feature: FEATURES_LOOKUP.MY_QUIZZES },
//   { key: 'hasMyGamesPermission', feature: FEATURES_LOOKUP.MY_GAMES },
//   { key: 'hasMyUtilitiesPermission', feature: FEATURES_LOOKUP.MY_UTILITIES },
//   { key: 'hasMyProgressPermission', feature: FEATURES_LOOKUP.MY_PROGRESS },
//   { key: 'hasMyProfilePermission', feature: FEATURES_LOOKUP.MY_PROFILE },
//   { key: 'hasReferEarnPermission', feature: FEATURES_LOOKUP.REFER_EARN },
//   { key: 'hasReviewQuizzesPermission', feature: FEATURES_LOOKUP.REVIEW_QUIZZES },
//   { key: 'hasReviewGamesPermission', feature: FEATURES_LOOKUP.REVIEW_GAMES },
//   { key: 'hasManageAdvtPermission', feature: FEATURES_LOOKUP.MANAGE_ADVT },
//   { key: 'hasManageQuizzesPermission', feature: FEATURES_LOOKUP.MANAGE_QUIZZES },
//   { key: 'hasManageGamesPermission', feature: FEATURES_LOOKUP.MANAGE_GAMES },
//   { key: 'hasManageEventsPermission', feature: FEATURES_LOOKUP.MANAGE_EVENTS },
//   { key: 'hasManageUsersPermission', feature: FEATURES_LOOKUP.MANAGE_USERS },
//   { key: 'hasRolesPermissionsPermission', feature: FEATURES_LOOKUP.ROLES_PERMISSIONS },
//   { key: 'hasFaqPermission', feature: FEATURES_LOOKUP.FAQ },
//   { key: 'hasRaiseSupportPermission', feature: FEATURES_LOOKUP.RAISE_SUPPORT },
//   { key: 'hasDonationPermission', feature: FEATURES_LOOKUP.DONATION },
// ];

// const ACTIONS = Object.values(PERMISSIONS_LOOKUP);

// const permissions = Promise.all(
//   featurePermissions.map(({ key, feature }) => {
//     // Use .then() to handle the session asynchronously
//     return auth()
//       .then(session => {
//         const userRoles = session?.user?.roles || ['USER']; // Extract roles from session

//         // Fetch roles asynchronously for each feature using .then() and .catch()
//         return getAllRoles()
//           .then(rolesResult => {
//             let roles = ['USER']; // Default role
//             if (rolesResult.status === 'success') {
//               roles = rolesResult.result || ['USER']; // If roles are fetched successfully
//             }

//             // Map over the actions and create permission entries
//             return ACTIONS.map(action => [
//               `${key}${action}`, // Append the action to the key, e.g., hasHomePermissionVIEW
//               permissionUtils.hasPermission(roles, userRoles, feature, PERMISSIONS_LOOKUP[action]),
//             ]);
//           })
//           .catch(error => {
//             console.error('Error fetching roles:', error);
//             // Handle the case where the role fetch fails
//             return ACTIONS.map(action => [
//               `${key}${action}`,
//               false, // You can set a default value if the fetch fails, or handle as needed
//             ]);
//           });
//       })
//       .catch(error => {
//         console.error('Error during session fetch:', error);
//         return ACTIONS.map(action => [
//           `${key}${action}`,
//           false, // Default permission if auth fails
//         ]);
//       });
//   })
// )
//   .then(results => {
//     // Flatten the results from the map
//     return Object.fromEntries(results.flat());
//   })
//   .catch(error => {
//     console.error('Error in generating permissions:', error);
//     return {}; // Return an empty object in case of an error
//   });



// // Organize permissions into a structured, nested object
// const organizedPermissions = featurePermissions.reduce((acc, { key }) => {
//   acc[key] = ACTIONS.reduce((featureAcc, action) => {
//     const permissionKey = `${key}${action}`;
//     featureAcc[action] = permissions[permissionKey] || false; // Default to false if permission is undefined
//     return featureAcc;
//   }, {});
//   return acc;
// }, {});

// // Example usage:
// console.log(organizedPermissions.hasHomePermission[FEATURES_LOOKUP.VIEW]); // Access VIEW permission for HOME
// console.log(organizedPermissions.hasPublicQuizzesPermission[FEATURES_LOOKUP.CREATE]); // Access CREATE permission for PUBLIC_QUIZZES


export async function invokeWebService(methodName, serviceName, reqBody) {
  try {
    const finalReqBody = { methodName, serviceName, reqBody };
    const result = await RestApi.post(`${API_URLS.v0.CLIENT_API}`, finalReqBody);
    if (result?.status === 'success') {
      console.log('invokeWebService Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error invoking web service:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

// ************************* START OF "GAME" APIs *************************
export async function getGameWithPin(gamePin) {
  try {
    const methodName = 'getByGamePin';
    const serviceName = 'GamesLiveService';
    const reqBody = { gamePin };

    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('GamePin Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching game by pin:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getGameWithId(id) {
  try {
    const methodName = 'getById';
    const serviceName = 'GamesLiveService';
    const reqBody = { id };

    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Game Id Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching game by ID:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}
// ************************* END OF "GAME" APIs *************************


// ************************* START OF "FEATURE" APIs *************************
export async function getFeatureById(id) {
  try {
    const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.ROLES_PERMISSIONS, PERMISSIONS_LOOKUP.VIEW)
    if (featurePermissionResult.status === 'error') {
      return { status: 'error', message: featurePermissionResult.message, result: null };
    }
    const methodName = 'getById';
    const serviceName = 'FeatureService';
    const reqBody = { id };

    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Feature Id Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching feature by ID:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getAllFeatures() {
  try {
    const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.ROLES_PERMISSIONS, PERMISSIONS_LOOKUP.VIEW)
    if (featurePermissionResult.status === 'error') {
      return { status: 'error', message: featurePermissionResult.message, result: null };
    }
    const methodName = 'getAll';
    const serviceName = 'FeatureService';
    const reqBody = {};
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('All Features Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching all features:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function addFeature(data) {
  try {
    const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.ROLES_PERMISSIONS, PERMISSIONS_LOOKUP.CREATE)
    if (featurePermissionResult.status === 'error') {
      return { status: 'error', message: featurePermissionResult.message, result: null };
    }
    const methodName = 'add';
    const serviceName = 'FeatureService';
    const reqBody = { data: data };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Feature Added result', result);
    }
    return result;
  } catch (error) {
    console.error('Error adding feature:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function updateFeature(id, data) {
  try {
    const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.ROLES_PERMISSIONS, PERMISSIONS_LOOKUP.UPDATE)
    if (featurePermissionResult.status === 'error') {
      return { status: 'error', message: featurePermissionResult.message, result: null };
    }
    const methodName = 'updateOne';
    const serviceName = 'FeatureService';
    const reqBody = { id: id, data: data };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Feature Updated result', result);
    }
    return result;
  } catch (error) {
    console.error('Error updating feature:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function deleteFeature(id) {
  try {
    const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.ROLES_PERMISSIONS, PERMISSIONS_LOOKUP.DELETE)
    if (featurePermissionResult.status === 'error') {
      return { status: 'error', message: featurePermissionResult.message, result: null };
    }
    const methodName = 'deleteOne';
    const serviceName = 'FeatureService';
    const reqBody = { id };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Feature Deleted result', result);
    }
    return result;
  } catch (error) {
    console.error('Error deleting feature:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}
// ************************* END OF "FEATURE" APIs *************************


// ************************* START OF "ROLE" APIs *************************
export async function getRoleById(id) {
  try {
    const methodName = 'getById';
    const serviceName = 'RoleService';
    const reqBody = { id };

    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Role Id Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching role by ID:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getAllRoles() {
  try {
    const methodName = 'getAll';
    const serviceName = 'RoleService';
    const reqBody = {};
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('All Roles Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching all roles:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function addRole(data) {
  try {
    const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.ROLES_PERMISSIONS, PERMISSIONS_LOOKUP.CREATE)
    if (featurePermissionResult.status === 'error') {
      return { status: 'error', message: featurePermissionResult.message, result: null };
    }
    const methodName = 'add';
    const serviceName = 'RoleService';
    const reqBody = { data: data };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Role Added result', result);
    }
    return result;
  } catch (error) {
    console.error('Error adding role:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function updateRole(id, data) {
  try {
    const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.ROLES_PERMISSIONS, PERMISSIONS_LOOKUP.UPDATE)
    if (featurePermissionResult.status === 'error') {
      return { status: 'error', message: featurePermissionResult.message, result: null };
    }
    const methodName = 'updateOne';
    const serviceName = 'RoleService';
    const reqBody = { id: id, data: data };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Role Updated result', result);
    }
    return result;
  } catch (error) {
    console.error('Error updating role:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function deleteRole(id) {
  try {
    const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.ROLES_PERMISSIONS, PERMISSIONS_LOOKUP.DELETE)
    if (featurePermissionResult.status === 'error') {
      return { status: 'error', message: featurePermissionResult.message, result: null };
    }
    const methodName = 'deleteOne';
    const serviceName = 'RoleService';
    const reqBody = { id };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Role Deleted result', result);
    }
    return result;
  } catch (error) {
    console.error('Error deleting role:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}
// ************************* END OF "ROLE" APIs *************************


// ************************* START OF "USER-PROFILE" APIs *************************
export async function getUserProfileById(id) {
  try {
    const methodName = 'getById';
    const serviceName = 'UserProfileService';
    const reqBody = { id };

    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Profile by Id Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching user profile by ID:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getUserProfileByEmail(email) {
  try {
    const methodName = 'getByEmail';
    const serviceName = 'UserProfileService';
    const reqBody = { email };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Profile By Email Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching user profile by email:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getAllUserProfiles() {
  try {
    const methodName = 'getAll';
    const serviceName = 'UserProfileService';
    const reqBody = {};
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('All User Profiles Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching all user profiles:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function addUserProfile(data) {
  try {
    const methodName = 'add';
    const serviceName = 'UserProfileService';
    const reqBody = { data: data };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Profile Added result', result);
    }
    return result;
  } catch (error) {
    console.error('Error adding user profile:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function updateUserProfile(email, data) {
  try {
    // const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.MY_PROFILE, PERMISSIONS_LOOKUP.UPDATE)
    // if (featurePermissionResult.status === 'error') {
    //   return { status: 'error', message: featurePermissionResult.message, result: null };
    // }
    const methodName = 'updateOne';
    const serviceName = 'UserProfileService';
    const reqBody = { email: email, data: data };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Profile Updated result', result);
    }
    return result;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function updateReferral(email, data) {
  try {
    const methodName = 'updateReferral';
    const serviceName = 'UserProfileService';
    const reqBody = { email: email, data: data };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Profile Updated result', result);
    }
    return result;
  } catch (error) {
    console.error('Error updating referral:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function addOrUpdateUserProfile(data) {
  try {
    const methodName = 'addOrUpdate';
    const serviceName = 'UserProfileService';
    const { email, ...restData } = data;
    const reqBody = { email: email, data: restData };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Profile Updated result', result);
    }
    return result;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function deleteUserProfile(email) {
  const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.MY_PROFILE, PERMISSIONS_LOOKUP.DELETE)
  if (featurePermissionResult.status === 'error') {
    return { status: 'error', message: featurePermissionResult.message, result: null };
  }
  try {
    const methodName = 'deleteOne';
    const serviceName = 'UserProfileService';
    const reqBody = { email };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Profile Deleted result', result);
    }
    return result;
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function addWorkingPosition(email, workingPosition) {
  try {
    const methodName = 'addWorkingPosition';
    const serviceName = 'UserProfileService';
    const reqBody = { email: email, workingPosition: workingPosition };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Working Position Added result', result);
    }
    return result;
  } catch (error) {
    console.error('Error adding working position:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getAllWorkingPositions(email) {
  try {
    const methodName = 'getAllWorkingPositions';
    const serviceName = 'UserProfileService';
    const reqBody = { email: email };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('All Working Positions Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching all working positions:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function addLanguage(email, language) {
  try {
    const methodName = 'addLanguage';
    const serviceName = 'UserProfileService';
    const reqBody = { email: email, language: language };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Language Added result', result);
    }
    return result;
  } catch (error) {
    console.error('Error adding language:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getAllLanguages(email) {
  try {
    const methodName = 'getAllLanguages';
    const serviceName = 'UserProfileService';
    const reqBody = { email: email };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('All Languages Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching all languages:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function addAssociatedOrganization(email, organization) {
  try {
    const methodName = 'addAssociatedOrganization';
    const serviceName = 'UserProfileService';
    const reqBody = { email: email, organization: organization };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('Associated Organization Added result', result);
    }
    return result;
  } catch (error) {
    console.error('Error adding associated organization:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getAllAssociatedOrganizations(email) {
  try {
    const methodName = 'getAllAssociatedOrganizations';
    const serviceName = 'UserProfileService';
    const reqBody = { email: email };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('All Associated Organizations Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching all associated organizations:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function addSchool(email, school) {
  try {
    const methodName = 'addSchool';
    const serviceName = 'UserProfileService';
    const reqBody = { email: email, school: school };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('School Added result', result);
    }
    return result;
  } catch (error) {
    console.error('Error adding school:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getAllSchools(email) {
  try {
    const methodName = 'getAllSchools';
    const serviceName = 'UserProfileService';
    const reqBody = { email: email };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('All Schools Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching all schools:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}
// ************************* END OF "ROLE" APIs *************************


// ************************* START OF "USER" APIs *************************
export async function getUserById(id) {
  try {
    const methodName = 'getById';
    const serviceName = 'UserService';
    const reqBody = { id };

    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Id Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getUserByEmail(email) {
  try {
    const methodName = 'getByEmail';
    const serviceName = 'UserService';
    const reqBody = { email: email };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Email Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getUserByReferralToken(referralToken) {
  try {
    const methodName = 'getByReferralToken';
    const serviceName = 'UserService';
    const reqBody = { referralToken: referralToken };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Referral Token Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching user by referral token:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function getAllUsers() {
  try {
    const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.MANAGE_USERS, PERMISSIONS_LOOKUP.VIEW)
    if (featurePermissionResult.status === 'error') {
      return { status: 'error', message: featurePermissionResult.message, result: null };
    }
    const methodName = 'getAll';
    const serviceName = 'UserService';
    const reqBody = {};
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('All Users Fetched result', result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching all users:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function addUser(data) {
  try {
    const methodName = 'add';
    const serviceName = 'UserService';
    const reqBody = { data: data };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Added result', result);
    }
    return result;
  } catch (error) {
    console.error('Error adding user:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function addOrUpdateUser(data) {
  try {
    const methodName = 'addOrUpdate';
    const serviceName = 'UserService';
    const { email, ...restData } = data
    const reqBody = { email, data: restData };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Added or Updated result', result);
    }
    return result;
  } catch (error) {
    console.error('Error adding or updating user:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function updateUser(email, data) {
  try {
    const methodName = 'updateOne';
    const serviceName = 'UserService';
    const reqBody = { email: email, data: data };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Updated result', result);
    }
    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function deleteUser(email) {
  try {
    const featurePermissionResult = await checkFeaturePermission(FEATURES_LOOKUP.MANAGE_USERS, PERMISSIONS_LOOKUP.DELETE)
    if (featurePermissionResult.status === 'error') {
      return { status: 'error', message: featurePermissionResult.message, result: null };
    }
    const methodName = 'deleteOne';
    const serviceName = 'UserService';
    const reqBody = { email };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Deleted result', result);
    }
    return result;
  } catch (error) {
    console.error('Error deleting user:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function addOrUpdateUserByGoogleSignin(data) {
  try {
    const methodName = 'addByGoogleSignin';
    const serviceName = 'UserService';
    const { email, ...restData } = data
    const reqBody = { email, data: restData };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Added by Google Signin result', result);
    }
    return result;
  } catch (error) {
    console.error('Error adding user by Google Signin:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function loginUser(email, password) {
  try {
    const methodName = 'login';
    const serviceName = 'UserService';
    const reqBody = { email, password };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      // console.log('User Logged In result', result);
    }
    return result;
  } catch (error) {
    console.error('Error logging in user:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}

export async function sendReferralLink(fromEmail, toEmail) {
  try {
    const methodName = 'srvSendReferralLink';
    const serviceName = 'UserService';
    const reqBody = { fromEmail, toEmail };
    const result = await invokeWebService(methodName, serviceName, reqBody);
    if (result?.status === 'success') {
      console.log('Referral Link Sent result', result);
    }
    return result;
  } catch (error) {
    console.error('Error sending referral link:', error);
    return { status: 'error', message: error.message || 'An error occurred', result: null };
  }
}
// ************************* END OF "USER" APIs *************************
