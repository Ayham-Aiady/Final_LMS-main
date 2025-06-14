import quizModel from '../models/quizModel.js';
import { pool } from '../config/db.js';

const quizController = {
  async getAllQuizzes(req, res) {
    try {
      const quizzes = await quizModel.findAll();
      res.json(quizzes);
    } catch (error) {
      console.error('Error getting quizzes:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  async getQuizById(req, res) {
    try {
      const { id } = req.params;
      const quiz = await quizModel.findById(id);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      res.json(quiz);
    } catch (error) {
      console.error('Error getting quiz by ID:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  async createQuiz(req, res) {
    try {
      const { lesson_id, max_score } = req.body;
      if (!lesson_id || max_score === undefined) {
        return res.status(400).json({ message: 'lesson_id and max_score are required' });
      }
      const newQuiz = await quizModel.create({ lesson_id, max_score });
      res.status(201).json(newQuiz);
    } catch (error) {
      console.error('Error creating quiz:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
async updateQuiz(req, res) {
  try {
    const id = req.params.id;
    const { lesson_id, max_score } = req.body;

    // Optional: Validate input here before updating

    const updatedQuiz = await quizModel.update(id, { lesson_id, max_score });

    if (!updatedQuiz) {
      return res.status(404).json({ message: `Quiz with id ${id} not found` });
    }

    res.json(updatedQuiz);
  } catch (error) {
    console.error(`Error updating quiz with id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
,

  async deleteQuiz(req, res) {
    try {
      const { id } = req.params;
      const deletedQuiz = await quizModel.delete(id);
      if (!deletedQuiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      res.json({ message: 'Quiz deleted successfully', id: deletedQuiz.id });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  async submitQuiz(req, res) {
  try {
    const { quiz_id, answers } = req.body;
    const user_id = req.user.id; // Use authenticated user

    // 1. Prevent multiple attempts
    const check = await pool.query(
      'SELECT * FROM quiz_grades WHERE quiz_id = $1 AND user_id = $2',
      [quiz_id, user_id]
    );
    if (check.rows.length > 0) {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    // 2. Fetch correct answers
    const questionRes = await pool.query(
      'SELECT id, correct_answer FROM questions WHERE quizz_id = $1',
      [quiz_id]
    );
    const questions = questionRes.rows;

    // 3. Grade quiz
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] && answers[q.id] === q.correct_answer) {
        score++;
      }
    });

    // 4. Save grade
    await pool.query(
      `INSERT INTO quiz_grades (quiz_id, user_id, grade) VALUES ($1, $2, $3)`,
      [quiz_id, user_id, score]
    );

    res.status(200).json({
      message: 'Quiz submitted',
      score,
      total: questions.length,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
};

export default quizController;
