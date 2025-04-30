
import {
  codes,
  log,
  execute,
  throwError,
  getModelByTenant  
} from '../../configs/index'

import  { userSchema}  from '../models/user.model'

export async function AddUser(userBody, tenantId) {
  log.info(`Add signature called with body ${userBody}`);
  //connect to the tenant database and define schema on it and get model on it.
  const User = getModelByTenant(tenantId, 'users', userSchema);
  // Execute takes a promise and return {null,response} if resolved and return {err,null} if rejected.
  const { err, response } = await execute(User.create(userBody));
  if (err || !response) {
    log.error(`User creation failed UserDao.js ${err.message}`);
    throwError(500, codes.CODE_1001);
  }
  log.info(`User created with response : ${response}`);
  return response;
}
