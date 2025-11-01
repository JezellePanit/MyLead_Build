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

export default function EducationDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const educationId = params.id; // Firestore document ID

  const [education, setEducation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!educationId) return;

    try {
      const docRef = doc(db, 'listings_db', educationId);
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setEducation({
              name: data.listing.listing_name,
              about: data.listing.description,
              representative: data.rep?.rep_name || 'Not specified',
              address: data.listing.address,
              image: data.listing.image,
              availability: `${data.listing.opening} - ${data.listing.closing}`,
              socialLinks: data.socialLinks || [],
            });
          } else {
            console.warn('Education listing not found.');
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching education details:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Unexpected error in useEffect:', error);
      setLoading(false);
    }
  }, [educationId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text>Loading education details...</Text>
      </View>
    );
  }

  if (!education) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>No education data found.</Text>
      </SafeAreaView>
    );
  }

  // Image array for Swiper
  const imageArray = education.image ? [education.image] : [];
  const finalImages = [
    ...imageArray,
    require('./../../../assets/images/Education.jpg'),
    require('./../../../assets/images/1789.jpg'),
  ];

  // Truncate header to 2 words for education
  const headerTitleShort = education?.name
    ? education.name.split(' ').slice(0, 2).join(' ') +
      (education.name.split(' ').length > 2 ? '...' : '')
    : '';

  // 🟩 Dynamic max characters based on screen width
  const getMaxChars = () => {
    if (width < 360) return 15; // Small phones
    if (width < 420) return 20; // Medium phones
    return 25; // Larger phones or tablets
  };

  const maxChars = getMaxChars();
  const shortTitle =
    education.name.length > maxChars
      ? `${education.name.substring(0, maxChars)}...`
      : education.name;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{shortTitle}</Text>

        <TouchableOpacity
          onPress={() => router.replace('tabs/homepage/education')}
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
          <Text style={styles.infoTitleText}>{education.name}</Text>
        </View>

        {/* About */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.value}>{education.about}</Text>
        </View>

        {/* Address */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.value}>{education.address}</Text>
        </View>

        {/* Availability */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>Opening Hours</Text>
          <Text style={styles.value}>
            {education.availability || 'No schedule provided'}
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
