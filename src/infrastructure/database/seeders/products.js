const { v4: uuidv4 } = require('uuid');

const productSeedData = [
    {
        id: uuidv4(),
        name: 'Product 1',
        description: 'Description for product 1',
        price: 100000,
        stock: 10
    },
    {
        id: uuidv4(),
        name: 'Product 2',
        description: 'Description for product 2',
        price: 200000,
        stock: 5
    }
];

async function seedProducts(Product) {
    try {
        const count = await Product.count();
        if (count === 0) {
            await Product.bulkCreate(productSeedData);
            console.log('Test products created successfully');
        }
    } catch (error) {
        console.error('Error seeding products:', error);
        throw error;
    }
}

module.exports = seedProducts; 