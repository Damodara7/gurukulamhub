'use server'

import * as UserService from '../app/services/user.service'
import crypto from 'crypto'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

export async function fetchDoesUserHasPassword(email) {
    const result = await RestApi.get(`${API_URLS.v0.USER}/${email}/does-password-exist`)
    return result
}

function generatePassword(email) {

    // Hash the email using SHA-256 (or any secure hash)
    const hash = crypto.createHash("sha256").update(email).digest("hex");
    // const hash = crypto.randomBytes(20).toString('hex');

    // Extract characters for each type
    const specials = "!@#$%^&*()_+{}|:<>?";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";

    // Select at least one character of each type
    const specialChar = specials[parseInt(hash.substring(0, 2), 16) % specials.length];
    const upperChar = upper[parseInt(hash.substring(2, 4), 16) % upper.length];
    const lowerChar = lower[parseInt(hash.substring(4, 6), 16) % lower.length];
    const digitChar = digits[parseInt(hash.substring(6, 8), 16) % digits.length];

    // Fill the remaining characters from the hash
    const remainingChars = hash
        .substring(8, 16)
        .split("")
        .map((char, index) => {
            const pool = index % 2 === 0 ? lower : digits; // Alternate lower and digits
            return pool[parseInt(char, 16) % pool.length];
        });

    // Combine and shuffle
    let password = [specialChar, upperChar, lowerChar, digitChar, ...remainingChars].slice(0, 8);
    password = password.sort(() => Math.random() - 0.5).join("");

    return password;
}

export async function addNewUser(data) {
    if (!data?.email) {
        return { result: null, status: 'error', message: 'Email is required.' };
    }
    // Check if user already exists
    try {
        // const existingUserResult = await UserService.getByEmail({ email: data.email })
        // if (existingUserResult.status === 'success') {
        //     return { result: null, status: 'error', message: 'User with this email already exists.' };
        // } else {
        // Generate a password
        const password = generatePassword(data.email);
        console.log({ password })
        data.password = password
        // Add new user
        console.log('Before adding user')
        const userResult = await UserService.addByAdmin({ data })
        console.log('After adding user')
        if (userResult.status === 'success') {
            console.log('User result was successful')
            return { result: userResult.result, status: 'success', message: userResult.message || 'User added successfully.' };
        } else {
            return { result: null, status: 'error', message: userResult.message };
        }
        // }
    } catch (error) {
        console.error('Error adding new user:', error)
        return { result: null, status: 'error', message: error.message || 'An error occurred while adding user.' };
    }
}

export async function getUserAndProfile({ email }) {
    const result = await RestApi.get(`${API_URLS.v0.USERS_PROFILE}/${email}`)
    return result
}
