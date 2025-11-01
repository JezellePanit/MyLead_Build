//firebase
import {
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../../../firebase-config';

import { AntDesign, Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Color';

export default function Community() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [votes, setVotes] = useState({});
  const [voteLock, setVoteLock] = useState({}); // ✅ prevents spamming

  const [communityData, setCommunityData] = useState([]);

  // ✅ Fetch community data in real-time from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "listings_db"),
      where("listing.category", "==", "community")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.listing.listing_name,
          address: d.listing.address,
          operatingHours: `${d.listing.opening} - ${d.listing.closing}`,
          description: d.listing.description,
          image: d.listing.image,
          latitude: d.listing.coordinates?._lat || null,
          longitude: d.listing.coordinates?._long || null,
          rep: d.rep?.rep_name || null,
          likes: d.listing.likes || 0,
          dislikes: d.listing.dislikes || 0
        };
      });
      setCommunityData(data);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Save vote to Firestore
  const saveVoteToDatabase = async (itemId, type, action) => {
    try {
      const docRef = doc(db, "listings_db", itemId);
      if (type === "like") {
        await updateDoc(docRef, {
          "listing.likes": action === "add" ? increment(1) : increment(-1),
        });
      } else if (type === "dislike") {
        await updateDoc(docRef, {
          "listing.dislikes": action === "add" ? increment(1) : increment(-1),
        });
      }
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  // ✅ Load votes from local storage
  useEffect(() => {
    const loadVotes = async () => {
      const savedVotes = await AsyncStorage.getItem('communityVotes');
      if (savedVotes) {
        setVotes(JSON.parse(savedVotes));
      }
    };
    loadVotes();
  }, []);

  // ✅ Save votes to local storage
  useEffect(() => {
    AsyncStorage.setItem('communityVotes', JSON.stringify(votes));
  }, [votes]);

  // ✅ Handle like/dislike (anti-spam version)
  const handleVote = async (index, type) => {
    const itemId = communityData[index].id;

    // 🚫 Prevent spamming while Firestore updates
    if (voteLock[itemId]) return;

    setVoteLock((prev) => ({ ...prev, [itemId]: true }));

    try {
      const currentVote = votes[index];

      // 🔄 Double-check AsyncStorage
      // const storedVotes = JSON.parse(await AsyncStorage.getItem('communityVotes') || '{}');
      // if (storedVotes[index] && storedVotes[index] === type) {
      //   setVoteLock((prev) => ({ ...prev, [itemId]: false }));
      //   return;
      // }

      if (currentVote === type) {
        // ✅ Remove same vote
        const newVotes = { ...votes };
        delete newVotes[index];
        setVotes(newVotes);
        await saveVoteToDatabase(itemId, type, 'remove');
      } else {
        // ✅ Remove opposite vote if exists
        if (currentVote === 'like') await saveVoteToDatabase(itemId, 'like', 'remove');
        if (currentVote === 'dislike') await saveVoteToDatabase(itemId, 'dislike', 'remove');

        // ✅ Apply new vote
        setVotes({ ...votes, [index]: type });
        await saveVoteToDatabase(itemId, type, 'add');
      }
    } catch (error) {
      console.error("Error handling vote:", error);
    } finally {
      // 🕒 Unlock after short delay (prevents spam)
      setTimeout(() => {
        setVoteLock((prev) => ({ ...prev, [itemId]: false }));
      }, 500);
    }
  };

  // ✅ Filter search results
  const filteredCommunity = communityData.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.address.toLowerCase().includes(query) ||
      item.operatingHours.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.header_text}>Community</Text>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.replace('tabs/homepage/home')}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.font2} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search community..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={20} color="#ccc" style={styles.searchIcon} />
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredCommunity.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Ionicons name="information-circle-outline" size={30} color="#888" />
            <Text style={styles.noDataText}>
              {searchQuery
                ? 'No results found for your search.'
                : 'No community listings available.'}
            </Text>
          </View>
        ) : (
          filteredCommunity.map((item, index) => (
            <View key={item.id} style={styles.cardWrapper}>
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: 'details/community/communitydetails',
                    params: {
                      id: item.id,
                      image: item.image,
                    },
                  })
                }
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                  </Text>
                </View>

                {/* Info */}
                <Text style={styles.desc}>{item.address}</Text>
                <Text style={styles.hours}>{item.operatingHours}</Text>

                {/* ✅ Like/Dislike Buttons */}
                <View style={styles.voteRow}>
                  <TouchableOpacity
                    style={styles.voteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleVote(index, 'like');
                    }}
                    disabled={voteLock[item.id]} // 🚫 Disable while updating
                  >
                    <Ionicons
                      name={votes[index] === 'like' ? 'thumbs-up' : 'thumbs-up-outline'}
                      size={20}
                      color={votes[index] === 'like' ? Colors.primary : '#555'}
                    />
                    <Text style={styles.voteText}>{item.likes}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.voteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleVote(index, 'dislike');
                    }}
                    disabled={voteLock[item.id]} // 🚫 Disable while updating
                  >
                    <Ionicons
                      name={votes[index] === 'dislike' ? 'thumbs-down' : 'thumbs-down-outline'}
                      size={20}
                      color={votes[index] === 'dislike' ? 'red' : '#555'}
                    />
                    <Text style={styles.voteText}>{item.dislikes}</Text>
                  </TouchableOpacity>
                </View>
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
  listContainer: { paddingHorizontal: 15, paddingBottom: 100 },
  cardWrapper: { marginBottom: 15 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    padding: 10,
  },
  image: { width: '100%', height: 190, borderRadius: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },

title: {
  fontWeight: 'bold',
  fontSize: 16,
  flexShrink: 1,
  overflow: 'hidden',      // 👈 hides overflowing text
  textOverflow: 'ellipsis', // 👈 ensures the "..." effect (for web compatibility)
},

  desc: {
    fontSize: 12,
    color: '#666',
    marginVertical: 5,
  },
  hours: {
    fontSize: 12,
    color: '#666',
  },
  voteRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginBottom: 5,
  },
  voteButton: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  voteText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4, color: '#444' },
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
