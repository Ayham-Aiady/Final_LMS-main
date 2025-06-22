import { query } from '../config/db.js';

const CourseModel = {
  // Create a new course
  async create({ title, description, instructor_id, category_id, thumbnail_url }) {
    try {
      const { rows } = await query(
        `INSERT INTO courses 
          (title, description, instructor_id, category_id, thumbnail_url, is_published, is_approved, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [title, description, instructor_id, category_id, thumbnail_url]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Failed to create course');
    }
  },

  // Read course by ID
  async findById(courseId) {
    const { rows } = await query(
      'SELECT * FROM courses WHERE id = $1',
      [courseId]
    );
    return rows[0];
  },

  // Read all courses
  async findAll() {
    const { rows } = await query('SELECT * FROM courses');
    return rows;
  },

  async findByInstructorId(instructorId) {
  const { rows } = await query('SELECT * FROM courses WHERE instructor_id = $1', [instructorId]);
  return rows;
},

// findAvailableForStudent: async function (user_id, search = '') {
//   const sql = `
//     SELECT * FROM courses
//     WHERE is_published = TRUE
//       AND is_approved = TRUE
//       AND id NOT IN (
//         SELECT course_id FROM enrollments WHERE user_id = $1
//       )
//       AND (
//         title ILIKE $2 OR description ILIKE $2
//       )
//     ORDER BY created_at DESC;
//   `;
//   const values = [user_id, `%${search}%`];
//   const { rows } = await query(sql, values);
//   return rows;
// },
async findAvailableForStudent(user_id, search = '', limit = 10, offset = 0) {
  const sql = `
    SELECT * FROM courses
    WHERE is_published = TRUE
      AND is_approved = TRUE
      AND id NOT IN (
        SELECT course_id FROM enrollments WHERE user_id = $1
      )
      AND (
        title ILIKE $2 OR description ILIKE $2
      )
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4;
  `;
  const values = [user_id, `%${search}%`, limit, offset];
  const { rows } = await query(sql, values);
  return rows;
},

async findByIdWithInstructor(courseId) {
  try {
    const { rows } = await query(
      `
      SELECT 
        c.*, 
        u.name AS instructor_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = $1
      `,
      [courseId]
    );

    const course = rows[0];
    if (!course) return null;

    return {
      ...course,
      instructor: {
        id: course.instructor_id,
        name: course.instructor_name || 'Unknown Instructor'
      }
    };
  } catch (err) {
    console.error('🔥 DB Error in findByIdWithInstructor:', err);
    throw new Error('Failed to fetch course with instructor');
  }
},

async countLessonsByCourse(courseId) {
  const { rows } = await query(`
    SELECT COUNT(*) AS lesson_count
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.course_id = $1
  `, [courseId]);

  return parseInt(rows[0]?.lesson_count || 0);
},

async getModulesWithLessonCounts(courseId) {
  const { rows } = await query(`
    SELECT 
      m.*, 
      COUNT(l.id) AS lesson_count
    FROM modules m
    LEFT JOIN lessons l ON l.module_id = m.id
    WHERE m.course_id = $1
    GROUP BY m.id
    ORDER BY m."order"
  `, [courseId]);

  return rows.map(m => ({
    ...m,
    lesson_count: parseInt(m.lesson_count, 10)
  }));
},



  // Update course
  async update(courseId, { title, description, thumbnail_url }) {
    try {
      const { rows } = await query(
        `UPDATE courses 
         SET title = $1,
             description = $2,
             thumbnail_url = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [title, description, thumbnail_url, courseId]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Failed to update course');
    }
  },

  // Delete course
  async delete(courseId) {
    try {
      const { rows } = await query(
        'DELETE FROM courses WHERE id = $1 RETURNING *',
        [courseId]
      );
      return rows[0];
   } catch (error) {
  console.error('❌ DB error during course deletion:', error);
  throw new Error(error.message || 'Failed to delete course');
}
  },

  async updateApprovalStatus(courseId, isApproved) {
  try {
    const { rows } = await query(
      `UPDATE courses
       SET is_approved = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [isApproved, courseId]
    );
    return rows[0];
  } catch (error) {
    throw new Error('Failed to update course approval status');
  }
},
async findPending() {
  const { rows } = await query(
    'SELECT * FROM courses WHERE is_approved = false'
  );
  return rows;
},


async updatePublishStatus(courseId, isPublished) {
  try {
    const { rows } = await query(
      `UPDATE courses
       SET is_published = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [isPublished, courseId]
    );
    return rows[0];
  } catch (error) {
    throw new Error('Failed to update course publish status');
  }
}



};

export default CourseModel;
