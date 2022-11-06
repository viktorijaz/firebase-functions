const functions = require("firebase-functions");
const express = require("express");
const cors = require('cors')({ origin: true }); 

const admin = require("firebase-admin");
admin.initializeApp();

const app = express();

/** Get all the previous Fibonacci calculations */
app.get("/", async (req, res) => {
  const snapshot = await admin.firestore().collection("availableCalculations").get();

  let calculations = [];
  snapshot.forEach((doc) => {
    let id = doc.id;
    let data = doc.data();

    calculations.push({ id, ...data });
  });

  res.status(200).send(JSON.stringify(calculations));
});

/** Calculate a Fibonacci number
 * this will be a REST Endpoint, so we use cors here
 */
app.get("/:id", async (req, res) => {
  return cors(req, res, async() => {  
    const result = fibonacci(req.params.id);
    functions.logger.info("fibonacci! ", req.params.id, {structuredData: true});
 
    await admin.firestore().collection("availableCalculations").add({
        date: new Date(),
        result: result
    });

    res.status(200).send(JSON.stringify(result));
  });
})

/** helper method */
const fibonacci = n => {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
};

exports.calculation = functions.https.onRequest(app);

