import EnrollmentModel from '../models/enrollmentModel.js';

const EnrollmentController = {
  async create(req, res) {
    try {
      const {
        user_id,
        course_id,
        enrolled_at,
        completed_at,
        progress,
        last_viewed_lesson_id
      } = req.body;

      if (!user_id || !course_id) {
        return res.status(400).json({ message: 'user_id and course_id are required' });
      }

      const enrollment = await EnrollmentModel.create({
        user_id,
        course_id,
        enrolled_at,
        completed_at,
        progress,
        last_viewed_lesson_id
      });

      res.status(201).json(enrollment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create enrollment', error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const enrollment = await EnrollmentModel.findById(req.params.id);
      if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
      res.json(enrollment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to get enrollment', error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const enrollments = await EnrollmentModel.findAll();
      res.json(enrollments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to get enrollments', error: error.message });
    }
  },

  async getCoursesByUserId(req, res) {
    try {
      const user_id = parseInt(req.params.user_id);
      if (isNaN(user_id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      const courses = await EnrollmentModel.findCoursesByUserId(user_id);
      res.json(courses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to get enrolled courses', error: error.message });
    }
  },

  async getEnrollmentByCourseForAuthenticatedUser(req, res) {
    const userId = req.user.id;
    const { courseId } = req.params;
    try {
      const enrollment = await EnrollmentModel.findByUserAndCourse(userId, courseId);
      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }
      res.json(enrollment);
    } catch (err) {
      console.error('Enrollment fetch error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req, res) {
    try {
      const { completed_at, progress } = req.body;
      const updatedEnrollment = await EnrollmentModel.update(req.params.id, {
        completed_at,
        progress
      });

      if (!updatedEnrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }

      res.json(updatedEnrollment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update enrollment', error: error.message });
    }
  },

  async updateProgress(req, res) {
    try {
      const { progress } = req.body;
      if (progress == null) {
        return res.status(400).json({ message: 'Progress is required' });
      }

      const updatedEnrollment = await EnrollmentModel.update(req.params.id, { progress });
      if (!updatedEnrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }

      res.json(updatedEnrollment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update progress', error: error.message });
    }
  },

  async updateLastViewedLesson(req, res) {
    const { enrollmentId, lessonId } = req.body;

    if (!enrollmentId || !lessonId) {
      return res.status(400).json({ message: 'enrollmentId and lessonId are required' });
    }

    try {
      const updated = await EnrollmentModel.updateLastViewedLesson(enrollmentId, lessonId);
      if (!updated) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }
      res.json(updated);
    } catch (error) {
      console.error('Error updating last viewed lesson:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async delete(req, res) {
    try {
      await EnrollmentModel.delete(req.params.id);
      res.json({ message: 'Enrollment deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete enrollment', error: error.message });
    }
  },

  async getByUserId(req, res) {
    try {
      const enrollments = await EnrollmentModel.findByUserId(req.params.user_id);
      res.json(enrollments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to get enrollments for user', error: error.message });
    }
  },

  async getByCourseId(req, res) {
    try {
      const enrollments = await EnrollmentModel.findByCourseId(req.params.course_id);
      res.json(enrollments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to get enrollments for course', error: error.message });
    }
  },

async getDashboardOverview(req, res) {
  const user_id = parseInt(req.params.user_id);
  if (isNaN(user_id)) return res.status(400).json({ message: 'Invalid user ID' });

  try {
    const data = await EnrollmentModel.getDashboardOverview(user_id);
    res.json(data);
  } catch (error) {
    console.error('Dashboard overview fetch failed:', error);
    res.status(500).json({ message: 'Failed to load dashboard overview' });
  }
},




};

export default EnrollmentController;
