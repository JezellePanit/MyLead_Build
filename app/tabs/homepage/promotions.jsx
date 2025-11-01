import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Color';
import { db } from '../../../firebase-config';

export default function Promotions() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  // const [votes, setVotes] = useState({});
  const [promotionData, setPromotionData] = useState([]);
  const [filter, setFilter] = useState('all');

   // Fetch education data in real-time from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "campaigns_db"),
      where("campaign.category", "==", "promotion")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.campaign.title,
          address: d.campaign.address,
          description: d.campaign.description,
          image: d.campaign.image,
          startDate: d.campaign.startDate,
          startTime: d.campaign.startTime,
          endDate: d.campaign.endDate,
          endTime: d.campaign.endTime,
          latitude: d.campaign.coordinates?._lat || null,
          longitude: d.campaign.coordinates?._long || null,
          organizer: d.organizer?.organizer_name || null,
          likes: d.campaign.likes || 0,      // default 0 if missing
          dislikes: d.campaign.dislikes || 0 // default 0 if missing
        };
      });
      setPromotionData(data);
    });

    return () => unsubscribe(); // cleanup listener
  }, []);
  // Dummy promotions data
  // const [promotionsData, setPromotionsData] = useState([
  //   {
  //     id: 'promo1',
  //     promotionTitle: 'Muslim Booth – Panagbenga Festival',
  //     description:
  //       'A special booth offering halal delicacies, cultural items, and Islamic literature during the Panagbenga Festival.',
  //     startDate: '2025-02-15',
  //     endDate: '2025-02-20',
  //     time: '09:00 - 20:00',
  //     location: 'Burnham Park, Baguio City',
  //     number: '+63 912 345 6789',
  //     email: 'istiqlal@mosque.com',
  //     socials: 'facebook.com/PanagbengaMuslimBooth',
  //     image: require('../../../assets/images/promo1.jpg'),
  //     latitude: 16.4063,
  //     longitude: 120.5960,
  //     // likes: 40,
  //     // dislikes: 3,
  //   },
  //   {
  //     id: 'promo2',
  //     promotionTitle: 'Halal Food Fair – Session Road in Bloom',
  //     description:
  //       'Taste authentic halal dishes and learn about Muslim culture at our booth in Session Road in Bloom.',
  //     startDate: '2025-03-01',
  //     endDate: '2025-03-07',
  //     time: '10:00 - 22:00',
  //     location: 'Session Road, Baguio City',
  //     number: '+63 943 825 9267', 
  //     email: 'istiqlal@mosque.com',
  //     socials: 'facebook.com/HalalFoodFair',
  //     image: require('../../../assets/images/promo2.jpg'),
  //     latitude: 16.4156,
  //     longitude: 120.58853,
  //     // likes: 65,
  //     // dislikes: 5,
  //   },
  // ]);

  // 🔹 Helper: Date range
  const getPromotionDateRange = (campaign) => {
    const start = new Date(`${campaign.startDate}T00:00:00`);
    const end = new Date(`${campaign.endDate}T23:59:59`);
    return { start, end };
  };

  // 🔹 Save vote placeholder
  // const saveVoteToDatabase = async (itemId, type, action) => {
  //   console.log(`Saving vote: ${itemId}, ${type}, ${action}`);
  // };

  // Load votes
  // useEffect(() => {
  //   const loadVotes = async () => {
  //     const savedVotes = await AsyncStorage.getItem('promotionsVotes');
  //     if (savedVotes) {
  //       setVotes(JSON.parse(savedVotes));
  //     }
  //   };
  //   loadVotes();
  // }, []);

  // Save votes
  // useEffect(() => {
  //   AsyncStorage.setItem('promotionsVotes', JSON.stringify(votes));
  // }, [votes]);

  // Handle voting
  // const handleVote = (index, type) => {
  //   const updatedData = [...promotionsData];
  //   const currentVote = votes[index];
  //   const itemId = updatedData[index].id;

  //   if (currentVote === type) {
  //     if (type === 'like') updatedData[index].likes -= 1;
  //     else updatedData[index].dislikes -= 1;

  //     const newVotes = { ...votes };
  //     delete newVotes[index];
  //     setVotes(newVotes);
  //     setPromotionsData(updatedData);

  //     saveVoteToDatabase(itemId, type, 'remove');
  //     return;
  //   }

  //   if (currentVote === 'like') {
  //     updatedData[index].likes -= 1;
  //     saveVoteToDatabase(itemId, 'like', 'remove');
  //   } else if (currentVote === 'dislike') {
  //     updatedData[index].dislikes -= 1;
  //     saveVoteToDatabase(itemId, 'dislike', 'remove');
  //   }

  //   if (type === 'like') updatedData[index].likes += 1;
  //   else updatedData[index].dislikes += 1;

  //   setPromotionsData(updatedData);
  //   setVotes({ ...votes, [index]: type });

  //   saveVoteToDatabase(itemId, type, 'add');
  // };

  // ✅ Filter the list based on search
const now = new Date();
const filteredPromotions = promotionData.filter((item) => {
  const query = searchQuery.toLowerCase();
  const matchesSearch =
    item.title.toLowerCase().includes(query) ||
    item.address.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query);

  if (!matchesSearch) return false;

  // Use new range helper
  const { start, end } = getPromotionDateRange(item);

    if (filter === 'upcoming') return start > now;
    if (filter === 'ongoing') return start <= now && end >= now;
    if (filter === 'expired') return end < now;

  return true; // "all"
});

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.header_text}>Promotions</Text>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.replace('tabs/homepage/home')}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.font2} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search promotions..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={20} color="#ccc" style={styles.searchIcon} />
      </View>

      {/* Dropdown Filter */}
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={filter}
          onValueChange={(val) => setFilter(val)}
          style={styles.picker}
          dropdownIconColor={Colors.primary}
        >
          <Picker.Item label="All Promotions" value="all" style={styles.pickerItem} />
          <Picker.Item label="Upcoming" value="upcoming" style={styles.pickerItem} />
          <Picker.Item label="Happening Now" value="ongoing" style={styles.pickerItem} />
          <Picker.Item label="Expired" value="expired" style={styles.pickerItem} />
        </Picker>
      </View>

      {/* Promotions List */}
<ScrollView contentContainerStyle={styles.listContainer}>
  {filteredPromotions.length === 0 ? (
    <View style={styles.noDataContainer}>
      <Ionicons name="information-circle-outline" size={30} color="#888" />
      <Text style={styles.noDataText}>
        {filter === "upcoming"
          ? "No upcoming promotions."
          : filter === "ongoing"
          ? "No ongoing promotions."
          : filter === "expired"
          ? "No expired promotions."
          : "No promotions available."}
      </Text>
    </View>
  ) : (
    filteredPromotions.map((item, index) => (
      <View key={item.id} style={styles.cardWrapper}>
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: 'details/promotions/promotionsdetails',
                  params: {
                    id: item.id,
                    image: item.image,
                  },
                })
              }
            >
              <Image source={{ uri: item.image }} style={styles.image} />

              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
              </View>

              <Text style={styles.desc}>{item.address}</Text>

              <Text style={styles.hours}>
                {new Date(item.startDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {item.startDate !== item.endDate &&
                  ` - ${new Date(item.endDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}`}
                · {item.startTime} - {item.endTime}
              </Text>


              {/* Votes */}
              {/* <View style={styles.voteRow}>
                <TouchableOpacity
                  style={styles.voteButton}
                  onPress={() => handleVote(index, 'like')}
                >
                  <AntDesign
                    name={votes[index] === 'like' ? 'like1' : 'like2'}
                    size={20}
                    color={votes[index] === 'like' ? Colors.primary : '#555'}
                  />
                  <Text style={styles.voteText}>{item.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.voteButton}
                  onPress={() => handleVote(index, 'dislike')}
                >
                  <AntDesign
                    name={votes[index] === 'dislike' ? 'dislike1' : 'dislike2'}
                    size={20}
                    color={votes[index] === 'dislike' ? 'red' : '#555'}
                  />
                  <Text style={styles.voteText}>{item.dislikes}</Text>
                </TouchableOpacity>
              </View> */}
            </TouchableOpacity>
      </View>
    ))
  )}
</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.font2 },
  header: { backgroundColor: Colors.primary },
  header_text: {
    fontFamily: 'poppins-bold',
    textAlign: 'center',
    fontSize: 22,
    color: Colors.font2,
    padding: 13,
  },
  backIcon: { position: 'absolute', left: 20, top: 18 },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    margin: 15,
    borderRadius: 20,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchInput: { flex: 1, height: 40 },
  searchIcon: { marginLeft: 10 },
  filterContainer: {
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  picker: { height: 50, width: '100%', color: '#333', fontSize: 14 },
  pickerItem: { fontSize: 14, color: '#333' },
  listContainer: { paddingHorizontal: 15, paddingBottom: 100 },
  cardWrapper: { marginBottom: 15 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    padding: 10,
    marginBottom: 15,
  },
  image: { width: '100%', height: 190, borderRadius: 10 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    flexShrink: 1,
    overflow: 'hidden',      // 👈 hides overflowing text
    textOverflow: 'ellipsis', // 👈 ensures the "..." effect (for web compatibility)
  },

  desc: { fontSize: 12, color: '#666', marginVertical: 5 },
  hours: { fontSize: 12, color: '#666' },
  // voteRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'flex-end',
  //   marginTop: 8,
  //   marginBottom: 5,
  // },
  // voteButton: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  // voteText: {
  //   fontSize: 12,
  //   fontWeight: 'bold',
  //   marginLeft: 4,
  //   color: '#444',
  // },
noDataContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 150,
},
noDataText: {
  marginTop: 5,
  fontSize: 14,
  color: "#888",
  fontFamily: "poppins-medium",
  textAlign: "center",
},
});
