import React, { useState, useContext } from 'react';
import { collection, addDoc } from 'firebase/firestore';
// In a real project, AppContext would be imported from its own file
// import { AppContext } from './AppContext'; 

// This is a placeholder since the real context is in the main App file.
// When integrating, you would remove this and use the imported context.
const AppContext = React.createContext();

// --- Admin Page Component ---
// This component would be the default export of an AdminPage.js file.
const AdminPage = () => {
    // It consumes the shared context from the main application.
    const { db, fetchProducts } = useContext(AppContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState(null);

    const addProduct = async (productData) => {
        // Note: In a real app, you'd have robust security rules in Firestore
        // to ensure only admins can write to the 'products' collection.
        try {
            const productsCollection = collection(db, 'products');
            await addDoc(productsCollection, productData);
            await fetchProducts(); // Refresh product list after adding
            return true;
        } catch (err) {
            console.error('Failed to add product.', err);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!db || !fetchProducts) {
             setFormMessage({ type: 'error', text: 'Context not available. Are you running this inside the main app?' });
             return;
        }
        setIsSubmitting(true);
        setFormMessage(null);

        const productData = {
            name,
            description,
            price: parseFloat(price),
            imageUrl
        };

        const success = await addProduct(productData);
        
        if (success) {
            setFormMessage({ type: 'success', text: 'Product added successfully!' });
            // Clear form
            setName('');
            setDescription('');
            setPrice('');
            setImageUrl('');
        } else {
            setFormMessage({ type: 'error', text: 'Failed to add product. Please try again.' });
        }
        setIsSubmitting(false);
    };

    return (
        <div className="container mx-auto p-8">
            <h2 className="text-3xl font-bold mb-8">Admin Panel - Add New Product</h2>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit}>
                    {formMessage && (
                        <p className={`p-3 rounded-md mb-4 text-center ${formMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                            {formMessage.text}
                        </p>
                    )}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="name">Product Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="description">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="price">Price</label>
                        <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required step="0.01" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="imageUrl">Image URL</label>
                        <input type="text" id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300">
                        {isSubmitting ? 'Adding Product...' : 'Add Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// FIX: Export the component so it can be imported by other files.
export default AdminPage;
