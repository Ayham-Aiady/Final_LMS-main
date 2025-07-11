import CourseModel from '../models/courseModel.js';

const CourseController = {
  // Create a new course
  async create(req, res) {
    try {
      const { title, description, instructor_id, category_id, thumbnail_url } = req.body;

      if (!title || !description || !instructor_id || !category_id || !thumbnail_url) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const course = await CourseModel.create({
        title,
        description,
        instructor_id,
        category_id,
        thumbnail_url,
      });

      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all courses
  async getAll(req, res) {
    try {
      const courses = await CourseModel.findAll();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get course by ID
  async getById(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      res.json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getCoursesByInstructor(req, res) {
  try {
    const instructorId = parseInt(req.params.id);
    const courses = await CourseModel.findByInstructorId(instructorId);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching instructor courses' });
  }
},

async getAvailableCourses(req, res) {
  try {
    const user_id = parseInt(req.params.user_id);
    const search = req.query.search || '';

    if (isNaN(user_id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const courses = await CourseModel.findAvailableForStudent(user_id, search);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching available courses:', error);
    res.status(500).json({ message: 'Failed to fetch available courses', error: error.message });
  }
},

async getCourseWithInstructor(req, res) {
  try {
    const courseId = parseInt(req.params.id);
    console.log("🔍 Requesting course with instructor, ID:", courseId);

    const course = await CourseModel.findByIdWithInstructor(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const [modules, lessonCount] = await Promise.all([
      CourseModel.getModulesWithLessonCounts(courseId),
      CourseModel.countLessonsByCourse(courseId)
    ]);

    const moduleCount = modules.length;

    res.json({
      ...course,
      modules,
      moduleCount,
      lessonCount
    });
  } catch (err) {
    console.error('🔥 Error in getCourseWithInstructor:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
},





  // Update course
  async update(req, res) {
    try {
      const { title, description, thumbnail_url } = req.body;
      const courseId = req.params.id;

      const updatedCourse = await CourseModel.update(courseId, {
        title,
        description,
        thumbnail_url,
      });

      if (!updatedCourse) {
        return res.status(404).json({ message: 'Course not found or update failed' });
      }

      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete course
  async delete(req, res) {
    try {
      const deletedCourse = await CourseModel.delete(req.params.id);

      if (!deletedCourse) {
        return res.status(404).json({ message: 'Course not found or already deleted' });
      }

      res.json({ message: 'Course deleted successfully', course: deletedCourse });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

async approveOrReject(req, res) {
  try {
    const courseId = req.params.id;
    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ message: 'isApproved must be true or false' });
    }

    const updatedCourse = await CourseModel.updateApprovalStatus(courseId, isApproved);

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      message: `Course has been ${isApproved ? 'approved' : 'rejected'}`,
      course: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

async getPendingCourses(req, res) {
  try {
    const pendingCourses = await CourseModel.findPending();
    res.json(pendingCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

// Publish or Unpublish a course
async publishOrUnpublish(req, res) {
  try {
    const courseId = req.params.id;
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({ message: 'isPublished must be true or false' });
    }

    const updatedCourse = await CourseModel.updatePublishStatus(courseId, isPublished);

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      message: `Course has been ${isPublished ? 'published' : 'unpublished'}`,
      course: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}





};

export default CourseController;
