const Job = require('../models/jobs'); // Import the Job model

// Controller to fetch all jobs with pagination, search, and filtering
const getJobs = async (req, res) => {
  const { page = 1, limit = 18, search = '', category = '' } = req.query;

  try {
    // Validate query parameters
    const pageNumber = Math.max(1, parseInt(page, 10)); // Ensure page is at least 1
    const limitNumber = Math.max(1, parseInt(limit, 10)); // Ensure limit is at least 1

    // Build query object
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
    if (category) query.category = category;

    // Fetch total count for pagination metadata
    const totalJobs = await Job.countDocuments(query);

    // Fetch paginated results
    const jobs = await Job.find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Prepare response
    res.json({
      jobs,
      pagination: {
        totalJobs,
        totalPages: Math.ceil(totalJobs / limitNumber),
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage: pageNumber < Math.ceil(totalJobs / limitNumber),
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
};

// Controller to fetch job details by ID
const getJobById = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job', details: error.message });
  }
};

// Controller to create a new job
const createJob = async (req, res) => {
  const { title, category, description, imageUrl, location, applyLink, jobDetailsLink } =
    req.body;

  try {
    const newJob = new Job({
      title,
      category,
      description,
      imageUrl,
      location,
      applyLink,
      jobDetailsLink,
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job', details: error.message });
  }
};

// Controller to update an existing job by ID
const updateJob = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job', details: error.message });
  }
};

// Controller to delete a job by ID
const deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedJob = await Job.findByIdAndDelete(id);
    if (!deletedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job', details: error.message });
  }
};

// Export controllers as a plain object
module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
