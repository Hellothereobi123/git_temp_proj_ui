import React, { useState, useEffect } from 'react';
import { Search, X, Home, DollarSign, Bed, MapPin, ArrowUpDown, Calendar, Coffee, Wifi, Shield, Filter } from 'lucide-react';
import ApartmentMap from './ApartmentMap'; // Assuming you have a separate component for the map
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { addDoc } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyC_wn6HBNcIDnQJzz-S1j_Fm20tUtgc_OY",
  authDomain: "sat-hackpsu-2025.firebaseapp.com",
  projectId: "sat-hackpsu-2025",
  storageBucket: "sat-hackpsu-2025.firebasestorage.app",
  messagingSenderId: "41582977382",
  appId: "1:41582977382:web:1f811a79d99ce0595fa8a7",
  measurementId: "G-B3ZK0MSF09"
};

// Initialize Firebase
const PennStateApartmentFinder = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('list');

  // State for apartments and loading
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use useEffect to fetch data when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const apartmentsList = await getApartments(db);
        
        // Process the data to ensure all required fields have default values
        const processedApartments = apartmentsList.map(apt => ({
          id: apt.id, // Generate an ID if none exists
          name: apt.name || 'Unnamed Property',
          address: apt.address || 'Address not available',
          rent: apt.rent !== undefined ? apt.rent : null,
          bedrooms: apt.bedrooms !== undefined ? apt.bedrooms : null,
          bathrooms: apt.bathrooms !== undefined ? apt.bathrooms : null,
          distance: apt.distance !== undefined ? apt.distance : null,
          rating: apt.rating !== undefined ? apt.rating : 'N/A',
          reviews: apt.reviews !== undefined ? apt.reviews : 0,
          available: apt.available || 'Contact for availability',
          image: apt.image || '/placeholder-apartment.jpg',
          featured: apt.featured || false,
          amenities: Array.isArray(apt.amenities) ? apt.amenities : []
        }));
        
        setApartments(processedApartments);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []); 

  // Your existing getApartments function
  async function getApartments(db) {
    const apartmentsCollection = collection(db, 'testApartments');
    const apartmentsSnapshot = await getDocs(apartmentsCollection);
    const apartmentList = apartmentsSnapshot.docs.map(doc => {
      // Get document ID and data
      const data = doc.data();
      return {
        id: doc.id, // Include the Firestore document ID
        ...data
      };
    });
    return apartmentList;
  }

  // State for filters
  const [filters, setFilters] = useState({
    search: "",
    minRent: "",
    maxRent: "",
    bedrooms: "",
    maxDistance: "",
    sortBy: "distance"
  });

  // Filter apartments based on current filters - with safe handling of missing properties
  const filteredApartments = apartments.filter(apt => {
    // Search filter
    if (filters.search && 
        !apt.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !apt.address.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Min rent filter
    if (filters.minRent && (apt.rent === null || parseInt(filters.minRent) > apt.rent)) {
      return false;
    }
    
    // Max rent filter
    if (filters.maxRent && apt.rent !== null && parseInt(filters.maxRent) < apt.rent) {
      return false;
    }
    
    // Bedrooms filter
    if (filters.bedrooms && apt.bedrooms !== parseInt(filters.bedrooms)) {
      return false;
    }
    
    // Distance filter
    if (filters.maxDistance && (apt.distance === null || parseFloat(filters.maxDistance) < apt.distance)) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === "distance") {
      // Handle null values
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1; // Push nulls to the end
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    } else if (filters.sortBy === "rent-low") {
      // Handle null values
      if (a.rent === null && b.rent === null) return 0;
      if (a.rent === null) return 1; // Push nulls to the end
      if (b.rent === null) return -1;
      return a.rent - b.rent;
    } else if (filters.sortBy === "rent-high") {
      // Handle null values
      if (a.rent === null && b.rent === null) return 0;
      if (a.rent === null) return 1; // Push nulls to the end
      if (b.rent === null) return -1;
      return b.rent - a.rent;
    }
    return 0;
  });
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      minRent: "",
      maxRent: "",
      bedrooms: "",
      maxDistance: "",
      sortBy: "distance"
    });
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-blue-50 min-h-screen">
      {/* Header with hero section */}
      <header className="bg-blue-900 text-white py-6">
        {/* Header content - unchanged */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Penn State Apartment Finder</h1>
            <div className="flex space-x-4">
              <button className="bg-white text-blue-900 px-4 py-2 rounded-md font-medium hover:bg-blue-100 transition-colors">
                List Your Property
              </button>
              
            </div>
          </div>
          
          <div className="bg-blue-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Find Your Perfect Penn State Home</h2>
            <p className="text-blue-100 mb-4">
              Browse apartments near campus with our easy-to-use search tools
            </p>
            <div className="bg-white rounded-lg overflow-hidden flex">
              <input 
                type="text"
                placeholder="Search by location, property name, or features..."
                className="flex-grow p-4 text-gray-800 outline-none"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
              />
              <button className="bg-yellow-500 text-white px-6 font-medium hover:bg-yellow-600 transition-colors flex items-center">
                <Search size={18} className="mr-2" /> Search
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 pb-16">
        {/* View Toggle */}
        <div className="mb-4 mt-6 flex justify-center">
          <div className="bg-white p-1 rounded-lg shadow-md flex">
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-md flex items-center ${activeTab === 'list' 
                ? 'bg-blue-900 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              <Home size={18} className="mr-2" /> List View
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-md flex items-center ${activeTab === 'map' 
                ? 'bg-blue-900 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              <MapPin size={18} className="mr-2" /> Map View
            </button>
          </div>
        </div>
        
        {/* Filters Section - unchanged */}
        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min. Rent</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign size={16} className="text-gray-400" />
              </div>
              <input
                type="number"
                name="minRent"
                placeholder="Min"
                value={filters.minRent}
                onChange={handleFilterChange}
                className="pl-8 pr-4 py-2 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max. Rent</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign size={16} className="text-gray-400" />
              </div>
              <input
                type="number"
                name="maxRent"
                placeholder="Max"
                value={filters.maxRent}
                onChange={handleFilterChange}
                className="pl-8 pr-4 py-2 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <select
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange}
              className="pl-3 pr-4 py-2 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>
          </div>
          
          {/* Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Distance (miles)</label>
            <input
              type="number"
              name="maxDistance"
              placeholder="Any distance"
              value={filters.maxDistance}
              onChange={handleFilterChange}
              className="pl-3 pr-4 py-2 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Sort Options */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, sortBy: "distance" }))}
                className={`px-3 py-2 rounded-md text-sm flex items-center ${
                  filters.sortBy === "distance"
                    ? "bg-blue-100 text-blue-900 border border-blue-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                <MapPin size={16} className="mr-1" /> Distance
              </button>
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, sortBy: "rent-low" }))}
                className={`px-3 py-2 rounded-md text-sm flex items-center ${
                  filters.sortBy === "rent-low"
                    ? "bg-blue-100 text-blue-900 border border-blue-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                <DollarSign size={16} className="mr-1" /> Price: Low to High
              </button>
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, sortBy: "rent-high" }))}
                className={`px-3 py-2 rounded-md text-sm flex items-center ${
                  filters.sortBy === "rent-high"
                    ? "bg-blue-100 text-blue-900 border border-blue-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                <DollarSign size={16} className="mr-1" /> Price: High to Low
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-700 font-medium">
            {loading ? 'Loading apartments...' : `Found ${filteredApartments.length} apartments`}
          </div>
          <div className="text-sm text-gray-500">
            Showing all available properties
          </div>
        </div>
        
        {/* Main Content Area - Toggle between List and Map */}
        {activeTab === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading apartments...</p>
              </div>
            ) : (
              filteredApartments.map((apt, index) => (
                <div key={apt.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img src={apt.image} alt={apt.name} className="w-full h-48 object-cover" />
                    {apt.featured && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                        Featured
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-md px-2 py-1 text-sm font-medium text-gray-800">
                      {apt.rent !== null ? `$${apt.rent}/mo` : 'Price on request'}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-blue-900">{apt.name}</h3>
                      <div className="flex items-center bg-blue-50 px-2 py-1 rounded-lg">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-sm font-medium">{apt.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({apt.reviews})</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 flex items-center">
                      <MapPin size={16} className="mr-1 flex-shrink-0 text-blue-900" /> 
                      <span className="text-sm">{apt.address}</span>
                    </p>
                    
                    <div className="flex justify-between mb-4 text-sm">
                      <div className="flex items-center">
                        <Bed size={16} className="mr-1 text-gray-600" />
                        <span>{apt.bedrooms !== null ? `${apt.bedrooms} ${apt.bedrooms === 1 ? 'Bed' : 'Beds'}` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <span>{apt.bathrooms !== null ? `${apt.bathrooms} ${apt.bathrooms === 1 ? 'Bath' : 'Baths'}` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-blue-900 font-medium">
                        <span>{apt.distance !== null ? `${apt.distance} miles` : 'Distance N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Available:</span> {apt.available}
                      </p>
                      
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {apt.amenities.length > 0 ? (
                            <>
                              {apt.amenities.slice(0, 3).map((amenity, i) => (
                                <span key={i} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {amenity}
                                </span>
                              ))}
                              {apt.amenities.length > 3 && 
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                  +{apt.amenities.length - 3} more
                                </span>
                              }
                            </>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              No amenities listed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-grow bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium">
                        View Details
                      </button>
                      <button className="px-3 py-2 border border-blue-900 text-blue-900 rounded-lg hover:bg-blue-50 transition-colors">
                        ♥
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {!loading && filteredApartments.length === 0 && (
              <div className="col-span-full text-center py-10">
                <Home size={48} className="mx-auto text-gray-400 mb-2" />
                <h3 className="text-xl font-medium text-gray-600">No apartments match your filters</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <ApartmentMap 
            apartments={apartments} 
            filteredApartments={filteredApartments} 
            loading={loading}
          />
        )}
      </div>

      {/* Footer removed as it was commented out in original code */}
    </div>
  );
};

export default PennStateApartmentFinder;