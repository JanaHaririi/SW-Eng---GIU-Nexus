const express = require('express');
const {
  createApplication,
  getApplications,
  getMyApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Applications
 *     description: Job applications (create, list, status updates)
 */

router.use(protect);

/**
 * @swagger
 * /applications:
 *   get:
 *     tags: [Applications]
 *     summary: List applications visible to the caller
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               applications:
 *                 - { _id: "66500cdef00000000000ab12", job: { _id: "66400ab10cc9f10012cd0011", title: "Backend Intern" }, status: "pending" }
 *       401: { description: Not authorized }
 *   post:
 *     tags: [Applications]
 *     summary: Create a new application (jobSeeker only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobId]
 *             properties:
 *               jobId:       { type: string, example: "66400ab10cc9f10012cd0011" }
 *               coverLetter: { type: string, example: "I'm interested because..." }
 *     responses:
 *       201:
 *         description: Application submitted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               application: { _id: "66500cdef00000000000ab12", job: "66400ab10cc9f10012cd0011", status: "pending" }
 *       400: { description: Already applied or missing jobId }
 *       401: { description: Not authorized }
 *       403: { description: Only jobSeekers can apply }
 */
router
  .route('/')
  .get(getApplications)
  .post(authorize('jobSeeker'), createApplication);

/**
 * @swagger
 * /applications/my:
 *   get:
 *     tags: [Applications]
 *     summary: List the authenticated jobSeeker's own applications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Caller's applications returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               applications:
 *                 - { _id: "66500cdef00000000000ab12", job: { _id: "66400ab10cc9f10012cd0011", title: "Backend Intern", company: "Acme" }, status: "pending", createdAt: "2026-05-01T10:00:00.000Z" }
 *       401: { description: Not authorized }
 *       403: { description: Only jobSeekers may use this endpoint }
 */
router.get('/my', authorize('jobSeeker'), getMyApplications);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     tags: [Applications]
 *     summary: Update an application's status (recruiter or admin)
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, accepted, rejected], example: accepted }
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             example: { success: true, message: "Application accepted" }
 *       400: { description: Invalid status }
 *       404: { description: Application not found }
 *       401: { description: Not authorized }
 *       403: { description: Recruiter or admin role required }
 */
router.patch('/:id/status', authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
