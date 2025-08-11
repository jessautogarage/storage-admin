// src/services/priceBreakdownService.js
// ✅ Enhanced price calculation service matching Flutter implementation

export class PriceBreakdownService {
  constructor() {
    this.platformFeePercentage = 10; // 10% platform fee (fixed from 9%)
  }

  /**
   * Calculate price breakdown for a booking
   * @param {number} storagePrice - The listing price (not per day)
   * @param {number} numberOfDays - Number of days to book
   * @returns {Object} Price breakdown with all components
   */
  calculatePriceBreakdown(storagePrice, numberOfDays = 1) {
    // ✅ FIXED: Storage fee is the listing price, not divided by days
    const storageFee = storagePrice;
    
    // ✅ FIXED: Platform fee is 10% of storage fee
    const platformFee = (storageFee * this.platformFeePercentage) / 100;
    
    // Total = Storage Fee + Platform Fee
    const totalAmount = storageFee + platformFee;

    return {
      storagePrice,
      numberOfDays,
      storageFee,
      platformFee,
      platformFeePercentage: this.platformFeePercentage,
      totalAmount,
      // Additional details for display
      pricePerDay: numberOfDays > 1 ? storageFee / numberOfDays : storageFee,
      breakdown: {
        'Storage Fee': storageFee,
        'Platform Fee (10%)': platformFee,
        'Total': totalAmount
      }
    };
  }

  /**
   * Calculate price for multiple date ranges
   * @param {Array} dateRanges - Array of {startDate, endDate} objects
   * @param {number} dailyPrice - Daily price for the listing
   * @returns {Object} Price breakdown for all date ranges
   */
  calculateMultiDatePriceBreakdown(dateRanges, dailyPrice) {
    let totalDays = 0;
    const rangeDetails = [];

    dateRanges.forEach((range, index) => {
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      totalDays += days;
      rangeDetails.push({
        rangeIndex: index + 1,
        startDate: range.startDate,
        endDate: range.endDate,
        days,
        cost: dailyPrice * days
      });
    });

    return this.calculatePriceBreakdown(dailyPrice * totalDays, totalDays);
  }

  /**
   * Validate if user has sufficient wallet balance
   * @param {number} walletBalance - Current wallet balance
   * @param {number} totalAmount - Total booking amount
   * @returns {Object} Validation result with warnings
   */
  validateWalletBalance(walletBalance, totalAmount) {
    const isInsufficientFunds = walletBalance < totalAmount;
    const isLowBalance = walletBalance < 500; // Low balance threshold
    const shortfall = isInsufficientFunds ? totalAmount - walletBalance : 0;

    return {
      hasInsufficientFunds: isInsufficientFunds,
      hasLowBalance: isLowBalance,
      shortfall,
      canProceed: !isInsufficientFunds,
      warnings: [
        ...(isInsufficientFunds ? [`Insufficient funds. You need $${shortfall.toFixed(2)} more.`] : []),
        ...(isLowBalance && !isInsufficientFunds ? ['Your wallet balance is below $500. Consider topping up.'] : [])
      ]
    };
  }

  /**
   * Format price for display
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency symbol
   * @returns {string} Formatted price string
   */
  formatPrice(amount, currency = '$') {
    return `${currency}${amount.toFixed(2)}`;
  }

  /**
   * Get platform settings (for dynamic fee configuration)
   * @returns {Promise<Object>} Platform settings
   */
  async getPlatformSettings() {
    // TODO: Implement dynamic platform fee from Firestore
    // This matches the Flutter implementation
    return {
      platformFeePercentage: this.platformFeePercentage,
      lowBalanceThreshold: 500,
      currency: '$',
      taxRate: 0 // For future tax implementation
    };
  }
}

// Export singleton instance
export const priceBreakdownService = new PriceBreakdownService();