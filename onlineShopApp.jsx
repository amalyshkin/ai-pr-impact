import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

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
// NOTE: In a multi-file project, this context would be in its own file (e.g., AppContext.js)
// and imported into both the main app and the admin page.
export const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({});
    const [currentPage, setCurrentPage] = useState('products'); // products, cart, productDetail, login, signup
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authMessage, setAuthMessage] = useState(null);
    
    // --- Authentication ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (user) {
                loadCart(user.uid);
                if(authMessage) setAuthMessage(null);
            } else {
                setCart({});
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [authMessage]);

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

    // Note: The 'addProduct' function has been moved to the Admin page logic.
    const value = {
        user,
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
        fetchProducts, // Pass fetchProducts to be used by Admin page
        db, // Pass db instance to be used by Admin page
        cartCount: Object.values(cart).reduce((acc, count) => acc + count, 0),
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Components ---

const Navbar = () => {
    const { user, logOut, navigate, cartCount } = useContext(AppContext);
    // Note: The Admin button is removed. It would be added conditionally
    // in a real app based on user roles (e.g., custom claims).

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
            <h1 className="text-2xl font-bold text-gray-800 cursor-pointer" onClick={() => navigate('products')}>
                My Shop
            </h1>
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate('cart')} className="relative text-gray-600 hover:text-gray-800">
                    <ShoppingCart size={24} />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                </button>
                {user ? (
                    <>
                        <span className="text-gray-700 hidden sm:block">Welcome, {user.email.split('@')[0]}</span>
                        <button onClick={logOut} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate('login')} className="text-gray-600 hover:text-gray-800">
                            Login
                        </button>
                        <button onClick={() => navigate('signup')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            Sign Up
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

const ProductList = () => {
    const { products, addToCart, viewProduct } = useContext(AppContext);

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-3xl font-bold text-center mb-8">Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                        <img
                            src={product.imageUrl || `https://placehold.co/400x300/E0E0E0/4A4A4A?text=${product.name}`}
                            alt={product.name}
                            className="w-full h-48 object-cover cursor-pointer"
                            onClick={() => viewProduct(product)}
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/E0E0E0/4A4A4A?text=Image+Not+Found`; }}
                        />
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                            <p className="text-gray-600 mb-4 truncate">{product.description}</p>
                            <div className="flex justify-between items-center">
                                <p className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
                                <button
                                    onClick={() => addToCart(product.id)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                                >
                                    <ShoppingCart size={18} className="mr-2"/> Add
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProductDetail = () => {
    const { selectedProduct, addToCart, navigate } = useContext(AppContext);

    if (!selectedProduct) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p>Product not found.</p>
                <button onClick={() => navigate('products')} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
             <button onClick={() => navigate('products')} className="mb-8 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
                &larr; Back to Products
            </button>
            <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="md:w-1/2">
                     <img
                        src={selectedProduct.imageUrl || `https://placehold.co/600x600/E0E0E0/4A4A4A?text=${selectedProduct.name}`}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                         onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x600/E0E0E0/4A4A4A?text=Image+Not+Found`; }}
                    />
                </div>
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <h2 className="text-4xl font-bold mb-4">{selectedProduct.name}</h2>
                    <p className="text-gray-700 text-lg mb-6">{selectedProduct.description}</p>
                    <p className="text-3xl font-bold text-blue-600 mb-6">${selectedProduct.price.toFixed(2)}</p>
                    <button
                        onClick={() => addToCart(selectedProduct.id)}
                        className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 flex items-center justify-center"
                    >
                        <ShoppingCart size={22} className="mr-2"/> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};


const Cart = () => {
    const { cart, products, addToCart, removeFromCart, deleteFromCart, user, navigate } = useContext(AppContext);

    const cartItems = Object.keys(cart).map(productId => {
        const product = products.find(p => p.id === productId);
        return product ? { ...product, quantity: cart[productId] } : null;
    }).filter(item => item !== null);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (!user) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-4">Please log in to view and manage your cart.</p>
                <button onClick={() => navigate('login')} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                    Login
                </button>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-4">Looks like you haven't added anything to your cart yet.</p>
                <button onClick={() => navigate('products')} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold mb-8">Your Shopping Cart</h2>
            <div className="bg-white shadow-lg rounded-lg p-6">
                {cartItems.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b py-4">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <img src={item.imageUrl || `https://placehold.co/100x100/E0E0E0/4A4A4A?text=${item.name}`} alt={item.name} className="w-20 h-20 object-cover rounded-lg mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold">{item.name}</h3>
                                <p className="text-gray-600">${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                             <div className="flex items-center border rounded-lg">
                                <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"><Minus size={16}/></button>
                                <span className="px-4 py-1">{item.quantity}</span>
                                <button onClick={() => addToCart(item.id)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"><Plus size={16}/></button>
                            </div>
                            <p className="font-semibold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => deleteFromCart(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
                <div className="mt-6 text-right">
                    <h3 className="text-2xl font-bold">Subtotal: ${subtotal.toFixed(2)}</h3>
                    <button className="mt-4 bg-green-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-600">
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

const AuthForm = ({ isSignUp = false }) => {
    const { signUp, logIn, error, authMessage, navigate } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSignUp) {
            await signUp(email, password);
        } else {
            await logIn(email, password);
        }
    };

    const title = isSignUp ? 'Create an Account' : 'Login to Your Account';
    const buttonText = isSignUp ? 'Sign Up' : 'Login';
    const switchText = isSignUp ? 'Already have an account?' : "Don't have an account?";
    const switchAction = () => navigate(isSignUp ? 'login' : 'signup');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
                {authMessage && <p className="bg-blue-100 text-blue-800 p-3 rounded-md mb-4 text-center">{authMessage}</p>}
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                        {buttonText}
                    </button>
                </form>
                <p className="text-center mt-4">
                    {switchText} <button onClick={switchAction} className="text-blue-500 hover:underline">{isSignUp ? 'Login' : 'Sign Up'}</button>
                </p>
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    return (
        <AppProvider>
            <Main />
        </AppProvider>
    );
}

const Main = () => {
    const { currentPage, loading, error } = useContext(AppContext);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
    }

    // To re-integrate the AdminPage, you would import it and add a case for 'admin' here.
    const renderPage = () => {
        switch (currentPage) {
            case 'products':
                return <ProductList />;
            case 'productDetail':
                return <ProductDetail />;
            case 'cart':
                return <Cart />;
            case 'login':
                return <AuthForm />;
            case 'signup':
                return <AuthForm isSignUp />;
            // case 'admin':
            //     return <AdminPage />;
            default:
                return <ProductList />;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <main>
                {error && <p className="bg-red-500 text-white p-4 text-center">{error}</p>}
                {renderPage()}
            </main>
        </div>
    );
};
