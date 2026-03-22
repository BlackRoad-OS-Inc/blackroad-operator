import { useState, useEffect } from 'react';
import {
  browseMarketplace,
  getCategories,
  getFeaturedListings,
  getTrendingListings,
  searchMarketplace,
  addToFavorites,
  removeFromFavorites
} from '../api';
import { Link } from 'react-router-dom';

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      loadListings();
    }
  }, [selectedCategory, sortBy, priceRange]);

  async function loadInitialData() {
    try {
      const [categoriesData, featuredData, trendingData] = await Promise.all([
        getCategories(),
        getFeaturedListings(6),
        getTrendingListings(10)
      ]);
      setCategories(categoriesData);
      setFeatured(featuredData);
      setTrending(trendingData);
      await loadListings();
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadListings() {
    try {
      const params = {
        category: selectedCategory || undefined,
        sortBy,
        minPrice: priceRange.min ? parseInt(priceRange.min) * 100 : undefined,
        maxPrice: priceRange.max ? parseInt(priceRange.max) * 100 : undefined,
        limit: 20,
        offset: 0
      };
      const data = await browseMarketplace(params);
      setListings(data.listings || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      loadListings();
      return;
    }
    try {
      const data = await searchMarketplace(searchQuery, {
        category: selectedCategory || undefined
      });
      setListings(data.listings || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  }

  async function toggleFavorite(listingId, e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (favorites.has(listingId)) {
        await removeFromFavorites(listingId);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      } else {
        await addToFavorites(listingId);
        setFavorites(prev => new Set(prev).add(listingId));
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }

  function formatPrice(cents) {
    if (cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Marketplace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <span className="text-4xl">🏪</span>
                Reality Engine Marketplace
              </h1>
              <p className="text-gray-400 mt-1">Discover & sell photorealistic 3D assets</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/marketplace/sell"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
              >
                Start Selling
              </Link>
              <Link
                to="/marketplace/dashboard"
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
              >
                My Dashboard
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for 3D models, scenes, characters..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Featured Section */}
        {!searchQuery && featured.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>⭐</span> Featured Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorite={favorites.has(listing.id)}
                  onToggleFavorite={toggleFavorite}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Filters */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">Filters</h3>

              {/* Categories */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Price Range ($)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-1/2 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-1/2 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSortBy('newest');
                  setPriceRange({ min: '', max: '' });
                  setSearchQuery('');
                }}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-9">
            {/* Trending (if no search) */}
            {!searchQuery && trending.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>🔥</span> Trending Now
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {trending.map(listing => (
                    <div key={listing.id} className="min-w-[250px]">
                      <ListingCard
                        listing={listing}
                        isFavorite={favorites.has(listing.id)}
                        onToggleFavorite={toggleFavorite}
                        formatPrice={formatPrice}
                        compact
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* All Listings */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'All Assets'}
                </h2>
                <span className="text-gray-400">{listings.length} items</span>
              </div>

              {listings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-400 text-lg">No assets found</p>
                  <p className="text-gray-500 mt-2">Try adjusting your filters or search query</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map(listing => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isFavorite={favorites.has(listing.id)}
                      onToggleFavorite={toggleFavorite}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function ListingCard({ listing, isFavorite, onToggleFavorite, formatPrice, compact = false }) {
  const categoryIcons = {
    '3d-model': '🎨',
    'scene': '🌆',
    'building': '🏢',
    'character': '🧑',
    'vehicle': '🚗',
    'nature': '🌳',
    'prop': '📦',
    'material': '✨',
    'template': '📋',
    'other': '🔮'
  };

  return (
    <Link
      to={`/marketplace/listing/${listing.id}`}
      className="block bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500 transition group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900 overflow-hidden">
        {listing.thumbnail_url ? (
          <img
            src={listing.thumbnail_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {categoryIcons[listing.category] || '🔮'}
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => onToggleFavorite(listing.id, e)}
          className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition"
        >
          <span className="text-lg">{isFavorite ? '❤️' : '🤍'}</span>
        </button>

        {/* Featured Badge */}
        {listing.is_featured === 1 && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/90 backdrop-blur-sm rounded text-xs font-bold text-black">
            ⭐ Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className={compact ? 'p-3' : 'p-4'}>
        <h3 className={`font-bold text-white mb-1 truncate ${compact ? 'text-sm' : 'text-lg'}`}>
          {listing.title}
        </h3>
        {!compact && listing.description && (
          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{listing.description}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            <span>⭐</span>
            <span>{listing.rating_avg ? listing.rating_avg.toFixed(1) : 'New'}</span>
            {listing.rating_count > 0 && (
              <span className="text-gray-500">({listing.rating_count})</span>
            )}
          </div>
          <div className="text-purple-400 font-bold">
            {formatPrice(listing.price_cents)}
          </div>
        </div>

        {!compact && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>{categoryIcons[listing.category]}{listing.category}</span>
            <span>•</span>
            <span>👁️ {listing.view_count}</span>
            <span>•</span>
            <span>⬇️ {listing.download_count}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
