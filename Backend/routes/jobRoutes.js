const express = require('express');

const router = express.Router();

const {
  getJobs,
  getJobById,
  toggleSaveJob,
  getSavedJobs,
  applyToJob,
  getRecommendedJobs,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  generateCoverLetter
} = require('../controllers/jobController');
const { getJobApplicants } = require('../controllers/applicationController');

const { protect, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   - name: Jobs
 *     description: Job postings, search, save, and applications
 */

// public routes

/**
 * @swagger
 * /jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: List/search public job postings
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Free-text keyword
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Job list
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               page: 1
 *               total: 12
 *               jobs:
 *                 - { _id: "66400ab10cc9f10012cd0011", title: "Backend Intern", company: "Acme", location: "Cairo", description: "Node.js + MongoDB" }
 */
router.get('/', getJobs);

// must be before /:id

/**
 * @swagger
 * /jobs/saved:
 *   get:
 *     tags: [Jobs]
 *     summary: List the authenticated jobSeeker's saved jobs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved jobs returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               savedJobs:
 *                 - { _id: "66400ab10cc9f10012cd0011", title: "Backend Intern", company: "Acme" }
 *       401: { description: Not authorized }
 *       403: { description: Only jobSeekers can access saved jobs }
 */
router.get(
  '/saved',
  protect,
  authorize('jobSeeker'),
  getSavedJobs
);

/**
 * @swagger
 * /jobs/recommended:
 *   get:
 *     tags: [Jobs]
 *     summary: AI-recommended jobs for the authenticated jobSeeker
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended jobs returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               recommendations:
 *                 - { _id: "66400ab10cc9f10012cd0011", title: "Backend Intern", company: "Acme", matchScore: 0.87 }
 *       401: { description: Not authorized }
 *       403: { description: Only jobSeekers can receive recommendations }
 */
router.get(
  '/recommended',
  protect,
  authorize('jobSeeker'),
  getRecommendedJobs
);

// recruiter routes

/**
 * @swagger
 * /jobs:
 *   post:
 *     tags: [Jobs]
 *     summary: Create a new job posting (recruiter only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:       { type: string, example: "Backend Intern" }
 *               company:     { type: string, example: "Acme Inc." }
 *               location:    { type: string, example: "Cairo, Egypt" }
 *               description: { type: string, example: "Node.js + MongoDB internship" }
 *               skills:      { type: array, items: { type: string }, example: ["node.js", "mongodb"] }
 *     responses:
 *       201:
 *         description: Job created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               job: { _id: "66400ab10cc9f10012cd0011", title: "Backend Intern", company: "Acme Inc.", location: "Cairo, Egypt" }
 *       401: { description: Not authorized }
 *       403: { description: Only recruiters can create jobs }
 */
router.post(
  '/',
  protect,
  authorize('recruiter'),
  createJob
);

/**
 * @swagger
 * /jobs/my-jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: List the recruiter's own job postings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recruiter's jobs returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               jobs:
 *                 - { _id: "66400ab10cc9f10012cd0011", title: "Backend Intern", applicantCount: 7 }
 *       401: { description: Not authorized }
 *       403: { description: Recruiter role required }
 */
router.get(
  '/my-jobs',
  protect,
  authorize('recruiter'),
  getMyJobs
);

/**
 * @swagger
 * /jobs/{id}:
 *   patch:
 *     tags: [Jobs]
 *     summary: Update a job posting (recruiter only, must own the job)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:       { type: string, example: "Senior Backend Engineer" }
 *               description: { type: string }
 *               location:    { type: string }
 *     responses:
 *       200:
 *         description: Job updated
 *         content:
 *           application/json:
 *             example: { success: true, message: "Job updated" }
 *       404: { description: Job not found }
 *       401: { description: Not authorized }
 *       403: { description: Recruiter role required, or job not owned by caller }
 */
router.patch(
  '/:id',
  protect,
  authorize('recruiter'),
  updateJob
);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     tags: [Jobs]
 *     summary: Delete a job posting (recruiter or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job deleted
 *         content:
 *           application/json:
 *             example: { success: true, message: "Job deleted" }
 *       404: { description: Job not found }
 *       401: { description: Not authorized }
 *       403: { description: Recruiter or admin role required }
 */
router.delete(
  '/:id',
  protect,
  authorize('recruiter', 'admin'),
  deleteJob
);

/**
 * @swagger
 * /jobs/{jobId}/applicants:
 *   get:
 *     tags: [Jobs]
 *     summary: List applicants for a job (recruiter or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Applicants returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               applicants:
 *                 - { _id: "66500cdef00000000000ab12", applicant: { name: "Jana Hariri", email: "jana@student.giu-uni.de" }, status: "pending" }
 *       404: { description: Job not found }
 *       401: { description: Not authorized }
 *       403: { description: Recruiter or admin role required }
 */
router.get('/:jobId/applicants', protect, authorize('recruiter', 'admin'), getJobApplicants);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Get a single job by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               job: { _id: "66400ab10cc9f10012cd0011", title: "Backend Intern", company: "Acme", location: "Cairo", description: "Node.js + MongoDB" }
 *       404: { description: Job not found }
 */
router.get('/:id', getJobById);

/**
 * @swagger
 * /jobs/{id}/save:
 *   post:
 *     tags: [Jobs]
 *     summary: Toggle save/unsave a job (jobSeeker only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Save state toggled
 *         content:
 *           application/json:
 *             example: { success: true, saved: true, message: "Job saved" }
 *       401: { description: Not authorized }
 *       403: { description: Only jobSeekers can save jobs }
 *       404: { description: Job not found }
 */
router.post(
  '/:id/save',
  protect,
  authorize('jobSeeker'),
  toggleSaveJob
);

/**
 * @swagger
 * /jobs/{jobId}/apply:
 *   post:
 *     tags: [Jobs]
 *     summary: Apply to a job (jobSeeker only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter: { type: string, example: "I'm interested because..." }
 *     responses:
 *       201:
 *         description: Application submitted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               application: { _id: "66500cdef00000000000ab12", job: "66400ab10cc9f10012cd0011", status: "pending" }
 *       400: { description: Already applied }
 *       401: { description: Not authorized }
 *       403: { description: Only jobSeekers can apply }
 *       404: { description: Job not found }
 */
router.post(
  '/:jobId/apply',
  protect,
  authorize('jobSeeker'),
  applyToJob
);

/**
 * @swagger
 * /jobs/{id}/cover-letter:
 *   post:
 *     tags: [Jobs]
 *     summary: Generate an AI cover-letter draft for this job (jobSeeker only) — bonus feature
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cover letter draft returned
 *         content:
 *           application/json:
 *             example: { success: true, coverLetter: "Dear Hiring Manager, ..." }
 *       400: { description: User has no bio yet }
 *       401: { description: Not authorized }
 *       403: { description: Only jobSeekers can generate cover letters }
 *       404: { description: Job not found }
 *       503: { description: HF text-generation model unavailable }
 */
router.post(
  '/:id/cover-letter',
  protect,
  authorize('jobSeeker'),
  generateCoverLetter
);

module.exports = router;
