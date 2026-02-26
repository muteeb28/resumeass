import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";
import HrIndianList from "../model/hrIndianList.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importDataFromCSV(filePath) {
  const users = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (!row.Email || !row.Name) return;
        users.push({
          name: row.Name.trim(),
          email: row.Email.trim(),
          title: row.Title?.trim() || "",
          company: row.Company?.trim() || "",
        });
      })
      .on("end", async () => {
        try {
          if (!users.length) {
            resolve();
            return;
          }

          const operations = users.map((user) => ({
            updateOne: {
              filter: { email: user.email.toLowerCase() },
              update: { $setOnInsert: user },
              upsert: true,
            },
          }));

          await HrIndianList.bulkWrite(operations, { ordered: false });
          console.log("csv file successfully processed and data imported to database: ", users.length);
          resolve();
        } catch (error) {
          console.error("Error importing data to database: ", error);
          reject(error);
        }
      })
      .on("error", reject);
  });
}

export const addDatafForHrIndiaLists = async (req, res) => {
  try {
    const filePath = path.resolve(__dirname, "../assets/HR_Lists-Sheet1.csv");
    console.log("target file: ", filePath);
    await importDataFromCSV(filePath);
    res.status(200).json({
      success: true,
      msg: "data imported successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      msg: "Error importing data to database",
    });
  }
};

export const getHrIndianListDemo = async (req, res) => {
  try {
    const data = await HrIndianList.find({}).limit(10).lean();

    return res.status(200).json({
      success: true,
      list: data,
    });
  } catch (error) {
    console.log("error from the getHrIndianListDemo controller: ", error);
    res.status(500).json({
      success: false,
      message: "error when fetching from the db. Please try again later.",
    });
  }
};
