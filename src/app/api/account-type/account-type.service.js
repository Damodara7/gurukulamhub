import connectMongo from '@/utils/dbConnect-mongo';
import AccountType from './account-type.model.js';
import { validateAccountTypeCreateRequestDto, validateAccountTypeUpdateRequestDto } from './account-type.validator.js';

// **Add AccountType**
export async function add({ data }) {
    try {
        // Validate the request body
        await validateAccountTypeCreateRequestDto(data, { abortEarly: false });
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        // Create and save the new AccountType
        const newAccountType = new AccountType({ ...data });
        await newAccountType.save();

        console.log('AccountType added successfully!');
        return { status: 'success', result: newAccountType, message: 'Account Type Added Successfully' };
    } catch (err) {
        console.error('Error adding AccountType:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get AccountType By ID**
export async function getById({ id }) {
    await connectMongo();
    try {
        const accountType = await AccountType.findById(id);
        if (!accountType) {
            return { status: 'error', message: 'Account Type not found', result: null };
        }

        console.log('AccountType fetched successfully!');
        return { status: 'success', result: accountType };
    } catch (err) {
        console.error('Error fetching AccountType by ID:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get All AccountTypes**
export async function getAll() {
    await connectMongo();
    try {
        const accountTypes = await AccountType.find().sort({ createdAt: -1 }); // Sort by createdAt descending
        return { status: 'success', result: accountTypes, message: 'Account Types fetched successfully' };
    } catch (err) {
        console.error('Error fetching AccountTypes:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Update AccountType**
export async function updateOne({ id, data }) {
    // Validate the request body
    try {
        validateAccountTypeUpdateRequestDto(data);
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        const updatedAccountType = await AccountType.findByIdAndUpdate(id, data, { new: true });
        if (!updatedAccountType) {
            return { status: 'error', message: 'Account Type not found', result: null };
        }

        console.log('AccountType updated successfully!');
        return { status: 'success', result: updatedAccountType, message: 'Account Type Updated Successfully' };
    } catch (err) {
        console.error('Error updating AccountType:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Delete AccountType**
export async function deleteOne({ id }) {
    await connectMongo();
    try {
        const deletedAccountType = await AccountType.findByIdAndDelete(id);
        if (!deletedAccountType) {
            return { status: 'error', message: 'Account Type not found', result: null };
        }

        console.log('AccountType deleted successfully!');
        return { status: 'success', result: deletedAccountType, message: 'Account Type Deleted Successfully' };
    } catch (err) {
        console.error('Error deleting AccountType:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

