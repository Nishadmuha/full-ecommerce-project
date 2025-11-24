import { useEffect, useState } from 'react';
import api from '../../api/api';
import { createProduct, updateProduct, deleteProduct, getProductsByCategory } from '../../api/adminApi';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
    images: [],
    category: '',
    isBestseller: false,
    isNew: false,
    stock: 0,
    colors: [],
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      fetchProducts();
    } else {
      fetchProductsByCategory();
    }
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async () => {
    try {
      const response = await getProductsByCategory(selectedCategory);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch product categories (not collection categories) for the dropdown
      const response = await api.get('/products/categories');
      // Convert array of category names to objects with _id and name
      const categoryObjects = (response.data || []).map(catName => ({
        _id: catName,
        name: catName
      }));
      setCategories(categoryObjects);
    } catch (error) {
      console.error('Error fetching product categories:', error);
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty colors and clean color images
      const cleanedColors = (formData.colors || [])
        .filter(color => color.name && color.name.trim()) // Only keep colors with names
        .map(color => ({
          name: color.name.trim(),
          image: color.image?.trim() || '',
          images: (color.images || []).filter(img => img && img.trim()) // Remove empty image URLs
        }));

      // Prepare form data - ensure images array is properly formatted
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        images: formData.images?.filter(img => img && img.trim()) || [], // Remove empty image URLs
        colors: cleanedColors, // Use cleaned colors
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id, productData);
        alert('Product updated successfully!');
      } else {
        await createProduct(productData);
        alert('Product added successfully!');
      }
      resetForm();
      // Refresh categories to include any new category that was added
      fetchCategories();
      if (selectedCategory === 'all') {
        fetchProducts();
      } else {
        fetchProductsByCategory();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Error saving product. Please try again.');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      image: product.image || '',
      images: product.images || [],
      category: product.category || '',
      isBestseller: product.isBestseller || false,
      isNew: product.isNew || false,
      stock: product.stock || 0,
      colors: product.colors && Array.isArray(product.colors) && product.colors.length > 0 
        ? product.colors.map(color => ({
            name: color.name || '',
            image: color.image || '',
            images: Array.isArray(color.images) ? color.images : ['', '', '']
          }))
        : [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      if (selectedCategory === 'all') {
        fetchProducts();
      } else {
        fetchProductsByCategory();
      }
    } catch (error) {
      alert('Error deleting product');
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      price: '', 
      image: '', 
      images: [],
      category: '',
      isBestseller: false,
      isNew: false,
      stock: 0,
      colors: [],
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // Add a new color (maximum 5 colors)
  const addColor = () => {
    if (formData.colors.length >= 5) {
      alert('Maximum 5 colors allowed');
      return;
    }
    setFormData({
      ...formData,
      colors: [...formData.colors, { name: '', image: '', images: ['', '', ''] }]
    });
  };

  // Remove a color by index
  const removeColor = (index) => {
    const newColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: newColors });
  };

  // Update color field
  const updateColor = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setFormData({ ...formData, colors: newColors });
  };

  // Update color image at specific index
  const updateColorImage = (colorIndex, imageIndex, value) => {
    const newColors = [...formData.colors];
    if (!newColors[colorIndex].images) {
      newColors[colorIndex].images = ['', '', ''];
    }
    newColors[colorIndex].images[imageIndex] = value;
    setFormData({ ...formData, colors: newColors });
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-auto"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Form Modal - Popup with 60% transparent background */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <h2 className="text-2xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button 
                onClick={resetForm} 
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      list="category-list"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      onBlur={(e) => {
                        // Trim whitespace on blur
                        const trimmed = e.target.value.trim();
                        if (trimmed !== e.target.value) {
                          setFormData({ ...formData, category: trimmed });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Select or type a new category"
                    />
                    <datalist id="category-list">
                      {categories.map((cat) => (
                        <option key={cat._id || cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Select from existing categories or type a new category name
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter product description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Additional Images - 3 separate fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images (Optional - Up to 3)</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.images?.[0] || ''}
                    onChange={(e) => {
                      const newImages = [...(formData.images || [])];
                      newImages[0] = e.target.value;
                      setFormData({ ...formData, images: newImages.filter(img => img) });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Image 1 URL (optional)"
                  />
                  <input
                    type="url"
                    value={formData.images?.[1] || ''}
                    onChange={(e) => {
                      const newImages = [...(formData.images || [])];
                      newImages[1] = e.target.value;
                      setFormData({ ...formData, images: newImages.filter(img => img) });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Image 2 URL (optional)"
                  />
                  <input
                    type="url"
                    value={formData.images?.[2] || ''}
                    onChange={(e) => {
                      const newImages = [...(formData.images || [])];
                      newImages[2] = e.target.value;
                      setFormData({ ...formData, images: newImages.filter(img => img) });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Image 3 URL (optional)"
                  />
                </div>
              </div>

              {/* Product Colors - Dynamic colors with add/remove buttons (Maximum 5) */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Colors (Optional - Maximum 5 colors, 3 images per color)
                  </label>
                  <button
                    type="button"
                    onClick={addColor}
                    disabled={formData.colors.length >= 5}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.colors.length >= 5
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    + Add Color ({formData.colors.length}/5)
                  </button>
                      </div>
                
                {formData.colors.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
                    No colors added. Click "Add Color" to add product colors.
                      </div>
                )}

                <div className="space-y-4">
                  {formData.colors.map((color, colorIndex) => (
                    <div key={colorIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">
                          Color {colorIndex + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeColor(colorIndex)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                  </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                          <label className="block text-xs text-gray-600 mb-1">Color Name *</label>
                        <input
                          type="text"
                            value={color.name || ''}
                            onChange={(e) => updateColor(colorIndex, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Black, Red, Blue"
                        />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-600 mb-1">Main Image URL</label>
                        <input
                          type="url"
                            value={color.image || ''}
                            onChange={(e) => updateColor(colorIndex, 'image', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/color-main.jpg"
                        />
                    </div>
                  </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-2">Additional Images (3 images)</label>
                        <div className="space-y-2">
                          {[0, 1, 2].map((imgIndex) => (
                        <input
                              key={imgIndex}
                          type="url"
                              value={color.images?.[imgIndex] || ''}
                              onChange={(e) => updateColorImage(colorIndex, imgIndex, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Image ${imgIndex + 1} URL (optional)`}
                        />
                          ))}
                    </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mark as Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mark as New Arrival</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
            {product.image && (
              <img src={product.image} alt={product.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-gray-900">${product.price?.toFixed(2)}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{product.category}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

