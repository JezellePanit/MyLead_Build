// firebase
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase-config";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Colors } from "../../../constants/Color";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || "";

export default function CommunityLocation() {
  const router = useRouter();
  const mapRef = useRef(null);

  // params
  const { id } = useLocalSearchParams();

  // states
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
  const [communityName, setCommunityName] = useState("Community");

  // fetch from Firestore
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

  // user location
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

      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={true}
        mapType={mapType}
      >
        {communityCoords && (
          <Marker coordinate={communityCoords} title={communityName} pinColor="orange" />
        )}

        {userLocation && communityCoords && (
          <MapViewDirections
            origin={userLocation}
            destination={communityCoords}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={5}
            strokeColor="blue"
            mode={mode === "MOTORCYCLE" ? "DRIVING" : mode}
            onReady={(result) => {
              setLoading(false);
              setDistance(result.distance.toFixed(1));
              setDuration(result.duration.toFixed(1));

              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 100, right: 80, bottom: 180, left: 80 },
                animated: true,
              });
            }}
            onError={(err) => {
              setLoading(false);
              console.warn("Directions error:", err);
            }}
          />
        )}
      </MapView>

      {/* Map Layers */}
      <View style={styles.layerContainer}>
        <TouchableOpacity style={styles.layerButton} onPress={() => setShowDropdown(!showDropdown)}>
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

      {/* Route Type Dropdown */}
      <View style={styles.routeDropdownWrapper}>
        <TouchableOpacity
          style={styles.layerButton}
          onPress={() => setShowRouteDropdown(!showRouteDropdown)}
        >
          <FontAwesome5 name="route" size={24} color="black" />
        </TouchableOpacity>
        {showRouteDropdown && (
          <View style={styles.dropdown}>
            {routeOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownOption, routeType === opt.toLowerCase() && styles.activeOption]}
                onPress={() => {
                  setRouteType(opt.toLowerCase());
                  setShowRouteDropdown(false);
                }}
              >
                <Text
                  style={[styles.dropdownText, routeType === opt.toLowerCase() && styles.activeText]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Transport Modes */}
      <View style={styles.transportContainer}>
        {transportModes.map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.modeButton, mode === key && styles.selectedMode]}
            onPress={() => {
              setMode(key);
              setLoading(true);
            }}
          >
            <View style={styles.modeContent}>
              <MaterialIcons
                name={icon}
                size={20}
                color={mode === key ? "#fff" : "#333"}
              />
              <Text style={[styles.modeText, mode === key && styles.selectedText]}>{label}</Text>
            </View>
          </TouchableOpacity>
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
  routeDropdownWrapper: { position: "absolute", top: 320, right: 10, zIndex: 10 },
  layerButton: { backgroundColor: "white", padding: 8, borderRadius: 0, elevation: 4 },
  dropdown: { marginTop: 5, backgroundColor: "white", borderRadius: 0, padding: 0, elevation: 4 },
  dropdownOption: { paddingVertical: 8, paddingHorizontal: 12 },
  dropdownText: { fontSize: 14 },
  activeOption: { backgroundColor: "#e0e0e0" },
  activeText: { fontWeight: "bold", color: "#000" },
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
