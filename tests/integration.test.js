// tests/integration.test.js

require('./setup');

// uuid v14 is ESM-only and Jest's CJS runtime can't parse it. Replace with a
// CommonJS shim that delegates to Node's built-in randomUUID.
jest.mock('uuid', () => ({ v4: () => require('crypto').randomUUID() }));

// Mock the HF service used by jobController for AI category classification.
// jest.mock is hoisted above all imports.
jest.mock('../Backend/services/hfService', () => ({
    zeroShotClassification: jest.fn().mockResolvedValue([
        {
            sequence: 'mocked',
            labels: ['Backend', 'Frontend', 'AI/ML', 'DevOps', 'Data Engineering', 'Other'],
            scores: [0.85, 0.05, 0.03, 0.02, 0.025, 0.025]
        }
    ])
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const app = require('../Backend/server');
const User = require('../Backend/models/user.schema');
const JobPost = require('../Backend/models/JobPost');

const mintToken = (user) =>
    jwt.sign(
        { id: user._id, role: user.role, jti: randomUUID() },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

let userCounter = 0;
const uniqueEmail = (prefix) => `${prefix}-${++userCounter}@example.com`;

const seedJobSeeker = async (overrides = {}) =>
    User.create({
        username: 'Seeker',
        email: uniqueEmail('seeker'),
        password: 'password123',
        role: 'jobSeeker',
        ...overrides
    });

const seedRecruiter = async (overrides = {}) =>
    User.create({
        username: 'Recruiter',
        email: uniqueEmail('recruiter'),
        password: 'password123',
        role: 'recruiter',
        recruiterStatus: 'approved',
        ...overrides
    });

const seedJob = async (recruiter, overrides = {}) =>
    JobPost.create({
        title: 'Backend Engineer',
        company: 'Acme',
        description: 'Build APIs in Node.js with MongoDB',
        requirements: ['node.js', 'mongodb'],
        location: 'Cairo',
        type: 'full-time',
        totalSlots: 3,
        category: 'Backend',
        createdBy: recruiter._id,
        ...overrides
    });

describe('Integration — auth, jobs, applications, AI', () => {
    test('1. registers a new user via POST /api/v1/auth/register', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Alice',
                email: 'alice@example.com',
                password: 'password123',
                role: 'jobSeeker'
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeTruthy();
        expect(res.body.user.email).toBe('alice@example.com');
        expect(res.body.user.role).toBe('jobSeeker');

        const stored = await User.findOne({ email: 'alice@example.com' });
        expect(stored).not.toBeNull();
    });

    test('2. logs in and receives a token via POST /api/v1/auth/login', async () => {
        await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Bob',
                email: 'bob@example.com',
                password: 'password123',
                role: 'jobSeeker'
            });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'bob@example.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeTruthy();

        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(decoded.jti).toBeTruthy();
        expect(decoded.role).toBe('jobSeeker');
    });

    test('3. recruiter creates a job and AI category detection assigns Backend', async () => {
        const recruiter = await seedRecruiter();
        const token = mintToken(recruiter);

        const res = await request(app)
            .post('/api/v1/jobs')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Backend Engineer',
                company: 'Acme',
                description: 'Build REST APIs in Node.js with MongoDB and Redis',
                requirements: ['node.js', 'mongodb'],
                location: 'Cairo',
                type: 'full-time',
                totalSlots: 3
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.job.category).toBe('Backend');

        const hfService = require('../Backend/services/hfService');
        expect(hfService.zeroShotClassification).toHaveBeenCalledTimes(1);
    });

    test('4. jobSeeker applies to a job via POST /api/v1/jobs/:jobId/apply', async () => {
        const recruiter = await seedRecruiter();
        const job = await seedJob(recruiter);
        const seeker = await seedJobSeeker();
        const token = mintToken(seeker);

        const res = await request(app)
            .post(`/api/v1/jobs/${job._id}/apply`)
            .set('Authorization', `Bearer ${token}`)
            .send({ coverLetter: 'I would love to join.' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.application.user.toString()).toBe(seeker._id.toString());
        expect(res.body.application.job.toString()).toBe(job._id.toString());
        expect(res.body.application.status).toBe('pending');
    });

    test('5. skill extraction works via POST /api/v1/profile/extract-skills', async () => {
        const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            headers: { get: () => 'application/json' },
            json: async () => [
                { entity_group: 'MISC', word: 'JavaScript', score: 0.99 },
                { entity_group: 'MISC', word: 'Node.js', score: 0.97 },
                { entity_group: 'MISC', word: 'MongoDB', score: 0.95 }
            ]
        });

        try {
            const seeker = await seedJobSeeker({
                bio: 'I work with JavaScript, Node.js and MongoDB on backend services.'
            });
            const token = mintToken(seeker);

            const res = await request(app)
                .post('/api/v1/profile/extract-skills')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.extractedSkills).toEqual(
                expect.arrayContaining(['JavaScript', 'Node.js', 'MongoDB'])
            );

            const stored = await User.findById(seeker._id);
            expect(stored.extractedSkills).toEqual(
                expect.arrayContaining(['JavaScript', 'Node.js', 'MongoDB'])
            );
        } finally {
            fetchSpy.mockRestore();
        }
    });

    test('6. applying to the same job twice returns a duplicate-application error', async () => {
        const recruiter = await seedRecruiter();
        const job = await seedJob(recruiter);
        const seeker = await seedJobSeeker();
        const token = mintToken(seeker);

        const first = await request(app)
            .post(`/api/v1/jobs/${job._id}/apply`)
            .set('Authorization', `Bearer ${token}`)
            .send({ coverLetter: 'first' });

        expect(first.status).toBe(201);

        const second = await request(app)
            .post(`/api/v1/jobs/${job._id}/apply`)
            .set('Authorization', `Bearer ${token}`)
            .send({ coverLetter: 'second' });

        expect(second.status).toBe(400);
        expect(second.body.success).toBe(false);
        expect(second.body.message).toMatch(/already applied/i);
    });
});
