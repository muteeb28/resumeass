import JobApplication from "../model/jobApplication.model.js";

export const getJobApplications = async (req, res) => {
  try {
    const jobApplications = await JobApplication.find({}).sort({ createdAt: -1 }).lean();
    console.log("job applications fetched: ", jobApplications);

    const applications = jobApplications.map((app) => ({
      ...app,
      id: String(app._id),
    }));

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.log("error from the getJobApplications controller: ", error);
    res.status(500).json({
      success: false,
      msg: "Error fetching job applications",
    });
  }
};

export const setJobApplication = async (req, res) => {
  try {
    if (!req.body?.applications || !Array.isArray(req.body?.applications) || req.body?.applications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "application data is required in the request body",
      });
    }

    const operations = req.body.applications
      .filter((app) => app?.title)
      .map((app) => ({
        updateOne: {
          filter: { title: app.title },
          update: {
            $setOnInsert: {
              company: app.company || "",
              title: app.title,
              status: app.status || "",
              link: app.link || "",
              contact: app.contact || "",
              date: app.date || "",
              stage: app.stage || "",
              custom: app.custom || null,
            },
          },
          upsert: true,
        },
      }));

    if (!operations.length) {
      return res.status(400).json({
        success: false,
        message: "at least one application with title is required",
      });
    }

    const result = await JobApplication.bulkWrite(operations, { ordered: false });

    if ((result.upsertedCount || 0) > 0) {
      return res.status(200).json({
        success: true,
        message: "application submitted successfully!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "no new applications were added",
    });
  } catch (error) {
    console.log("error from the setJobApplication controller: ", error);
    return res.status(500).json({
      success: false,
      message: "error when saving the application. Please try again later.",
    });
  }
};

export const editJobApplication = async (req, res) => {
  try {
    if (!req.body?.application || !req.params?.jobId) {
      return res.status(400).json({
        success: false,
        message: "application data and id are required in the request body",
      });
    }

    const app = req.body.application;
    const updatedApp = await JobApplication.findByIdAndUpdate(
      req.params.jobId,
      {
        company: app.company || "",
        title: app.title || "",
        status: app.status || "",
        link: app.link || "",
        contact: app.contact || "",
        date: app.date || "",
        stage: app.stage || "",
        custom: app.custom || null,
      },
      { new: true, runValidators: true }
    );

    if (updatedApp) {
      return res.status(200).json({
        success: true,
        message: "application updated successfully!",
      });
    }
    return res.status(500).json({
      success: false,
      message: "error when updating the application. Please try again later.",
    });
  } catch (error) {
    console.log("error from the editJobApplication controller: ", error);
    return res.status(500).json({
      success: false,
      message: "error when updating the application. Please try again later.",
    });
  }
};

export const updateJobApplicationStatus = async (req, res) => {
  try {
    if (!req.body?.status || !req.params?.jobId) {
      return res.status(400).json({
        success: false,
        message: "application data and id are required in the request body",
      });
    }

    const updatedApp = await JobApplication.findByIdAndUpdate(
      req.params.jobId,
      { status: req.body.status },
      { new: true }
    );

    if (updatedApp) {
      return res.status(200).json({
        success: true,
        message: "application updated successfully!",
      });
    }
    return res.status(500).json({
      success: false,
      message: "error when updating the application. Please try again later.",
    });
  } catch (error) {
    console.log("error from the editJobApplication controller: ", error);
    return res.status(500).json({
      success: false,
      message: "error when updating the application. Please try again later.",
    });
  }
};

export const deleteJobApplication = async (req, res) => {
  try {
    if (!req.body?.id) {
      return res.status(400).json({
        success: false,
        message: "application id is required in the request body",
      });
    }

    const deletedApp = await JobApplication.findByIdAndDelete(req.body.id);

    if (deletedApp) {
      return res.status(200).json({
        success: true,
        message: "application deleted successfully!",
      });
    }
    return res.status(500).json({
      success: false,
      message: "error when deleting the application. Please try again later.",
    });
  } catch (error) {
    console.log("error from the deleteJobApplication controller: ", error);
    return res.status(500).json({
      success: false,
      message: "error when deleting the application. Please try again later.",
    });
  }
};
