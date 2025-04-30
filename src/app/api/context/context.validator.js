export const validateCreateContextDto = (data) => {
  const errors = {};

  // Validate ID
  if (!data.id) {
    errors.id = 'ID is required';
  }

  // Validate Title
  if (!data.title) {
    errors.title = 'Title is required';
  }

  // Validate Language
  if (!data.lang || !data.lang.code || !data.lang.name) {
    errors.lang = 'Language code and name are required';
  }

  // Validate Description
  if (!data.description) {
    errors.description = 'Description is required';
  }

  // Validate CreatedBy
  if (!data.createdBy) {
    errors.createdBy = 'Created by is required';
  }

  // Validate ParentContextId (Custom logic based on isRoot)
  if (!data.isRoot && !data.parentContextId) {
    errors.parentContextId = 'Parent Context ID is required for non-root contexts';
  }

  // Validate ParentContextObjectId (Custom logic based on isRoot)
  if (!data.isRoot && !data.parentContextObjectId) {
    errors.parentContextObjectId = 'Parent Context Object ID is required for non-root contexts';
  }

  // Validate ContextType
  if (!data.contextType) {
    errors.contextType = 'Context Type is required';
  }

  // Validate Status
  if (!data.status) {
    errors.status = 'Status is required';
  }

  // Validate isRoot
  if (typeof data.isRoot !== 'boolean') {
    errors.isRoot = 'isRoot must be a boolean';
  }

  // Validate SchemaVersion
  if (!data.schemaVersion) {
    errors.schemaVersion = 'Schema Version is required';
  }

  // Return errors if any
  return errors;
};
