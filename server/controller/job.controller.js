import JobApplication from "../model/jobApplication.model.js";

const normalizeApplication = (app, userId) => ({
  company: app.company || "",
  title: app.title || "",
  status: app.status || "Applied",
  link: app.link || "",
  contact: app.contact || "",
  date: app.date || "",
  stage: app.stage || "Initial Screening",
  // New Fields
  salary: app.salary || "",
  location: app.location || "",
  priority: app.priority || "Medium",
  referral: app.referral || "none",
  notes: app.notes || "",
  custom: app.custom || null,
});

const mapWithId = (doc) => {
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  return obj;
};

const mapWithId = (doc) => {
  const obj = doc?.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: String(obj._id),
  };
};

export const getJobApplications = async (req, res) => {
  try {
    // 1. Get the user ID from the request (authenticated user)
    const userId = req.user?.id; 

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User ID not found.",
      });
    }

    // 2. Find applications only belonging to this user
    const jobApplications = await JobApplication.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Map IDs for the frontend
    const applications = jobApplications.map((app) => ({
      ...app,
      id: String(app._id),
      _id: String(app._id), // Keeping both for compatibility
    }));

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Error in getJobApplications:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching your job applications",
    });
  }
};

export const setJobApplication = async (req, res) => {
  try {
    const singleApplication = req.body?.application;
    const multipleApplications = req.body?.applications;

    // Handle Single Application Save (usually from the "Save" button on a specific row)
    if (singleApplication && typeof singleApplication === "object") {
      const applicationData = normalizeApplication(singleApplication, req.user.id);

      if (!applicationData.title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Job title is required.",
        });
      }

      const created = await JobApplication.create(applicationData);

      return res.status(201).json({
        success: true,
        message: "Application saved successfully.",
        application: mapWithId(created),
      });
    }

    // Handle Bulk Save (from the "Save Drafts" button)
    if (!Array.isArray(multipleApplications) || multipleApplications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No application data provided.",
      });
    }

    const applicationsToInsert = multipleApplications
      .map((app) => normalizeApplication(app))
      .filter((app) => app.title.trim());

    if (applicationsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one application must have a valid title.",
      });
    }

    const createdApps = await JobApplication.insertMany(applicationsToInsert, {
      ordered: true,
    });

    return res.status(201).json({
      success: true,
      message: `${createdApps.length} applications saved successfully.`,
      applications: createdApps.map((doc) => mapWithId(doc)),
    });
  } catch (error) {
    console.error("Error in setJobApplication controller:", error);

    // Handle MongoDB Duplicate Key Error (if you kept any unique indexes)
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate entry detected. This application might already exist.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while saving applications.",
    });
  }
};

export const editJobApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applicationData = req.body?.application;

    // 1. Validation
    if (!applicationData || !jobId) {
      return res.status(400).json({
        success: false,
        message: "Application data and Job ID are required.",
      });
    }

    // 2. Normalize (This grabs company, title, status, link, contact, date, stage, 
    // AND the new fields: salary, location, priority, referral, notes)
    const normalizedApp = normalizeApplication(applicationData);

    if (!normalizedApp.title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title is required to update an application.",
      });
    }

    // 3. Update Database
    const updatedApp = await JobApplication.findByIdAndUpdate(
      jobId,
      { $set: normalizedApp }, // Use $set with the normalized object to include all fields
      { new: true, runValidators: true }
    );

    if (!updatedApp) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application updated successfully!",
      application: mapWithId(updatedApp),
    });

  } catch (error) {
    console.error("Error from the editJobApplication controller:", error);

    // Handle Duplicate Key Error
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate entry detected.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the application.",
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
