//firebase
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase-config";

import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || "";

const DEFAULT_REGION = {
  latitude: 16.4023, // Baguio City
  longitude: 120.596,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function Locate() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [showGuideLegend, setShowGuideLegend] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [filterType, setFilterType] = useState("All");

  const [mapType, setMapType] = useState("standard");
  const [showDropdown, setShowDropdown] = useState(false);

  const [nearMeActive, setNearMeActive] = useState(false);
  const [listings, setListings] = useState([]);

  // ✅ Fetch user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  // 🔹 Fetch listings from Firestore
  useEffect(() => {
    const colRef = collection(db, "listings_db");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const raw = doc.data();
        const listing = raw.listing || {};
        const rep = raw.rep || {};

        return {
          id: doc.id,
          name: listing.listing_name || "Unknown",
          type: listing.category || "Unknown",
          latitude: listing.coordinates?._lat || 0,
          longitude: listing.coordinates?._long || 0,
          address: listing.address || "",
          contact: rep.phone || rep.email || "N/A",
        };
      });
      setListings(data);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Filter listings
  const filteredEstablishments = listings.filter((item) => {
    if (filterType !== "All" && item.type.toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }

    if (nearMeActive && userLocation) {
      const R = 6371; // km radius of Earth
      const dLat = ((item.latitude - userLocation.latitude) * Math.PI) / 180;
      const dLon = ((item.longitude - userLocation.longitude) * Math.PI) / 180;
      const lat1 = (userLocation.latitude * Math.PI) / 180;
      const lat2 = (item.latitude * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance <= 1;
    }

    return true;
  });

  const getMarkerColor = (type) => {
    if (type.toLowerCase() === "education") return "green";
    if (type.toLowerCase() === "mosque") return "yellow";
    if (type.toLowerCase() === "restaurant") return "red";
    if (type.toLowerCase() === "community") return "orange"; 
    return "blue";
  };

  // ✅ Navigation by type
  const handleNavigate = () => {
    if (!selectedPlace) return;
    const type = selectedPlace.type.toLowerCase();
    if (type === "education") {
      router.push(`/details/education/educationlocation?id=${selectedPlace.id}`);
    } else if (type === "mosque") {
      router.push(`/details/masjid/masjidlocation?id=${selectedPlace.id}`);
    } else if (type === "restaurant") {
      router.push(`/details/restaurant/restaurantlocation?id=${selectedPlace.id}`);
    } else if (type === "community") {
      router.push(`/details/community/communitylocation?id=${selectedPlace.id}`);
    } else if (type === "lgu") {
      router.push(`/details/lgu/ncmflocation?id=${selectedPlace.id}`);
    }
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={true}
        mapType={mapType}
        onPress={() => setSelectedPlace(null)}
      >
        {/* 🔹 Display filtered establishments */}
        {filteredEstablishments.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            pinColor={getMarkerColor(item.type)}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedPlace(item);
            }}
          />
        ))}

        {/* 🔹 Show NCMF marker ONLY when filter = "All" */}
        {filterType === "All" && !nearMeActive && (
          <Marker
            coordinate={{ latitude: 16.4262, longitude: 120.5896 }}
            pinColor="purple"
            onPress={(e) => {
              e.stopPropagation();
              setSelectedPlace({
                name: "NCMF — North Luzon",
                address: "80 Bokawkan, Baguio, Benguet",
                contact: "(074) 620 0122",
                type: "lgu",
                latitude: 16.4262,
                longitude: 120.5896,
              });
            }}    
          />
        )}
      </MapView>

      {/* 🧭 Minimal Floating Info Icon + Clean Legend Box */}
      <View style={styles.legendGuideWrapper}>
        <TouchableOpacity
          style={styles.infoIconButton}
          onPress={() => setShowGuideLegend(!showGuideLegend)}
        >
          <MaterialIcons name="info-outline" size={22} color="#000" />
        </TouchableOpacity>

        {/* Legend Content */}
        {showGuideLegend && (
          <View style={styles.legendGuideBox}>
            {[
              { label: "Mosque", color: "#f1ee31ff" },
              { label: "Education", color: "#5af334ff" },
              { label: "Restaurant", color: "#df3f33ff" },
              { label: "Muslim Community", color: "#dd8833ff" },
              { label: "NCMF—North Luzon", color: "#cf54d3ff" },
            ].map((item) => (
              <View key={item.label} style={styles.legendGuideItem}>
                <View
                  style={[styles.legendGuideCircle, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendGuideText}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Map Layers */}
      <View style={styles.layerContainer}>
        <TouchableOpacity
          style={styles.layerButton}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Feather name="layers" size={24} color="black" />
        </TouchableOpacity>
        {showDropdown && (
          <View style={styles.dropdown}>
            {["standard", "hybrid", "terrain"].map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.dropdownOption, mapType === key && styles.activeOption]}
                onPress={() => {
                  setMapType(key);
                  setShowDropdown(false);
                }}
              >
                <Text style={[styles.dropdownText, mapType === key && styles.activeText]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Legend Dropdown */}
      <View style={styles.legendContainer}>
        <TouchableOpacity
          style={styles.legendButton}
          onPress={() => setShowLegend(!showLegend)}
        >
          <MaterialIcons name="legend-toggle" size={24} color="black" />
        </TouchableOpacity>

        {showLegend && (
          <View style={styles.dropdown}>
            {["All", "Mosque", "Education", "Restaurant", "Community"].map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.dropdownOption, filterType === type && styles.activeOption]}
                  onPress={() => {
                    setFilterType(type);
                    setShowLegend(false);
                  }}
                >
                  <Text style={[styles.dropdownText, filterType === type && styles.activeText]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      </View>

      {/* Near Me Button */}
      <View style={styles.nearMeContainer}>
        <TouchableOpacity
          style={[
            styles.nearMeButton,
            nearMeActive && { backgroundColor: "#4285F4" },
          ]}
          onPress={() => {
            setNearMeActive(!nearMeActive);

            if (!nearMeActive && userLocation && mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              );
            }
          }}
        >
          <Ionicons
            name={nearMeActive ? "locate" : "locate-outline"}
            size={24}
            color={nearMeActive ? "#fff" : "#000"}
          />
          <Text style={[styles.nearMeText, nearMeActive && { color: "#fff" }]}>
            Near Me
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      {selectedPlace && (
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.placeName}>{selectedPlace.name}</Text>
          </View>
          <Text>{selectedPlace.address}</Text>
          <Text>📞 {selectedPlace.contact}</Text>

          <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
            <Text style={{ color: "white", fontWeight: "bold" }}>Navigate</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },

  layerContainer: {
    position: "absolute",
    top: 100,
    right: 10,
    zIndex: 10,
  },
layerButton: {
  backgroundColor: "white",
  padding: 8,
  borderRadius: 0, // ✅ sharp edges
  elevation: 4,
},
dropdown: {
  marginTop: 5,
  backgroundColor: "white",
  borderRadius: 0, // ✅ sharp edges
  padding: 0,
  elevation: 4,
},
dropdownOption: {
  paddingVertical: 8,
  paddingHorizontal: 12,
},
dropdownText: {
  fontSize: 14,
},
activeOption: {
  backgroundColor: "#e0e0e0", // ✅ highlight background
},
activeText: {
  fontWeight: "bold",
  color: "#000",
},
legendGuideWrapper: {
  position: "absolute",
  top: 49,
  left: 12,
  zIndex: 20,
  alignItems: "flex-start",
},

infoIconButton: {
  backgroundColor: "rgba(255, 255, 255, 1)",
  padding: 6,
  borderRadius: 50,
  elevation: 2,
  borderWidth: 0.5,
  borderColor: "rgba(0,0,0,0.1)",
},

legendGuideBox: {
  marginTop: 6,
  backgroundColor: "rgba(255, 255, 255, 1)",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 10,
  width: 130,
  elevation: 2,
  borderWidth: 0.3,
  borderColor: "rgba(0,0,0,0.1)", // very light outline
},

legendGuideItem: {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: 2,
},

legendGuideCircle: {
  width: 10,
  height: 10,
  borderRadius: 5,
  marginRight: 6,
  borderWidth: 0.5,
  borderColor: "#555",
},

legendGuideText: {
  fontSize: 11,
  color: "#000",
},



legendContainer: {
  position: "absolute",
  top: 260,
  right: 10,
  zIndex: 10,
},
legendButton: {
  backgroundColor: "white",
  padding: 8,
  borderRadius: 0, // ✅ sharp edges
  elevation: 4,
},
legendDropdown: {
  marginTop: 5,
  backgroundColor: "white",
  borderRadius: 0,
  elevation: 4,
},
legendOption: {
  padding: 6,
  textAlign: "left",
},
activeLegendOption: {
  backgroundColor: "#ddd",
},  

nearMeContainer: {
  position: "absolute",
  top: 49,
  right: 55,
  zIndex: 10,
},
nearMeButton: {
  flexDirection: "row",
  alignItems: "center",
  padding: 6.5,
  backgroundColor: "#f5f5f5ff",
  borderRadius: 0,
  elevation: 4,
},
nearMeText: {
  marginLeft: 6,
  fontWeight: "bold",
  fontSize: 10,
},

infoCard: {
  position: "absolute",
  bottom: 115,
  left: 20,
  right: 20,
  backgroundColor: "white",
  padding: 15,
  borderRadius: 12,
  elevation: 5,
},
infoHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
},
placeName: { 
  fontWeight: "bold", 
  fontSize: 16 
},
  navigateButton: {
    marginTop: 10,
    backgroundColor: "#2eaf66",
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  modeRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-around",
  },
  modeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  activeMode: { backgroundColor: "#ddd" },
  markerImage: {
  width: 60,
  height: 60,
  borderRadius: 30,
  borderRadius: 0,  // keep clean edges
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 1.4,
  elevation: 2,
},
});
