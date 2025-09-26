'use server'

import * as UserService from '@/app/services/user.service'

export async function getAccountsWithMobile(mobile) {
    try {
        const result = await UserService.srvGetAccountsWithMobile(mobile)
        if (result.status === 'success') {
            return { result: [...result?.result?.map(account => ({ firstname: account.firstname, lastname: account.lastname, email: account.email, phone: account.phone }))], status: 'success', message: result.message };
        } else {
            return { result: null, status: 'error', message: result.message };
        }
    } catch (error) {
        console.error(error)
        return { status: 'error', result: null, message: error.message || 'An error occurred while fetching account details.' }
    }
}

export async function sendPhoneOtp(email, mobileValue, name) {
    try {
        if (mobileValue) {
            console.log('mobile otp sending.....')
            const result = await UserService.srvSendPhoneOtp(email, "91" + mobileValue, name)
            console.log('mobile otp sent.....')
            return { 
                success: true, 
                message: 'Otp sent.',
                result: {
                    testingOtp: result?.testingOtp || null
                }
            }
        } else {
            return { error: 'Failed to send otp.' }
        }
    } catch (error) {
        console.error(error)
        return { error: error.message || 'Something went wrong while sending otp.' }
    }
}
