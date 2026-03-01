import JobApplication from "../model/jobApplication.model.js";

const normalizeApplication = (app = {}) => ({
  company: app.company || "",
  title: app.title || "",
  status: app.status || "Applied",
  link: app.link || "",
  contact: app.contact || "",
  date: app.date || "",
  stage: app.stage || "",
  custom: app.custom || {},
});

const mapWithId = (doc) => {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: String(obj._id),
  };
};

export const getJobApplications = async (req, res) => {
  try {
    const jobApplications = await JobApplication.find({}).sort({ createdAt: -1 }).lean();

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
    return res.status(500).json({
      success: false,
      msg: "Error fetching job applications",
    });
  }
};

export const setJobApplication = async (req, res) => {
  try {
    const singleApplication = req.body?.application;
    const multipleApplications = req.body?.applications;

    if (singleApplication && typeof singleApplication === "object") {
      const application = normalizeApplication(singleApplication);

      if (!application.title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title is required to save an application.",
        });
      }

      const created = await JobApplication.create(application);

      return res.status(201).json({
        success: true,
        message: "Application submitted successfully.",
        application: mapWithId(created),
      });
    }

    if (!Array.isArray(multipleApplications) || multipleApplications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "application data is required in the request body",
      });
    }

    const applicationsToInsert = multipleApplications
      .map((app) => normalizeApplication(app))
      .filter((app) => app.title.trim());

    if (applicationsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Each application must have a title.",
      });
    }

    const createdApps = await JobApplication.insertMany(applicationsToInsert, {
      ordered: true,
    });

    return res.status(201).json({
      success: true,
      message: "Applications submitted successfully.",
      applications: createdApps.map((doc) => mapWithId(doc)),
    });
  } catch (error) {
    console.log("error from the setJobApplication controller: ", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate title detected. Each title must currently be unique.",
      });
    }

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

    const app = normalizeApplication(req.body.application);
    if (!app.title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required to update an application.",
      });
    }

    const updatedApp = await JobApplication.findByIdAndUpdate(
      req.params.jobId,
      {
        company: app.company,
        title: app.title,
        status: app.status,
        link: app.link,
        contact: app.contact,
        date: app.date,
        stage: app.stage,
        custom: app.custom,
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

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate title detected. Each title must currently be unique.",
      });
    }

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
    const applicationId = req.body?.id || req.body?._id;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "application id is required in the request body",
      });
    }

    const deletedApp = await JobApplication.findByIdAndDelete(applicationId);

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
