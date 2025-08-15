const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// --- Firebase Admin SDK Initialization ---
// IMPORTANT: Download your service account key from Firebase console
// and place it in your project directory.
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---

// GET all products
app.get('/api/products', async (req, res) => {
    try {
        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();
        if (snapshot.empty) {
            return res.status(404).json({ message: 'No products found' });
        }
        let products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET a single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const productRef = db.collection('products').doc(productId);
        const doc = await productRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// --- NEW: POST a new product ---
app.post('/api/products', async (req, res) => {
    try {
        const { name, description, price, imageUrl } = req.body;

        // Basic validation
        if (!name || !description || !price) {
            return res.status(400).json({ message: 'Missing required fields: name, description, price' });
        }

        const newProduct = {
            name,
            description,
            price: Number(price),
            imageUrl: imageUrl || ''
        };

        const docRef = await db.collection('products').add(newProduct);
        res.status(201).json({ id: docRef.id, ...newProduct });

    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// --- Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// --- Helper to set user as admin ---
// Run this function to grant admin privileges to a specific user
async function setUserAsAdmin(userEmail) {
    try {
        // Find user by email
        const usersRef = db.collection('users');
        const q = usersRef.where('email', '==', userEmail);
        const querySnapshot = await q.get();
        
        if (querySnapshot.empty) {
            console.log(`User with email ${userEmail} not found. Please make sure the user has logged in at least once.`);
            return;
        }
        
        const userDoc = querySnapshot.docs[0];
        await userDoc.ref.update({ role: 'admin' });
        console.log(`User ${userEmail} has been granted admin privileges!`);
    } catch (error) {
        console.error('Error setting user as admin:', error);
    }
}

// --- Helper to add sample data to Firestore ---
// You can run this function once to populate your database.
// Make sure to comment it out or remove it after use.
async function addSampleProducts() {
    const products = [
        {
            name: "Laptop Pro",
            description: "A high-performance laptop for all your professional needs. Features a stunning display and blazing-fast processor.",
            price: 1299.99,
            imageUrl: "https://placehold.co/600x600/3498db/ffffff?text=Laptop+Pro"
        },
        {
            name: "Wireless Headphones",
            description: "Immerse yourself in crystal-clear audio with these noise-cancelling wireless headphones. Long-lasting battery life.",
            price: 199.99,
            imageUrl: "https://placehold.co/600x600/9b59b6/ffffff?text=Headphones"
        },
        {
            name: "Smart Watch",
            description: "Stay connected and track your fitness goals with this sleek and stylish smart watch. Syncs with your smartphone.",
            price: 249.50,
            imageUrl: "https://placehold.co/600x600/e74c3c/ffffff?text=Smart+Watch"
        },
        {
            name: "Coffee Maker",
            description: "Brew the perfect cup of coffee every morning. Programmable and easy to clean.",
            price: 89.99,
            imageUrl: "https://placehold.co/600x600/1abc9c/ffffff?text=Coffee+Maker"
        },
        {
            name: "Gaming Mouse",
            description: "Get the competitive edge with this ergonomic gaming mouse, featuring customizable buttons and RGB lighting.",
            price: 79.99,
            imageUrl: "https://placehold.co/600x600/f1c40f/ffffff?text=Gaming+Mouse"
        },
        {
            name: "Mechanical Keyboard",
            description: "A durable and responsive mechanical keyboard for typing and gaming. Satisfying tactile feedback.",
            price: 120.00,
            imageUrl: "https://placehold.co/600x600/2ecc71/ffffff?text=Keyboard"
        },
        {
            name: "4K Monitor",
            description: "Experience stunning visuals with this 27-inch 4K UHD monitor. Perfect for creative work and entertainment.",
            price: 450.00,
            imageUrl: "https://placehold.co/600x600/34495e/ffffff?text=4K+Monitor"
        },
        {
            name: "Portable SSD",
            description: "1TB of lightning-fast storage in a compact design. Transfer large files in seconds.",
            price: 150.00,
            imageUrl: "https://placehold.co/600x600/e67e22/ffffff?text=Portable+SSD"
        }
    ];

    const productsCollection = db.collection('products');
    console.log("Adding sample products to Firestore...");
    for (const product of products) {
        await productsCollection.add(product);
    }
    console.log("Sample products added successfully!");
}

// Uncomment the lines below to run the functions.
// addSampleProducts().catch(console.error);

// To grant admin privileges to a user, uncomment and modify the line below:
// setUserAsAdmin('user@example.com').catch(console.error);
