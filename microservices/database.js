import express from 'express';
import { MongoClient, ServerApiVersion, Timestamp } from 'mongodb';
import cors from 'cors';

const app = express();
const PORT_SERVER = 3004;
const uri = 'mongodb://localhost:27017/ProjectShohaibMallick';

/*
creating connection to DB
*/
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}
);

/*
connecting to DB
*/
client.connect(err => {
    if (err) {
        throw err;
    }
});

/*
Database Objects
*/
const db = client.db('ProjectShohaibMallick');
const collectionUsers = db.collection('users');
const collectionTiles = db.collection('tiles');

app.use(cors()); // Enable CORS for all routes
app.use(express.json());    //Enable JSON

/**
 * Creating new user
 */
app.post('/createUser', async (req, res) => {
    const uid = req.body.uid;
    const dataToInsert = {
        uid: uid,
        temperatureUnit: "F"
    }

    console.log("Creating User: ", dataToInsert);

    try {
        const result = await collectionUsers.insertOne(dataToInsert);
        console.log('Write Successful', dataToInsert);
        res.status(200).send('Data inserted successfully');
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Error inserting data');
    }
    console.log("\n\n");
});

/**
 * Get user details
 */
app.post('/getUser', async (req, res) => {
    try {

        const uid = req.body.uid;
        console.log("uid", uid)
        const userDetails = await collectionUsers.find({ uid: uid }).limit(1).toArray();

        if (userDetails == "") {
            console.log("user Not exists");
        }
        else {
            console.log('No error in read');
            console.log('User Details:', userDetails);
        }
        res.status(200).json(userDetails[0]);
    } catch (error) {
        console.error('Error in read:', error);
        res.status(500).send('Error fetching courses');
    }
    console.log("\n\n");
});

/**
 * return Boolean value of if user is premium user
 */
app.post('/isPremiumUser', async (req, res) => {
    console.log()
    try {
        const uid = req.body.uid;
        console.log("uid", uid)
        const userDetails = await collectionUsers.find({ uid: uid }).limit(1).toArray();

        if (userDetails == "") {
            console.log(`User ${uid} not found`);
            res.status(200).json({ result: false });
        }
        else {
            // console.log('No error in read');
            console.log(`User ${uid} found`);
            console.log('User Details:', userDetails);
            res.status(200).json({ result: true });
        }
    } catch (error) {
        console.error('Error in read:', error);
        res.status(500).send('Error fetching courses');
    }
    console.log("\n\n");
});

/**
 * Writing tile data in Database
 */
app.post('/tiledata', async (req, res) => {
    try {
        const uid = req.body.uid;
        const tileData = req.body.tileData;
        console.log("insert or update tile data:-")
        console.log("uid", uid);
        console.log("tiledata", tileData);
        const filter = { uid: uid };
        const update = { $set: { tileData: tileData } };

        const result = await collectionTiles.updateOne(filter, update, { upsert: true });

        if (result.upsertedCount > 0) {
            console.log('Document inserted:', result);
        } else {
            console.log('Document updated', result);
        }
        res.status(201).send('Insert successful');
    } catch (error) {
        console.error('Error in read:', error);
        res.status(500).send('Error fetching courses');
    }
    console.log("\n\n");
});

/**
 * return tile data found in Database
 */
app.post('/getTileData', async (req, res) => {
    try {
        const uid = req.body.uid;

        console.log("uid", uid);

        const userDetails = await collectionTiles.find({ uid: uid }).limit(1).toArray();

        if (userDetails == "") {
            console.log("user Not exists");
        }
        else {
            console.log('No error in read');
            console.log('tileData: \n', userDetails[0].tileData);
        }
        res.status(200).json(userDetails[0].tileData);

    } catch (error) {
        console.error('Error in read:', error);
        res.status(500).send('Error fetching courses');
    }
    console.log("\n\n");

});

app.listen(PORT_SERVER, () => console.log(`Node server listening on : http://127.0.0.1:${PORT_SERVER}`));
