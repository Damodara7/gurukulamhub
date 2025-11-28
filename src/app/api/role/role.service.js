import connectMongo from '@/utils/dbConnect-mongo';
import Role from './role.model.js'; // Import your Role model
import { validateRoleCreateRequestDto, validateRoleUpdateRequestDto } from './role.validator.js'; // Import your DTO schema
import User from '@/app/models/user.model.js';
import { ROLES_LOOKUP } from '@/configs/roles-lookup';
import * as UserService from '@/app/services/user.service.js';
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
        // First, get the role to check its name
        const roleToDelete = await Role.findById(id);
        if (!roleToDelete) {
            return { status: 'error', message: 'Role not found', result: null };
        }

        const roleName = roleToDelete.name;

        // Prevent deletion of critical/system roles
        const criticalRoles = [
            ROLES_LOOKUP.SUPER_ADMIN,
            ROLES_LOOKUP.ADMIN,
            ROLES_LOOKUP.USER
        ];

        if (criticalRoles.includes(roleName)) {
            return {
                status: 'error',
                message: `Cannot delete critical role: ${roleName}. This role is required for system functionality.`,
                result: null
            };
        }

        // Check how many users have this role
        const usersWithRole = await User.find({ roles: roleName });
        const affectedUserCount = usersWithRole.length;

        // Remove the role from all users who have it and send notifications
        let usersUpdated = 0;
        let emailsSent = 0;
        let emailsFailed = 0;

        if (affectedUserCount > 0) {
            // Update users and collect their remaining roles for notifications
            for (const user of usersWithRole) {
                try {
                    // Get remaining roles before removal
                    const remainingRoles = user.roles.filter(r => r !== roleName);
                    
                    // Remove the role from this user
                    await User.updateOne(
                        { _id: user._id },
                        { $pull: { roles: roleName } }
                    );
                    usersUpdated++;

                    // Send notification email to the user
                    try {
                        const notificationResult = await UserService.srvSendRoleRemovedNotification({
                            userEmail: user.email,
                            roleName: roleName,
                            remainingRoles: remainingRoles,
                            locale: 'en' // You can make this dynamic based on user preference
                        });
                        
                        if (notificationResult.status === 'success') {
                            emailsSent++;
                        } else {
                            emailsFailed++;
                            console.error(`Failed to send notification to ${user.email}:`, notificationResult.message);
                        }
                    } catch (emailError) {
                        emailsFailed++;
                        console.error(`Error sending notification email to ${user.email}:`, emailError);
                    }
                } catch (updateError) {
                    console.error(`Error updating user ${user.email}:`, updateError);
                }
            }
            
            console.log(`Removed role ${roleName} from ${usersUpdated} users. Sent ${emailsSent} notifications, ${emailsFailed} failed.`);
        }

        // Now delete the role
        const deletedRole = await Role.findByIdAndDelete(id);
        if (!deletedRole) {
            return { status: 'error', message: 'Role not found', result: null };
        }

        console.log('Role deleted successfully!');
        return {
            status: 'success',
            result: {
                deletedRole,
                affectedUsers: {
                    count: affectedUserCount,
                    updated: usersUpdated,
                    notificationsSent: emailsSent,
                    notificationsFailed: emailsFailed
                }
            },
            message: `Role deleted successfully. ${affectedUserCount > 0 ? `Removed from ${usersUpdated} user(s). ${emailsSent} notification(s) sent.` : 'No users were affected.'}`
        };
    } catch (err) {
        console.error('Error deleting Role:', err);
        return { status: 'error', message: err.message, result: null };
    }
}
