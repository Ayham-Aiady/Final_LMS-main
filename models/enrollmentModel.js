import { query } from '../config/db.js';

const EnrollmentModel = {
  // Create a new enrollment
  async create({
    user_id,
    course_id,
    enrolled_at = new Date(),
    completed_at = null,
    progress = 0,
    last_viewed_lesson_id = null
  }) {
    const sql = `
      INSERT INTO enrollments (user_id, course_id, enrolled_at, completed_at, progress, last_viewed_lesson_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [user_id, course_id, enrolled_at, completed_at, progress, last_viewed_lesson_id];
    const { rows } = await query(sql, values);
    return rows[0];
  },

  // Find enrollment by id
  async findById(id) {
    const { rows } = await query('SELECT * FROM enrollments WHERE id = $1', [id]);
    return rows[0];
  },

  // Find all enrollments
  async findAll() {
    const { rows } = await query('SELECT * FROM enrollments ORDER BY enrolled_at DESC');
    return rows;
  },

  // Get full course details for a student's enrollments
  async findCoursesByUserId(user_id) {
    const sql = `
      SELECT 
        c.id AS course_id,
        c.title,
        c.thumbnail_url,
        c.description,
        u.name AS instructor_name,
        e.progress,
        e.enrolled_at,
        e.last_viewed_lesson_id
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      WHERE e.user_id = $1
      ORDER BY e.enrolled_at DESC
    `;
    const { rows } = await query(sql, [user_id]);
    return rows;
  },

  // Find enrollment by user and course
  async findByUserAndCourse(userId, courseId) {
    const sql = `
      SELECT * FROM enrollments
      WHERE user_id = $1 AND course_id = $2
      LIMIT 1
    `;
    const { rows } = await query(sql, [userId, courseId]);
    return rows[0];
  },

  // Update enrollment progress & completion timestamp
  async update(id, { completed_at, progress }) {
    const sql = `
      UPDATE enrollments
      SET completed_at = COALESCE($2, completed_at),
          progress = COALESCE($3, progress)
      WHERE id = $1
      RETURNING *;
    `;
    const values = [id, completed_at, progress];
    const { rows } = await query(sql, values);
    return rows[0];
  },

  // Update just the last viewed lesson
  async updateLastViewedLesson(enrollmentId, lessonId) {
    const sql = `
      UPDATE enrollments
      SET last_viewed_lesson_id = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await query(sql, [lessonId, enrollmentId]);
    return rows[0];
  },

  // Delete enrollment by id
  async delete(id) {
    await query('DELETE FROM enrollments WHERE id = $1', [id]);
  },

  // Find enrollments by user_id
  async findByUserId(user_id) {
    const { rows } = await query('SELECT * FROM enrollments WHERE user_id = $1', [user_id]);
    return rows;
  },

  // Find enrollments by course_id
  async findByCourseId(course_id) {
    const { rows } = await query('SELECT * FROM enrollments WHERE course_id = $1', [course_id]);
    return rows;
  },

async getDashboardOverview(user_id) {
  // 1. Fetch courses with progress
  const coursesQuery = `
    SELECT 
      c.id AS course_id,
      c.title,
      c.thumbnail_url,
      c.description,
      u.name AS instructor_name,
      e.progress,
      e.enrolled_at,
      e.last_viewed_lesson_id
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    JOIN users u ON c.instructor_id = u.id
    WHERE e.user_id = $1
    ORDER BY e.enrolled_at DESC
  `;
  const { rows: courses } = await query(coursesQuery, [user_id]);

  // 2. Completed lessons
  const progressQuery = `
    SELECT COUNT(*) FROM lesson_progress lp
    JOIN enrollments e ON lp.enrollment_id = e.id
    WHERE lp.is_completed = TRUE AND e.user_id = $1
  `;
  const { rows: completedRes } = await query(progressQuery, [user_id]);
  const completedLessons = parseInt(completedRes[0].count, 10) || 0;

  // 3. Pending assignments
  const pendingQuery = `
    SELECT a.id AS assignment_id, a.title AS assignment_title, a.deadline
    FROM assignments a
    JOIN lessons l ON a.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    JOIN enrollments e ON c.id = e.course_id
    WHERE e.user_id = $1
    AND NOT EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.assignment_id = a.id AND s.user_id = $1
    )
    ORDER BY a.deadline ASC
    LIMIT 5
  `;
  const { rows: pendingAssignments } = await query(pendingQuery, [user_id]);

  return {
    courses,
    completedLessons,
    pendingAssignments
  };
},




};



export default EnrollmentModel;















// import { query } from '../config/db.js';

// const EnrollmentModel = {
//   // Create a new enrollment
//   async create({ user_id, course_id, enrolled_at = new Date(), completed_at = null, progress = 0 }) {
//     const sql = `
//       INSERT INTO enrollments (user_id, course_id, enrolled_at, completed_at, progress)
//       VALUES ($1, $2, $3, $4, $5)
//       RETURNING *;
//     `;
//     const values = [user_id, course_id, enrolled_at, completed_at, progress];
//     const { rows } = await query(sql, values);
//     return rows[0];
//   },

//   // Find enrollment by id
//   async findById(id) {
//     const { rows } = await query('SELECT * FROM enrollments WHERE id = $1', [id]);
//     return rows[0];
//   },

//   // Find all enrollments
//   async findAll() {
//     const { rows } = await query('SELECT * FROM enrollments ORDER BY enrolled_at DESC');
//     return rows;
//   },

//   // Get full course details for a student's enrollments
// async findCoursesByUserId(user_id) {
//   const sql = `
//     SELECT 
//       c.id AS course_id,
//       c.title,
//       c.thumbnail_url,
//       c.description,
//       u.name AS instructor_name,
//       e.progress,
//       e.enrolled_at
//     FROM enrollments e
//     JOIN courses c ON e.course_id = c.id
//     JOIN users u ON c.instructor_id = u.id
//     WHERE e.user_id = $1
//     ORDER BY e.enrolled_at DESC
//   `;
//   const { rows } = await query(sql, [user_id]);
//   return rows;
// },

// async findByUserAndCourse(userId, courseId) {
//   const sql = `
//     SELECT * FROM enrollments
//     WHERE user_id = $1 AND course_id = $2
//     LIMIT 1
//   `;
//   const { rows } = await query(sql, [userId, courseId]);
//   return rows[0];
// },



//   // Update enrollment by id
//   async update(id, { completed_at, progress }) {
//     // Allow updating completed_at and progress only
//     const sql = `
//       UPDATE enrollments
//       SET completed_at = COALESCE($2, completed_at),
//           progress = COALESCE($3, progress)
//       WHERE id = $1
//       RETURNING *;
//     `;
//     const values = [id, completed_at, progress];
//     const { rows } = await query(sql, values);
//     return rows[0];
//   },

//   // Delete enrollment by id
//   async delete(id) {
//     await query('DELETE FROM enrollments WHERE id = $1', [id]);
//   },

//   // Find enrollments by user_id
//   async findByUserId(user_id) {
//     const { rows } = await query('SELECT * FROM enrollments WHERE user_id = $1', [user_id]);
//     return rows;
//   },

//   // Find enrollments by course_id
//   async findByCourseId(course_id) {
//     const { rows } = await query('SELECT * FROM enrollments WHERE course_id = $1', [course_id]);
//     return rows;
//   },

  
// };

// export default EnrollmentModel;
