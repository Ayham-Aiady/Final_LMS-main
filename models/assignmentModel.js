import { query } from '../config/db.js';

const assignmentModel = {
  async create({ lesson_id, title, description, deadline, max_score, file_url }) {
    const result = await query(
      `INSERT INTO assignments (lesson_id, title, description, deadline, max_score, file_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [lesson_id, title, description, deadline, max_score, file_url]
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await query(`SELECT * FROM assignments`);
    return result.rows;
  },

  async getById(id) {
    const result = await query(`SELECT * FROM assignments WHERE id = $1`, [id]);
    return result.rows[0];
  },

  async findByLessonId(lessonId) {
  const { rows } = await query('SELECT * FROM assignments WHERE lesson_id = $1', [lessonId]);
  return rows;
},


  async update(id, { lesson_id, title, description, deadline, max_score, file_url }) {
    const result = await query(
      `UPDATE assignments
       SET lesson_id = $1,
           title = $2,
           description = $3,
           deadline = $4,
           max_score = $5,
           file_url = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [lesson_id, title, description, deadline, max_score, file_url, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await query(`DELETE FROM assignments WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
  }
};

export default assignmentModel;
