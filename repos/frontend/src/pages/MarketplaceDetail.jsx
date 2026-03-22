import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getListing,
  getSellerProfile,
  getListingReviews,
  createOrder,
  confirmOrder,
  addToFavorites,
  removeFromFavorites,
  postReview
} from '../api';
import RealityEngineViewer from '../components/RealityEngineViewer';
import StripeCheckout from '../components/StripeCheckout';

export default function MarketplaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState('personal');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    loadListingDetails();
  }, [id]);

  async function loadListingDetails() {
    try {
      const data = await getListing(id);
      setListing(data.listing);
      setSeller(data.seller);

      // Load reviews
      const reviewsData = await getListingReviews(id);
      setReviews(reviewsData.reviews || []);
    } catch (err) {
      console.error('Failed to load listing:', err);
      alert('Failed to load listing');
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    if (!listing || purchasing) return;

    setPurchasing(true);

    try {
      // Create order in backend
      const orderData = await createOrder({
        listingId: listing.id,
        licenseType: selectedLicense
      });

      // Store order for checkout
      setCurrentOrder(orderData.order);

      // Show Stripe checkout modal
      setShowCheckout(true);
    } catch (err) {
      console.error('Purchase failed:', err);
      alert(err.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  }

  async function handlePaymentSuccess(paymentData) {
    try {
      // Confirm order with payment intent ID
      await confirmOrder(currentOrder.id, {
        paymentIntentId: paymentData.paymentIntentId
      });

      setShowCheckout(false);
      alert('Purchase successful! 🎉\n\nYou can now download your asset from My Purchases.');

      // Navigate to purchases page
      navigate('/marketplace/purchases');
    } catch (err) {
      console.error('Order confirmation failed:', err);
      alert('Payment succeeded but order confirmation failed. Please contact support.');
    }
  }

  function handlePaymentCancel() {
    setShowCheckout(false);
    setCurrentOrder(null);
  }

  async function toggleFavorite() {
    try {
      if (isFavorite) {
        await removeFromFavorites(listing.id);
        setIsFavorite(false);
      } else {
        await addToFavorites(listing.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }

  function formatPrice(cents) {
    if (cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  }

  function getLicensePrice(basePrice, licenseType) {
    if (basePrice === 0) return 0;
    const multipliers = {
      personal: 1,
      commercial: 3,
      extended: 10
    };
    return Math.floor(basePrice * multipliers[licenseType]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <p className="text-gray-400 text-xl">Listing not found</p>
          <Link to="/marketplace" className="mt-4 inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30">
        <div className="container mx-auto px-6 py-4">
          <Link to="/marketplace" className="text-purple-400 hover:text-purple-300 flex items-center gap-2">
            ← Back to Marketplace
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden">
              {/* Thumbnail/3D Preview */}
              <div className="relative aspect-video bg-gray-900">
                {listing.preview_3d_url ? (
                  <RealityEngineViewer sceneUrl={listing.preview_3d_url} className="w-full h-full" />
                ) : listing.thumbnail_url ? (
                  <img
                    src={listing.thumbnail_url}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    {categoryIcons[listing.category] || '🔮'}
                  </div>
                )}

                {/* Featured Badge */}
                {listing.is_featured === 1 && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded text-sm font-bold text-black">
                    ⭐ Featured
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition"
                >
                  <span className="text-2xl">{isFavorite ? '❤️' : '🤍'}</span>
                </button>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{categoryIcons[listing.category]} {listing.category}</span>
                      <span>•</span>
                      <span>👁️ {listing.view_count} views</span>
                      <span>•</span>
                      <span>⬇️ {listing.download_count} downloads</span>
                      <span>•</span>
                      <span>🛒 {listing.purchase_count} purchases</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                {listing.rating_count > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <span>⭐</span>
                      <span className="text-lg font-bold">{listing.rating_avg.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-400">({listing.rating_count} reviews)</span>
                  </div>
                )}

                {/* Description */}
                {listing.description && (
                  <div className="mt-6">
                    <h2 className="text-xl font-bold text-white mb-3">Description</h2>
                    <p className="text-gray-300 whitespace-pre-wrap">{listing.description}</p>
                  </div>
                )}

                {/* Tags */}
                {listing.tags && listing.tags.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-xl font-bold text-white mb-3">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-sm text-purple-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Reviews ({reviews.length})</h2>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                  Write Review
                </button>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">💭</div>
                  <p className="text-gray-400">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-white">{review.reviewer_name}</div>
                          <div className="flex items-center gap-1 text-yellow-400 text-sm">
                            {'⭐'.repeat(review.rating)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {review.title && (
                        <h4 className="font-semibold text-white mb-1">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-gray-300 text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 sticky top-24">
              <div className="text-3xl font-bold text-purple-400 mb-6">
                {formatPrice(getLicensePrice(listing.price_cents, selectedLicense))}
              </div>

              {/* License Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-3">License Type</label>
                <div className="space-y-2">
                  {['personal', 'commercial', 'extended'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedLicense(type)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition text-left ${
                        selectedLicense === type
                          ? 'border-purple-500 bg-purple-600/20 text-white'
                          : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-semibold capitalize">{type}</div>
                      <div className="text-sm text-gray-400">
                        {formatPrice(getLicensePrice(listing.price_cents, type))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-bold text-lg transition shadow-lg"
              >
                {purchasing ? 'Processing...' : listing.price_cents === 0 ? 'Download Free' : 'Purchase Now'}
              </button>

              {/* Info */}
              <div className="mt-6 space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <span>✅</span>
                  <span>Instant download after purchase</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>🔑</span>
                  <span>License key included</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>🔄</span>
                  <span>Unlimited re-downloads</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>💳</span>
                  <span>Secure payment via Stripe</span>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            {seller && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Seller Information</h3>

                <div className="flex items-center gap-3 mb-4">
                  {seller.avatar_url ? (
                    <img src={seller.avatar_url} alt={seller.display_name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                      {seller.display_name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-white">{seller.display_name || 'Anonymous'}</div>
                    {seller.verification_status === 'verified' && (
                      <div className="text-xs text-green-400 flex items-center gap-1">
                        <span>✓</span> Verified Seller
                      </div>
                    )}
                  </div>
                </div>

                {seller.bio && (
                  <p className="text-gray-300 text-sm mb-4">{seller.bio}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">{seller.total_sales}</div>
                    <div className="text-xs text-gray-400">Sales</div>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {seller.rating_avg > 0 ? seller.rating_avg.toFixed(1) : 'New'}
                    </div>
                    <div className="text-xs text-gray-400">Rating</div>
                  </div>
                </div>

                <Link
                  to={`/marketplace/seller/${seller.id}`}
                  className="mt-4 block w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-center rounded-lg transition"
                >
                  View More Assets
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      {showCheckout && currentOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <StripeCheckout
              amount={getLicensePrice(listing.price_cents, selectedLicense)}
              currency="usd"
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
              metadata={{
                orderId: currentOrder.id,
                listingId: listing.id,
                licenseType: selectedLicense
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
