//firebase
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase-config";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { Colors } from "../../../constants/Color";
import { useEffect, useState } from "react";

const { width } = Dimensions.get("window");

export default function CommunityDetails() {
  const router = useRouter();
  const { id, image } = useLocalSearchParams(); // ✅ id comes from community.jsx
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ✅ Add error state

  // ✅ Fetch Firestore data with try-catch
  useEffect(() => {
    if (!id) return;

    let unsubscribe;

    const fetchCommunity = async () => {
      try {
        const docRef = doc(db, "listings_db", id);
        unsubscribe = onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setCommunity({
                name: data.listing?.listing_name || "N/A",
                description: data.listing?.description || "No description available.",
                location: data.listing?.address || "No address provided.",
                operatingHours: `${data.listing?.opening || "N/A"} - ${data.listing?.closing || "N/A"}`,
                representative: data.rep?.rep_name || "Not specified",
                established: data.listing?.established || "N/A",
                image: data.listing?.image || image || "",
              });
            } else {
              setError("Community data not found.");
            }
            setLoading(false);
          },
          (err) => {
            console.error("❌ Firestore onSnapshot error:", err);
            setError("Failed to fetch community data. Please try again later.");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("❌ Unexpected error fetching data:", err);
        setError("An unexpected error occurred while loading data.");
        setLoading(false);
      }
    };

    fetchCommunity();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  // ✅ Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50, color: "red" }}>{error}</Text>
        <TouchableOpacity
          style={{ alignSelf: "center", marginTop: 15 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: Colors.primary, fontWeight: "bold" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ✅ If no data found
  if (!community) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>Community not found.</Text>
      </SafeAreaView>
    );
  }

  // Convert `image` field into an array
  const imageArray = community.image
    ? community.image.split(",").map((img) => img.trim())
    : [];

  // Final image list (dynamic + fallback)
  const finalImages = [
    ...imageArray,
    require("../../../assets/images/community1.jpg"),
  ];

  // 🟩 Dynamic max characters based on screen width
  const getMaxChars = () => {
    if (width < 360) return 15; // Small phones
    if (width < 420) return 20; // Medium phones
    return 25; // Larger phones or tablets
  };

  const maxChars = getMaxChars();
  const shortTitle =
    community.name.length > maxChars
      ? `${community.name.substring(0, maxChars)}...`
      : community.name;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{shortTitle}</Text>

        <TouchableOpacity
          onPress={() => router.replace("tabs/homepage/community")}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Swiper */}
        <View style={styles.profileContainer}>
          <Swiper
            style={styles.wrapper}
            showsButtons={false}
            autoplay
            autoplayTimeout={3}
            dot={
              <View
                style={{
                  backgroundColor: "rgba(179, 172, 172, 0.8)",
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  margin: 3,
                }}
              />
            }
            activeDot={
              <View
                style={{
                  backgroundColor: Colors.primary,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  margin: 3,
                }}
              />
            }
            paginationStyle={{ bottom: 5 }}
          >
            {finalImages.map((img, index) => (
              <Image
                key={index}
                source={typeof img === "string" ? { uri: img } : img}
                style={styles.profilePic}
                resizeMode="cover"
              />
            ))}
          </Swiper>
        </View>

        {/* Title */}
        <View style={styles.infoTitleContainer}>
          <Text style={styles.infoTitleText}>{community.name}</Text>
        </View>

        {/* Description */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.value}>{community.description}</Text>
        </View>

        {/* Established */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>Date Established</Text>
          <Text style={styles.value}>{community.established}</Text>
        </View>

        {/* Location */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.value}>{community.location}</Text>
        </View>

        {/* Operating Hours */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <Text style={styles.value}>{community.operatingHours}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: Colors.primary },
  backBtn: { position: "absolute", left: 20, top: 18 },
  headerTitle: {
    fontFamily: "poppins-bold",
    textAlign: "center",
    fontSize: 22,
    color: Colors.font2,
    padding: 13,
  },
  scrollContent: { padding: 15 },
  profileContainer: { marginTop: 20, alignItems: "center", height: 270 },
  wrapper: { borderRadius: 12 },
  profilePic: {
    width: width - 40,
    height: 250,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ccc",
    alignSelf: "center",
  },
  infoTitleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  infoTitleText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoAssets: {
    backgroundColor: "#DBFCF0",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16, color: "#333", marginBottom: 8 },
  value: { fontSize: 14, color: "#444" },
});
