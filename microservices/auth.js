import express from 'express';
import cors from 'cors';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from "firebase/auth";

// Web app's Firebase configuration
const firebaseConfig = `${FIREBASE_CONFIG}`;

const app = express();
const PORT_SERVER = 3003;
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

/**
 * Middleware to handle cors and json
 */
app.use(express.json());
app.use(cors());

/**
 * Route to create user or SignUp with email ID and password on FireBase and return UID
 */
app.post('/createUser', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            console.log(email, 'User Created:', user.uid);
            res.status(201).json({ message: 'User created successfully', uid: user.uid });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
            res.status(500).json({ message: errorMessage });
        });
});

/**
 * Route to signin using email id and password on FireBase and return the UID
 */
app.post('/getuser', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log('User exist:', user.uid);
            res.status(201).json({ message: 'User exist', uid: user.uid });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(errorCode, errorMessage);
            res.status(500).json({ code: errorCode, message: errorMessage });
        });
});

/**
 * Route to handle Google signin into FireBase and return UID
 */
app.post('/googleSignIn', (req, res) => {

    const id_token = req.body.token;
    const credential = GoogleAuthProvider.credential(id_token);

    signInWithCredential(auth, credential)
        .then((result) => {
            const user = result.user;
            console.log("user created", user.uid)
            res.status(201).json({ message: 'User Logged In successfully with google', uid: user.uid });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            res.status(500).json({ code: errorCode, message: errorMessage });
        });
});

app.listen(PORT_SERVER, () => console.log(`Node server listening on : http://127.0.0.1:${PORT_SERVER}`));

