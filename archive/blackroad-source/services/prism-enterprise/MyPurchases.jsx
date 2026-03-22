import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders, downloadAsset, postReview } from '../api';

export default function MyPurchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await getMyOrders('purchases');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(orderId) {
    try {
      const data = await downloadAsset(orderId);

      // In production, this would trigger actual download
      alert(`Download ready!\n\nLicense Key: ${data.license_key}\nDownloads Remaining: ${data.downloads_remaining === -1 ? 'Unlimited' : data.downloads_remaining}\n\nURL: ${data.download_url}`);

      // Reload to update download count
      await loadOrders();
    } catch (err) {
      console.error('Download failed:', err);
      alert(err.response?.data?.error || 'Download failed');
    }
  }

  async function handleReview(orderId, rating, title, comment) {
    try {
      await postReview({
        orderId,
        rating,
        title,
        comment
      });
      setShowReviewModal(null);
      alert('Review posted! Thank you for your feedback.');
      await loadOrders();
    } catch (err) {
      console.error('Failed to post review:', err);
      alert(err.response?.data?.error || 'Failed to post review');
    }
  }

  function formatPrice(cents) {
    if (cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'completed') return order.status === 'completed';
    if (filter === 'pending') return order.status === 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading your purchases...</div>
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
                <span className="text-4xl">📦</span>
                My Purchases
              </h1>
              <p className="text-gray-400 mt-1">Download your assets and manage licenses</p>
            </div>
            <Link
              to="/marketplace"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
            >
              Browse More Assets
            </Link>
          </div>

          {/* Filters */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'completed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Completed ({orders.filter(o => o.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Pending ({orders.filter(o => o.status === 'pending').length})
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">Total Spent</div>
            <div className="text-3xl font-bold text-purple-400">
              {formatPrice(orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount_cents, 0))}
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">Assets Owned</div>
            <div className="text-3xl font-bold text-green-400">
              {orders.filter(o => o.status === 'completed').length}
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">Total Downloads</div>
            <div className="text-3xl font-bold text-blue-400">
              {orders.reduce((sum, o) => sum + (o.download_count || 0), 0)}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-400 text-lg mb-4">
              {filter === 'all' ? 'No purchases yet' : `No ${filter} purchases`}
            </p>
            <Link
              to="/marketplace"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onDownload={handleDownload}
                onReview={() => setShowReviewModal(order)}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          order={showReviewModal}
          onClose={() => setShowReviewModal(null)}
          onSubmit={handleReview}
        />
      )}
    </div>
  );
}

function OrderCard({ order, onDownload, onReview, formatPrice }) {
  const statusColors = {
    pending: 'bg-yellow-600',
    processing: 'bg-blue-600',
    completed: 'bg-green-600',
    failed: 'bg-red-600',
    refunded: 'bg-gray-600'
  };

  const statusIcons = {
    pending: '⏳',
    processing: '⚙️',
    completed: '✅',
    failed: '❌',
    refunded: '↩️'
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500/50 transition">
      <div className="p-6">
        <div className="flex gap-6">
          {/* Thumbnail */}
          <Link to={`/marketplace/listing/${order.listing_id}`} className="flex-shrink-0">
            {order.thumbnail_url ? (
              <img
                src={order.thumbnail_url}
                alt={order.listing_title}
                className="w-32 h-32 object-cover rounded-lg hover:opacity-80 transition"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-900 rounded-lg flex items-center justify-center text-4xl">
                📦
              </div>
            )}
          </Link>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Link
                  to={`/marketplace/listing/${order.listing_id}`}
                  className="text-xl font-bold text-white hover:text-purple-400 transition"
                >
                  {order.listing_title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span>Order #{order.id.slice(0, 8)}</span>
                  <span>•</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="capitalize">{order.license_type} License</span>
                </div>
              </div>
              <div className={`px-3 py-1 ${statusColors[order.status]} rounded text-sm font-bold text-white uppercase flex items-center gap-1`}>
                <span>{statusIcons[order.status]}</span>
                <span>{order.status}</span>
              </div>
            </div>

            {/* License Key */}
            {order.license_key && (
              <div className="mb-3 p-3 bg-gray-900/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">License Key</div>
                <div className="font-mono text-sm text-purple-400">{order.license_key}</div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400">Amount</div>
                <div className="text-lg font-bold text-green-400">{formatPrice(order.amount_cents)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Downloads</div>
                <div className="text-lg font-bold text-blue-400">
                  {order.download_count}/{order.max_downloads === -1 ? '∞' : order.max_downloads}
                </div>
              </div>
              {order.license_expires_at && (
                <div>
                  <div className="text-xs text-gray-400">License Expires</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {new Date(order.license_expires_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {order.status === 'completed' && (
                <>
                  <button
                    onClick={() => onDownload(order.id)}
                    disabled={order.max_downloads !== -1 && order.download_count >= order.max_downloads}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={onReview}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                  >
                    ⭐ Write Review
                  </button>
                </>
              )}
              <Link
                to={`/marketplace/listing/${order.listing_id}`}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
              >
                View Listing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ order, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(order.id, rating, title, comment);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Write a Review</h2>
        <p className="text-gray-400 mb-4">{order.listing_title}</p>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl hover:scale-110 transition"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
              placeholder="Sum up your experience"
            />
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
              placeholder="Share your thoughts..."
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
              Post Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
