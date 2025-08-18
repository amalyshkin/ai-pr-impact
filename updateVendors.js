const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Default vendors for existing products (if needed)
const defaultVendors = {
  "Laptop Pro": "TechCorp",
  "Wireless Headphones": "AudioMax", 
  "Smart Watch": "SmartTech",
  "Coffee Maker": "HomeBrew",
  "Gaming Mouse": "GamingPro",
  "Mechanical Keyboard": "KeyMaster",
  "4K Monitor": "DisplayTech",
  "Portable SSD": "StoragePlus"
};

async function updateExistingProducts() {
  try {
    console.log('Fetching existing products...');
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    if (snapshot.empty) {
      console.log('No products found in database.');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const doc of snapshot.docs) {
      const product = doc.data();
      
      // Check if product already has a vendor
      if (product.vendor) {
        console.log(`Product "${product.name}" already has vendor: ${product.vendor}`);
        skippedCount++;
        continue;
      }

      // Try to find a default vendor for this product
      const defaultVendor = defaultVendors[product.name];
      
      if (defaultVendor) {
        // Update the product with the default vendor
        await doc.ref.update({ vendor: defaultVendor });
        console.log(`Updated "${product.name}" with vendor: ${defaultVendor}`);
        updatedCount++;
      } else {
        // Set a generic vendor for unknown products
        await doc.ref.update({ vendor: 'Unknown Vendor' });
        console.log(`Updated "${product.name}" with vendor: Unknown Vendor`);
        updatedCount++;
      }
    }

    console.log(`\nUpdate complete!`);
    console.log(`Updated: ${updatedCount} products`);
    console.log(`Skipped: ${skippedCount} products (already had vendor)`);
    
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    process.exit(0);
  }
}

// Run the update
updateExistingProducts();
