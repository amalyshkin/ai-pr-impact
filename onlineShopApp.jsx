import React, { useContext } from 'react';
import { Minus, Plus, ShoppingCart, Trash2, User } from 'lucide-react';
import { AppProvider, useAppContext } from './AppContext';
import AdminPage from './adminPage';
import UserProfile from './UserProfile';
import Footer from './Footer';

// --- Components ---

const Navbar = () => {
    const { user, isAdmin, logOut, navigate, cartCount } = useAppContext();

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
                        <button onClick={() => navigate('profile')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center">
                            <User size={18} className="mr-2" />
                            Profile
                        </button>
                        {isAdmin() && (
                            <button onClick={() => navigate('admin')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                Admin
                            </button>
                        )}
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
    const { products, addToCart, viewProduct } = useAppContext();

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
    const { selectedProduct, addToCart, navigate } = useAppContext();

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
    const { cart, products, addToCart, removeFromCart, deleteFromCart, user, navigate } = useAppContext();

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

const AccessDenied = () => {
    const { navigate } = useAppContext();
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-6">You don't have permission to access the admin panel. Only administrators can view this page.</p>
                <button 
                    onClick={() => navigate('products')} 
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                    Back to Products
                </button>
            </div>
        </div>
    );
};

const AuthForm = ({ isSignUp = false }) => {
    const { signUp, logIn, error, authMessage, navigate } = useAppContext();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

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
    const { currentPage, loading, error, isAdmin } = useAppContext();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
    }

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
            case 'admin':
                // Check if user has admin privileges
                if (!isAdmin()) {
                    return <AccessDenied />;
                }
                return <AdminPage />;
            case 'profile':
                return <UserProfile />;
            default:
                return <ProductList />;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                {error && <p className="bg-red-500 text-white p-4 text-center">{error}</p>}
                {renderPage()}
            </main>
            {currentPage !== 'admin' && <Footer />}
        </div>
    );
};
