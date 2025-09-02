import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useStorageListings from '../../hooks/useStorageListings';
import useUserFavorites from '../../hooks/useUserFavorites';
import { db } from '../../utils/firebaseConfig';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import ModernHeader from '../Layout/ModernHeader';
import DateAvailabilityCalendar from '../Common/DateAvailabilityCalendar';
import BookingFlow from '../Booking/BookingFlow';
import listingService from '../../services/listingService';
import { bookingService } from '../../services/bookingService';
import { walletService } from '../../services/walletService';
import { termsService } from '../../services/termsService';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  Calendar,
  Clock,
  Shield,
  Wifi,
  Car,
  Thermometer,
  Zap,
  MessageCircle,
  Phone,
  Mail,
  User,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Ruler,
  Package,
  Building,
  Eye,
  DollarSign,
  AlertCircle,
  Info,
  Wallet,
  CreditCard,
  FileText
} from 'lucide-react';

const ListingDetail = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userId = user?.user?.uid || user?.uid;

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [similarListings, setSimilarListings] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [terms, setTerms] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [bookingDates, setBookingDates] = useState({ startDate: null, endDate: null, days: 0, isValid: false });
  const [listingAvailability, setListingAvailability] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [termsSignature, setTermsSignature] = useState('');
  const [showBookingFlow, setShowBookingFlow] = useState(false);

  const {
    favorites,
    isFavorited,
    toggleFavorite,
    loading: favoritesLoading
  } = useUserFavorites(userId);

  // Fetch terms and wallet balance
  useEffect(() => {
    const loadTermsAndWallet = async () => {
      if (userId) {
        // Load wallet
        const walletResult = await walletService.getWallet(userId);
        if (walletResult.success) {
          setWalletBalance(walletResult.wallet.balance);
        } else {
          // Initialize wallet if doesn't exist
          await walletService.initializeWallet(userId, 'client');
          const retryWallet = await walletService.getWallet(userId);
          if (retryWallet.success) {
            setWalletBalance(retryWallet.wallet.balance);
          }
        }
      }
      
      // Load terms
      const termsResult = await termsService.getCurrentTerms();
      if (termsResult.success) {
        setTerms(termsResult.terms);
      }
    };
    
    loadTermsAndWallet();
  }, [userId]);

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) {
        setError('No listing ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, 'listings', listingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const listingData = { id: docSnap.id, ...docSnap.data() };
          setListing(listingData);

          // Fetch listing availability
          const availabilityResult = await listingService.getListingAvailability(listingId);
          console.log('Fetched listing availability:', availabilityResult);
          if (availabilityResult.success) {
            setListingAvailability(availabilityResult.availability);
            console.log('Available dates from listing:', {
              count: availabilityResult.availability?.availableDates?.length || 0,
              sample: availabilityResult.availability?.availableDates?.slice(0, 5),
              bookedDates: availabilityResult.availability?.bookedDates?.length || 0
            });
          }

          // Fetch similar listings based on type and location
          const similarQuery = query(
            collection(db, 'listings'),
            where('status', '==', 'active'),
            where('type', '==', listingData.type || 'storage'),
            orderBy('rating', 'desc'),
            limit(4)
          );

          const similarSnapshot = await getDocs(similarQuery);
          const similar = [];
          similarSnapshot.forEach((doc) => {
            if (doc.id !== listingId) { // Exclude current listing
              similar.push({ id: doc.id, ...doc.data() });
            }
          });
          setSimilarListings(similar.slice(0, 3)); // Get only 3 similar listings
        } else {
          setError('Listing not found');
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleToggleFavorite = async () => {
    if (!userId) {
      navigate('/signin');
      return;
    }
    
    try {
      await toggleFavorite(listingId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleBooking = async () => {
    if (!userId) {
      navigate('/signin');
      return;
    }

    if (!bookingDates.isValid || !bookingDates.startDate || !bookingDates.endDate) {
      // Show booking modal to select dates
      setShowBookingModal(true);
      return;
    }

    // Validate dates are within available dates
    if (listingAvailability && listingAvailability.availableDates) {
      const startStr = format(bookingDates.startDate, 'yyyy-MM-dd');
      const endStr = format(bookingDates.endDate, 'yyyy-MM-dd');
      
      // Check if all dates in range are available
      const currentDate = new Date(bookingDates.startDate);
      const endDate = new Date(bookingDates.endDate);
      
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        if (!listingAvailability.availableDates.includes(dateStr)) {
          alert('Some selected dates are not available. Please choose different dates.');
          return;
        }
        if (listingAvailability.bookedDates?.includes(dateStr)) {
          alert('Some selected dates are already booked. Please choose different dates.');
          return;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Show booking flow instead of confirmation modal
    setShowBookingFlow(true);
  };

  const handleConfirmBooking = async () => {
    if (!termsAccepted || !termsSignature) {
      alert('Please read and sign the terms and conditions');
      return;
    }
    
    const storageAmount = (listing.pricing?.daily || listing.pricePerDay || 0) * bookingDates.days;
    const serviceFee = Math.round(storageAmount * 0.05);
    const clientPays = storageAmount; // Client doesn't pay service fee
    
    if (paymentMethod === 'wallet' && walletBalance < clientPays) {
      alert('Insufficient wallet balance. Please add funds or choose another payment method.');
      return;
    }
    
    setShowConfirmModal(false);
    
    try {
      setBookingLoading(true);
      
      // Record terms acceptance with signature
      if (terms?.id) {
        await termsService.recordAcceptance(userId, terms.id, 'booking', {
          ...termsSignature,
          paymentMethod,
          bookingAmount: clientPays
        });
      }
      
      // Format dates for booking
      const formattedStartDate = format(bookingDates.startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(bookingDates.endDate, 'yyyy-MM-dd');
      
      // Process payment if using wallet
      if (paymentMethod === 'wallet') {
        const paymentResult = await walletService.processBookingPayment({
          clientId: userId,
          hostId: listing.hostId,
          bookingId: `temp-${Date.now()}`, // Temporary ID until booking is created
          amount: storageAmount,
          serviceFee: serviceFee,
          paymentMethod: 'wallet',
          listingTitle: listing.title
        });
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment failed');
        }
      }
      
      // Create the booking
      const bookingResult = await bookingService.createBooking({
        listingId,
        clientId: userId,
        hostId: listing.hostId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        listingPrice: listing.pricing?.daily || listing.pricePerDay || 0,
        totalPrice: clientPays,
        serviceFee: serviceFee,
        days: bookingDates.days,
        paymentMethod: paymentMethod,
        clientName: user.displayName || user.email,
        clientEmail: user.email,
        hostName: listing.hostName || 'Host',
        hostEmail: listing.hostEmail || '',
        listingTitle: listing.title,
        listingAddress: listing.location?.address || listing.address,
        status: listingAvailability?.instantBook ? 'confirmed' : 'pending',
        termsAccepted: true,
        termsSignature: termsSignature
      });

      if (bookingResult.success) {
        // Navigate to booking confirmation or success page
        navigate('/client/bookings', {
          state: { 
            message: 'Booking request submitted successfully!',
            bookingId: bookingResult.bookingId 
          }
        });
      } else {
        throw new Error(bookingResult.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking: ' + error.message);
      setShowConfirmModal(false);
    } finally {
      setBookingLoading(false);
      setShowBookingModal(false);
    }
  };

  const handleDateRangeChange = (dateRange) => {
    setBookingDates(dateRange);
  };

  const handleMessageHost = () => {
    if (!userId) {
      navigate('/signin');
      return;
    }
    setShowMessageModal(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: listing?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  const getFeatureIcon = (feature) => {
    const lowerFeature = feature.toLowerCase();
    if (lowerFeature.includes('climate') || lowerFeature.includes('air con')) return Thermometer;
    if (lowerFeature.includes('cctv') || lowerFeature.includes('security')) return Shield;
    if (lowerFeature.includes('wifi')) return Wifi;
    if (lowerFeature.includes('24') || lowerFeature.includes('access')) return Clock;
    if (lowerFeature.includes('parking') || lowerFeature.includes('car')) return Car;
    return Zap;
  };

  const nextImage = () => {
    if (listing?.images?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = () => {
    if (listing?.images?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader 
          variant="client"
          user={user}
          onSignIn={() => navigate('/signin')}
          onSignUp={() => navigate('/signup')}
          onLogout={handleSignOut}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-80 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader 
          variant="client"
          user={user}
          onSignIn={() => navigate('/signin')}
          onSignUp={() => navigate('/signup')}
          onLogout={handleSignOut}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Listing not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              The storage space you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/client/browse')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Other Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle both string URLs and image objects with url property
  // Use actual uploaded images only
  let displayImage = null;
  if (listing.images && listing.images.length > 0) {
    const currentImage = listing.images[currentImageIndex];
    if (typeof currentImage === 'string') {
      displayImage = currentImage;
    } else if (currentImage?.url) {
      displayImage = currentImage.url;
    } else if (currentImage?.src) {
      displayImage = currentImage.src;
    }
  }

  const displayLocation = listing.location 
    ? `${listing.location.address || ''} ${listing.location.district || ''}, ${listing.location.city || ''}`.replace(/^,\s*/, '')
    : 'Location not specified';

  const displayPrice = listing.pricing?.daily || 0;
  const displaySize = listing.size?.value 
    ? `${listing.size.value} ${listing.size.unit || 'sqm'}`
    : 'Size not specified';

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        variant="client"
        user={user}
        onSignIn={() => navigate('/signin')}
        onSignUp={() => navigate('/signup')}
        onLogout={handleSignOut}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to listings
        </button>

        {/* Image Gallery */}
        <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden mb-8 group">
          {displayImage ? (
            <img
              src={displayImage}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div 
            className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
            style={{ display: displayImage ? 'none' : 'flex' }}
          >
            <div className="text-center">
              <Package className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <span className="text-gray-500 text-lg">No image available</span>
            </div>
          </div>
          
          {/* Image Navigation */}
          {listing.images && listing.images.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                <Camera className="w-4 h-4" />
                {currentImageIndex + 1} / {listing.images.length}
              </div>

              {/* Image Dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={handleShare}
              className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleToggleFavorite}
              disabled={favoritesLoading}
              className={`w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all ${
                isFavorited(listingId) 
                  ? 'bg-red-500 text-white scale-110' 
                  : 'bg-white/90 text-gray-700 hover:text-red-500 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited(listingId) ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Basic Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{displayLocation}</span>
                  </div>
                  {listing.rating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900 ml-1">
                          {listing.rating}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        ({listing.reviewCount || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
                {listing.viewCount && (
                  <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <Eye className="w-4 h-4 mr-1" />
                    {listing.viewCount} views
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-xl shadow-sm border">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Ruler className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="font-semibold text-gray-900">{displaySize}</div>
                  <div className="text-sm text-gray-500">Size</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {listing.type || 'Storage'}
                  </div>
                  <div className="text-sm text-gray-500">Type</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="font-semibold text-gray-900">
                    {listing.features?.includes('24/7 Access') ? '24/7' : 'Limited'}
                  </div>
                  <div className="text-sm text-gray-500">Access</div>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                    listing.status === 'available' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <Package className={`w-6 h-6 ${
                      listing.status === 'available' ? 'text-green-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {listing.status || 'Available'}
                  </div>
                  <div className="text-sm text-gray-500">Status</div>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>
              </div>
            )}

            {/* Features & Amenities */}
            {listing.features && listing.features.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.features.map((feature, index) => {
                    const Icon = getFeatureIcon(feature);
                    return (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{feature}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Host Information - Removed per requirement. Messaging only available after booking */}

            {/* Similar Listings */}
            {similarListings.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Similar Storage Spaces</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {similarListings.map((similar) => {
                    // Use actual uploaded images only for similar listings
                    let similarImage = null;
                    if (similar.images && similar.images.length > 0) {
                      const firstImage = similar.images[0];
                      if (typeof firstImage === 'string') {
                        similarImage = firstImage;
                      } else if (firstImage?.url) {
                        similarImage = firstImage.url;
                      } else if (firstImage?.src) {
                        similarImage = firstImage.src;
                      }
                    }
                    
                    const similarLocation = similar.location 
                      ? `${similar.location.district || ''}, ${similar.location.city || ''}`.replace(/^,\s*/, '')
                      : 'Location not specified';

                    return (
                      <div
                        key={similar.id}
                        onClick={() => navigate(`/client/listing/${similar.id}`)}
                        className="cursor-pointer group"
                      >
                        <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                          {similarImage ? (
                            <img
                              src={similarImage}
                              alt={similar.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                            style={{ display: similarImage ? 'none' : 'flex' }}
                          >
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {similar.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                          {similarLocation}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-blue-600">
                            ₱{(similar.pricing?.daily || 0).toLocaleString()}
                            <span className="text-xs font-normal text-gray-500">/day</span>
                          </div>
                          {similar.rating && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="font-medium">{similar.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    ₱{displayPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">per day</div>
                </div>

                {/* Booking Calendar */}
                <div className="mb-6">
                  {listingAvailability ? (
                    <>
                      {/* Debug: Show availability info */}
                      <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-lg text-xs">
                        <div className="font-semibold text-green-800">Available Dates:</div>
                        <div className="text-green-700">
                          {listingAvailability.availableDates?.length > 0 
                            ? `${listingAvailability.availableDates.length} days available`
                            : 'No dates set by host'}
                        </div>
                        {listingAvailability.availableDates?.length > 0 && (
                          <>
                            <div className="mt-1 text-green-600">
                              Next available: {listingAvailability.availableDates.sort()[0]}
                            </div>
                            <div className="text-green-600 text-xs mt-1">
                              Sample dates: {listingAvailability.availableDates.slice(0, 3).join(', ')}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <DateAvailabilityCalendar
                        mode="client"
                        availableDates={listingAvailability.availableDates || []}
                        bookedDates={listingAvailability.bookedDates || []}
                        blackoutDates={listingAvailability.blackoutDates || []}
                        onDateRangeChange={handleDateRangeChange}
                        selectedStartDate={bookingDates.startDate}
                        selectedEndDate={bookingDates.endDate}
                        minBookingDays={listingAvailability.minBookingDays || 1}
                        maxBookingDays={listingAvailability.maxBookingDays || 30}
                        listingId={listingId}
                      />
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Loading availability...
                    </div>
                  )}
                </div>

                {/* Booking Button Section */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    {bookingDates.isValid 
                      ? `Ready to book ${bookingDates.days} night${bookingDates.days > 1 ? 's' : ''}`
                      : 'Select your dates above to proceed with booking'
                    }
                  </div>
                </div>
                
                <button
                  onClick={handleBooking}
                  disabled={!bookingDates.isValid || bookingLoading || listing.status !== 'active' || userId === listing.hostId}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    bookingDates.isValid && !bookingLoading && listing.status === 'active' && userId !== listing.hostId
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>
                      {userId === listing.hostId
                        ? 'Cannot Book Own Listing'
                        : listing.status !== 'active'
                        ? 'Not Available'
                        : !bookingDates.isValid
                        ? 'Select Dates to Book'
                        : `Book for ₱${Math.round(displayPrice * bookingDates.days * 1.05).toLocaleString()}`
                      }
                    </span>
                  )}
                </button>

                {/* Message host only available after booking */}

                {/* Price Breakdown */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  {bookingDates.isValid && bookingDates.days > 0 ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>₱{displayPrice.toLocaleString()} × {bookingDates.days} day{bookingDates.days > 1 ? 's' : ''}</span>
                        <span>₱{(displayPrice * bookingDates.days).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service fee</span>
                        <span>₱{Math.round(displayPrice * bookingDates.days * 0.05).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base pt-2 border-t">
                        <span>Total</span>
                        <span>₱{Math.round(displayPrice * bookingDates.days * 1.05).toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Select dates to see pricing
                    </div>
                  )}
                </div>

                {/* Trust & Safety */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Shield className="w-4 h-4" />
                    <span>Your payment is protected</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Info className="w-4 h-4" />
                    <span>Free cancellation before check-in</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBookingModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Book Storage Space</h3>
                  <p className="text-sm text-gray-600 mt-1">Select your booking dates for {listing.title}</p>
                </div>
                
                {/* Calendar in modal */}
                <div className="mb-6">
                  {listingAvailability ? (
                    <DateAvailabilityCalendar
                      mode="client"
                      availableDates={listingAvailability.availableDates || []}
                      bookedDates={listingAvailability.bookedDates || []}
                      blackoutDates={listingAvailability.blackoutDates || []}
                      onDateRangeChange={handleDateRangeChange}
                      selectedStartDate={bookingDates.startDate}
                      selectedEndDate={bookingDates.endDate}
                      minBookingDays={listingAvailability.minBookingDays || 1}
                      maxBookingDays={listingAvailability.maxBookingDays || 30}
                      listingId={listingId}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Loading availability...
                    </div>
                  )}
                </div>

                {/* Booking Summary */}
                {bookingDates.isValid && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Booking Summary</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>Check-in: {bookingDates.startDate ? format(bookingDates.startDate, 'MMMM dd, yyyy') : ''}</div>
                      <div>Check-out: {bookingDates.endDate ? format(bookingDates.endDate, 'MMMM dd, yyyy') : ''}</div>
                      <div>Duration: {bookingDates.days} day{bookingDates.days > 1 ? 's' : ''}</div>
                      <div className="pt-2 border-t border-blue-200">
                        <div className="flex justify-between">
                          <span>Storage fee:</span>
                          <span>₱{(displayPrice * bookingDates.days).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service fee:</span>
                          <span>₱{Math.round(displayPrice * bookingDates.days * 0.05).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base pt-1 border-t border-blue-200">
                          <span>Total:</span>
                          <span>₱{Math.round(displayPrice * bookingDates.days * 1.05).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleBooking}
                  disabled={!bookingDates.isValid || bookingLoading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    bookingDates.isValid && !bookingLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {bookingLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Confirm Booking${bookingDates.isValid ? ` (₱${Math.round(displayPrice * bookingDates.days * 1.05).toLocaleString()})` : ''}`
                  )}
                </button>
                <button
                  onClick={() => setShowBookingModal(false)}
                  disabled={bookingLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Flow Component */}
      {showBookingFlow && bookingDates.isValid && (
        <BookingFlow
          listing={listing}
          selectedDates={bookingDates}
          onClose={() => setShowBookingFlow(false)}
        />
      )}

      {/* Old Booking Confirmation Modal - Keeping as backup but hidden */}
      {false && showConfirmModal && bookingDates.isValid && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowConfirmModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Your Booking</h3>
                  <p className="text-sm text-gray-600 mt-1">{listing.title}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{format(bookingDates.startDate, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{format(bookingDates.endDate, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{bookingDates.days} night{bookingDates.days > 1 ? 's' : ''}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Storage fee:</span>
                        <span>₱{(displayPrice * bookingDates.days).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-xs italic">
                        <span>Service fee (paid by host):</span>
                        <span>₱{Math.round(displayPrice * bookingDates.days * 0.05).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base pt-2 border-t">
                        <span>You Pay:</span>
                        <span className="text-blue-600">₱{(displayPrice * bookingDates.days).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Method Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="wallet"
                        checked={paymentMethod === 'wallet'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <Wallet className="w-5 h-5 mr-2 text-blue-600" />
                      <div className="flex-1">
                        <span className="font-medium">Wallet</span>
                        <span className="ml-2 text-sm text-gray-600">
                          (Balance: ₱{walletBalance.toLocaleString()})
                        </span>
                        {paymentMethod === 'wallet' && walletBalance < (displayPrice * bookingDates.days) && (
                          <span className="ml-2 text-xs text-red-600">Insufficient balance</span>
                        )}
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="gcash"
                        checked={paymentMethod === 'gcash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                      <div className="flex-1">
                        <span className="font-medium">GCash</span>
                        <span className="ml-2 text-sm text-gray-600">Pay via GCash</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <DollarSign className="w-5 h-5 mr-2 text-gray-600" />
                      <div className="flex-1">
                        <span className="font-medium">Cash</span>
                        <span className="ml-2 text-sm text-gray-600">Pay on arrival</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <div className="text-sm">
                      <span className="text-gray-700">
                        I accept the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-blue-600 underline hover:text-blue-700"
                        >
                          Terms and Conditions
                        </button>
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        Including cancellation policy and liability terms
                      </p>
                    </div>
                  </label>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  <div className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 mt-0.5" />
                    <div>
                      <div className="font-medium">Booking Protection</div>
                      <div className="text-xs mt-1">Your payment is secure and you can cancel before check-in</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    !bookingLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {bookingLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={bookingLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Host Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowMessageModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Message {listing.hostName || 'Host'}</h3>
                  <p className="text-sm text-gray-600 mt-1">Send a message about {listing.title}</p>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    placeholder="Hi! I'm interested in your storage space..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;