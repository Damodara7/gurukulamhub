// 'use server'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
// import {schedule, getTasks, validate} from 'node-cron'
import * as nodeCron from 'node-cron'

export function scheduleCleanupUnverifiedUsers() {
    nodeCron.schedule('0 0 * * *', async () => {
        console.log('Running cleanup unverified users...');
        try {
            const response = await RestApi.post(`${API_URLS.v0.CLEANUP}`)
            if (response.status === 'success') {
                console.log('Cleanup unverified users completed.');
            } else {
                console.error('Error in cleanup unverified users: ', response.message);
            }
            // console.log('Cleanup unverified users completed.');
        } catch (error) {
            console.error('Error in scheduled cleanup unverified users: ', error);
        }
    },
        {
            scheduled: true,
            timezone: "Asia/Kolkata"
        })
}


// 1. Schedule to run once every day at midnight (00:00) ---> '0 0 * * *'
// 2. to run at a specific time(e.g., 2:30 AM every day) ---> '30 2 * * *'
// 3. at 30th second of every minute(means for every minute) -> '30 * * * * *'
// 4. While node-cron does not directly support "every 30 seconds,"
//      you can work around this by setting a schedule that runs at both
//      the 30th and 0th seconds of each minute. ---> '0,30 * * * * *'
