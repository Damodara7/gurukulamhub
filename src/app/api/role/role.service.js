import connectMongo from '@/utils/dbConnect-mongo'
import Role from './role.model.js'
import { validateRoleCreateRequestDto, validateRoleUpdateRequestDto } from './role.validator.js'
import { ROLES_LOOKUP } from '@/configs/roles-lookup'

// **Add Role**
export async function add({ data }) {
  try {
    // Validate the request body
    await validateRoleCreateRequestDto(data, { abortEarly: false })
  } catch (err) {
    console.error(err)
    return { status: 'error', message: err.message, result: null }
  }

  await connectMongo()
  try {
    // Create and save the new Role
    const newRole = new Role({
      ...data,
      isDeleted: false
    })
    await newRole.save()

    console.log('Role added successfully!')
    return { status: 'success', result: newRole, message: 'Role Added Successfully' }
  } catch (err) {
    console.error('Error adding Role:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Get Role By ID**
export async function getById({ id }) {
  await connectMongo()
  try {
    const role = await Role.findById({ _id: id, isDeleted: false })
    if (!role) {
      return { status: 'error', message: 'Role not found', result: null }
    }

    console.log('Role fetched successfully!')
    return { status: 'success', result: role }
  } catch (err) {
    console.error('Error fetching Role by ID:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Get All Roles**
export async function getAll({ activeOnly = false } = {}) {
  await connectMongo()
  try {
    const filter = { isDeleted: false }
    if (activeOnly) {
      filter.isActive = true
    }
    const roles = await Role.find(filter).sort({ createdAt: -1 })
    return { status: 'success', result: roles, message: 'Roles fetched successfully!' }
  } catch (err) {
    console.error('Error fetching Roles:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Update Role**
export async function updateOne({ id, data }) {
  // Validate the request body
  try {
    await validateRoleUpdateRequestDto(data, { abortEarly: false })
  } catch (err) {
    console.error(err)
    return { status: 'error', message: err.message, result: null }
  }

  await connectMongo()
  try {
    const existingRole = await Role.findOne({ _id: id, isDeleted: false })
    if (!existingRole) {
      return { status: 'error', message: 'Role not found or already deleted', result: null }
    }

    // Prevent deactivation of critical system roles
    if (data.isActive === false && existingRole.isActive !== false) {
      const criticalRoles = [ROLES_LOOKUP.SUPER_ADMIN, ROLES_LOOKUP.ADMIN, ROLES_LOOKUP.USER]
      if (criticalRoles.includes(existingRole.name)) {
        return {
          status: 'error',
          message: `Cannot deactivate critical role: ${existingRole.name}. This role is required for system functionality.`,
          result: null
        }
      }
    }

    // Track status change if isActive is being modified
    if (data.isActive !== undefined && data.isActive !== existingRole.isActive) {
      const now = new Date()
      data.statusChangedBy = data.updatedBy
      if (!data.$push) data.$push = {}
      data.$push.statusHistory = {
        status: data.isActive ? 'active' : 'inactive',
        changedBy: data.updatedBy,
        changedAt: now
      }
      if (data.isActive) {
        data.activatedAt = now
      } else {
        data.deactivatedAt = now
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(id, data, { new: true })
    if (!updatedRole) {
      return { status: 'error', message: 'Role not found', result: null }
    }

    console.log('Role updated successfully!')
    return { status: 'success', result: updatedRole, message: 'Role Updated Successfully' }
  } catch (err) {
    console.error('Error updating Role:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Toggle Role Active Status**
export async function toggleActive({ id, isActive, updatedBy }) {
  await connectMongo()
  try {
    const role = await Role.findOne({ _id: id, isDeleted: false })
    if (!role) {
      return { status: 'error', message: 'Role not found or already deleted', result: null }
    }

    const criticalRoles = [ROLES_LOOKUP.SUPER_ADMIN, ROLES_LOOKUP.ADMIN, ROLES_LOOKUP.USER]
    if (criticalRoles.includes(role.name) && !isActive) {
      return {
        status: 'error',
        message: `Cannot deactivate critical role: ${role.name}. This role is required for system functionality.`,
        result: null
      }
    }

    const now = new Date()
    const updateData = {
      isActive,
      updatedBy,
      statusChangedBy: updatedBy,
      $push: {
        statusHistory: {
          status: isActive ? 'active' : 'inactive',
          changedBy: updatedBy,
          changedAt: now
        }
      }
    }

    if (isActive) {
      updateData.activatedAt = now
    } else {
      updateData.deactivatedAt = now
    }

    const updatedRole = await Role.findByIdAndUpdate(id, updateData, { new: true })

    if (!updatedRole) {
      return { status: 'error', message: 'Role not found', result: null }
    }

    const statusText = isActive ? 'activated' : 'deactivated'
    console.log(`Role ${role.name} ${statusText} successfully!`)
    return {
      status: 'success',
      result: updatedRole,
      message: `Role "${role.name}" ${statusText} successfully`
    }
  } catch (err) {
    console.error('Error toggling role status:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

