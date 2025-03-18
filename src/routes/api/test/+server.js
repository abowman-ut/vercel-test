import { json } from '@sveltejs/kit';
import { getCollection } from '$lib/server/mongodb';

export async function GET() {
    try {
        const collection = await getCollection('test');
        
        // Create a test document if none exists
        const existingDoc = await collection.findOne({});
        if (!existingDoc) {
            await collection.insertOne({
                message: 'Hello from MongoDB!',
                timestamp: new Date(),
                test: true
            });
        }
        
        // Get the document
        const result = await collection.findOne({});
        return json({ status: 'success', data: result });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        return json({ status: 'error', message: error.message }, { status: 500 });
    }
} 