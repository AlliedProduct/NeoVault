const request = require('supertest');
const { app, db } = require('./server');

// Blackbox testing
describe('API Endpoints / Blackbox testing', () => {
    let sessionId = null;

    // Clean up after tests are done
    afterAll(async () => {
        if (sessionId) {
            await request(app)
                .post('/logout')
                .set('Cookie', sessionId)
                .expect(200);
        }
        await db.end();
    });

    // Log in before tests
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'testpass' });
        expect(res.statusCode).toEqual(200);
        sessionId = res.headers['set-cookie'][0].split(';')[0];
    });

// /api/login endpoint test
    describe('POST /api/login', () => {
        it('should authenticate user with correct credentials', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({ username: 'testuser', password: 'testpass' });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Login successful');
        });

        it('should reject user with incorrect credentials', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({ username: 'testuser', password: 'wrongpass' });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Invalid credentials');
        });
    });

// /api/username endpoint test
    describe('GET /api/username', () => {
        it('should retrieve the username for logged-in user', async () => {
            const res = await request(app)
                .get('/api/username')
                .set('Cookie', sessionId);
            //console.log('Session ID for /api/username:', sessionId);  // Debug, comment out for rn
            //console.log('Response:', res.body);  // Debug, comment out for rn
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('username');
        });
    });

    // /api/transactions endpoint test
    describe('GET /api/transactions', () => {
        it('should fetch the last 10 transactions for the authenticated user', async () => {
            const res = await request(app)
                .get('/api/transactions')
                .set('Cookie', sessionId);
            //console.log('Session ID for /api/transactions:', sessionId);  // Debug, comment out for rn
            //console.log('Response:', res.body);  // Debug, comment out for rn
            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBeLessThanOrEqual(10);
        });
    });

    // /api/register endpoint test
    describe('POST /api/register', () => {
        it('should register a new user', async () => {
            const testUsername = `user_${Date.now()}`;  // Dynamic username to prevent duplication errors
            const res = await request(app)
                .post('/api/register')
                .send({
                    username: testUsername,
                    password: 'newpassword',
                    email: `${testUsername}@test.com`,
                    phone: '1234567890',
                    address: '123 Test St'
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Registration successful');
        });
    });
    
 // /logout endpoint test
    describe('POST /logout', () => {
        it('should successfully logout the user', async () => {
            const res = await request(app)
                .post('/logout')
                .set('Cookie', sessionId);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Logged out successfully');
        });
    });

});


