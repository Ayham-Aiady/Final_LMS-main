import submissionModel from '../models/submissionModel.js';

const submissionController = {
  async createSubmission(req, res) {
    try {
      const { assignment_id, user_id, submission_url, grade, feedback } = req.body;
      if (!assignment_id || !user_id || !submission_url) {
        return res.status(400).json({ message: "assignment_id, user_id, and submission_url are required" });
      }
      const submission = await submissionModel.create({ assignment_id, user_id, submission_url, grade, feedback });
      res.status(201).json(submission);
    } catch (error) {
      console.error('Error creating submission:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  async getAllSubmissions(req, res) {
    try {
      const submissions = await submissionModel.getAll();
      res.json(submissions);
    } catch (error) {
      console.error('Error getting submissions:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  async getSubmissionById(req, res) {
    try {
      const submission = await submissionModel.getById(req.params.id);
      if (!submission) return res.status(404).json({ message: 'Submission not found' });
      res.json(submission);
    } catch (error) {
      console.error('Error getting submission:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  async getByAssignmentId(req, res) {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const subs = await submissionModel.findByAssignmentId(assignmentId);
    res.json(subs);
  } catch (error) {
    console.error('Error fetching submissions by assignment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
},


  async updateSubmission(req, res) {
    try {
      const { assignment_id, user_id, submission_url, grade, feedback } = req.body;
      if (!assignment_id || !user_id || !submission_url) {
        return res.status(400).json({ message: "assignment_id, user_id, and submission_url are required" });
      }
      const updated = await submissionModel.update(req.params.id, { assignment_id, user_id, submission_url, grade, feedback });
      if (!updated) return res.status(404).json({ message: 'Submission not found' });
      res.json(updated);
    } catch (error) {
      console.error('Error updating submission:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  async deleteSubmission(req, res) {
    try {
      const deleted = await submissionModel.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Submission not found' });
      res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
      console.error('Error deleting submission:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },


async gradeSubmission(req, res) {
  try {
    const { grade, feedback } = req.body;
    const { id } = req.params;

    if (grade === undefined || grade === null) {
      return res.status(400).json({ message: 'Grade is required' });
    }

    const updated = await submissionModel.updateGrade(id, grade, feedback);
    if (!updated) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({
      message: 'Submission graded successfully',
      submission: updated
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
},

async getPendingByUser(req, res) {
  const { userId } = req.params;
  try {
    const pending = await submissionModel.getPendingByUser(userId);
    res.json(pending);
  } catch (err) {
    console.error('Error fetching pending submissions:', err);
    res.status(500).json({ error: 'Failed to fetch pending submissions' });
  }
}



};

export default submissionController;