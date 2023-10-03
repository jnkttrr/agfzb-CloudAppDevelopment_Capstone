const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const Cloudant = require('@cloudant/cloudant');

// Initialize Cloudant connection with IAM authentication
async function dbCloudantConnect() {
    secret = {"COUCH_URL": "https://c2dd735d-1ba4-421a-a233-b8fae3da2577-bluemix.cloudantnosqldb.appdomain.cloud",
    "IAM_API_KEY": "s6o57bOZhFsli_ep9d4hKUdB-pAUOcJ62YkSJc6FqaM-",
    "COUCH_USERNAME": "c2dd735d-1ba4-421a-a233-b8fae3da2577-bluemix"
    };
    try {
        const cloudant = Cloudant({
            plugins: { iamauth: { iamApiKey: secret.IAM_API_KEY } }, // Replace with your IAM API key
            url: secret.COUCH_URL, // Replace with your Cloudant URL
        });

        const db = cloudant.use('reviews');
        console.info('Connect success! Connected to DB');
        return db;
    } catch (err) {
        console.error('Connect failure: ' + err.message + ' for Cloudant DB');
        throw err;
    }
}

let db;

(async () => {
    db = await dbCloudantConnect();
})();

app.use(express.json());

// Define a route to get all dealerships with optional state and ID filters
app.get('/reviews/get', (req, res) => {
    const { state, id } = req.query;

    // Create a selector object based on query parameters
    const selector = {};
    if (state) {
        selector.state = state;
    }
    if (id) {
        selector._id = id;
    }

    const queryOptions = {
        selector,
        limit: 10, // Limit the number of documents returned to 10
    };

    db.find(queryOptions, (err, body) => {
        if (err) {
            console.error('Error fetching reviews:', err);
            res.status(500).json({ error: 'An error occurred while fetching reviews.' });
        } else {
            const reviews = body.docs;
            res.json(reviews);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
