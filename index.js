/* Packages. */
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

/* Initialize dotenv. */
require('dotenv').config()

/* TODO: Add simple rate limiting using a package. */

/* Initialize ExpressJS. */
const app = express();
app.use(express.static(path.join(__dirname, 'client/build')));

/* Initialize Firestore. */
admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

/* Initialize HMAC. */
const crypto = require('crypto');

/* API Endpoints. */

/* Generate public/secret key pair.
    - Note: we only want _legitimate_ public/secret key pairs being used.
    - In order to do this, each public key is actually:
        RAND() | HMAC(RAND(), key=SERVER_KEY)
    - Before doing operations with the public key, the server checks the signature.
    - This protects against users performing arbitrary operations.
    - Note: PK/SK's are not encryption keys; they're simply conceptual.
*/
app.get('/createNode', (req, res) => {
    /* We create a public/private key pair. */
    var publicKey = generatePublicKey();
    var privateKey = generatePrivateKey();
    /* Add a node to Firebase. */
    var me = {
        'publicKey': publicKey,
        'privateKey': privateKey,
        'dateCreated': FieldValue.serverTimestamp()
    }
    await db.collection('nodes').doc(publicKey).set(me);           
});

app.post('/addEdge', function (req, res) {
    /* Add an edge to Firebase. */
    updateEdge(req, FieldValue.serverTimestamp());
})

app.post('/removeEdge', function (req, res) {
    /* Delete an edge from Firebase. */
    updateEdge(req, null);
})

function updateEdge(req, value) {
    var me = req.query.me;          /* My public key. */
    var auth = req.query.auth;      /* My private key. */
    var friend = req.query.friend;  /* My friend's public key. */

    if (me == null || auth == null || friend == null) res.send('error');
    else if (me === undefined || auth === undefined || friend === undefined) res.send('error');
    else if (!validatePublicKey(friend) || !validatePublicKey(me) || !validateKeyPair(me, auth)) res.send('error');
    else {
        /* Push the edge. */
        var meUpdate = {};
        meUpdate["edges." + friend] = value;
        var friendUpdate = {};
        friendUpdate["edges." + me] = value;
        await db.collection('nodes').doc(me).update(meUpdate);            
        await db.collection('nodes').doc(friend).update(friendUpdate);
    }
}
  
function getHmac(rand) {
    /* Get a HMAC from our random string. */
    return crypto.createHmac('sha256', process.env.HMAC_KEY).update(rand).digest('hex').slice(0, 15);;
}

function generatePublicKey() {
    /* Generate a public key. */
    const _, buf = crypto.randomBytes(8);
    var rand = buf.toString('hex');
    var pk = rand + '-' + crypto.createHmac('sha256', process.env.HMAC_KEY).update(rand).digest('hex').slice(0, 15);
    return pk
}

function validatePublicKey(key) {
    /* Verify that the signature is what we expect. */
    if (key == null) return false;
    if (key.length != 16) return false;
    var parts = key.split('-');
    if (parts.length != 2) return false;
    var rand = parts[0];
    var sign = parts[1];
    if (sign != getHmac(rand)) return false;
    return true;
}

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('Listening on port ' + port);