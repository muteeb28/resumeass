import db from '../db/db.js';
const { getPool } = db;

export const getJobApplications = async (req, res) => {
    try {
        const pool = getPool();
        const { rows: jobApplications } = await pool.query('SELECT * FROM "jobApplications"');
        console.log("job applications fetched: ", jobApplications);
        return res.status(200).json({
            success: true,
            applications: jobApplications
        });
    } catch (error) {
        console.log('error from the getJobApplications controller: ', error);
        res.status(500).json({
            success: false,
            msg: 'Error fetching job applications',
        });
    }
}

export const setJobApplication = async (req, res) => {
    try {
        if (!req.body?.applications || !Array.isArray(req.body?.applications) || req.body?.applications.length === 0) {
            return res.status(400).json({
                success: false,
                message: "application data is required in the request body",
            });
        }

        const pool = getPool();
        let count = 0;

        for (const app of req.body.applications) {
            const { rowCount } = await pool.query(
                `INSERT INTO "jobApplications" 
                 (company, title, status, link, contact, date, stage, custom)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (title) DO NOTHING`,
                [app.company, app.title, app.status, app.link, app.contact, app.date, app.stage, app.custom ? JSON.stringify(app.custom) : null]
            );
            count += rowCount;
        }

        if (count > 0) {
            return res.status(200).json({
                success: true,
                message: "application submitted successfully!",
            });
        }
        return res.status(500).json({
            success: false,
            message: "error when saving the application. Please try again later."
        })
    } catch (error) {
        console.log("error from the setJobApplication controller: ", error);
        return res.status(500).json({
            success: false,
            message: "error when saving the application. Please try again later."
        })
    }
}

export const editJobApplication = async (req, res) => {
    try {
        if (!req.body?.application || !req.params?.jobId) {
            return res.status(400).json({
                success: false,
                message: "application data and id are required in the request body",
            });
        }

        const pool = getPool();
        const app = req.body.application;

        const { rows: [updatedApp] } = await pool.query(
            `UPDATE "jobApplications"
             SET company = $1, title = $2, status = $3, link = $4, contact = $5, date = $6, stage = $7, custom = $8, "updatedAt" = CURRENT_TIMESTAMP
             WHERE id = $9
             RETURNING id`,
            [app.company, app.title, app.status, app.link, app.contact, app.date, app.stage, app.custom ? JSON.stringify(app.custom) : null, req.params.jobId]
        );

        if (updatedApp && updatedApp.id) {
            return res.status(200).json({
                success: true,
                message: "application updated successfully!",
            })
        }
        return res.status(500).json({
            success: false,
            message: "error when updating the application. Please try again later."
        });
    } catch (error) {
        console.log("error from the editJobApplication controller: ", error);
        return res.status(500).json({
            success: false,
            message: "error when updating the application. Please try again later."
        });
    }
}

export const updateJobApplicationStatus = async (req, res) => {
    try {
        if (!req.body?.status || !req.params?.jobId) {
            return res.status(400).json({
                success: false,
                message: "application data and id are required in the request body",
            });
        }

        const pool = getPool();
        const { rows: [updatedApp] } = await pool.query(
            `UPDATE "jobApplications"
             SET status = $1, "updatedAt" = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id`,
            [req.body.status, req.params.jobId]
        );

        if (updatedApp && updatedApp.id) {
            return res.status(200).json({
                success: true,
                message: "application updated successfully!",
            })
        }
        return res.status(500).json({
            success: false,
            message: "error when updating the application. Please try again later."
        });
    } catch (error) {
        console.log("error from the editJobApplication controller: ", error);
        return res.status(500).json({
            success: false,
            message: "error when updating the application. Please try again later."
        });
    }
}

export const deleteJobApplication = async (req, res) => {
    try {
        if (!req.body?.id) {
            return res.status(400).json({
                success: false,
                message: "application id is required in the request body",
            });
        }

        const pool = getPool();
        const { rows: [deletedApp] } = await pool.query(
            'DELETE FROM "jobApplications" WHERE id = $1 RETURNING id',
            [req.body.id]
        );

        if (deletedApp && deletedApp.id) {
            return res.status(200).json({
                success: true,
                message: "application deleted successfully!",
            });
        }
        return res.status(500).json({
            success: false,
            message: "error when deleting the application. Please try again later."
        });
    } catch (error) {
        console.log("error from the deleteJobApplication controller: ", error);
        return res.status(500).json({
            success: false,
            message: "error when deleting the application. Please try again later."
        });
    }
}
