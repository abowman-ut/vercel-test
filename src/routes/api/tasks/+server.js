import { json } from '@sveltejs/kit';
import { getCollection } from '$lib/server/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all tasks with pagination, filtering, and sorting
export async function GET({ url }) {
    try {
        const collection = await getCollection('tasks');
        
        // Get query parameters
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const completed = url.searchParams.get('completed');
        const search = url.searchParams.get('search');
        const sortBy = url.searchParams.get('sortBy') || 'createdAt';
        const sortOrder = url.searchParams.get('sortOrder') || 'desc';
        
        // Build query
        const query = {};
        if (completed !== null) {
            query.completed = completed === 'true';
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Validate sort parameters
        const validSortFields = ['title', 'description', 'completed', 'createdAt', 'updatedAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const sortDirection = sortOrder === 'asc' ? 1 : -1;

        // Get total count for pagination
        const total = await collection.countDocuments(query);
        
        // Get paginated and sorted results
        const tasks = await collection
            .find(query)
            .sort({ [sortField]: sortDirection })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        return json({ 
            status: 'success', 
            data: tasks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            sort: {
                field: sortField,
                order: sortOrder
            }
        });
    } catch (error) {
        console.error('MongoDB error:', error);
        return json({ status: 'error', message: error.message }, { status: 500 });
    }
}

// POST - Create a new task
export async function POST({ request }) {
    try {
        const { title, description = '' } = await request.json();
        
        // Enhanced validation
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return json({ 
                status: 'error', 
                message: 'Title is required and must be a non-empty string' 
            }, { status: 400 });
        }

        if (description && typeof description !== 'string') {
            return json({ 
                status: 'error', 
                message: 'Description must be a string' 
            }, { status: 400 });
        }

        const collection = await getCollection('tasks');
        const task = {
            title: title.trim(),
            description: description.trim(),
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(task);
        return json({ 
            status: 'success', 
            data: { ...task, _id: result.insertedId }
        }, { status: 201 });
    } catch (error) {
        console.error('MongoDB error:', error);
        return json({ status: 'error', message: error.message }, { status: 500 });
    }
}

// PUT - Update a task
export async function PUT({ request, url }) {
    try {
        const taskId = url.searchParams.get('id');
        if (!taskId) {
            return json({ status: 'error', message: 'Task ID is required' }, { status: 400 });
        }

        const updates = await request.json();
        
        // Validate updates
        if (updates.title !== undefined) {
            if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
                return json({ 
                    status: 'error', 
                    message: 'Title must be a non-empty string' 
                }, { status: 400 });
            }
            updates.title = updates.title.trim();
        }

        if (updates.description !== undefined && typeof updates.description !== 'string') {
            return json({ 
                status: 'error', 
                message: 'Description must be a string' 
            }, { status: 400 });
        }

        if (updates.completed !== undefined && typeof updates.completed !== 'boolean') {
            return json({ 
                status: 'error', 
                message: 'Completed must be a boolean' 
            }, { status: 400 });
        }

        const collection = await getCollection('tasks');
        
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(taskId) },
            { 
                $set: { 
                    ...updates,
                    updatedAt: new Date()
                } 
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return json({ status: 'error', message: 'Task not found' }, { status: 404 });
        }

        return json({ status: 'success', data: result });
    } catch (error) {
        console.error('MongoDB error:', error);
        return json({ status: 'error', message: error.message }, { status: 500 });
    }
}

// DELETE - Delete a task
export async function DELETE({ url }) {
    try {
        const taskId = url.searchParams.get('id');
        if (!taskId) {
            return json({ status: 'error', message: 'Task ID is required' }, { status: 400 });
        }

        const collection = await getCollection('tasks');
        const result = await collection.deleteOne({ _id: new ObjectId(taskId) });

        if (result.deletedCount === 0) {
            return json({ status: 'error', message: 'Task not found' }, { status: 404 });
        }

        return json({ status: 'success', message: 'Task deleted successfully' });
    } catch (error) {
        console.error('MongoDB error:', error);
        return json({ status: 'error', message: error.message }, { status: 500 });
    }
} 