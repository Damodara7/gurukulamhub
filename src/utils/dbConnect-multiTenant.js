import { log, mongodb, throwError, codes } from '../configs/index'

/**
 * Creating New MongoDb Connection obect by Switching DB
 */
export const getTenantDB = (tenantId, modelName, schema) => {
  const dbName = `squizme_${tenantId}`;
  if (mongodb) {
    // useDb will return new connection
    const db = mongodb.useDb(dbName, { useCache: true });
    log.info(`DB switched to ${dbName}`);
    db.model(modelName, schema);
    return db;
  }
  return throwError(500, codes.CODE_8004);
};

/**
 * Return Model as per tenant
 */
export const getModelByTenant = (tenantId, modelName, schema) => {
  log.info(`getModelByTenant tenantId : ${tenantId}.`);
  const tenantDb = getTenantDB(tenantId, modelName, schema);
  return tenantDb.model(modelName);
};
