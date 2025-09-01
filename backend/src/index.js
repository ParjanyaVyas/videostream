// require("dotenv").config({ path: './.env' });

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
});


connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("Error: Application not abel to talk to DB ", error);
            throw error;
        });

        app.listen(process.env.PORT || 8000, () => {
            console.log(`App is listining on port ${process.env.PORT}`);
        });
    })

    .catch((error) => {
        console.log("MONGODB connection failed: !!!", error);
    });



/*

//one method to connect to Database but its poluting index.js so we will create a new file db/index.js and connect from there.

import express from "express";
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI} / ${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error: Application not abel to talk to DB ", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`App is listining on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.error(error);
        throw error
    }
})()

*/