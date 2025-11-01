//firebase
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import { Colors } from '../../../constants/Color';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase-config';
import { useEffect, useState } from 'react';

const { width } = Dimensions.get('window');

export default function PromotionsDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Firestore document ID
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch data from Firestore by ID
  useEffect(() => {
    if (!id) return;

    const fetchPromotion = async () => {
      try {
        const docRef = doc(db, "campaigns_db", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const d = docSnap.data();
          setPromotion({
            id: docSnap.id,
            title: d.campaign.title,
            description: d.campaign.description,
            startDate: d.campaign.startDate,
            endDate: d.campaign.endDate,
            startTime: d.campaign.startTime,
            endTime: d.campaign.endTime,
            address: d.campaign.address,
            image: d.campaign.image,
            organizer_name: d.organizer?.organizer_name || "N/A",
            email: d.organizer?.email || "N/A",
            socials: d.organizer?.socialLinks || [],
          });
        }
      } catch (error) {
        console.error("Error fetching promotion:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text>Loading promotion details...</Text>
      </View>
    );
  }

  if (!promotion) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No promotion found.</Text>
      </View>
    );
  }

  // ✅ Convert image (string or array) to array
  const imageArray = typeof promotion.image === 'string'
    ? promotion.image.split(',').map((img) => img.trim())
    : [];

  const finalImages = [
    ...imageArray,
    require('../../../assets/images/promo1.jpg'),
  ];

  // 🟩 Dynamic max characters based on screen width
  const getMaxChars = () => {
    if (width < 360) return 15; // Small phones
    if (width < 420) return 20; // Medium phones
    return 25; // Larger phones or tablets
  };

  const maxChars = getMaxChars();
  const shortTitle =
    promotion.title.length > maxChars
      ? `${promotion.title.substring(0, maxChars)}...`
      : promotion.title;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{shortTitle}</Text>

        <TouchableOpacity
          onPress={() => router.replace('tabs/homepage/promotions')}
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
            dot={<View style={{ backgroundColor: 'rgba(179, 172, 172, 0.8)', width: 8, height: 8, borderRadius: 4, margin: 3 }}/>}
            activeDot={<View style={{ backgroundColor: Colors.primary, width: 8, height: 8, borderRadius: 4, margin: 3 }}/>}
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

        {/* Promotion Title */}
        <View style={styles.infoTitleContainer}>
          <Text style={styles.infoTitleText}>{promotion.title}</Text>
        </View>

        {/* Promotion Details */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.value}>{promotion.description}</Text>
        </View>

        {/* Location */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.value}>{promotion.address}</Text>
        </View>

        {/* Date & Time */}
        <View style={styles.infoAssets}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <Text style={styles.value}>
            {promotion.startDate === promotion.endDate
              ? new Date(promotion.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : `${new Date(promotion.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${new Date(promotion.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
            {promotion.startTime ? ` · ${promotion.startTime}` : ''}
            {promotion.endTime ? ` - ${promotion.endTime}` : ''}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: Colors.primary },
  backBtn: { position: 'absolute', left: 20, top: 18 },
  headerTitle: {
    fontFamily: 'poppins-bold',
    textAlign: 'center',
    fontSize: 22,
    color: Colors.font2,
    padding: 13,
  },
  scrollContent: { padding: 15 },
  profileContainer: { marginTop: 20, alignItems: 'center', height: 270 },
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
  infoTitleText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', },
  infoAssets: {
    backgroundColor: '#DBFCF0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, color: '#333', marginBottom: 8 },
  value: { fontSize: 14, color: '#444' },
});
