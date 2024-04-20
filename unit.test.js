const request = require('supertest');
const { app, db } = require('./server');
const mysql = require('mysql2');

// Mocking the database connection
jest.mock('mysql2', () => {
    const mQuery = jest.fn();
    const mConnect = jest.fn();
    const mEnd = jest.fn();
    const mBeginTransaction = jest.fn();
    const mCommit = jest.fn();
    const mRollback = jest.fn();
    return {
        createConnection: jest.fn(() => ({
            connect: mConnect,
            query: mQuery,
            beginTransaction: mBeginTransaction,
            commit: mCommit,
            rollback: mRollback,
            end: mEnd
        }))
    };
});

// Mocking session middleware
app.use((req, res, next) => {
    req.session = { userId: 1 }; // Assume user is logged in with ID 1
    next();
});

describe('API Endpoints', () => {
    let db;
    let cookie;

    beforeAll(() => {
        db = mysql.createConnection();
    });

    afterAll(() => {
        db.end();
    });

//Domantas's Tests


    // Login before tests
    beforeAll(async () => {
        db.query.mockImplementation((sql, data, callback) => {
            callback(null, [{ id: 1 }], null);
        });
        const loginResponse = await request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'testpass' });
        cookie = loginResponse.headers['set-cookie'][0];
    });

// /api/login endpoint test after a succesfull login
    test('/api/login - POST - success', async () => {
        expect(cookie).toBeDefined();
        const response = await request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'testpass' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(db.query).toHaveBeenCalled();
    });

// /api/login endpoint test after a failed login
    test('/api/login - POST - failure', async () => {
        db.query.mockImplementation((sql, data, callback) => {
            callback(null, [], null); // Simulate user not found
        });
        const response = await request(app)
            .post('/api/login')
            .send({ username: 'wronguser', password: 'wrongpass' });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(db.query).toHaveBeenCalled();
    });

// /api/username endpoint test for an authenticated user
    test('/api/username - GET - authenticated', async () => {
        db.query.mockImplementation((sql, data, callback) => {
            callback(null, [{ username: 'testuser' }], null);
        });

        const response = await request(app)
            .get('/api/username')
            .set('Cookie', cookie);

        expect(response.status).toBe(200);
        expect(response.body.username).toBe('testuser');
        expect(db.query).toHaveBeenCalled();
    });

// /balance endpoint test
    describe('/balance - GET', () => {
        test('should fetch user balance if authenticated', async () => {
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, [{ balance: 100 }], null);
            });

            const response = await request(app)
                .get('/balance')
                .set('Cookie', cookie)
                .expect(200);

            expect(response.status).toBe(200);
            expect(response.body.balance).toBe(100);
        });

        test('should handle database errors', async () => {
            db.query.mockImplementation((sql, params, callback) => {
                callback(new Error('Database query failed'), null, null);
            });

            const response = await request(app)
                .get('/balance')
                .set('Cookie', cookie)
                .expect(500);

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Database query failed');
        });

        test('should return 401 if user not authenticated', async () => {
            
            app.use((req, res, next) => {
                req.session = {};
                next();
            });

            const response = await request(app)
                .get('/balance')
                .expect(401);

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('User not authenticated');
        });


        // NOJUS'S TESTSS

        // /api/tranfers endpoint test
        describe('/api/transfer - POST', () => {
            test('Successful transfer', async () => {
                db.beginTransaction.mockImplementation(cb => cb(null));
                db.query.mockImplementation((sql, params, callback) => {
                    if (sql.includes('SELECT balance FROM users')) {
                        callback(null, [{ balance: 1000 }], null);
                    } else if (sql.includes('UPDATE users SET balance')) {
                        callback(null, { affectedRows: 1 });
                    } else {
                        callback(null, { insertId: 1 });
                    }
                });
                db.commit.mockImplementation(cb => cb(null));
    
                const response = await request(app)
                    .post('/api/transfer')
                    .set('Cookie', cookie)
                    .send({ recipientUsername: 'recipient', amount: 100 });
    
                expect(response.statusCode).toEqual(200);
                expect(response.body.success).toBeTruthy();
            });
    
            test('Insufficient funds', async () => {
                db.beginTransaction.mockImplementation(cb => cb(null));
                db.query.mockImplementation((sql, params, callback) => {
                    if (sql.includes('SELECT balance FROM users')) {
                        callback(null, [{ balance: 50 }], null);
                    }
                });
    
                const response = await request(app)
                    .post('/api/transfer')
                    .set('Cookie', cookie)
                    .send({ recipientUsername: 'recipient', amount: 100 });
    
                expect(response.statusCode).toEqual(400);
                expect(response.body.error).toContain('Insufficient funds');
            });
        });

    // /api/topup endpoint test
        describe('/api/topup - POST', () => {
            test('Successful top-up', async () => {        
                db.query.mockImplementation((sql, params, callback) => {
                    console.log(`Mock SQL Query: ${sql}`);
                    if (sql.includes('SELECT balance FROM users')) {
                        callback(null, [{ balance: 100 }]); 
                    } else if (sql.includes('UPDATE users SET balance')) {
                        callback(null, { affectedRows: 1 });
                    } else if (sql.includes('INSERT INTO transactions')) {
                        callback(null, { insertId: 1 });
                    } else {
                        callback(null, []);
                    }
                });
        
                db.beginTransaction.mockImplementation((callback) => {
                    console.log("Mock Begin Transaction");
                    callback(null);
                });
        
                db.commit.mockImplementation((callback) => {
                    console.log("Mock Commit Transaction");
                    callback(null);
                });
        
                db.rollback.mockImplementation(() => {
                    console.log("Mock Rollback Transaction");
                });
        
                const response = await request(app)
                    .post('/api/topup')
                    .set('Cookie', cookie)
                    .send({ amount: 150 });
        
                expect(response.statusCode).toEqual(200);
                expect(response.body.success).toBeTruthy();
                expect(response.body.message).toContain('Balance updated successfully');
            });
        
            test('Negative top-up amount', async () => {
                const response = await request(app)
                    .post('/api/topup')
                    .set('Cookie', cookie)
                    .send({ amount: -100 });
        
                expect(response.status).toEqual(400);
                expect(response.body.error).toContain('Invalid amount');
            });
        });

        describe('Savings and User Details Endpoints', () => {
            // Test for fetching current savings and goal
            describe('/api/savings - GET', () => {
                test('should return user savings if authenticated', async () => {
                    db.query.mockImplementationOnce((sql, params, callback) => {
                        callback(null, [{ amount: 500, goal: 1000 }]);
                    });
        
                    const response = await request(app)
                        .get('/api/savings')
                        .set('Cookie', cookie);
        
                    expect(response.status).toBe(200);
                    expect(response.body.amount).toBe(500);
                    expect(response.body.goal).toBe(1000);
                });
        
                test('should return 401 if not authenticated', async () => {
                    app.use((req, res, next) => {
                        req.session = {};
                        next();
                    });
        
                    const response = await request(app).get('/api/savings');
                    expect(response.status).toBe(401);
                    expect(response.body.error).toBe('Not authenticated');
                });
        
                test('should handle database errors during savings fetch', async () => {
                    db.query.mockImplementationOnce((sql, params, callback) => {
                        callback(new Error('Database error'), null);
                    });
        
                    const response = await request(app)
                        .get('/api/savings')
                        .set('Cookie', cookie);
        
                    expect(response.status).toBe(500);
                    expect(response.body.error).toBe('Failed to fetch savings');
                });
            });
        
            // Test for adding to savings
            describe('/api/savings/add - POST', () => {
                test('should add to savings successfully', async () => {
                    db.query.mockImplementation((sql, params, callback) => {
                        if (sql.includes('SELECT amount FROM savings')) {
                            callback(null, [{ amount: 100 }]);
                        } else if (sql.includes('UPDATE savings')) {
                            callback(null, { affectedRows: 1 });
                        } else {
                            callback(null, { insertId: 1 });
                        }
                    });
        
                    const response = await request(app)
                        .post('/api/savings/add')
                        .set('Cookie', cookie)
                        .send({ amount: 200 });
        
                    expect(response.status).toBe(200);
                    expect(response.body.success).toBe(true);
                });
        
                test('should reject negative amounts', async () => {
                    const response = await request(app)
                        .post('/api/savings/add')
                        .set('Cookie', cookie)
                        .send({ amount: -100 });
        
                    expect(response.status).toBe(400);
                    expect(response.body.error).toBe("Invalid amount. Please enter a positive number.");
                });
            });
        
            // Test for setting or updating savings goal
            describe('/api/savings/set-goal - POST', () => {
                test('should set savings goal successfully', async () => {
                    db.query.mockImplementationOnce((sql, params, callback) => {
                        callback(null, { affectedRows: 1 });
                    });
        
                    const response = await request(app)
                        .post('/api/savings/set-goal')
                        .set('Cookie', cookie)
                        .send({ goal: 2000 });
        
                    expect(response.status).toBe(200);
                    expect(response.body.success).toBe(true);
                    expect(response.body.message).toBe("Savings goal set successfully");
                });
        
                test('should handle database errors when setting goal', async () => {
                    db.query.mockImplementationOnce((sql, params, callback) => {
                        callback(new Error('Database error'), null);
                    });
        
                    const response = await request(app)
                        .post('/api/savings/set-goal')
                        .set('Cookie', cookie)
                        .send({ goal: 2000 });
        
                    expect(response.status).toBe(500);
                    expect(response.body.error).toBe("Failed to set savings goal");
                });
            });
        
            // Test for fetching and updating user details
            describe('User Details Endpoints', () => {
                test('should fetch user details', async () => {
                    db.query.mockImplementationOnce((sql, params, callback) => {
                        callback(null, [{ email: 'user@example.com', phone: '1234567890', address: '123 Main St' }]);
                    });
        
                    const response = await request(app)
                        .get('/api/user/details')
                        .set('Cookie', cookie);
        
                    expect(response.status).toBe(200);
                    expect(response.body.email).toBe('user@example.com');
                    expect(response.body.phone).toBe('1234567890');
                    expect(response.body.address).toBe('123 Main St');
                });
        
                test('should update user details successfully', async () => {
                    db.query.mockImplementationOnce((sql, params, callback) => {
                        callback(null, { affectedRows: 1 });
                    });
        
                    const response = await request(app)
                        .post('/api/user/update')
                        .set('Cookie', cookie)
                        .send({ email: 'newuser@example.com', phone: '0987654321', address: '321 Main St' });
        
                    expect(response.status).toBe(200);
                    expect(response.body.success).toBe(true);
                    expect(response.body.message).toBe('User details updated successfully');
                });
            });
        });
    });
});
