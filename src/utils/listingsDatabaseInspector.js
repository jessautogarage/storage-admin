import { db } from './firebaseConfig';
import { collection, getDocs, enableNetwork } from 'firebase/firestore';

/**
 * Database inspector utility to check current state of listings
 * This helps identify why listings weren't deleted
 */
const inspectListingsDatabase = async () => {
  console.log('🔍 DATABASE INSPECTION STARTED');
  console.log('=====================================');
  
  try {
    // Ensure we're online
    await enableNetwork(db);
    console.log('✅ Firebase connection enabled');
    
    // Get ALL listings from the database
    console.log('\n📋 Fetching all listings from database...');
    const listingsRef = collection(db, 'listings');
    const snapshot = await getDocs(listingsRef);
    
    if (snapshot.empty) {
      console.log('📭 DATABASE IS EMPTY - No listings found');
      return {
        empty: true,
        total: 0,
        listings: []
      };
    }
    
    console.log(`📊 Found ${snapshot.size} total listings in database\n`);
    
    const allListings = [];
    const targetTitle = 'dfgbnchnfbfgnfgnfgnfgbn';
    let targetFound = false;
    
    // Analyze each listing in detail
    snapshot.forEach((docSnapshot, index) => {
      const data = docSnapshot.data();
      const listing = {
        id: docSnapshot.id,
        title: data.title || 'UNTITLED',
        hostId: data.hostId || 'NO_HOST_ID',
        hostName: data.hostName || 'NO_HOST_NAME',
        status: data.status || 'NO_STATUS',
        type: data.type || 'NO_TYPE',
        dailyPrice: data.pricing?.daily || 0,
        monthlyPrice: data.pricing?.monthly || 0,
        location: {
          city: data.location?.city || 'NO_CITY',
          district: data.location?.district || 'NO_DISTRICT',
          address: data.location?.address || 'NO_ADDRESS'
        },
        createdAt: data.createdAt?.toDate?.() || data.createdAt || 'NO_DATE',
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || 'NO_DATE'
      };
      
      allListings.push(listing);
      
      console.log(`📋 LISTING ${index + 1}/${snapshot.size}:`);
      console.log(`   ID: ${listing.id}`);
      console.log(`   Title: "${listing.title}"`);
      console.log(`   Host ID: ${listing.hostId}`);
      console.log(`   Host Name: ${listing.hostName}`);
      console.log(`   Status: ${listing.status}`);
      console.log(`   Type: ${listing.type}`);
      console.log(`   Daily Price: ₱${listing.dailyPrice}`);
      console.log(`   Monthly Price: ₱${listing.monthlyPrice}`);
      console.log(`   Location: ${listing.location.district}, ${listing.location.city}`);
      console.log(`   Address: ${listing.location.address}`);
      console.log(`   Created: ${listing.createdAt}`);
      
      // Check if this is the target listing to keep
      if (listing.title === targetTitle) {
        console.log(`   🎯 TARGET LISTING FOUND - This should be KEPT`);
        targetFound = true;
      } else {
        console.log(`   🗑️  This listing should be DELETED`);
      }
      
      console.log(''); // Empty line for readability
    });
    
    // Summary analysis
    console.log('\n📊 ANALYSIS SUMMARY:');
    console.log(`   Total listings: ${allListings.length}`);
    console.log(`   Target listing ("${targetTitle}") found: ${targetFound ? 'YES' : 'NO'}`);
    
    // Group by characteristics that might explain why they weren't deleted
    const byHostId = {};
    const byStatus = {};
    const byPrice = {};
    const byType = {};
    
    allListings.forEach(listing => {
      // Group by host ID
      if (!byHostId[listing.hostId]) byHostId[listing.hostId] = [];
      byHostId[listing.hostId].push(listing);
      
      // Group by status
      if (!byStatus[listing.status]) byStatus[listing.status] = [];
      byStatus[listing.status].push(listing);
      
      // Group by price (zero vs non-zero)
      const priceKey = (listing.dailyPrice === 0 && listing.monthlyPrice === 0) ? 'FREE' : 'PAID';
      if (!byPrice[priceKey]) byPrice[priceKey] = [];
      byPrice[priceKey].push(listing);
      
      // Group by type
      if (!byType[listing.type]) byType[listing.type] = [];
      byType[listing.type].push(listing);
    });
    
    console.log('\n🏠 BY HOST ID:');
    Object.entries(byHostId).forEach(([hostId, listings]) => {
      console.log(`   ${hostId}: ${listings.length} listings`);
      listings.forEach(listing => {
        console.log(`     - "${listing.title}"`);
      });
    });
    
    console.log('\n📊 BY STATUS:');
    Object.entries(byStatus).forEach(([status, listings]) => {
      console.log(`   ${status}: ${listings.length} listings`);
    });
    
    console.log('\n💰 BY PRICE:');
    Object.entries(byPrice).forEach(([priceType, listings]) => {
      console.log(`   ${priceType}: ${listings.length} listings`);
      if (priceType === 'FREE') {
        console.log('     ⚠️  These FREE listings might be test/seed data');
      }
    });
    
    console.log('\n🏷️  BY TYPE:');
    Object.entries(byType).forEach(([type, listings]) => {
      console.log(`   ${type}: ${listings.length} listings`);
    });
    
    // Identify potential issues
    console.log('\n🚨 POTENTIAL ISSUES:');
    
    const noHostIdListings = allListings.filter(l => l.hostId === 'NO_HOST_ID');
    if (noHostIdListings.length > 0) {
      console.log(`   ❌ ${noHostIdListings.length} listings have NO hostId - cleanup might have missed these`);
    }
    
    const freeListings = allListings.filter(l => l.dailyPrice === 0 && l.monthlyPrice === 0);
    if (freeListings.length > 0) {
      console.log(`   ⚠️  ${freeListings.length} listings are FREE (₱0) - likely test/seed data`);
    }
    
    const untitledListings = allListings.filter(l => l.title === 'UNTITLED');
    if (untitledListings.length > 0) {
      console.log(`   ❌ ${untitledListings.length} listings have NO title - might cause cleanup issues`);
    }
    
    console.log('\n🎯 CLEANUP RECOMMENDATION:');
    if (!targetFound) {
      console.log('   ❌ TARGET LISTING NOT FOUND - Force cleanup will delete ALL listings');
    } else {
      console.log(`   ✅ Target listing found - Force cleanup will delete ${allListings.length - 1} other listings`);
    }
    
    console.log('\n🔍 DATABASE INSPECTION COMPLETE');
    console.log('=====================================');
    
    return {
      empty: false,
      total: allListings.length,
      listings: allListings,
      targetFound,
      groups: {
        byHostId,
        byStatus,
        byPrice,
        byType
      },
      issues: {
        noHostId: noHostIdListings.length,
        free: freeListings.length,
        untitled: untitledListings.length
      }
    };
    
  } catch (error) {
    console.error('💥 INSPECTION ERROR:', error);
    return {
      error: error.message,
      empty: null,
      total: 0,
      listings: []
    };
  }
};

export default inspectListingsDatabase;