import React, { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { useAppContext } from './AppContext';

// --- Admin Page Component ---
const AdminPage = () => {
    // It consumes the shared context from the main application.
    const { db, fetchProducts } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [originCountry, setOriginCountry] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState(null);
    
    // CSV Import states
    const [csvFile, setCsvFile] = useState(null);
    const [csvValidation, setCsvValidation] = useState({ isValid: false, message: '' });
    const [isImporting, setIsImporting] = useState(false);
    const [importMessage, setImportMessage] = useState(null);
    const fileInputRef = useRef(null);

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

    // CSV Import functions
    const validateCsvFormat = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csvContent = e.target.result;
                    const lines = csvContent.split('\n');
                    if (lines.length < 2) {
                        resolve({ isValid: false, message: 'CSV file must contain at least a header row and one data row.' });
                        return;
                    }

                    const headerRow = lines[0].split(',').map(col => col.trim().toLowerCase());
                    const requiredColumns = ['name', 'description', 'price', 'origincountry'];
                    const missingColumns = requiredColumns.filter(col => !headerRow.includes(col));
                    const extraColumns = headerRow.filter(col => !requiredColumns.includes(col));

                    if (missingColumns.length > 0) {
                        resolve({ 
                            isValid: false, 
                            message: `Missing required columns: ${missingColumns.join(', ')}` 
                        });
                        return;
                    }

                    if (extraColumns.length > 0) {
                        resolve({ 
                            isValid: false, 
                            message: `Extra columns found: ${extraColumns.join(', ')}. Only name, description, and price are allowed.` 
                        });
                        return;
                    }

                    // Validate data rows
                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim() === '') continue; // Skip empty lines
                        
                        const values = lines[i].split(',').map(val => val.trim());
                        if (values.length !== requiredColumns.length) {
                            resolve({ 
                                isValid: false, 
                                message: `Row ${i + 1}: Incorrect number of columns. Expected ${requiredColumns.length}, got ${values.length}.` 
                            });
                            return;
                        }

                        // Validate price is a number
                        const price = parseFloat(values[2]);
                        if (isNaN(price) || price <= 0) {
                            resolve({ 
                                isValid: false, 
                                message: `Row ${i + 1}: Price must be a positive number.` 
                            });
                            return;
                        }
                    }

                    resolve({ isValid: true, message: 'CSV format is valid!' });
                } catch (error) {
                    resolve({ isValid: false, message: 'Error reading CSV file. Please check the file format.' });
                }
            };
            reader.readAsText(file);
        });
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            setCsvFile(null);
            setCsvValidation({ isValid: false, message: '' });
            return;
        }

        if (!file.name.toLowerCase().endsWith('.csv')) {
            setCsvValidation({ isValid: false, message: 'Please select a valid CSV file.' });
            setCsvFile(null);
            return;
        }

        setCsvFile(file);
        setImportMessage(null);
        
        // Validate CSV format
        const validation = await validateCsvFormat(file);
        setCsvValidation(validation);
    };

    const importCsvData = async () => {
        if (!csvFile || !csvValidation.isValid) return;

        setIsImporting(true);
        setImportMessage(null);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const csvContent = e.target.result;
                    const lines = csvContent.split('\n');
                    const headerRow = lines[0].split(',').map(col => col.trim().toLowerCase());
                    
                    let importedCount = 0;
                    let errorCount = 0;

                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim() === '') continue; // Skip empty lines
                        
                        const values = lines[i].split(',').map(val => val.trim());
                        const productData = {
                            name: values[0],
                            description: values[1],
                            price: parseFloat(values[2]),
                            originCountry: values[3] || '',
                            imageUrl: '' // Default empty image URL
                        };

                        try {
                            const productsCollection = collection(db, 'products');
                            await addDoc(productsCollection, productData);
                            importedCount++;
                        } catch (err) {
                            console.error(`Failed to import product ${i + 1}:`, err);
                            errorCount++;
                        }
                    }

                    await fetchProducts(); // Refresh product list
                    
                    if (errorCount === 0) {
                        setImportMessage({ 
                            type: 'success', 
                            text: `Successfully imported ${importedCount} products!` 
                        });
                    } else {
                        setImportMessage({ 
                            type: 'warning', 
                            text: `Imported ${importedCount} products. ${errorCount} products failed to import.` 
                        });
                    }

                    // Clear file input
                    setCsvFile(null);
                    setCsvValidation({ isValid: false, message: '' });
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                } catch (error) {
                    setImportMessage({ 
                        type: 'error', 
                        text: 'Error processing CSV file. Please check the file format.' 
                    });
                }
                setIsImporting(false);
            };
            reader.readAsText(csvFile);
        } catch (error) {
            setImportMessage({ 
                type: 'error', 
                text: 'Error reading CSV file. Please try again.' 
            });
            setIsImporting(false);
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
            originCountry,
            imageUrl
        };

        const success = await addProduct(productData);
        
        if (success) {
            setFormMessage({ type: 'success', text: 'Product added successfully!' });
            // Clear form
            setName('');
            setDescription('');
            setPrice('');
            setOriginCountry('');
            setImageUrl('');
        } else {
            setFormMessage({ type: 'error', text: 'Failed to add product. Please try again.' });
        }
        setIsSubmitting(false);
    };

    return (
        <div className="container mx-auto p-8">
            <h2 className="text-3xl font-bold mb-8">Admin Panel</h2>
            
            {/* CSV Import Section */}
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Import Products from CSV</h3>
                
                {importMessage && (
                    <p className={`p-3 rounded-md mb-4 text-center ${
                        importMessage.type === 'success' ? 'bg-green-100 text-green-800' : 
                        importMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-700'
                    }`}>
                        {importMessage.text}
                    </p>
                )}
                
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="csvFile">Choose CSV File</label>
                    <input 
                        type="file" 
                        id="csvFile" 
                        ref={fileInputRef}
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="w-full px-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                
                {csvValidation.message && (
                    <div className={`p-3 rounded-md mb-4 ${
                        csvValidation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                    }`}>
                        {csvValidation.message}
                    </div>
                )}
                
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">CSV Format Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Header row with columns: <code className="bg-gray-100 px-1 rounded">name, description, price, origincountry</code></li>
                        <li>• Price must be a positive number</li>
                        <li>• Origin country is optional but recommended</li>
                        <li>• Data will be appended to existing products (no duplicates checked)</li>
                        <li>• Image URLs will be set to empty (can be updated later)</li>
                    </ul>
                </div>
                
                <button 
                    onClick={importCsvData} 
                    disabled={!csvValidation.isValid || isImporting}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                    {isImporting ? 'Importing Products...' : 'Import Products'}
                </button>
            </div>
            
            {/* Manual Add Product Section */}
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Add New Product Manually</h3>
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
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="originCountry">Origin Country</label>
                        <input type="text" id="originCountry" value={originCountry} onChange={e => setOriginCountry(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., USA, Germany, Japan" />
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
