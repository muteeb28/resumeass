import fs from "fs";
import csv from "csv-parser";
import db from '../db/db.js';
const { getPool } = db;
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// csv file import helper function
async function importDataFromCSV(filePath) {
    const users = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                // Skip junk / empty rows (Google Sheets issue)
                console.log('processing row: ', row);
                if (!row.Email || !row.Name) return;
                users.push({
                    name: row.Name.trim(),
                    email: row.Email.trim(),
                    title: row.Title?.trim() || "",
                    company: row.Company?.trim() || "",
                });
            })
            .on('end', async () => {
                try {
                    const pool = getPool();
                    // Since pg doesn't have a native createMany with skipDuplicates for arbitrary objects easily,
                    // we'll do individual inserts with ON CONFLICT DO NOTHING
                    for (const user of users) {
                        await pool.query(
                            `INSERT INTO "hrIndianLists" (name, email, title, company)
                         VALUES ($1, $2, $3, $4)
                         ON CONFLICT (email) DO NOTHING`,
                            [user.name, user.email, user.title, user.company]
                        );
                    }

                    console.log('csv file successfully processed and data imported to database: ', users.length);
                    resolve();
                } catch (error) {
                    console.error('Error importing data to database: ', error);
                    reject(error);
                }
            })
            .on('error', reject);
    })
};

export const addDatafForHrIndiaLists = async (req, res) => {
    try {
        const filePath = path.resolve(__dirname, '../assets/HR_Lists-Sheet1.csv');
        console.log('target file: ', filePath);
        await importDataFromCSV(filePath);
        res.status(200).json({
            success: true,
            msg: 'data imported successfully!',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: 'Error importing data to database',
        })
    }
}

export const getHrIndianListDemo = async (req, res) => {
    try {
        const pool = getPool();
        const { rows: data } = await pool.query(
            'SELECT * FROM "hrIndianLists" LIMIT 10'
        );

        return res.status(200).json({
            success: true,
            list: data,
        });
    } catch (error) {
        console.log("error from the getHrIndianListDemo controller: ", error);
        res.status(500).json({
            success: false,
            message: "error when fetching from the db. Please try again later."
        });
    }
}
