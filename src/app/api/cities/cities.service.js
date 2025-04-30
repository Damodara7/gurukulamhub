import connectMongo from '@/utils/dbConnect-mongo';
import Cities from '../../models/cities.model';

export async function getCities(queryParams = {}) {
    await connectMongo()
    try {
        const cities = await Cities.find({ ...queryParams })
        console.log('Cities fetched:', cities)
        if (cities?.length > 0) {
            const finalResult = { status: 'success', result: cities, message: `${cities.length} cities found` }
            return finalResult
        } else if (cities?.length === 0) {
            const finalResult = { status: 'success', result: [], message: 'No cities found' }
            return finalResult
        } else {
            const finalResult = { status: 'error', result: {}, message: 'Unexpected error occurred' }
            return finalResult
        }
    } catch (err) {
        console.error('Error getting cities:', err)
        const finalResult = { status: 'error', result: {}, message: err.message }
        return finalResult
    }
}
