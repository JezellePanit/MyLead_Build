//firebase
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase-config";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Colors } from "../../../constants/Color";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import polyline from "@mapbox/polyline";

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || "";

export default function EducationLocation() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapType, setMapType] = useState("standard");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [mode, setMode] = useState("DRIVING");
  const [routeType, setRouteType] = useState("shortest");
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [educationCoords, setEducationCoords] = useState(null);
  const [educationName, setEducationName] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  const { id } = useLocalSearchParams();

  const DEFAULT_REGION = {
    latitude: 16.4023,
    longitude: 120.596,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const transportModes = useMemo(
    () => [
      { key: "DRIVING", label: "Drive", icon: "drive-eta" },
      { key: "WALKING", label: "Walk", icon: "directions-walk" },
      { key: "MOTORCYCLE", label: "Motor", icon: "motorcycle" },
      { key: "TRANSIT", label: "Transit", icon: "directions-transit" },
    ],
    []
  );

  const routeOptions = ["Shortest", "Longest"];

  // Fetch Firestore document
  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "listings_db", id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const listing = data.listing || {};
        setEducationName(listing.listing_name || "Education");

        if (listing.coordinates) {
          const lat = Number(listing.coordinates._lat);
          const lng = Number(listing.coordinates._long);
          if (!isNaN(lat) && !isNaN(lng)) {
            setEducationCoords({ latitude: lat, longitude: lng });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [id]);

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  // Animate map to marker
  useEffect(() => {
    if (educationCoords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: educationCoords.latitude,
          longitude: educationCoords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }, [educationCoords]);

  // Decode polyline
  const decodePolyline = useCallback(
    (t) => polyline.decode(t).map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
    []
  );

  // Simplify polyline
  const simplifyPolyline = useCallback((coords, factor = 5) => coords.filter((_, i) => i % factor === 0), []);

  // Reset routeType to 'shortest' whenever mode changes
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setRouteType("shortest");
  }, []);

  // Fetch route
  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation || !educationCoords) return;
      setLoading(true);

      const origin = `${userLocation.latitude},${userLocation.longitude}`;
      const destination = `${educationCoords.latitude},${educationCoords.longitude}`;
      const travelMode = mode === "MOTORCYCLE" ? "driving" : mode.toLowerCase();

      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${travelMode}&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          let selectedRoute = data.routes[0];

          if (routeType === "shortest") {
            selectedRoute = data.routes.reduce((prev, curr) =>
              prev.legs[0].distance.value < curr.legs[0].distance.value ? prev : curr
            );
          } else if (routeType === "longest") {
            selectedRoute = data.routes.reduce((prev, curr) =>
              prev.legs[0].distance.value > curr.legs[0].distance.value ? prev : curr
            );
          }

          const coords = simplifyPolyline(decodePolyline(selectedRoute.overview_polyline.points));
          setRouteCoordinates(coords);
          setDistance((selectedRoute.legs[0].distance.value / 1000).toFixed(1));
          setDuration((selectedRoute.legs[0].duration.value / 60).toFixed(1));

          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { top: 100, right: 80, bottom: 180, left: 80 },
            animated: true,
          });
        }
      } catch (err) {
        console.warn("Directions API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [mode, routeType, userLocation, educationCoords, decodePolyline, simplifyPolyline]);

  // Memoized Mode Button
  const ModeButton = React.memo(({ keyMode, selectedMode, onPress, label, icon }) => (
    <TouchableOpacity
      key={`mode-${keyMode}`} // ✅ unique key
      style={[styles.modeButton, selectedMode === keyMode && styles.selectedMode]}
      onPress={onPress}
    >
      <View style={styles.modeContent}>
        <MaterialIcons name={icon} size={20} color={selectedMode === keyMode ? "#fff" : "#333"} />
        <Text style={[styles.modeText, selectedMode === keyMode && styles.selectedText]}>{label}</Text>
      </View>
    </TouchableOpacity>
  ));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.header_text}>Location</Text>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.replace("tabs/homepage/education")}>
          <Ionicons name="chevron-back" size={24} color={Colors.font2} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={true}
        mapType={mapType}
      >
        {educationCoords && <Marker coordinate={educationCoords} title={educationName} pinColor="green" />}
        {routeCoordinates.length > 0 && <Polyline coordinates={routeCoordinates} strokeColor="blue" strokeWidth={5} />}
      </MapView>

      {/* Map Tiles Dropdown */}
      <View style={styles.layerContainer}>
        <TouchableOpacity style={styles.layerButton} onPress={() => setShowDropdown(!showDropdown)}>
          <Feather name="layers" size={24} color="black" />
        </TouchableOpacity>
        {showDropdown && (
          <View style={styles.dropdown}>
            {["standard", "hybrid", "terrain"].map((key) => (
              <TouchableOpacity
                key={`map-${key}`} // ✅ unique key
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

      {/* Route Type Dropdown */}
      <View style={styles.routeDropdownWrapper}>
        <TouchableOpacity style={styles.layerButton} onPress={() => setShowRouteDropdown(!showRouteDropdown)}>
          <FontAwesome5 name="route" size={24} color="black" />
        </TouchableOpacity>
        {showRouteDropdown && (
          <View style={styles.dropdown}>
            {routeOptions.map((opt) => (
              <TouchableOpacity
                key={`route-${opt}`} // ✅ unique key
                style={[styles.dropdownOption, routeType === opt.toLowerCase() && styles.activeOption]}
                onPress={() => {
                  setRouteType(opt.toLowerCase());
                  setShowRouteDropdown(false);
                }}
              >
                <Text style={[styles.dropdownText, routeType === opt.toLowerCase() && styles.activeText]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Transportation Modes */}
      <View style={styles.transportContainer}>
        {transportModes.map(({ key, label, icon }) => (
  <ModeButton
    key={`mode-${key}`}   // ✅ React key goes here
    keyMode={key}
    selectedMode={mode}
    onPress={() => handleModeChange(key)}
    label={label}
    icon={icon}
  />
))}
      </View>

      {/* Distance & Duration */}
      {distance && duration && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Distance: {distance} km</Text>
          <Text style={styles.infoText}>Duration: {duration} mins</Text>
        </View>
      )}

      {/* Loading Spinner */}
      {loading && <ActivityIndicator size="large" color="#2eaf66" style={styles.loading} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    zIndex: 10,
    elevation: 5,
  },
  header_text: {
    fontFamily: "poppins-bold",
    fontSize: 22,
    color: Colors.font2,
    textAlign: "center",
  },
  backIcon: { position: "absolute", left: 15, top: 10 },
  layerContainer: { position: "absolute", top: 155, right: 10, zIndex: 10 },
  layerButton: { backgroundColor: "white", padding: 8, borderRadius: 0, elevation: 4 },
  dropdown: { marginTop: 5, backgroundColor: "white", borderRadius: 0, padding: 0, elevation: 4 },
  dropdownOption: { paddingVertical: 8, paddingHorizontal: 12 },
  dropdownText: { fontSize: 14 },
  activeOption: { backgroundColor: "#e0e0e0" },
  activeText: { fontWeight: "bold", color: "#000" },
  routeDropdownWrapper: { position: "absolute", top: 320, right: 10, zIndex: 10 },
  transportContainer: {
    position: "absolute",
    bottom: 150,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
    borderRadius: 10,
    padding: 5,
  },
  modeButton: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
  },
  selectedMode: { backgroundColor: "#2eaf66" },
  modeContent: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  modeText: { marginLeft: 5, color: "#333", fontWeight: "bold" },
  selectedText: { color: "#fff" },
  infoContainer: {
    position: "absolute",
    bottom: 110,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 6,
  },
  infoText: { color: "#000", fontWeight: "bold" },
  loading: { position: "absolute", top: "50%", left: "50%", marginLeft: -15, marginTop: -15 },
});
