// src/services/analyticsService.js
import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  startAt,
  endAt
} from 'firebase/firestore';
import { format, startOfDay, endOfDay, eachDayOfInterval, subDays } from 'date-fns';

export const analyticsService = {
  // Get overview analytics
  async getOverviewAnalytics(dateRange, compareRange) {
    try {
      const [revenue, users, bookings, listings] = await Promise.all([
        this.getRevenueMetrics(dateRange, compareRange),
        this.getUserMetrics(dateRange, compareRange),
        this.getBookingMetrics(dateRange, compareRange),
        this.getListingMetrics(dateRange, compareRange)
      ]);

      // Calculate conversion rate
      const views = await this.getListingViews(dateRange);
      const conversionRate = views > 0 ? (bookings.total / views) * 100 : 0;

      return {
        overview: {
          revenue: revenue.summary,
          users: users.summary,
          bookings: bookings.summary,
          conversion: {
            rate: conversionRate,
            change: this.calculateChange(conversionRate, bookings.compare.conversionRate)
          },
          revenueTrend: revenue.trend,
          userGrowth: users.growth,
          bookingStatus: bookings.statusDistribution,
          categories: listings.categoryPerformance,
          topHosts: revenue.topHosts,
          topListings: listings.topPerformers,
          topLocations: bookings.topLocations
        },
        revenue,
        users,
        bookings,
        listings,
        geographic: await this.getGeographicAnalytics(dateRange),
        predictive: await this.getPredictiveAnalytics(dateRange)
      };
    } catch (error) {
      console.error('Error getting overview analytics:', error);
      throw error;
    }
  },

  // Get revenue metrics
  async getRevenueMetrics(dateRange, compareRange) {
    try {
      // Get payments in date range
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('createdAt', '>=', dateRange.start),
        where('createdAt', '<=', dateRange.end),
        where('status', '==', 'verified')
      );

      const paymentsSnapshot = await getDocs(paymentsQuery);
      const payments = paymentsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));

      // Calculate metrics
      const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const fees = payments.reduce((sum, p) => sum + (p.amount || 0) * 0.09, 0);
      const bookingRevenue = total - fees;

      // Get comparison period data
      const compareQuery = query(
        collection(db, 'payments'),
        where('createdAt', '>=', compareRange.start),
        where('createdAt', '<=', compareRange.end),
        where('status', '==', 'verified')
      );

      const compareSnapshot = await getDocs(compareQuery);
      const compareTotal = compareSnapshot.docs.reduce((sum, doc) => 
        sum + (doc.data().amount || 0), 0
      );

      // Revenue by payment method
      const paymentMethods = this.groupByPaymentMethod(payments);

      // Revenue by category
      const categories = await this.getRevenueByCategory(dateRange);

      // Revenue trend
      const trend = await this.getRevenueTrend(dateRange);

      // Top performers
      const topHosts = await this.getTopRevenueHosts(dateRange);
      const topListings = await this.getTopRevenueListings(dateRange);

      // Forecast
      const forecast = await this.getRevenueForecast(payments, trend);

      return {
        summary: {
          total,
          change: this.calculateChange(total, compareTotal)
        },
        total,
        bookings: bookingRevenue,
        fees,
        avgTransaction: payments.length > 0 ? total / payments.length : 0,
        growth: {
          total: this.calculateChange(total, compareTotal),
          bookings: this.calculateChange(bookingRevenue, compareTotal * 0.91),
          fees: this.calculateChange(fees, compareTotal * 0.09)
        },
        paymentMethods,
        categories,
        trend,
        topHosts,
        topListings,
        forecast,
        breakdown: this.getRevenueBreakdown(payments)
      };
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      throw error;
    }
  },

  // Get user metrics
  async getUserMetrics(dateRange, compareRange) {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', dateRange.start),
        where('createdAt', '<=', dateRange.end)
      );

      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));

      // Active users (users with bookings or listings in period)
      const activeUsers = await this.getActiveUsers(dateRange);

      // User types
      const hosts = users.filter(u => u.type === 'host').length;
      const clients = users.filter(u => u.type === 'client').length;

      // Comparison
      const compareQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', compareRange.start),
        where('createdAt', '<=', compareRange.end)
      );
      const compareSnapshot = await getDocs(compareQuery);
      const compareActive = await this.getActiveUsers(compareRange);

      // Growth trend
      const growth = await this.getUserGrowthTrend(dateRange);

      // User demographics
      const demographics = this.getUserDemographics(users);

      // User activity
      const activity = await this.getUserActivity(dateRange);

      return {
        summary: {
          active: activeUsers.length,
          change: this.calculateChange(activeUsers.length, compareActive.length)
        },
        total: users.length,
        active: activeUsers.length,
        new: users.length,
        hosts,
        clients,
        growth,
        demographics,
        activity,
        retention: await this.getUserRetention(dateRange),
        engagement: await this.getUserEngagement(dateRange)
      };
    } catch (error) {
      console.error('Error getting user metrics:', error);
      throw error;
    }
  },

  // Get booking metrics
  async getBookingMetrics(dateRange, compareRange) {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('createdAt', '>=', dateRange.start),
        where('createdAt', '<=', dateRange.end)
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));

      // Status distribution
      const statusDistribution = [
        { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
        { name: 'Active', value: bookings.filter(b => b.status === 'active').length },
        { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
        { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length }
      ];

      // Comparison
      const compareQuery = query(
        collection(db, 'bookings'),
        where('createdAt', '>=', compareRange.start),
        where('createdAt', '<=', compareRange.end)
      );
      const compareSnapshot = await getDocs(compareQuery);

      // Booking trends
      const trend = await this.getBookingTrend(dateRange);

      // Average booking value
      const avgValue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0) / bookings.length || 0;

      // Top locations
      const topLocations = this.getTopBookingLocations(bookings);

      // Occupancy rate
      const occupancyRate = await this.getOccupancyRate(dateRange);

      return {
        summary: {
          total: bookings.length,
          change: this.calculateChange(bookings.length, compareSnapshot.size)
        },
        total: bookings.length,
        completed: bookings.filter(b => b.status === 'completed').length,
        active: bookings.filter(b => b.status === 'active').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        statusDistribution,
        trend,
        avgValue,
        avgDuration: this.calculateAvgDuration(bookings),
        topLocations,
        occupancyRate,
        seasonality: await this.getBookingSeasonality(dateRange)
      };
    } catch (error) {
      console.error('Error getting booking metrics:', error);
      throw error;
    }
  },

  // Get listing metrics
  async getListingMetrics(dateRange, compareRange) {
    try {
      const listingsQuery = query(
        collection(db, 'listings'),
        where('createdAt', '>=', dateRange.start),
        where('createdAt', '<=', dateRange.end)
      );

      const listingsSnapshot = await getDocs(listingsQuery);
      const listings = listingsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));

      // Active listings
      const activeListings = listings.filter(l => l.status === 'active').length;

      // Category performance
      const categoryPerformance = await this.getCategoryPerformance(dateRange);

      // Top performers
      const topPerformers = await this.getTopPerformingListings(dateRange);

      // Utilization rate
      const utilizationRate = await this.getListingUtilization(dateRange);

      return {
        total: listings.length,
        active: activeListings,
        categoryPerformance,
        topPerformers,
        utilizationRate,
        avgPrice: this.calculateAvgPrice(listings),
        priceDistribution: this.getPriceDistribution(listings),
        availability: await this.getListingAvailability(dateRange)
      };
    } catch (error) {
      console.error('Error getting listing metrics:', error);
      throw error;
    }
  },

  // Get geographic analytics
  async getGeographicAnalytics(dateRange) {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('createdAt', '>=', dateRange.start),
        where('createdAt', '<=', dateRange.end)
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => doc.data());

      // Group by location
      const locationData = {};
      
      bookings.forEach(booking => {
        const location = booking.location || 'Unknown';
        if (!locationData[location]) {
          locationData[location] = {
            name: location,
            bookings: 0,
            revenue: 0,
            users: new Set()
          };
        }
        
        locationData[location].bookings++;
        locationData[location].revenue += booking.amount || 0;
        locationData[location].users.add(booking.userId);
      });

      // Convert to array and calculate metrics
      const locations = Object.values(locationData).map(loc => ({
        ...loc,
        users: loc.users.size,
        avgBookingValue: loc.revenue / loc.bookings
      }));

      // Get listing distribution
      const listingsSnapshot = await getDocs(collection(db, 'listings'));
      const listingsByLocation = {};
      
      listingsSnapshot.docs.forEach(doc => {
        const listing = doc.data();
        const location = listing.location || 'Unknown';
        listingsByLocation[location] = (listingsByLocation[location] || 0) + 1;
      });

      return {
        locations,
        listingsByLocation,
        heatmapData: this.generateHeatmapData(locations),
        topRegions: locations.sort((a, b) => b.revenue - a.revenue).slice(0, 10)
      };
    } catch (error) {
      console.error('Error getting geographic analytics:', error);
      throw error;
    }
  },

  // Get predictive analytics
  async getPredictiveAnalytics(dateRange) {
    try {
      // Get historical data
      const historicalData = await this.getHistoricalData(subDays(dateRange.start, 90), dateRange.end);
      
      // Revenue prediction
      const revenuePrediction = this.predictRevenue(historicalData.revenue);
      
      // Demand forecast
      const demandForecast = this.forecastDemand(historicalData.bookings);
      
      // Growth projections
      const growthProjections = this.projectGrowth(historicalData);
      
      // Risk indicators
      const riskIndicators = this.identifyRisks(historicalData);
      
      // Opportunity analysis
      const opportunities = await this.identifyOpportunities(historicalData);

      return {
        revenuePrediction,
        demandForecast,
        growthProjections,
        riskIndicators,
        opportunities,
        seasonalTrends: this.analyzeSeasonalTrends(historicalData),
        recommendations: this.generateRecommendations(historicalData)
      };
    } catch (error) {
      console.error('Error getting predictive analytics:', error);
      throw error;
    }
  },

  // Helper functions
  calculateChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  groupByPaymentMethod(payments) {
    const methods = {};
    
    payments.forEach(payment => {
      const method = payment.method || 'other';
      if (!methods[method]) {
        methods[method] = 0;
      }
      methods[method] += payment.amount || 0;
    });

    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  },

  async getRevenueTrend(dateRange) {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    const trend = [];

    for (const day of days) {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('createdAt', '>=', dayStart),
        where('createdAt', '<=', dayEnd),
        where('status', '==', 'verified')
      );

      const snapshot = await getDocs(paymentsQuery);
      let revenue = 0;
      let fees = 0;
      
      snapshot.docs.forEach(doc => {
        const payment = doc.data();
        revenue += payment.amount || 0;
        fees += (payment.amount || 0) * 0.09;
      });

      trend.push({
        date: format(day, 'MMM dd'),
        revenue,
        fees
      });
    }

    return trend;
  },

  async getTopRevenueHosts(dateRange, limit = 5) {
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('createdAt', '>=', dateRange.start),
      where('createdAt', '<=', dateRange.end),
      where('status', '==', 'completed')
    );

    const snapshot = await getDocs(bookingsQuery);
    const hostRevenue = {};

    snapshot.docs.forEach(doc => {
      const booking = doc.data();
      const hostId = booking.hostId;
      
      if (!hostRevenue[hostId]) {
        hostRevenue[hostId] = {
          id: hostId,
          name: booking.hostName || 'Unknown Host',
          revenue: 0,
          bookings: 0
        };
      }
      
      hostRevenue[hostId].revenue += booking.amount || 0;
      hostRevenue[hostId].bookings++;
    });

    return Object.values(hostRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  },

  getRevenueBreakdown(payments) {
    const breakdown = {};
    
    payments.forEach(payment => {
      const date = format(payment.createdAt?.toDate() || new Date(), 'yyyy-MM-dd');
      
      if (!breakdown[date]) {
        breakdown[date] = {
          date,
          bookings: 0,
          revenue: 0,
          fees: 0,
          netRevenue: 0,
          transactions: []
        };
      }
      
      breakdown[date].bookings++;
      breakdown[date].revenue += payment.amount || 0;
      breakdown[date].fees += (payment.amount || 0) * 0.09;
      breakdown[date].netRevenue += (payment.amount || 0) * 0.91;
      breakdown[date].transactions.push(payment.amount);
    });

    return Object.values(breakdown).map(day => ({
      ...day,
      avgTransaction: day.revenue / day.bookings
    }));
  },

  // Export data functionality
  async exportAnalyticsData(data, format) {
    if (format === 'csv') {
      // Convert data to CSV format
      // Implementation depends on the structure of data
      console.log('Exporting to CSV...');
    } else if (format === 'pdf') {
      // Generate PDF report
      // Would require a PDF generation library
      console.log('Generating PDF report...');
    }
  }
};

// Analytics hook