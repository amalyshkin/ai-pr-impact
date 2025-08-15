import React, { createContext, useState, useEffect, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- App Context ---
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({});
    const [currentPage, setCurrentPage] = useState('products'); // products, cart, productDetail, login, signup, admin
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authMessage, setAuthMessage] = useState(null);
    
    // --- Authentication ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                loadCart(user.uid);
                await loadUserRole(user.uid);
                if(authMessage) setAuthMessage(null);
            } else {
                setCart({});
                setUserRole(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [authMessage]);

    // --- User Role Management ---
    const loadUserRole = async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserRole(userSnap.data().role || 'user');
            } else {
                // Create new user with default role
                await setDoc(userRef, { role: 'user', email: user.email, createdAt: new Date() });
                setUserRole('user');
            }
        } catch (err) {
            console.error('Failed to load user role:', err);
            setUserRole('user'); // Default to user role on error
        }
    };

    const isAdmin = () => {
        return userRole === 'admin';
    };

    const signUp = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const logIn = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const logOut = async () => {
        await signOut(auth);
        setCurrentPage('products');
    };
    
    const navigate = (page) => {
        setError(null);
        setAuthMessage(null);
        setCurrentPage(page);
    };

    // --- Product Fetching ---
    const fetchProducts = async () => {
        try {
            const productsCollection = collection(db, 'products');
            const productSnapshot = await getDocs(productsCollection);
            const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productList);
        } catch (err) {
            setError('Failed to fetch products.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // --- Cart Management ---
    const loadCart = async (userId) => {
        try {
            const cartRef = doc(db, 'carts', userId);
            const cartSnap = await getDoc(cartRef);
            if (cartSnap.exists()) {
                setCart(cartSnap.data().items || {});
            } else {
                setCart({});
            }
        } catch (err) {
            setError('Failed to load cart.');
            console.error(err);
        }
    };

    const saveCart = async (newCart) => {
        if (!user) return;
        try {
            const cartRef = doc(db, 'carts', user.uid);
            await setDoc(cartRef, { items: newCart });
        } catch (err) {
            setError('Failed to save cart.');
            console.error(err);
        }
    };

    const addToCart = (productId) => {
        if (!user) {
            setAuthMessage('Please log in to add items to your cart.');
            setCurrentPage('login');
            return;
        }

        const newCart = { ...cart };
        newCart[productId] = (newCart[productId] || 0) + 1;
        setCart(newCart);
        saveCart(newCart);
    };

    const removeFromCart = (productId) => {
        const newCart = { ...cart };
        if (newCart[productId] > 1) {
            newCart[productId] -= 1;
        } else {
            delete newCart[productId];
        }
        setCart(newCart);
        saveCart(newCart);
    };

    const deleteFromCart = (productId) => {
        const newCart = { ...cart };
        delete newCart[productId];
        setCart(newCart);
        saveCart(newCart);
    };

    const viewProduct = (product) => {
        setSelectedProduct(product);
        navigate('productDetail');
    };

    const value = {
        user,
        userRole,
        isAdmin,
        products,
        cart,
        currentPage,
        selectedProduct,
        loading,
        error,
        authMessage,
        signUp,
        logIn,
        logOut,
        addToCart,
        removeFromCart,
        deleteFromCart,
        navigate,
        fetchProducts,
        db,
        cartCount: Object.values(cart).reduce((acc, count) => acc + count, 0),
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
