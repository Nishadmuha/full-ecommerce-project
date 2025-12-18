import ProductCard from './ProductCard';

export default function ProductGrid({ products = [], fallbackLabel, limit = 4 }) {
  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Products are on their way.</p>
      </div>
    );
  }

  const visibleProducts = limit ? products.slice(0, limit) : products;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {visibleProducts.map((product, index) => (
        <ProductCard key={product._id} product={product} index={index} />
      ))}
    </div>
  );
}
