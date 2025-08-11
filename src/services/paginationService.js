import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  getCountFromServer,
  documentId
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

class PaginationService {
  constructor() {
    this.pageSize = 20;
    this.cache = new Map();
    this.lastVisible = new Map();
  }

  /**
   * Get paginated data from Firestore
   * @param {string} collectionName - Name of the collection
   * @param {Object} options - Query options
   * @param {Array} options.conditions - Array of where conditions
   * @param {Object} options.orderByField - Field to order by {field: string, direction: 'asc'|'desc'}
   * @param {number} options.pageSize - Number of items per page
   * @param {string} options.pageToken - Token for next page
   * @param {boolean} options.reset - Reset pagination cursor
   * @returns {Promise<Object>} - Paginated results with metadata
   */
  async getPaginatedData(collectionName, options = {}) {
    const {
      conditions = [],
      orderByField = { field: 'createdAt', direction: 'desc' },
      pageSize = this.pageSize,
      pageToken = null,
      reset = false
    } = options;

    try {
      // Build base query
      let q = collection(db, collectionName);
      
      // Apply conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });

      // Apply ordering
      q = query(q, orderBy(orderByField.field, orderByField.direction));

      // Apply pagination
      if (pageToken && !reset) {
        const lastDoc = this.lastVisible.get(pageToken);
        if (lastDoc) {
          q = query(q, startAfter(lastDoc));
        }
      }

      // Apply limit
      q = query(q, limit(pageSize));

      // Execute query
      const snapshot = await getDocs(q);
      
      // Process results
      const items = [];
      snapshot.forEach(doc => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Store last visible document for next page
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const nextPageToken = lastDoc ? `${collectionName}_${Date.now()}` : null;
      
      if (lastDoc) {
        this.lastVisible.set(nextPageToken, lastDoc);
      }

      // Get total count (cached for performance)
      const cacheKey = `${collectionName}_count_${JSON.stringify(conditions)}`;
      let totalCount = this.cache.get(cacheKey);
      
      if (!totalCount) {
        const countQuery = conditions.length > 0 
          ? query(collection(db, collectionName), ...conditions.map(c => 
              where(c.field, c.operator, c.value)))
          : collection(db, collectionName);
        
        const countSnapshot = await getCountFromServer(countQuery);
        totalCount = countSnapshot.data().count;
        
        // Cache count for 5 minutes
        this.cache.set(cacheKey, totalCount);
        setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
      }

      return {
        items,
        pagination: {
          total: totalCount,
          pageSize,
          hasMore: items.length === pageSize,
          nextPageToken,
          currentPage: Math.ceil((totalCount - items.length) / pageSize) + 1,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      };
    } catch (error) {
      console.error('Pagination error:', error);
      throw error;
    }
  }

  /**
   * Get paginated data with search
   * @param {string} collectionName - Name of the collection
   * @param {string} searchTerm - Search term
   * @param {Array} searchFields - Fields to search in
   * @param {Object} options - Additional query options
   */
  async searchPaginated(collectionName, searchTerm, searchFields, options = {}) {
    const {
      pageSize = this.pageSize,
      pageToken = null,
      additionalConditions = [],
      orderByField = { field: 'createdAt', direction: 'desc' }
    } = options;

    try {
      // For text search, we need to implement a workaround since Firestore
      // doesn't support full-text search natively
      
      // Option 1: Use array-contains for exact matches
      // Option 2: Use range queries for prefix matching
      // Option 3: Integrate with Algolia or ElasticSearch
      
      // Basic implementation with prefix matching on first field
      const searchField = searchFields[0];
      const conditions = [
        ...additionalConditions,
        {
          field: searchField,
          operator: '>=',
          value: searchTerm
        },
        {
          field: searchField,
          operator: '<=',
          value: searchTerm + '\uf8ff'
        }
      ];

      return this.getPaginatedData(collectionName, {
        conditions,
        orderByField,
        pageSize,
        pageToken
      });
    } catch (error) {
      console.error('Search pagination error:', error);
      throw error;
    }
  }

  /**
   * Get data in batches for large operations
   * @param {string} collectionName - Name of the collection
   * @param {Function} processor - Function to process each batch
   * @param {Object} options - Query options
   */
  async processBatches(collectionName, processor, options = {}) {
    const {
      batchSize = 100,
      conditions = [],
      orderByField = { field: 'createdAt', direction: 'desc' }
    } = options;

    let hasMore = true;
    let pageToken = null;
    let processedCount = 0;

    while (hasMore) {
      const result = await this.getPaginatedData(collectionName, {
        conditions,
        orderByField,
        pageSize: batchSize,
        pageToken
      });

      // Process batch
      await processor(result.items, processedCount);
      
      processedCount += result.items.length;
      hasMore = result.pagination.hasMore;
      pageToken = result.pagination.nextPageToken;

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return processedCount;
  }

  /**
   * Clear pagination cache
   */
  clearCache() {
    this.cache.clear();
    this.lastVisible.clear();
  }
}

// Export singleton instance
export const paginationService = new PaginationService();

// Export hook for React components
export const usePagination = (collectionName, options = {}) => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [pagination, setPagination] = React.useState({
    total: 0,
    hasMore: false,
    nextPageToken: null,
    currentPage: 1,
    totalPages: 0
  });

  const loadData = React.useCallback(async (pageToken = null, reset = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await paginationService.getPaginatedData(collectionName, {
        ...options,
        pageToken,
        reset
      });
      
      if (reset) {
        setData(result.items);
      } else {
        setData(prev => pageToken ? [...prev, ...result.items] : result.items);
      }
      
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Pagination error:', err);
    } finally {
      setLoading(false);
    }
  }, [collectionName, options]);

  const loadNextPage = React.useCallback(() => {
    if (pagination.hasMore && !loading) {
      loadData(pagination.nextPageToken);
    }
  }, [pagination, loading, loadData]);

  const refresh = React.useCallback(() => {
    loadData(null, true);
  }, [loadData]);

  React.useEffect(() => {
    loadData();
  }, [collectionName]);

  return {
    data,
    loading,
    error,
    pagination,
    loadNextPage,
    refresh
  };
};