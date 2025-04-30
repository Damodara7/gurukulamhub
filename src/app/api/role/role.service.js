import connectMongo from '@/utils/dbConnect-mongo';
import Role from './role.model.js'; // Import your Role model
import { validateRoleCreateRequestDto, validateRoleUpdateRequestDto } from './role.validator.js'; // Import your DTO schema
// import * as ApiResponseUtils from '@/utils/apiResponses';

// **Add Role**
export async function add({ data }) {
    try {
        // Validate the request body
        await validateRoleCreateRequestDto(data, { abortEarly: false });
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        // Create and save the new Role
        const newRole = new Role({ ...data });
        await newRole.save();

        console.log('Role added successfully!');
        return { status: 'success', result: newRole, message: 'Role Added Successfully' };
    } catch (err) {
        console.error('Error adding Role:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get Role By ID**
export async function getById({ id }) {
    await connectMongo();
    try {
        const role = await Role.findById(id);
        if (!role) {
            return { status: 'error', message: 'Role not found' };
        }

        console.log('Role fetched successfully!');
        return { status: 'success', result: role, message: 'Role fetched Successfully' };
    } catch (err) {
        console.error('Error fetching Role by ID:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get All Roles**
export async function getAll() {
    await connectMongo();
    try {
        const roles = await Role.find().sort({ createdAt: -1 }); // Sort by createdAt descending
        return { status: 'success', result: roles, message: 'Roles fetched successfully!' };
    } catch (err) {
        console.error('Error fetching Roles:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Update Role**
export async function updateOne({ id, data }) {
    // Validate the request body
    try {
        await validateRoleUpdateRequestDto(data, { abortEarly: false });
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        const updatedRole = await Role.findByIdAndUpdate(id, data, { new: true });
        if (!updatedRole) {
            return { status: 'error', message: 'Role not found', result: null };
        }

        console.log('Role updated successfully!');
        return { status: 'success', result: updatedRole, message: 'Role Updated Successfully' };
    } catch (err) {
        console.error('Error updating Role:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Delete Role**
export async function deleteOne({ id }) {
    await connectMongo();
    try {
        const deletedRole = await Role.findByIdAndDelete(id);
        if (!deletedRole) {
            return { status: 'error', message: 'Role not found' };
        }

        console.log('Role deleted successfully!');
        return { status: 'success', result: deletedRole, message: 'Role Deleted Successfully' };
    } catch (err) {
        console.error('Error deleting Role:', err);
        return { status: 'error', message: err.message, result: null };
    }
}
