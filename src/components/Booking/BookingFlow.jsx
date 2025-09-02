import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Calendar,
  CreditCard,
  Wallet,
  DollarSign,
  MessageCircle,
  MapPin,
  Navigation,
  Check,
  AlertCircle,
  ChevronRight,
  Shield,
  Clock,
  Phone,
  FileText
} from 'lucide-react';
import BookingAgreement from './BookingAgreement';
import { bookingService } from '../../services/bookingService';
import { walletService } from '../../services/walletService';
import { messageService } from '../../services/messageService';
import { useToast } from '../Notifications/EnhancedToast';

const BookingFlow = ({ listing, selectedDates, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError, showLoading, removeToast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [hostInfo, setHostInfo] = useState(null);

  const steps = [
    { id: 1, title: 'Agreement', icon: FileText },
    { id: 2, title: 'Payment', icon: CreditCard },
    { id: 3, title: 'Confirmation', icon: Check }
  ];

  // Calculate booking details
  const calculateBookingDetails = () => {
    const startDate = new Date(selectedDates.startDate);
    const endDate = new Date(selectedDates.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const dailyRate = listing.pricePerDay || listing.pricing?.daily || 100;
    const subtotal = dailyRate * days;
    const serviceFee = subtotal * 0.1; // 10% service fee
    const totalAmount = subtotal + serviceFee;

    return {
      startDate: selectedDates.startDate,
      endDate: selectedDates.endDate,
      days,
      dailyRate,
      subtotal,
      serviceFee,
      totalAmount,
      listingId: listing.id,
      listingTitle: listing.title,
      hostId: listing.hostId
    };
  };

  useEffect(() => {
    // Fetch wallet balance
    const fetchWalletBalance = async () => {
      const userId = user?.user?.uid || user?.uid;
      if (userId) {
        const result = await walletService.getWallet(userId);
        if (result.success) {
          setWalletBalance(result.wallet.balance);
        } else {
          // Initialize wallet for new users
          await walletService.initializeWallet(userId, 'client');
          setWalletBalance(2000); // Default client balance
        }
      }
    };
    
    fetchWalletBalance();
    setBookingData(calculateBookingDetails());
  }, [listing, selectedDates, user]);

  const handleAgreementAccept = async (agreementData) => {
    setAgreementAccepted(true);
    setCurrentStep(2);
    
    // Store agreement data
    setBookingData(prev => ({
      ...prev,
      agreement: agreementData
    }));
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    
    // Check wallet balance if wallet payment selected
    if (method === 'wallet' && walletBalance < bookingData.totalAmount) {
      showError('Insufficient wallet balance. Please choose another payment method or add funds.');
      return;
    }
    
    // Proceed to confirmation
    setCurrentStep(3);
  };

  const handleBookingConfirm = async () => {
    setLoading(true);
    const loadingToastId = showLoading('Processing your booking...');
    
    try {
      const userId = user?.user?.uid || user?.uid;
      
      // Create booking
      const bookingResult = await bookingService.createBooking({
        ...bookingData,
        clientId: userId,
        paymentMethod,
        status: paymentMethod === 'cash' ? 'pending_payment' : 'confirmed',
        agreementSigned: true,
        agreementData: bookingData.agreement
      });

      if (!bookingResult.success) {
        throw new Error(bookingResult.error || 'Failed to create booking');
      }

      // Process payment if using wallet
      if (paymentMethod === 'wallet') {
        const paymentResult = await walletService.processBookingPayment({
          clientId: userId,
          hostId: listing.hostId,
          bookingId: bookingResult.bookingId,
          amount: bookingData.totalAmount,
          serviceFee: bookingData.serviceFee,
          paymentMethod: 'wallet',
          listingTitle: listing.title
        });

        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment failed');
        }
      }

      // Create initial message thread with host
      await messageService.createMessageThread({
        bookingId: bookingResult.bookingId,
        clientId: userId,
        hostId: listing.hostId,
        listingTitle: listing.title,
        initialMessage: `Hi! I've just booked your ${listing.title} from ${new Date(bookingData.startDate).toLocaleDateString()} to ${new Date(bookingData.endDate).toLocaleDateString()}. Looking forward to using your space!`
      });

      removeToast(loadingToastId);
      showSuccess('Booking confirmed successfully! You can now message the host.');
      
      // Navigate to bookings page
      setTimeout(() => {
        navigate('/client/bookings', {
          state: { 
            newBookingId: bookingResult.bookingId,
            showMessage: true 
          }
        });
      }, 2000);
      
    } catch (error) {
      console.error('Booking error:', error);
      removeToast(loadingToastId);
      showError(error.message || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  const openNavigation = () => {
    const { lat, lng } = listing.location;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BookingAgreement
            listing={listing}
            bookingDetails={bookingData}
            hostInfo={hostInfo}
            clientInfo={{
              name: user?.displayName || 'Client',
              email: user?.email,
              phone: user?.phoneNumber
            }}
            onAccept={handleAgreementAccept}
            onDecline={onClose}
          />
        );
        
      case 2:
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">Select Payment Method</h3>
            
            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>₱{bookingData?.dailyRate} × {bookingData?.days} days</span>
                  <span>₱{bookingData?.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>₱{bookingData?.serviceFee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₱{bookingData?.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-3">
              {/* Wallet Payment */}
              <button
                onClick={() => handlePaymentMethodSelect('wallet')}
                className="w-full p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold">Pay with Wallet</p>
                      <p className="text-sm text-gray-600">
                        Balance: ₱{walletBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>
                {walletBalance < bookingData?.totalAmount && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Insufficient balance
                  </p>
                )}
              </button>

              {/* Cash Payment */}
              <button
                onClick={() => handlePaymentMethodSelect('cash')}
                className="w-full p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold">Cash Payment</p>
                      <p className="text-sm text-gray-600">
                        Pay directly to host upon meeting
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                </div>
              </button>

              {/* GCash Payment (Future) */}
              <button
                disabled
                className="w-full p-4 border rounded-lg opacity-50 cursor-not-allowed text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-400">GCash</p>
                      <p className="text-sm text-gray-400">Coming soon</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                Cancel
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold">Ready to Confirm!</h3>
              <p className="text-gray-600 mt-2">Review your booking details</p>
            </div>

            {/* Final Summary */}
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">{listing.title}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>
                      {new Date(bookingData?.startDate).toLocaleDateString()} - 
                      {new Date(bookingData?.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{listing.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-bold">
                      ₱{bookingData?.totalAmount?.toLocaleString()} via {paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Host Contact Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">After Booking</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span>Message the host directly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>Get directions to the location</span>
                  </div>
                  {paymentMethod === 'cash' && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>Coordinate cash payment with host</span>
                    </div>
                  )}
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold">Cash Payment Reminder</p>
                      <p className="text-gray-700">
                        Please prepare ₱{bookingData?.totalAmount?.toLocaleString()} in cash to hand over to the host when you meet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleBookingConfirm}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Progress Steps */}
        <div className="bg-white rounded-t-xl p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-400'}
                  `}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default BookingFlow;