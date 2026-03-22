import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';

export default function MarketplaceAdmin() {
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadPendingListings();
  }, []);

  async function loadPendingListings() {
    try {
      const { data } = await axios.get(`${API_BASE}/api/marketplace/admin/pending`);
      setPendingListings(data.listings || []);
    } catch (err) {
      console.error('Failed to load pending listings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(listingId) {
    if (!confirm('Approve this listing?')) return;

    try {
      await axios.post(`${API_BASE}/api/marketplace/admin/approve/${listingId}`);
      alert('Listing approved!');
      await loadPendingListings();
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Failed to approve listing');
    }
  }

  async function handleReject(listingId) {
    const reason = prompt('Rejection reason (optional):');

    try {
      await axios.post(`${API_BASE}/api/marketplace/admin/reject/${listingId}`, { reason });
      alert('Listing rejected');
      await loadPendingListings();
    } catch (err) {
      console.error('Rejection failed:', err);
      alert('Failed to reject listing');
    }
  }

  async function handleFeature(listingId, featured) {
    try {
      await axios.post(`${API_BASE}/api/marketplace/admin/featured/${listingId}`, { featured: !featured });
      alert(featured ? 'Listing unfeatured' : 'Listing featured!');
      await loadPendingListings();
    } catch (err) {
      console.error('Failed to toggle featured:', err);
      alert('Failed to update featured status');
    }
  }

  function formatPrice(cents) {
    if (cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading admin panel...</div>
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
                <span className="text-4xl">👑</span>
                Admin Panel
              </h1>
              <p className="text-gray-400 mt-1">Moderate marketplace listings</p>
            </div>
            <Link
              to="/marketplace"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
            >
              View Marketplace
            </Link>
          </div>

          {/* Filters */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Pending ({pendingListings.filter(l => l.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All ({pendingListings.length})
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-400">
              {pendingListings.filter(l => l.status === 'pending').length}
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">Total Listings</div>
            <div className="text-3xl font-bold text-purple-400">
              {pendingListings.length}
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">Featured</div>
            <div className="text-3xl font-bold text-green-400">
              {pendingListings.filter(l => l.is_featured === 1).length}
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">Unique Sellers</div>
            <div className="text-3xl font-bold text-blue-400">
              {new Set(pendingListings.map(l => l.seller_id)).size}
            </div>
          </div>
        </div>

        {/* Listings */}
        {pendingListings.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-400 text-lg">All caught up! No pending listings.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingListings
              .filter(l => filter === 'all' || l.status === filter)
              .map(listing => (
                <AdminListingCard
                  key={listing.id}
                  listing={listing}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onFeature={handleFeature}
                  formatPrice={formatPrice}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminListingCard({ listing, onApprove, onReject, onFeature, formatPrice }) {
  const statusColors = {
    pending: 'bg-yellow-600',
    approved: 'bg-green-600',
    rejected: 'bg-red-600'
  };

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
    <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500/50 transition">
      <div className="p-6">
        <div className="flex gap-6">
          {/* Thumbnail */}
          <Link to={`/marketplace/listing/${listing.id}`} className="flex-shrink-0" target="_blank">
            {listing.thumbnail_url ? (
              <img
                src={listing.thumbnail_url}
                alt={listing.title}
                className="w-32 h-32 object-cover rounded-lg hover:opacity-80 transition"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-900 rounded-lg flex items-center justify-center text-4xl">
                {categoryIcons[listing.category] || '📦'}
              </div>
            )}
          </Link>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Link
                  to={`/marketplace/listing/${listing.id}`}
                  target="_blank"
                  className="text-xl font-bold text-white hover:text-purple-400 transition"
                >
                  {listing.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span>{categoryIcons[listing.category]} {listing.category}</span>
                  <span>•</span>
                  <span>By {listing.seller_name}</span>
                  <span>•</span>
                  <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {listing.is_featured === 1 && (
                  <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs font-bold text-yellow-400">
                    ⭐ Featured
                  </div>
                )}
                <div className={`px-3 py-1 ${statusColors[listing.status]} rounded text-sm font-bold text-white uppercase`}>
                  {listing.status}
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">{listing.description}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400">Price</div>
                <div className="text-lg font-bold text-green-400">{formatPrice(listing.price_cents)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Views</div>
                <div className="text-lg font-bold text-blue-400">{listing.view_count}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Downloads</div>
                <div className="text-lg font-bold text-purple-400">{listing.download_count}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Purchases</div>
                <div className="text-lg font-bold text-yellow-400">{listing.purchase_count}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {listing.status === 'pending' && (
                <>
                  <button
                    onClick={() => onApprove(listing.id)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => onReject(listing.id)}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                  >
                    ❌ Reject
                  </button>
                </>
              )}
              <button
                onClick={() => onFeature(listing.id, listing.is_featured === 1)}
                className={`px-6 py-2 ${
                  listing.is_featured === 1
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                } text-white rounded-lg font-semibold transition`}
              >
                {listing.is_featured === 1 ? '⭐ Unfeature' : '⭐ Feature'}
              </button>
              <Link
                to={`/marketplace/listing/${listing.id}`}
                target="_blank"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
              >
                👁️ View
              </Link>
            </div>

            {/* Rejection Reason */}
            {listing.rejection_reason && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
                <div className="font-semibold mb-1">Rejection Reason:</div>
                <div>{listing.rejection_reason}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
