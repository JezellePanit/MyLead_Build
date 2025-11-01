//firebase
import { doc, getDoc } from 'firebase/firestore';
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

export default function MasjidDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const masjidId = params.id; // Firestore document ID
  const [loading, setLoading] = useState(true);
  const [masjid, setMasjid] = useState(null);

  useEffect(() => {
    if (!masjidId) return;

    const fetchMasjid = async () => {
      try {
        const docRef = doc(db, 'listings_db', masjidId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setMasjid({
            name: data.listing.listing_name,
            about: data.listing.description,
            imam: data.rep?.rep_name || 'Not specified',
            address: data.listing.address,
            image: data.listing.image,
            availability: `${data.listing.opening} - ${data.listing.closing}`,
            socialLinks: data.socialLinks || [],
          });
        } else {
          console.warn('Masjid not found.');
        }
      } catch (error) {
        console.error('Error fetching masjid details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasjid();
  }, [masjidId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text>Loading masjid details...</Text>
      </View>
    );
  }

  if (!masjid) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>No masjid found.</Text>
      </SafeAreaView>
    );
  }

  // Image array for Swiper
  const imageArray = masjid.image ? [masjid.image] : [];
  const finalImages = [
    ...imageArray,
    require('./../../../assets/images/Masjid.jpg'),
    require('./../../../assets/images/Education.jpg'),
  ];

  // 🟩 Dynamic max characters based on screen width
  const getMaxChars = () => {
    if (width < 360) return 15; // Small phones
    if (width < 420) return 20; // Medium phones
    return 25; // Larger phones or tablets
  };

  const maxChars = getMaxChars();
  const shortTitle =
    masjid.name.length > maxChars
      ? `${masjid.name.substring(0, maxChars)}...`
      : masjid.name;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{shortTitle}</Text>

        <TouchableOpacity
          onPress={() => router.replace('tabs/homepage/masjid')}
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
          <Text style={styles.infoTitleText}>{masjid.name}</Text>
        </View>

        {/* About */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.value}>{masjid.about}</Text>
        </View>

        {/* Address */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.value}>{masjid.address}</Text>
        </View>

        {/* Availability */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>Opening Hours</Text>
          <Text style={styles.value}>
            {masjid.availability || 'No schedule provided'}
          </Text>
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
