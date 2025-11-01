import { AntDesign, Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Color';

// 🔹 Firestore
import { db } from '../../../firebase-config';
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RestaurantMenu() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // 👈 restaurant documentId
  const [searchQuery, setSearchQuery] = useState('');
  const [votes, setVotes] = useState({});
  const [voteLock, setVoteLock] = useState({});
  const [listing, setListing] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  // 🔹 Fetch restaurant doc + subscribe for real-time updates
  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "listings_db", id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        // ensure each menu item has likes/dislikes
        const menuWithVotes = (data.menu || []).map((m) => ({
          ...m,
          likes: m.likes ?? 0,
          dislikes: m.dislikes ?? 0,
        }));

        setListing(data);
        setMenuItems(menuWithVotes);
      }
    });

    return () => unsub();
  }, [id]);

  // 🔹 Load votes from AsyncStorage
  useEffect(() => {
    const loadVotes = async () => {
      if (!id) return;
      const savedVotes = await AsyncStorage.getItem(`restaurantMenuVotes-${id}`);
      if (savedVotes) setVotes(JSON.parse(savedVotes));
    };
    loadVotes();
  }, [id]);

  // 🔹 Save votes to AsyncStorage whenever they change
  useEffect(() => {
    if (!id) return;
    AsyncStorage.setItem(`restaurantMenuVotes-${id}`, JSON.stringify(votes));
  }, [votes, id]);

  // 🔹 Save/remove votes in Firestore (per menu item)
  const saveVoteToDatabase = async (itemIndex, type, action) => {
    if (!id || !listing) return;

    const restaurantRef = doc(db, "listings_db", id);
    const updatedMenu = [...menuItems];

    if (action === "add") {
      updatedMenu[itemIndex][type + "s"] += 1;
    } else if (action === "remove") {
      updatedMenu[itemIndex][type + "s"] = Math.max(0, updatedMenu[itemIndex][type + "s"] - 1); // prevent negative
    }

    try {
      await updateDoc(restaurantRef, {
        menu: updatedMenu,
      });
    } catch (error) {
      console.error("Error saving vote:", error);
    }
  };

  // 🔹 Handle voting with anti-spam
  const handleVote = async (index, type) => {
    if (!listing) return;

    const itemId = index; // unique per menu item

    // 🚫 Prevent spam taps
    if (voteLock[itemId]) return;

    setVoteLock((prev) => ({ ...prev, [itemId]: true }));

    try {
      const currentVote = votes[index]; // "like" | "dislike" | undefined

      // 🔄 Check AsyncStorage to prevent double vote
      // const storedVotes = JSON.parse(await AsyncStorage.getItem(`restaurantMenuVotes-${id}`) || '{}');
      // if (storedVotes[index] && storedVotes[index] === type) {
      //   setVoteLock((prev) => ({ ...prev, [itemId]: false }));
      //   return;
      // }

      if (currentVote === type) {
        // ✅ Remove same vote
        setVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[index];
          return newVotes;
        });
        await saveVoteToDatabase(index, type, 'remove');
      } else {
        // ✅ Remove opposite vote if exists
        if (currentVote === 'like') await saveVoteToDatabase(index, 'like', 'remove');
        if (currentVote === 'dislike') await saveVoteToDatabase(index, 'dislike', 'remove');

        // ✅ Apply new vote
        setVotes(prev => ({ ...prev, [index]: type }));
        await saveVoteToDatabase(index, type, 'add');
      }
    } catch (error) {
      console.error("Error handling vote:", error);
    } finally {
      // 🕒 Unlock after 500ms
      setTimeout(() => {
        setVoteLock((prev) => ({ ...prev, [itemId]: false }));
      }, 500);
    }
  };

  // 🔹 Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.name?.toLowerCase() || "").includes(query) ||
      (item.desc?.toLowerCase() || "").includes(query)
    );
  });

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 40 }}>Loading menu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{listing.listing_name} Menu</Text>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.replace("tabs/homepage/restaurant")}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.font2} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search menu..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={20} color="#ccc" style={styles.searchIcon} />
      </View>

      {/* Greeting */}
      <Text style={styles.greeting}>
        Welcome to {listing?.listing_name || "our restaurant's menu!"}!
      </Text>

      {/* Menu Grid */}
      <ScrollView contentContainerStyle={styles.grid}>
        {filteredItems.map((item, index) => (
          <View key={`${item.name}-${index}`} style={styles.menuItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDesc}>{item.desc}</Text>

            {/* Vote Buttons */}
            <View style={styles.voteRow}>
              <TouchableOpacity
                style={styles.voteButton}
                onPress={() => handleVote(index, 'like')}
                disabled={voteLock[index]} // prevent spam
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
                onPress={() => handleVote(index, 'dislike')}
                disabled={voteLock[index]} // prevent spam
              >
                <Ionicons
                  name={votes[index] === 'dislike' ? 'thumbs-down' : 'thumbs-down-outline'}
                  size={20}
                  color={votes[index] === 'dislike' ? 'red' : '#555'}
                />
                <Text style={styles.voteText}>{item.dislikes}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontFamily: "poppins-bold",
    textAlign: "center",
    fontSize: 22,
    color: Colors.font2,
    padding: 13,
  },
  backIcon: {
    position: "absolute",
    left: 20,
    top: 18,
  },
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
  greeting: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2eaf66',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  grid: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuItem: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  menuList: {
    padding: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    color: "#555",
  },
  voteRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginBottom: 5,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  voteText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#444',
  },
});
