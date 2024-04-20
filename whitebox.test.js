const request = require('supertest');
const { app, db } = require('./server');

// Whitebox testing
describe('White Box Tests', () => {

    // /api/login endpoint test
    describe('/api/login endpoint', () => {
        test('It should handle incorrect credentials', async () => {
            const response = await request(app).post('/api/login').send({ username: 'wrong', password: 'wrong' });
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Invalid credentials');
        });
    });

    // Middleware / User Authentication test
    describe('Middleware', () => {
        const mockRequest = {};
        const mockResponse = {
          redirect: jest.fn(),
          set: jest.fn(),
          send: jest.fn()
        };
        const nextFunction = jest.fn();
      
        test('should redirect to login if not authenticated', () => {
          const middleware = (req, res, next) => {
            if (!req.isAuthenticated) {
              res.redirect('/login.html');
            } else {
              next();
            }
          };
      
          middleware(mockRequest, mockResponse, nextFunction);
      
          expect(mockResponse.redirect).toHaveBeenCalledWith('/login.html');
        });
      
        test('should call next if authenticated', () => {
          const middleware = (req, res, next) => {
            req.isAuthenticated = true;
            next();
          };
      
          middleware(mockRequest, mockResponse, nextFunction);
      
          expect(nextFunction).toHaveBeenCalled();
        });
      });

      // /api/username endpoint test
    describe('/api/username endpoint', () => {
        test('It should require login', async () => {
            const response = await request(app).get('/api/username');
            expect(response.statusCode).toBe(401);
            expect(response.body.error).toBe('User not authenticated');
        });

        test('It should return username after login', async () => {
            const login = await request(app).post('/api/login').send({ username: 'testuser', password: 'testpass' });
            const cookie = login.headers['set-cookie'][0].split(';')[0];

            const response = await request(app)
                .get('/api/username')
                .set('Cookie', cookie);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('username');
        });
    });
});
