<script>
    let tests = $state([]);
    let running = $state(false);
    let completed = $state(false);

    async function runTests() {
        running = true;
        completed = false;
        tests = [];

        // Test 1: Database Connection
        tests = [...tests, {
            name: 'Database Connection',
            status: 'running',
            message: 'Testing MongoDB connection...'
        }];

        try {
            const response = await fetch('/api/tasks');
            const data = await response.json();
            tests[0] = {
                ...tests[0],
                status: data.status === 'success' ? 'passed' : 'failed',
                message: data.status === 'success' 
                    ? 'Successfully connected to MongoDB' 
                    : `Connection failed: ${data.message}`
            };
        } catch (e) {
            tests[0] = {
                ...tests[0],
                status: 'failed',
                message: `Connection error: ${e.message}`
            };
        }

        // Test 2: Create Task
        tests = [...tests, {
            name: 'Create Task',
            status: 'running',
            message: 'Testing task creation...'
        }];

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Test Task',
                    description: 'This is a test task'
                })
            });
            const data = await response.json();
            tests[1] = {
                ...tests[1],
                status: data.status === 'success' ? 'passed' : 'failed',
                message: data.status === 'success'
                    ? 'Successfully created test task'
                    : `Failed to create task: ${data.message}`
            };
        } catch (e) {
            tests[1] = {
                ...tests[1],
                status: 'failed',
                message: `Creation error: ${e.message}`
            };
        }

        // Test 3: Read Tasks
        tests = [...tests, {
            name: 'Read Tasks',
            status: 'running',
            message: 'Testing task retrieval...'
        }];

        try {
            const response = await fetch('/api/tasks');
            const data = await response.json();
            tests[2] = {
                ...tests[2],
                status: data.status === 'success' ? 'passed' : 'failed',
                message: data.status === 'success'
                    ? `Successfully retrieved ${data.data.length} tasks`
                    : `Failed to retrieve tasks: ${data.message}`
            };
        } catch (e) {
            tests[2] = {
                ...tests[2],
                status: 'failed',
                message: `Retrieval error: ${e.message}`
            };
        }

        // Test 4: Update Task
        tests = [...tests, {
            name: 'Update Task',
            status: 'running',
            message: 'Testing task update...'
        }];

        try {
            // First get a task to update
            const getResponse = await fetch('/api/tasks');
            const getData = await getResponse.json();
            
            if (getData.status === 'success' && getData.data.length > 0) {
                const task = getData.data[0];
                const response = await fetch(`/api/tasks?id=${task._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed: true })
                });
                const data = await response.json();
                tests[3] = {
                    ...tests[3],
                    status: data.status === 'success' ? 'passed' : 'failed',
                    message: data.status === 'success'
                        ? 'Successfully updated test task'
                        : `Failed to update task: ${data.message}`
                };
            } else {
                tests[3] = {
                    ...tests[3],
                    status: 'failed',
                    message: 'No tasks available to update'
                };
            }
        } catch (e) {
            tests[3] = {
                ...tests[3],
                status: 'failed',
                message: `Update error: ${e.message}`
            };
        }

        // Test 5: Delete Task
        tests = [...tests, {
            name: 'Delete Task',
            status: 'running',
            message: 'Testing task deletion...'
        }];

        try {
            // First get a task to delete
            const getResponse = await fetch('/api/tasks');
            const getData = await getResponse.json();
            
            if (getData.status === 'success' && getData.data.length > 0) {
                const task = getData.data[0];
                const response = await fetch(`/api/tasks?id=${task._id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                tests[4] = {
                    ...tests[4],
                    status: data.status === 'success' ? 'passed' : 'failed',
                    message: data.status === 'success'
                        ? 'Successfully deleted test task'
                        : `Failed to delete task: ${data.message}`
                };
            } else {
                tests[4] = {
                    ...tests[4],
                    status: 'failed',
                    message: 'No tasks available to delete'
                };
            }
        } catch (e) {
            tests[4] = {
                ...tests[4],
                status: 'failed',
                message: `Deletion error: ${e.message}`
            };
        }

        // Test 6: Search and Filter
        tests = [...tests, {
            name: 'Search and Filter',
            status: 'running',
            message: 'Testing search and filter functionality...'
        }];

        try {
            const response = await fetch('/api/tasks?search=test&completed=true');
            const data = await response.json();
            tests[5] = {
                ...tests[5],
                status: data.status === 'success' ? 'passed' : 'failed',
                message: data.status === 'success'
                    ? 'Successfully tested search and filter'
                    : `Failed to search/filter tasks: ${data.message}`
            };
        } catch (e) {
            tests[5] = {
                ...tests[5],
                status: 'failed',
                message: `Search/filter error: ${e.message}`
            };
        }

        // Test 7: Sorting
        tests = [...tests, {
            name: 'Sorting',
            status: 'running',
            message: 'Testing sorting functionality...'
        }];

        try {
            const response = await fetch('/api/tasks?sortBy=createdAt&sortOrder=desc');
            const data = await response.json();
            tests[6] = {
                ...tests[6],
                status: data.status === 'success' ? 'passed' : 'failed',
                message: data.status === 'success'
                    ? 'Successfully tested sorting'
                    : `Failed to sort tasks: ${data.message}`
            };
        } catch (e) {
            tests[6] = {
                ...tests[6],
                status: 'failed',
                message: `Sorting error: ${e.message}`
            };
        }

        // Test 8: Pagination
        tests = [...tests, {
            name: 'Pagination',
            status: 'running',
            message: 'Testing pagination functionality...'
        }];

        try {
            const response = await fetch('/api/tasks?page=1&limit=5');
            const data = await response.json();
            tests[7] = {
                ...tests[7],
                status: data.status === 'success' ? 'passed' : 'failed',
                message: data.status === 'success'
                    ? `Successfully tested pagination (${data.data.length} items, ${data.pagination.totalPages} pages)`
                    : `Failed to paginate tasks: ${data.message}`
            };
        } catch (e) {
            tests[7] = {
                ...tests[7],
                status: 'failed',
                message: `Pagination error: ${e.message}`
            };
        }

        running = false;
        completed = true;
    }

    function getStatusColor(status) {
        switch (status) {
            case 'passed': return '#4CAF50';
            case 'failed': return '#f44336';
            case 'running': return '#2196F3';
            default: return '#666';
        }
    }
</script>

<main>
    <h1>API Test Suite</h1>

    <div class="controls">
        <button 
            onclick={runTests} 
            disabled={running}
            class="run-button"
        >
            {running ? 'Running Tests...' : 'Run Tests'}
        </button>
    </div>

    <div class="test-results">
        {#each tests as test}
            <div class="test-item">
                <div class="test-header">
                    <h3>{test.name}</h3>
                    <div 
                        class="status-indicator" 
                        style="background-color: {getStatusColor(test.status)}"
                    >
                        {test.status}
                    </div>
                </div>
                <p class="test-message">{test.message}</p>
            </div>
        {/each}
    </div>

    {#if completed}
        <div class="summary">
            <h2>Test Summary</h2>
            <p>
                Total Tests: {tests.length}<br>
                Passed: {tests.filter(t => t.status === 'passed').length}<br>
                Failed: {tests.filter(t => t.status === 'failed').length}
            </p>
        </div>
    {/if}
</main>

<style>
    main {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        font-family: system-ui, -apple-system, sans-serif;
    }

    h1 {
        text-align: center;
        color: #333;
        margin-bottom: 2rem;
    }

    .controls {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
    }

    .run-button {
        padding: 12px 24px;
        font-size: 1.1em;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .run-button:hover {
        background-color: #1976D2;
    }

    .run-button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }

    .test-results {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .test-item {
        background-color: #f5f5f5;
        border-radius: 4px;
        padding: 1rem;
    }

    .test-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .test-header h3 {
        margin: 0;
        color: #333;
    }

    .status-indicator {
        padding: 4px 8px;
        border-radius: 4px;
        color: white;
        font-size: 0.9em;
        text-transform: uppercase;
    }

    .test-message {
        margin: 0;
        color: #666;
        font-size: 0.9em;
    }

    .summary {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #e3f2fd;
        border-radius: 4px;
    }

    .summary h2 {
        margin: 0 0 1rem 0;
        color: #1976D2;
    }

    .summary p {
        margin: 0;
        line-height: 1.5;
    }
</style> 