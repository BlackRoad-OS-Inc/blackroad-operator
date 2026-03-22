import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  registerAsSeller,
  getSellerAnalytics,
  getMyListings,
  createListing,
  deleteListing,
  publishListing
} from '../api';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [listings, setListings] = useState([]);
  const [showBecomeSellerModal, setShowBecomeSellerModal] = useState(false);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);

  useEffect(() => {
    loadSellerData();
  }, []);

  async function loadSellerData() {
    try {
      // Try to load seller analytics
      const data = await getSellerAnalytics();
      setAnalytics(data.analytics);
      setIsSeller(true);

      // Load listings
      const listingsData = await getMyListings();
      setListings(listingsData);
    } catch (err) {
      // Not a seller yet
      setIsSeller(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleBecomeSeller(displayName, bio) {
    try {
      await registerAsSeller({ displayName, bio });
      setShowBecomeSellerModal(false);
      await loadSellerData();
    } catch (err) {
      console.error('Failed to become seller:', err);
      alert(err.response?.data?.error || 'Failed to become seller');
    }
  }

  async function handleCreateListing(data) {
    try {
      const result = await createListing(data);
      setShowCreateListingModal(false);
      navigate(`/marketplace/listing/${result.listing.id}`);
    } catch (err) {
      console.error('Failed to create listing:', err);
      alert(err.response?.data?.error || 'Failed to create listing');
    }
  }

  async function handlePublish(listingId) {
    if (!confirm('Publish this listing? It will be submitted for approval.')) return;
    try {
      await publishListing(listingId);
      await loadSellerData();
      alert('Listing published!');
    } catch (err) {
      console.error('Failed to publish:', err);
      alert(err.response?.data?.error || 'Failed to publish');
    }
  }

  async function handleDelete(listingId) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await deleteListing(listingId);
      await loadSellerData();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert(err.response?.data?.error || 'Failed to delete');
    }
  }

  function formatPrice(cents) {
    if (cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Not a seller yet - show registration
  if (!isSeller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30">
          <div className="container mx-auto px-6 py-4">
            <Link to="/marketplace" className="text-purple-400 hover:text-purple-300 flex items-center gap-2">
              ← Back to Marketplace
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">🏪</div>
            <h1 className="text-4xl font-bold text-white mb-4">Start Selling on Reality Engine Marketplace</h1>
            <p className="text-xl text-gray-300 mb-8">
              Share your 3D creations with the world and earn money!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-gray-800/50 border border-purple-500/30 rounded-lg">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="font-bold text-white mb-2">Earn 70-90%</h3>
                <p className="text-gray-400 text-sm">Keep most of your sales revenue</p>
              </div>
              <div className="p-6 bg-gray-800/50 border border-purple-500/30 rounded-lg">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="font-bold text-white mb-2">Easy Upload</h3>
                <p className="text-gray-400 text-sm">Simple interface to list your assets</p>
              </div>
              <div className="p-6 bg-gray-800/50 border border-purple-500/30 rounded-lg">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-white mb-2">Full Analytics</h3>
                <p className="text-gray-400 text-sm">Track views, sales, and earnings</p>
              </div>
            </div>

            <button
              onClick={() => setShowBecomeSellerModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold text-lg transition shadow-lg"
            >
              Become a Seller
            </button>
          </div>
        </div>

        {showBecomeSellerModal && (
          <BecomeSellerModal
            onClose={() => setShowBecomeSellerModal(false)}
            onSubmit={handleBecomeSeller}
          />
        )}
      </div>
    );
  }

  // Seller dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <span className="text-4xl">💼</span>
                Seller Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Manage your marketplace assets</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/marketplace"
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
              >
                Browse Marketplace
              </Link>
              <button
                onClick={() => setShowCreateListingModal(true)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
              >
                + Create Listing
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        {analytics?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Total Earnings</div>
              <div className="text-3xl font-bold text-green-400">
                {formatPrice(analytics.summary.total_earnings_cents || 0)}
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Available Balance</div>
              <div className="text-3xl font-bold text-purple-400">
                {formatPrice(analytics.summary.available_balance_cents || 0)}
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Total Sales</div>
              <div className="text-3xl font-bold text-blue-400">{analytics.summary.total_sales || 0}</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Active Listings</div>
              <div className="text-3xl font-bold text-yellow-400">{analytics.summary.active_listing_count || 0}</div>
            </div>
          </div>
        )}

        {/* Recent Sales */}
        {analytics?.recent_sales && analytics.recent_sales.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Sales</h2>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">License</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {analytics.recent_sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-900/30 transition">
                      <td className="px-6 py-4 text-white">{sale.listing_title}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-400 capitalize">{sale.license_type}</td>
                      <td className="px-6 py-4 text-right text-green-400 font-semibold">
                        {formatPrice(sale.amount_cents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* My Listings */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">My Listings ({listings.length})</h2>

          {listings.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-400 text-lg mb-4">No listings yet</p>
              <button
                onClick={() => setShowCreateListingModal(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onPublish={handlePublish}
                  onDelete={handleDelete}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateListingModal && (
        <CreateListingModal
          onClose={() => setShowCreateListingModal(false)}
          onSubmit={handleCreateListing}
        />
      )}
    </div>
  );
}

function ListingCard({ listing, onPublish, onDelete, formatPrice }) {
  const statusColors = {
    draft: 'bg-gray-600',
    pending: 'bg-yellow-600',
    approved: 'bg-green-600',
    rejected: 'bg-red-600'
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden">
      <div className="relative aspect-video bg-gray-900">
        {listing.thumbnail_url ? (
          <img src={listing.thumbnail_url} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 ${statusColors[listing.status]} rounded text-xs font-bold text-white uppercase`}>
          {listing.status}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white mb-2 truncate">{listing.title}</h3>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-4">
          <div>
            <div className="text-purple-400 font-bold">{listing.view_count}</div>
            <div>Views</div>
          </div>
          <div>
            <div className="text-purple-400 font-bold">{listing.download_count}</div>
            <div>Downloads</div>
          </div>
          <div>
            <div className="text-purple-400 font-bold">{listing.purchase_count}</div>
            <div>Sales</div>
          </div>
        </div>

        <div className="text-lg font-bold text-purple-400 mb-4">
          {formatPrice(listing.price_cents)}
        </div>

        <div className="flex gap-2">
          {listing.status === 'draft' && (
            <button
              onClick={() => onPublish(listing.id)}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
            >
              Publish
            </button>
          )}
          <Link
            to={`/marketplace/listing/${listing.id}`}
            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition text-center"
          >
            View
          </Link>
          <button
            onClick={() => onDelete(listing.id)}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function BecomeSellerModal({ onClose, onSubmit }) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(displayName, bio);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Become a Seller</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
              placeholder="Your seller name"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Bio (Optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
              placeholder="Tell buyers about yourself..."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateListingModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('3d-model');
  const [priceCents, setPriceCents] = useState(0);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ title, description, category, priceCents: parseInt(priceCents) || 0 });
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Create New Listing</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
              placeholder="Asset title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
            >
              <option value="3d-model">3D Model</option>
              <option value="scene">Scene</option>
              <option value="building">Building</option>
              <option value="character">Character</option>
              <option value="vehicle">Vehicle</option>
              <option value="nature">Nature</option>
              <option value="prop">Prop</option>
              <option value="material">Material</option>
              <option value="template">Template</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Price (USD)</label>
            <input
              type="number"
              value={priceCents / 100}
              onChange={(e) => setPriceCents(Math.floor(parseFloat(e.target.value || 0) * 100))}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
              placeholder="0.00"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
              placeholder="Describe your asset..."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
