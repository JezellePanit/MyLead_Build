//firebase
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase-config';

import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import { Colors } from '../../../constants/Color';
import { useEffect, useState } from 'react';

const { width } = Dimensions.get('window');

export default function RestaurantDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const restaurantId = params.id; // Firestore document ID

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!restaurantId) return;

    let unsubscribe;

    const fetchRestaurant = async () => {
      try {
        const docRef = doc(db, 'listings_db', restaurantId);
        unsubscribe = onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setRestaurant({
                name: data.listing?.listing_name || 'N/A',
                about: data.listing?.description || 'No description available.',
                representative: data.rep?.rep_name || 'Not specified',
                address: data.listing?.address || 'No address provided.',
                image: data.listing?.image || '',
                availability: `${data.listing?.opening || 'N/A'} - ${data.listing?.closing || 'N/A'}`,
                menu: data.menu || [],
                socialLinks: data.socialLinks || [],
              });
            } else {
              setError('Restaurant data not found.');
            }
            setLoading(false);
          },
          (err) => {
            console.error('❌ Firestore snapshot error:', err);
            setError('Failed to fetch restaurant data. Please try again later.');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('❌ Unexpected error fetching restaurant:', err);
        setError('An unexpected error occurred while loading restaurant data.');
        setLoading(false);
      }
    };

    fetchRestaurant();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [restaurantId]);

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
        <Text style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>{error}</Text>
        <TouchableOpacity
          style={{ alignSelf: 'center', marginTop: 15 }}
          onPress={() => router.replace()}
        >
          <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Restaurant not found.</Text>
      </SafeAreaView>
    );
  }

  // Image array for Swiper
  const imageArray = restaurant.image ? [restaurant.image] : [];
  const finalImages = [
    ...imageArray,
    require('./../../../assets/images/MuslimRestaurant.jpg'),
    require('./../../../assets/images/1789.jpg'),
  ];

  // 🟩 Dynamic max characters based on screen width
  const getMaxChars = () => {
    if (width < 360) return 15; // Small phones
    if (width < 420) return 20; // Medium phones
    return 25; // Larger phones or tablets
  };

  const maxChars = getMaxChars();
  const shortTitle =
    restaurant.name.length > maxChars
      ? `${restaurant.name.substring(0, maxChars)}...`
      : restaurant.name;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{shortTitle}</Text>

        <TouchableOpacity
          onPress={() => router.push('tabs/homepage/restaurant')}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Carousel */}
        <View style={styles.profileContainer}>
          <Swiper
            style={styles.wrapper}
            showsButtons={false}
            autoplay
            autoplayTimeout={3}
            dot={
              <View
                style={{
                  backgroundColor: 'rgba(179, 172, 172, 0.8)',
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
                source={typeof img === 'string' ? { uri: img } : img}
                style={styles.profilePic}
                resizeMode="cover"
              />
            ))}
          </Swiper>
        </View>

        {/* Title */}
        <View style={styles.infoTitleContainer}>
          <Text style={styles.infoTitleText}>{restaurant.name}</Text>
        </View>

        {/* About */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.value}>{restaurant.about}</Text>
        </View>

        {/* Address */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.value}>{restaurant.address}</Text>
        </View>

        {/* Availability */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>Opening Hours</Text>
          <Text style={styles.value}>{restaurant.availability}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: Colors.primary,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 18,
  },
  headerTitle: {
    fontFamily: 'poppins-bold',
    textAlign: 'center',
    fontSize: 22,
    color: Colors.font2,
    padding: 13,
  },
  scrollContent: { padding: 15 },
  profileContainer: {
    marginTop: 20,
    alignItems: 'center',
    height: 270,
  },
  wrapper: { borderRadius: 12 },
  profilePic: {
    width: width - 40,
    height: 250,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ccc',
    alignSelf: 'center',
  },
  infoTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  infoTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoAssets: {
    backgroundColor: '#DBFCF0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: '#444',
  },
});
