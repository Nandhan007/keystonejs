// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import { config } from "@keystone-6/core";

// to keep this file tidy, we define our schema in a different file
import { lists } from "./schema";

// authentication is configured separately here too, but you might move this elsewhere
// when you write your list-level access control functions, as they typically rely on session data
import { withAuth, session } from "./auth";
import CustomPage from "./admin/components/CustomPage";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_SCHEMA,
  port: Number(process.env.DB_PORT),
});

// Sync data from MySQL to Keystone
async function syncMySQLDataToKeystone(context: any) {
  const [rows] = await dbConnection.query("SELECT * FROM MFP_Target");

  console.log(rows);
  for (const row of rows) {
    console.log(row);
    // Normalize the Sales field to remove commas and convert to a number
    const normalizedSales = parseInt(row.Sales.replace(/,/g, ""), 10);

    // Find existing record by composite key
    const existingRecords = await context.query.MySQLDataList.findMany({
      where: {
        AND: [
          { version: { equals: row.Version } },
          { businessUnit: { equals: row.BusinessUnit } },
          { month: { equals: new Date(row.Month).toISOString() } },
        ],
      },
      query: "id version businessUnit month sales", // Retrieve matching fields for comparison
    });

    if (existingRecords.length > 0) {
      // Update the existing record
      console.log("Updating existing record:", {
        version: row.Version,
        businessUnit: row.BusinessUnit,
        month: row.Month,
        sales: normalizedSales,
      });

      await context.query.MySQLDataList.updateOne({
        where: { id: existingRecords[0].id },
        data: { sales: normalizedSales },
      });
    } else {
      // Create a new record
      console.log("Creating new record:", {
        version: row.Version,
        businessUnit: row.BusinessUnit,
        month: row.Month,
        sales: normalizedSales,
      });

      await context.query.MySQLDataList.createOne({
        data: {
          version: row.Version,
          businessUnit: row.BusinessUnit,
          month: new Date(row.Month).toISOString(),
          sales: normalizedSales,
        },
      });
    }
  }
}

// sync to mysql

async function syncKeystoneDataToMySQL(context: any) {
  // Fetch data from Keystone
  const keystoneData = await context.query.MySQLDataList.findMany({
    query: "version businessUnit month sales", // Adjust based on your schema
  });

  console.log("Keystone Data:", keystoneData);

  for (const record of keystoneData) {
    try {
      // Use INSERT INTO ... ON DUPLICATE KEY UPDATE for upsert
      const query = `
        INSERT INTO MFP_Target (Version, BusinessUnit, Month, Sales)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        Version = VALUES(Version),
        BusinessUnit = VALUES(BusinessUnit),
        Month = VALUES(Month),
        Sales = VALUES(Sales)
      `;

      const values = [
        record.version,
        record.businessUnit,
        new Date(record.month).toISOString(),
        record.sales,
      ];

      await dbConnection.query(query, values);

      console.log("Upserted record:", record);
    } catch (error) {
      console.error("Error syncing record to MySQL:", error);
    }
  }

  console.log("Data sync complete.");
}

export default withAuth(
  config({
    server: {
      cors: {
        origin: ["http://localhost:5173"], // Allow requests from React's development server
        credentials: true, // If you're using cookies for authentication
      },
      extendExpressApp: (app, createContext) => {
        app.get("/sync-mysql", async (req, res) => {
          const context = createContext.sudo();
          try {
            await syncMySQLDataToKeystone(context);
            res.send("MySQL data synced to Keystone Admin UI");
          } catch (error) {
            console.error("Error syncing MySQL data:", error);
            res.status(500).send("Error syncing data");
          }
        });

        app.get("/sync-keystone", async (req, res) => {
          const context = createContext.sudo();
          try {
            await syncKeystoneDataToMySQL(context);
            res.send("Keystone data synced to MySQL");
          } catch (error) {
            console.error("Error syncing Keystone data to MySQL:", error);
            res.status(500).send("Error syncing data");
          }
        });
      },
    },
    db: {
      // we're using sqlite for the fastest startup experience
      //   for more information on what database might be appropriate for you
      //   see https://keystonejs.com/docs/guides/choosing-a-database#title
      provider: "sqlite",
      url: "file:./keystone.db",
    },
    lists,
    session,
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
  })
);
