import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Color';
import { db } from '../../../firebase-config';

export default function Events() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  // const [votes, setVotes] = useState({});
  const [eventData, setEventData] = useState([]);
  const [filter, setFilter] = useState('all');

    // Fetch education data in real-time from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "campaigns_db"),
      where("campaign.category", "==", "event")
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
      setEventData(data);
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

// const [eventsData, setEventsData] = useState([
//   {
//     id: 'event1',
//     title: 'Istiqlal Ramadan Commencement',
//     startDate: '2025-02-22',
//     endDate: '2025-02-22',
//     startTime: '09:00',
//     endTime: '11:00',
//     where: 'Brgy. Happy Homes, Baguio City',
//     description:
//       'Opening event to welcome the month of Ramadan with recitation and community gathering.',
//     number: '+63 912 345 6789',
//     email: 'istiqlal@mosque.com',
//     socials: 'facebook.com/BIsCWA',
//     image: require('../../../assets/images/events1.jpg'),
//     latitude: 16.4150,
//     longitude: 120.5850,
//     // likes: 50,
//     // dislikes: 3,
//   },
//   {
//     id: 'event2',
//     title: 'Discover Islam Lecture Series',
//     startDate: '2025-03-15',
//     endDate: '2025-03-15',
//     startTime: '16:00',
//     endTime: '18:00',
//     where: 'Discover Islam Baguio Center',
//     description:
//       'A lecture / open forum about Islam: pillars, history, and community engagement.',
//     number: '+63 943 825 9267',
//     email: 'istiqlal@mosque.com',
//     socials: 'facebook.com/DiscoverIslamBaguio',
//     image: require('../../../assets/images/education2a.webp'),
//     latitude: 16.4000,
//     longitude: 120.5800,
//     // likes: 72,
//     // dislikes: 5,
//   },
//   {
//     id: 'event3',
//     title: 'Taraweeh Night Prayers & Talk',
//     startDate: '2025-03-01',
//     endDate: '2025-03-30',
//     startTime: '20:00',
//     endTime: '22:00',
//     where: 'Baguio Grand Mosque, 7 Roman Ayson Rd',
//     description:
//       'Nightly Taraweeh prayers followed by short Islamic talk / reflection. Community members welcome.',
//     number: '+63 915 222 3344',
//     email: 'istiqlal@mosque.com',
//     socials: 'facebook.com/BaguioGrandMosque',
//     image: require('../../../assets/images/mosque1b.webp'),
//     latitude: 16.4156,
//     longitude: 120.58853,
//     // likes: 120,
//     // dislikes: 8,
//   },
//   {
//     id: 'event4',
//     title: 'Eid al-Fitr Celebration & Feast',
//     startDate: '2025-03-31',
//     endDate: '2025-03-31',
//     startTime: '08:00',
//     endTime: '13:00',
//     where: 'Burnham Park, Baguio City',
//     description:
//       'Festive gathering after Eid prayer with communal halal food, cultural performances, and children’s activities.',
//     number: '+63 928 777 8899',
//     email: 'istiqlal@mosque.com',
//     socials: 'facebook.com/BaguioMuslimCommunity',
//     image: require('../../../assets/images/events2.jpg'),
//     latitude: 16.4063,
//     longitude: 120.5960,
//     // likes: 200,
//     // dislikes: 10,
//   },
// ]);


// Convert event.date (single or range) + time into { start, end }
const getEventDateRange = (campaign) => {
  const start = new Date(`${campaign.startDate}T${campaign.startTime || "00:00"}:00`);
  const end = new Date(`${campaign.endDate}T${campaign.endTime || "23:59"}:00`);
  return { start, end };
};

  // // 🔹 Placeholder for future database call
  // const saveVoteToDatabase = async (itemId, type, action) => {
  //   /*
  //     itemId: unique ID of the event item
  //     type: "like" or "dislike"
  //     action: "add" or "remove"
  //   */
  //   console.log(`Saving vote: ${itemId}, ${type}, ${action}`);
  // };

  // // Load votes from storage
  // useEffect(() => {
  //   const loadVotes = async () => {
  //     const savedVotes = await AsyncStorage.getItem('eventsVotes');
  //     if (savedVotes) {
  //       setVotes(JSON.parse(savedVotes));
  //     }
  //   };
  //   loadVotes();
  // }, []);

  // // Save votes to storage
  // useEffect(() => {
  //   AsyncStorage.setItem('eventsVotes', JSON.stringify(votes));
  // }, [votes]);

  // // Handle voting
  // const handleVote = (index, type) => {
  //   const updatedData = [...eventsData];
  //   const currentVote = votes[index]; // "like" | "dislike" | undefined
  //   const itemId = updatedData[index].id;

  //   if (currentVote === type) {
  //     // ✅ Remove same vote
  //     if (type === 'like') {
  //       updatedData[index].likes -= 1;
  //     } else {
  //       updatedData[index].dislikes -= 1;
  //     }

  //     const newVotes = { ...votes };
  //     delete newVotes[index];
  //     setVotes(newVotes);
  //     setEventsData(updatedData);

  //     saveVoteToDatabase(itemId, type, 'remove');
  //     return;
  //   }

  //   // ✅ Remove old opposite vote if exists
  //   if (currentVote === 'like') {
  //     updatedData[index].likes -= 1;
  //     saveVoteToDatabase(itemId, 'like', 'remove');
  //   } else if (currentVote === 'dislike') {
  //     updatedData[index].dislikes -= 1;
  //     saveVoteToDatabase(itemId, 'dislike', 'remove');
  //   }

  //   // ✅ Apply new vote
  //   if (type === 'like') {
  //     updatedData[index].likes += 1;
  //   } else {
  //     updatedData[index].dislikes += 1;
  //   }

  //   setEventsData(updatedData);
  //   setVotes({ ...votes, [index]: type });

  //   saveVoteToDatabase(itemId, type, 'add');
  // };

// ✅ Filter the list based on search
const now = new Date();
const filteredEvents = eventData.filter((item) => {
  const query = searchQuery.toLowerCase();
  const matchesSearch =
    item.title.toLowerCase().includes(query) ||
    item.address.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query);

  if (!matchesSearch) return false;

  // Use new range helper
  const { start, end } = getEventDateRange(item);

  if (filter === "upcoming") {
    return start > now;
  } else if (filter === "ongoing") {
    return start <= now && end >= now;
  } else if (filter === "past") {
    return end < now;
  }

  return true; // "all"
});

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.header_text}>Events</Text>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.replace('tabs/homepage/home')}>
          <Ionicons name="chevron-back" size={24} color={Colors.font2} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search events..."
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
    dropdownIconColor={Colors.primary} // makes the arrow visible
  >
    <Picker.Item label="All Events" value="all" style={styles.pickerItem} />
    <Picker.Item label="Upcoming" value="upcoming" style={styles.pickerItem} />
    <Picker.Item label="Happening Now" value="ongoing" style={styles.pickerItem} />
    <Picker.Item label="Past Events" value="past" style={styles.pickerItem} />
  </Picker>
</View>


      {/* Events Cards */}
<ScrollView contentContainerStyle={styles.listContainer}>
  {filteredEvents.length === 0 ? (
    <View style={styles.noDataContainer}>
      <Ionicons name="information-circle-outline" size={30} color="#888" />
      <Text style={styles.noDataText}>
        {filter === "upcoming"
          ? "No upcoming events."
          : filter === "ongoing"
          ? "No ongoing events."
          : filter === "past"
          ? "No past events."
          : "No events available."}
      </Text>
    </View>
  ) : (
    filteredEvents.map((item, index) => (
      <View key={item.id} style={styles.cardWrapper}>
            {/* Card Content */}
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: 'details/events/eventsdetails',
                  params: { 
                    id: item.id,
                    image: item.image,
                   },
                })
              }
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              {/* Title row */}
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
              </View>

              {/* Information */}
          <Text style={styles.desc}>{item.address}</Text>
          <Text style={styles.hours}>
            {item.startDate === item.endDate
              ? new Date(item.startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : `${new Date(item.startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })} - ${new Date(item.endDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}`}
            · {item.startTime}{item.endTime ? ` - ${item.endTime}` : ""}
          </Text>

              {/* ✅ Vote Buttons below details */}
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
  container: {
    flex: 1,
    backgroundColor: Colors.font2,
  },
  header: {
    backgroundColor: Colors.primary,
  },
  header_text: {
    fontFamily: 'poppins-bold',
    textAlign: 'center',
    fontSize: 22,
    color: Colors.font2,
    padding: 13,
  },
  backIcon: {
    position: 'absolute',
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
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    marginLeft: 10,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 15,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    padding: 10,
  },
  image: {
    width: '100%',
    height: 190,
    borderRadius: 10,
  },
  // voteRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'flex-end',
  //   marginTop: 8,
  //   marginBottom: 5,
  // },
  // voteButton: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginLeft: 12,
  // },
  // voteText: {
  //   fontSize: 12,
  //   fontWeight: 'bold',
  //   marginLeft: 4,
  //   color: '#444',
  // },
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
  desc: {
    fontSize: 12,
    color: '#666',
    marginVertical: 5,
  },
  hours: {
    fontSize: 12,
    color: '#666',
  },
filterContainer: {
  marginHorizontal: 15,
  marginBottom: 10,
  backgroundColor: '#f1f1f1',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#ccc',
  overflow: 'hidden',
},
picker: {
  height: 50,
  width: '100%',
  color: '#333',   
  fontSize: 14,
},
pickerItem: {
  fontSize: 14,
  color: '#333',
},
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
