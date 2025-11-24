// firebase
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase-config";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Colors } from "../../../constants/Color";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import polyline from "@mapbox/polyline";

const apiKey = Constants.expoConfig.extra.googleMapsApiKey;

export default function CommunityLocation() {
  const router = useRouter();
  const mapRef = useRef(null);

  const { id } = useLocalSearchParams();

  // States
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapType, setMapType] = useState("standard");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [mode, setMode] = useState("DRIVING");
  const [routeType, setRouteType] = useState("shortest");
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [communityCoords, setCommunityCoords] = useState(null);
  const [communityName, setCommunityName] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState([]);

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

        setCommunityName(listing.listing_name || "Community");

        if (listing.coordinates) {
          const lat = Number(listing.coordinates._lat);
          const lng = Number(listing.coordinates._long);

          if (!isNaN(lat) && !isNaN(lng)) {
            setCommunityCoords({ latitude: lat, longitude: lng });
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
    if (communityCoords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: communityCoords.latitude,
          longitude: communityCoords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }, [communityCoords]);

  // Decode polyline
  const decodePolyline = useCallback(
    (t) => polyline.decode(t).map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
    []
  );

  // Simplify polyline to speed render
  const simplifyPolyline = useCallback((coords, factor = 5) => coords.filter((_, i) => i % factor === 0), []);

  // Change transport mode + reset routing
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setRouteType("shortest");
  }, []);

  // Fetch route from Google Directions API
  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation || !communityCoords) return;

      setLoading(true);

      const origin = `${userLocation.latitude},${userLocation.longitude}`;
      const destination = `${communityCoords.latitude},${communityCoords.longitude}`;
      const travelMode = mode === "MOTORCYCLE" ? "driving" : mode.toLowerCase();

      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${travelMode}&alternatives=true&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.routes?.length > 0) {
          let selected = data.routes[0];

          if (routeType === "shortest") {
            selected = data.routes.reduce((prev, curr) =>
              prev.legs[0].distance.value < curr.legs[0].distance.value ? prev : curr
            );
          } else if (routeType === "longest") {
            selected = data.routes.reduce((prev, curr) =>
              prev.legs[0].distance.value > curr.legs[0].distance.value ? prev : curr
            );
          }

          const coords = simplifyPolyline(
            decodePolyline(selected.overview_polyline.points)
          );

          setRouteCoordinates(coords);
          setDistance((selected.legs[0].distance.value / 1000).toFixed(1));
          setDuration((selected.legs[0].duration.value / 60).toFixed(1));

          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { top: 100, right: 80, bottom: 180, left: 80 },
            animated: true,
          });
        }
      } catch (err) {
        console.warn("Route fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [mode, routeType, userLocation, communityCoords, decodePolyline, simplifyPolyline]);

  // Transport mode memo
  const ModeButton = React.memo(({ keyMode, label, icon }) => (
    <TouchableOpacity
      key={`mode-${keyMode}`}
      style={[styles.modeButton, mode === keyMode && styles.selectedMode]}
      onPress={() => handleModeChange(keyMode)}
    >
      <View style={styles.modeContent}>
        <MaterialIcons name={icon} size={20} color={mode === keyMode ? "#fff" : "#333"} />
        <Text style={[styles.modeText, mode === keyMode && styles.selectedText]}>{label}</Text>
      </View>
    </TouchableOpacity>
  ));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.header_text}>Location</Text>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.replace("tabs/homepage/community")}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.font2} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={true}
        mapType={mapType}
      >
        {communityCoords && (
          <Marker coordinate={communityCoords} title={communityName} pinColor="orange" />
        )}

        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="blue" strokeWidth={5} />
        )}
      </MapView>

      {/* Map Layer Dropdown */}
      <View style={styles.layerContainer}>
        <TouchableOpacity style={styles.layerButton} onPress={() => setShowDropdown(!showDropdown)}>
          <Feather name="layers" size={24} color="black" />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdown}>
            {["standard", "hybrid", "terrain"].map((type) => (
              <TouchableOpacity
                key={`map-${type}`}
                style={[styles.dropdownOption, mapType === type && styles.activeOption]}
                onPress={() => {
                  setMapType(type);
                  setShowDropdown(false);
                }}
              >
                <Text style={[styles.dropdownText, mapType === type && styles.activeText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Route Dropdown */}
      <View style={styles.routeDropdownWrapper}>
        <TouchableOpacity style={styles.layerButton} onPress={() => setShowRouteDropdown(!showRouteDropdown)}>
          <FontAwesome5 name="route" size={24} color="black" />
        </TouchableOpacity>

        {showRouteDropdown && (
          <View style={styles.dropdown}>
            {routeOptions.map((opt) => (
              <TouchableOpacity
                key={`route-${opt}`}
                style={[styles.dropdownOption, routeType === opt.toLowerCase() && styles.activeOption]}
                onPress={() => {
                  setRouteType(opt.toLowerCase());
                  setShowRouteDropdown(false);
                }}
              >
                <Text style={[styles.dropdownText, routeType === opt.toLowerCase() && styles.activeText]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Transport Modes */}
      <View style={styles.transportContainer}>
        {transportModes.map((m) => (
          <ModeButton key={m.key} keyMode={m.key} icon={m.icon} label={m.label} />
        ))}
      </View>

      {/* Distance & Duration */}
      {distance && duration && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Distance: {distance} km</Text>
          <Text style={styles.infoText}>Duration: {duration} mins</Text>
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#2eaf66" style={styles.loading} />}
    </SafeAreaView>
  );
}

// Styles stay exactly same as your working file:
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    elevation: 5,
    zIndex: 10,
  },
  header_text: {
    fontFamily: "poppins-bold",
    fontSize: 22,
    color: Colors.font2,
  },
  backIcon: { position: "absolute", left: 15, top: 10 },

  layerContainer: { position: "absolute", top: 155, right: 10, zIndex: 10 },
  routeDropdownWrapper: { position: "absolute", top: 320, right: 10, zIndex: 10 },

  layerButton: { backgroundColor: "white", padding: 8, borderRadius: 0, elevation: 4 },

  dropdown: { marginTop: 5, backgroundColor: "white", padding: 0, elevation: 4 },
  dropdownOption: { paddingVertical: 8, paddingHorizontal: 12 },
  dropdownText: { fontSize: 14 },

  activeOption: { backgroundColor: "#e0e0e0" },
  activeText: { fontWeight: "bold" },

  transportContainer: {
    position: "absolute",
    bottom: 150,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
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

  modeText: { marginLeft: 5, fontWeight: "bold", color: "#333" },
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

  infoText: { fontWeight: "bold", color: "#000" },

  loading: { position: "absolute", top: "50%", left: "50%", marginLeft: -15, marginTop: -15 },
});
