import React, { useEffect, useState, useRef } from 'react';
import { Home, Coffee, Wifi, Shield, X, Search, Star, Heart, MapPin } from 'lucide-react';

const ApartmentMap = ({ apartments, filteredApartments }) => {
  const [map, setMap] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [hoveredApartment, setHoveredApartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef(new Map()); // Store markers by apartment ID
  
  // Penn State University Park coordinates
  const pennStateCoords = [40.7982, -77.8599];

  // No mobile device detection since we only support desktop

  // Initialize map
  useEffect(() => {
    // Only import Leaflet on the client-side
    const initMap = async () => {
      try {
        setIsLoading(true);
        const L = await import('leaflet');
        
        // Check if map is already initialized
        if (!map) {
          // Make sure the container exists
          const container = document.getElementById('map-container');
          if (!container) return;

          // Load the CSS for Leaflet
          if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
            
            // Add custom styles for markers
            const style = document.createElement('style');
            style.textContent = `
              /* Hover effect for apartment markers */
              .apartment-marker div {
                transition: all 0.2s ease;
              }
              .apartment-marker div:hover {
                transform: scale(1.2);
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9);
              }
              
              /* Custom popup styles */
              .leaflet-popup-content-wrapper {
                border-radius: 8px;
                padding: 0;
              }
              .leaflet-popup-content {
                margin: 0;
                padding: 8px 12px;
              }
            `;
            document.head.appendChild(style);
          }

          // Initialize the map
          const mapInstance = L.map('map-container').setView(pennStateCoords, 14);
          
          // Add the tile layer (map imagery)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(mapInstance);

          // Add Penn State marker
          const pennStateIcon = L.divIcon({
            className: 'penn-state-marker',
            html: '<div class="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold border-4 border-white shadow-lg">PSU</div>',
            iconSize: [64, 64],
            iconAnchor: [32, 32]
          });
          
          L.marker(pennStateCoords, { icon: pennStateIcon }).addTo(mapInstance)
            .bindPopup('<b>Penn State University Park</b>');
            
          // Add listener to clear hovered apartment when clicking on the map
          mapInstance.on('click', () => {
            setHoveredApartment(null);
          });

          // Store the map instance
          setMap(mapInstance);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      // Clean up map on unmount
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Add points of interest around campus
  useEffect(() => {
    if (!map) return;
/*
    const addPointsOfInterest = async () => {
      const L = await import('leaflet');
      
      // Add some sample points of interest
      const pointsOfInterest = [
        { type: 'coffee', name: 'Starbucks', coords: [40.7932, -77.8586] },
        { type: 'coffee', name: 'Irving\'s Bagels', coords: [40.7945, -77.8632] },
        { type: 'wifi', name: 'University Library', coords: [40.8018, -77.8654] },
        { type: 'shield', name: 'Campus Police', coords: [40.7999, -77.8549] },
        { type: 'home', name: 'Student Union', coords: [40.7969, -77.8615] }
      ];

      // Create icon for each type
      const poiIcons = {
        coffee: L.divIcon({
          html: '<div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        }),
        wifi: L.divIcon({
          html: '<div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-600"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        }),
        shield: L.divIcon({
          html: '<div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        }),
        home: L.divIcon({
          html: '<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      };

      // Add markers for each point of interest
      pointsOfInterest.forEach(poi => {
        L.marker(poi.coords, { icon: poiIcons[poi.type] })
          .addTo(map)
          .bindPopup(`<b>${poi.name}</b><br>${poi.type.charAt(0).toUpperCase() + poi.type.slice(1)}`);
      });
    };

    addPointsOfInterest();
*/
  }, [map]);

  // Add apartment markers when filteredApartments or map changes
  // Replace your current apartment markers useEffect with this corrected solution

useEffect(() => {
    if (!map) return;
    
    const updateMarkers = async () => {
      try {
        // Import Leaflet dynamically
        const L = await import('leaflet');
        
        console.log("Updating markers, filtered apartments:", filteredApartments.length);
        
        // Clear all existing markers first
        markersRef.current.forEach(marker => {
          map.removeLayer(marker);
        });
        markersRef.current.clear();
        
        // Then add markers for all currently filtered apartments
        filteredApartments.forEach(apt => {
          // Get coordinates
          let coords;
          if (apt.coordinates) {
            coords = apt.coordinates;
          } else {
            // Generate coordinates based on distance
            const angle = Math.random() * Math.PI * 2;
            const distance = apt.distance || 1; // Miles
            const lat = pennStateCoords[0] + (distance * 0.014 * Math.cos(angle));
            const lng = pennStateCoords[1] + (distance * 0.018 * Math.sin(angle));
            coords = [lat, lng];
          }
          
          // Create marker icon
          const markerIcon = L.divIcon({
            className: 'apartment-marker',
            html: `<div class="${apt.featured ? 'bg-yellow-500' : 'bg-blue-700'} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md hover:w-10 hover:h-10 transition-all cursor-pointer">
                    ${apt.bedrooms !== null ? apt.bedrooms : '?'}
                  </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          
          // Create and add the marker
          const marker = L.marker(coords, { icon: markerIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-center font-bold text-blue-900">${apt.name}</div>
              <div class="text-sm">${apt.address}</div>
              <div class="text-sm font-semibold mt-1">$${apt.rent || 'N/A'}/month</div>
              <div class="text-center mt-2">
                <button class="bg-blue-900 text-white px-4 py-1 rounded text-xs font-bold apartment-details" data-id="${apt.id}">
                  View Details
                </button>
              </div>
            `)
            .on('click', () => {
              setSelectedApartment(apt);
              setHoveredApartment(null);
            });
          
          // Add hover event
          marker.on('mouseover', () => {
            setHoveredApartment(apt);
          });
          
          // Store the marker
          markersRef.current.set(apt.id, marker);
        });
        
        // Fit bounds to show all markers
        if (filteredApartments.length > 0) {
          const bounds = [];
          bounds.push(pennStateCoords); // Always include Penn State
          
          filteredApartments.forEach(apt => {
            const marker = markersRef.current.get(apt.id);
            if (marker) {
              bounds.push(marker.getLatLng());
            }
          });
          
          if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }
        
        // Add popup click handlers
        setTimeout(() => {
          document.querySelectorAll('.apartment-details').forEach(button => {
            button.addEventListener('click', (e) => {
              const aptId = e.target.getAttribute('data-id');
              const apartment = filteredApartments.find(a => a.id === aptId);
              if (apartment) {
                setSelectedApartment(apartment);
                map.closePopup();
              }
            });
          });
        }, 100);
      } catch (error) {
        console.error("Error updating markers:", error);
      }
    };
    
    updateMarkers();
    
  }, [filteredApartments, map]);

  // Function to close detail panel
  const closeDetailPanel = () => {
    setSelectedApartment(null);
  };
  
  // Function to close hover panel
  const closeHoverPanel = () => {
    setHoveredApartment(null);
  };

  // Function to center map on an apartment
  const centerOnApartment = (apt) => {
    if (!map || !apt) return;
    
    const coords = apt.coordinates || (markersRef.current.get(apt.id)?.getLatLng());
    if (coords) {
      map.setView(coords, 16);
      const marker = markersRef.current.get(apt.id);
      if (marker) {
        marker.openPopup();
      }
    }
  };
  
  // Function to format rating stars
  const renderRatingStars = (rating) => {
    if (!rating) return null;
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);
    
    return (
      <div className="flex text-yellow-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={14} fill="currentColor" />
        ))}
        {halfStar && (
          <div className="relative w-3.5">
            <Star size={14} className="absolute text-gray-300" fill="currentColor" />
            <div className="absolute overflow-hidden w-1/2">
              <Star size={14} fill="currentColor" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={14} className="text-gray-300" fill="currentColor" />
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      {/* Map container - takes 2/3 of the space on large screens */}
      <div className="lg:col-span-2 relative">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        )}
        
        {/* Map container */}
        <div id="map-container" className="h-96 rounded-lg overflow-hidden shadow-md"></div>
        
        {/* Search box */}
        <div className="absolute top-4 left-4 z-40">
          <div className="bg-white rounded-lg shadow-md p-2 flex">
            <input 
              type="text" 
              placeholder="Search for an area..." 
              className="p-2 w-64 outline-none text-sm"
            />
            <button className="bg-blue-900 text-white p-2 rounded-lg ml-2">
              <Search size={18} />
            </button>
          </div>
        </div>
        
        {/*
        {/* Map controls }
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-3 z-40">
          
            <button 
              className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center"
              onClick={() => map && map.setView(pennStateCoords, 14)}
            >
              <Home size={16} />
            </button>
          
        </div>
        */}
        
      </div>

      {/* Info panel - takes 1/3 of the space on large screens */}
      <div className="lg:col-span-1">
        {/* Hover details panel */}
        {hoveredApartment && !selectedApartment ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              {hoveredApartment.image && (
                <img 
                  src={hoveredApartment.image} 
                  alt={hoveredApartment.name} 
                  className="w-full h-40 object-cover" 
                />
              )}
              <button 
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-gray-500 hover:text-gray-700 transition-colors"
                onClick={closeHoverPanel}
              >
                <X size={18} />
              </button>
              {hoveredApartment.featured && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  Featured
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-blue-900">{hoveredApartment.name}</h3>
                <div className="flex items-center">
                  {renderRatingStars(hoveredApartment.rating)}
                  <span className="text-xs text-gray-500 ml-1">({hoveredApartment.reviews || 0})</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 flex items-center">
                <MapPin size={16} className="mr-1 flex-shrink-0 text-blue-900" /> 
                <span>{hoveredApartment.address}</span>
              </p>
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-blue-50 p-2 rounded text-center">
                  <div className="text-xs text-gray-500">Rent</div>
                  <div className="font-bold text-blue-900">${hoveredApartment.rent || 'N/A'}</div>
                </div>
                <div className="bg-blue-50 p-2 rounded text-center">
                  <div className="text-xs text-gray-500">Beds</div>
                  <div className="font-bold text-blue-900">{hoveredApartment.bedrooms || 'N/A'}</div>
                </div>
                <div className="bg-blue-50 p-2 rounded text-center">
                  <div className="text-xs text-gray-500">Baths</div>
                  <div className="font-bold text-blue-900">{hoveredApartment.bathrooms || 'N/A'}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm mb-3">
                <div className="text-blue-900 font-medium flex items-center">
                  <span>{hoveredApartment.distance || 'N/A'} miles from campus</span>
                </div>
                <div className="text-green-700">
                  {hoveredApartment.available || 'Contact for availability'}
                </div>
              </div>
              
              {hoveredApartment.amenities && hoveredApartment.amenities.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Amenities</div>
                  <div className="flex flex-wrap gap-1">
                    {hoveredApartment.amenities.map((amenity, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2 mt-4">
                <button 
                  className="flex-1 bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
                  onClick={() => setSelectedApartment(hoveredApartment)}
                >
                  View Details
                </button>
                <button 
                  className="w-10 flex items-center justify-center bg-white border border-blue-900 text-blue-900 rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() => centerOnApartment(hoveredApartment)}
                >
                  <MapPin size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Instruction to hover when no apartment is selected or hovered
          !selectedApartment && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} className="text-blue-900" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Apartment Details</h3>
              <p className="text-gray-600 text-sm">
                Hover over an apartment marker on the map to see details here.
              </p>
            </div>
          )
        )}
        
        {/* Full details panel (when apartment is selected) */}
        {selectedApartment && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="relative">
              {selectedApartment.image && (
                <img 
                  src={selectedApartment.image} 
                  alt={selectedApartment.name} 
                  className="w-full h-48 object-cover" 
                />
              )}
              <button 
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-gray-500 hover:text-gray-700 transition-colors"
                onClick={closeDetailPanel}
              >
                <X size={18} />
              </button>
              {selectedApartment.featured && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  Featured
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-xl font-bold text-white">{selectedApartment.name}</h3>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  {renderRatingStars(selectedApartment.rating)}
                  <span className="text-xs text-gray-500 ml-1">({selectedApartment.reviews || 0} reviews)</span>
                </div>
                <div className="text-lg font-bold text-green-700">
                  ${selectedApartment.rent || 'N/A'}<span className="text-sm font-normal">/mo</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 flex items-center">
                <MapPin size={16} className="mr-1 flex-shrink-0 text-blue-900" /> 
                <span>{selectedApartment.address}</span>
              </p>
              
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-xs text-gray-500">Bedrooms</div>
                  <div className="font-bold text-blue-900 text-lg">{selectedApartment.bedrooms || 'N/A'}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-xs text-gray-500">Bathrooms</div>
                  <div className="font-bold text-blue-900 text-lg">{selectedApartment.bathrooms || 'N/A'}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-xs text-gray-500">Distance</div>
                  <div className="font-bold text-blue-900 text-lg">{selectedApartment.distance || 'N/A'} <span className="text-xs">mi</span></div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">About this property</h4>
                <p className="text-sm text-gray-600">
                  {selectedApartment.description || 
                   `This ${selectedApartment.bedrooms}-bedroom apartment is located ${selectedApartment.distance} miles from Penn State University. Enjoy convenient access to campus and nearby amenities in State College.`}
                </p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Availability</h4>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Available:</span> {selectedApartment.available || 'Contact for details'}
                  </p>
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    {selectedApartment.leaseLength || '12-month lease'}
                  </div>
                </div>
              </div>
              
              {selectedApartment.amenities && selectedApartment.amenities.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Amenities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedApartment.amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 mt-4">
                <button 
                  className="flex-1 bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
                  onClick={() => window.open(`tel:555-123-4567`)}
                >
                  Contact
                </button>
                <button 
                  className="flex-1 bg-blue-100 text-blue-900 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  onClick={() => centerOnApartment(selectedApartment)}
                >
                  Locate
                </button>
                <button 
                  className="w-10 flex items-center justify-center bg-white border border-blue-900 text-blue-900 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Heart size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Similar apartments section */}
        {selectedApartment && (
          <div className="bg-white rounded-lg shadow-md p-4 mt-4">
            <h4 className="font-medium text-gray-800 mb-3">Similar Apartments</h4>
            
            <div className="space-y-3">
              {filteredApartments
                .filter(apt => 
                  apt.id !== selectedApartment.id && 
                  apt.bedrooms === selectedApartment.bedrooms)
                .slice(0, 3)
                .map(apt => (
                  <div 
                    key={apt.id}
                    className="flex items-center p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedApartment(apt)}
                    onMouseEnter={() => setHoveredApartment(apt)}
                    onMouseLeave={() => setHoveredApartment(null)}
                  >
                    <div className={`w-10 h-10 rounded-full ${apt.featured ? 'bg-yellow-500' : 'bg-blue-700'} flex items-center justify-center text-white font-bold mr-3`}>
                      {apt.bedrooms || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-blue-900 text-sm">{apt.name}</div>
                      <div className="text-xs text-gray-600">${apt.rent || 'N/A'}/mo · {apt.distance || 'N/A'} mi</div>
                    </div>
                    <div className="text-blue-900">
                      <MapPin size={18} />
                    </div>
                  </div>
                ))}
              
              {filteredApartments.filter(apt => 
                apt.id !== selectedApartment.id && 
                apt.bedrooms === selectedApartment.bedrooms).length === 0 && (
                <div className="text-center py-3 text-sm text-gray-500">
                  No similar apartments found
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Points of interest section */}
        <div className="bg-white rounded-lg shadow-md p-4 mt-4">
          <h4 className="font-medium text-gray-800 mb-3">Points of Interest</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <Coffee size={16} className="text-green-600" />
              </div>
              <span>Coffee Shops</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <Home size={16} className="text-blue-600" />
              </div>
              <span>Campus Buildings</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                <Wifi size={16} className="text-purple-600" />
              </div>
              <span>Free WiFi Spots</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                <Shield size={16} className="text-red-600" />
              </div>
              <span>Safety Centers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentMap;