// Seed script to initialize database with sample data
const productRepository = require('./repositories/productRepository');

async function seedDatabase() {
  try {
    console.log('Seeding database with sample products...');

    // Create sample products
    const products = [
      { name: 'Laptop', stock: 50 },
      { name: 'Mouse', stock: 200 },
      { name: 'Keyboard', stock: 150 },
      { name: 'Monitor', stock: 30 },
      { name: 'USB Cable', stock: 500 }
    ];

    for (const product of products) {
      try {
        await productRepository.createProduct(product.name, product.stock);
        console.log(`✓ Created product: ${product.name} with stock: ${product.stock}`);
      } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          console.log(`- Product ${product.name} already exists`);
        } else {
          throw err;
        }
      }
    }

    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Initialize database connection before seeding
require('./models/database');

// Wait a bit for database to initialize
setTimeout(seedDatabase, 1000);
