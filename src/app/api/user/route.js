import * as ApiResponseUtils from '@/utils/apiResponses';
import * as UserService from '@/app/services/user.service';
import crypto from 'crypto';

// Utility to generate password
function generatePassword(email) {
    // Hash the email using SHA-256 (or any secure hash)
    const hash = crypto.createHash("sha256").update(email).digest("hex");

    // Define character pools for password
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const specials = "!@#$%^&*()_+{}|:<>?";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";

    // Select characters based on hash values
    const upperChar = upper[parseInt(hash.substring(0, 2), 16) % upper.length];
    const specialChar = specials[parseInt(hash.substring(2, 4), 16) % specials.length];
    const lowerChar = lower[parseInt(hash.substring(4, 6), 16) % lower.length];
    const digitChar = digits[parseInt(hash.substring(6, 8), 16) % digits.length];

    // Create the password with a mix of characters
    const remainingChars = hash
        .substring(8, 16)
        .split("")
        .map((char, index) => {
            const pool = index % 2 === 0 ? lower : digits;
            return pool[parseInt(char, 16) % pool.length];
        });

    // Combine and shuffle
    let password = [upperChar, specialChar, lowerChar, digitChar, ...remainingChars].slice(0, 8);
    password = password.sort(() => Math.random() - 0.5).join("");

    return password;
}


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const referralToken = searchParams.get('referralToken');

    try {
        let result;
        if (referralToken) {
            // Fetch a user by referral token
            const userResult = await UserService.getByReferralToken({ referralToken });

            if (userResult.status === 'success') {
                result = ApiResponseUtils.createSuccessResponse('User fetched successfully', userResult.result);
                return ApiResponseUtils.sendSuccessResponse(result);
            } else {
                result = ApiResponseUtils.createErrorResponse(userResult?.message || 'User not found with the given referral token.');
                return ApiResponseUtils.sendErrorResponse(result);
            }
        } else {
            // Fetch all users if no referral token is provided
            const usersResult = await UserService.getAll();

            if (usersResult.result && usersResult.result.length > 0) {
                result = ApiResponseUtils.createSuccessResponse('Users fetched successfully', usersResult.result);
                return ApiResponseUtils.sendSuccessResponse(result);
            } else {
                result = ApiResponseUtils.createErrorResponse(userResult?.message || 'No users found.');
                return ApiResponseUtils.sendErrorResponse(result);
            }
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        const errorResp = ApiResponseUtils.createErrorResponse(error.message || 'Error fetching users.');
        return ApiResponseUtils.sendErrorResponse(errorResp);
    }
}

export async function PUT(request) {
    try {
        const reqBody = await request.json();

        const { email, userId, ...rest } = reqBody; // Extract data from the request body

        // Check if userId or email is provided
        if (!email) {
            const errorResult = ApiResponseUtils.createErrorResponse('email is required.');
            return ApiResponseUtils.sendErrorResponse(errorResult);
        }

        let updatedUserResult;

        // Decide which update function to call
        if (email) {
            updatedUserResult = await UserService.updateOne({ email, data: { ...rest } });
        }

        const successResult = ApiResponseUtils.createSuccessResponse('User updated successfully', updatedUserResult.result);
        return ApiResponseUtils.sendSuccessResponse(successResult);
    } catch (error) {
        console.error('Error updating user', error);
        const errorResp = ApiResponseUtils.createErrorResponse(error.message || 'Error updating user.');
        return ApiResponseUtils.sendErrorResponse(errorResp);
    }
}

export async function POST(request) {
    const data = await request.json(); // Parse the incoming request body

    if (!data?.email) {
        const errorResponse = ApiResponseUtils.createErrorResponse('Email is required.')
        return ApiResponseUtils.sendErrorResponse(errorResponse);
    }

    try {
        // Generate a password
        const password = generatePassword(data.email);
        data.password = password;

        // Add new user
        const userResult = await UserService.addByAdmin({ data });

        if (userResult.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(userResult.message || 'User created successfully', userResult.result)
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(userResult.message)
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }
    } catch (error) {
        console.error('Error adding new user:', error);
        const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
        return ApiResponseUtils.sendErrorResponse(errorResponse);
    }
}
