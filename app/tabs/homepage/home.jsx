// ✅ Firestore imports
import { collection, onSnapshot, doc, setDoc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "../../../firebase-config";

import { Ionicons, AntDesign, Entypo, SimpleLineIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useEffect, useState, useCallback, memo } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Color";

const { width } = Dimensions.get("window");

// ✅ Memoized Carousel Item
const CarouselCard = memo(({ item, onPress }) => (
  <TouchableOpacity style={styles.carouselCard} onPress={onPress}>
    <Image source={{ uri: item.image }} style={styles.carouselImage} />
<View style={styles.carouselOverlay}>
  <Text
    style={styles.carouselText}
    numberOfLines={1}
    ellipsizeMode="tail"
  >
    {item.listing_name}
  </Text>
</View>
  </TouchableOpacity>
));

// ✅ Memoized Menu Item
const MenuCard = memo(({ item, onPress }) => (
  <TouchableOpacity style={styles.menuCard} onPress={onPress}>
    <Text style={styles.itemName}>{item.name}</Text>
    <Text style={styles.itemDesc}>{item.desc || "No description"}</Text>
    <View style={styles.voteRow}>
      <View style={styles.voteButton}>
        <Ionicons name="thumbs-up" size={18} color={Colors.primary} />
        <Text style={styles.voteText}>{item.likes || 0}</Text>
      </View>
      <View style={styles.voteButton}>
        <Ionicons name="thumbs-down" size={18} color="red" />
        <Text style={styles.voteText}>{item.dislikes || 0}</Text>
      </View>
    </View>
  </TouchableOpacity>
));

// ✅ Memoized Category Card
const CategoryCard = memo(({ item, onPress, styleLabel }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={item.image} style={styles.cardImage} />
    <View style={styleLabel}>
      <Text style={styles.cardLabelText}>{item.title}</Text>
      <Ionicons
        name={styleLabel === styles.cardLabel1 ? "paper-plane" : "navigate"}
        size={18}
        color={Colors.font2}
        style={{ marginLeft: "auto" }}
      />
    </View>
  </TouchableOpacity>
));

export default function Home() {
  const router = useRouter();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [featured, setFeatured] = useState([]);
  const [allEstablishments, setAllEstablishments] = useState([]);
  const [bestSellingFoods, setBestSellingFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation State of Location - NCMF
  const [expanded, setExpanded] = useState(false);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(-10)).current;

  // Timer ref
  const hideTimer = useRef(null);

  const toggleLocation = () => {
    if (!expanded) {
      setExpanded(true);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      hideTimer.current = setTimeout(() => collapseText(), 3000);
    } else {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      router.push("details/lgu/ncmflocation");
    }
  };

  const collapseText = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: -10,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setExpanded(false));
  };

  // ✅ Category click analytics function
  const incrementCategoryClick = async (categoryName) => {
    try {
      const categoryRef = doc(db, "category_analytics", categoryName);
      const docSnap = await getDoc(categoryRef);

      if (docSnap.exists()) {
        await updateDoc(categoryRef, { clicks: increment(1) });
      } else {
        await setDoc(categoryRef, { clicks: 1 });
      }
    } catch (err) {
      console.error("🔥 Error logging category click:", err);
    }
  };

  const cards = [
    {
      title: "Mosques",
      image: require("./../../../assets/images/homemosque2.jpg"),
      route: "tabs/homepage/masjid",
    },
    {
      title: "Education",
      image: require("./../../../assets/images/homeeducation.jpg"),
      route: "tabs/homepage/education",
    },
    {
      title: "Muslim Restaurants",
      image: require("./../../../assets/images/homerestaurant.webp"),
      route: "tabs/homepage/restaurant",
    },
  ];

  const cards2 = [
    {
      title: "Events",
      image: require("./../../../assets/images/events.jpg"),
      route: "tabs/homepage/events",
    },
    {
      title: "Promotions",
      image: require("./../../../assets/images/promotions.jpg"),
      route: "tabs/homepage/promotions",
    },
  ];

  // ✅ Fetch Firestore data
  useEffect(() => {
    try {
      const colRef = collection(db, "listings_db");

      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const establishments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data().listing,
            menu: doc.data().menu || [],
          }));
          setAllEstablishments(establishments);

          const topFeatured = establishments
            .filter((item) => item.likes > 0)
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 6);
          setFeatured(topFeatured);

          const allMenus = establishments.flatMap((item) =>
            (item.menu || []).map((food) => ({
              ...food,
              parent: item.listing_name,
            }))
          );
          const topFoods = allMenus
            .filter((food) => food.likes && food.likes > 0)
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 5);
          setBestSellingFoods(topFoods);

          setLoading(false);
        },
        (err) => {
          console.error("🔥 Firestore listener error:", err);
          setError("Failed to load data. Please try again later.");
          setLoading(false);
        }
      );

      return () => unsubscribe && unsubscribe();
    } catch (err) {
      console.error("🔥 Unexpected Firestore error:", err);
      setError("Unexpected error occurred. Please restart the app.");
      setLoading(false);
    }
  }, []);

  // ✅ Auto-scroll carousel
  useEffect(() => {
    if (!featured.length) return;
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % featured.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, featured]);

  // ✅ Memoized render functions
  const renderCarouselItem = useCallback(
    ({ item }) => {
      const handlePress = () => {
        const category = (item.category || "").toLowerCase();
        let route = null;
        switch (category) {
          case "mosque":
            route = "/details/masjid/masjiddetails";
            break;
          case "education":
            route = "/details/education/educationdetails";
            break;
          case "restaurant":
            route = "/details/restaurant/restaurantdetails";
            break;
          default:
            console.warn("No route found for category:", category);
        }
        if (route) router.push({ pathname: route, params: { id: item.id } });
      };
      return <CarouselCard item={item} onPress={handlePress} />;
    },
    [router]
  );

  const renderMenuItem = useCallback(
    ({ item }) => {
      const restaurantDoc = allEstablishments.find(
        (rest) => rest.listing_name === item.parent
      );
      if (!restaurantDoc) return null;
      const handlePress = () =>
        router.push({
          pathname: "/details/restaurant/restaurantmenu",
          params: { id: restaurantDoc.id },
        });
      return <MenuCard item={item} onPress={handlePress} />;
    },
    [allEstablishments, router]
  );

  if (loading)
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ color: Colors.font1, marginTop: 10 }}>
          Loading data, please wait...
        </Text>
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.statusCard}>
          <Ionicons
            name="alert-circle"
            size={50}
            color="red"
            style={{ marginBottom: 15 }}
          />
          <Text style={styles.statusText}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
            style={styles.retryButton}
          >
            <Text style={{ color: Colors.font2, fontWeight: "bold" }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.font2 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header */}
        <ImageBackground
          source={require("./../../../assets/images/homebackground.png")}
          style={styles.headerBackground}
          resizeMode="cover"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Bismillah,{"\n"}Begin your Journey</Text>
            <Text style={styles.subtitle}>
              Location: Baguio City, Philippines
            </Text>
          </View>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={toggleLocation}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate-outline" size={20} color={Colors.font2} />
            {expanded && (
              <Animated.Text
                style={[
                  styles.locationText,
                  {
                    opacity: opacityAnim,
                    transform: [{ translateX: translateXAnim }],
                  },
                ]}
              >
                NCMF - North Luzon is here!
              </Animated.Text>
            )}
          </TouchableOpacity>

          <View style={styles.headerBar} />
        </ImageBackground>

        {/* Featured Carousel */}
        <Text style={styles.sectionTitle}>Famous & Best Places</Text>
        {featured.length === 0 ? (
          <Text style={{ marginLeft: 20, color: "#555" }}>
            No featured places found.
          </Text>
        ) : (
          <FlatList
            ref={flatListRef}
            data={featured}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            removeClippedSubviews
            initialNumToRender={3}
            maxToRenderPerBatch={5}
            windowSize={5}
            renderItem={renderCarouselItem}
            getItemLayout={(data, index) => ({
              length: width * 0.85,
              offset: width * 0.85 * index,
              index,
            })}
          />
        )}

        {/* Main Categories */}
        <Text style={styles.sectionTitle}>Explore Establishments</Text>
        <FlatList
          data={cards}
          keyExtractor={(item, index) => item.title + index}
          renderItem={({ item }) => (
            <CategoryCard
              item={item}
              onPress={() => {
                incrementCategoryClick(item.title);
                router.push(item.route);
              }}
              styleLabel={styles.cardLabel}
            />
          )}
          horizontal={false}
          scrollEnabled={false}
          removeClippedSubviews
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={5}
        />

        {/* Communities */}
        <Text style={styles.sectionTitle}>Explore Communities</Text>
        <FlatList
          data={[
            {
              title: "Muslim Community",
              image: require("./../../../assets/images/community.jpg"),
              route: "tabs/homepage/community",
            },
          ]}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <CategoryCard
              item={item}
              onPress={() => {
                incrementCategoryClick(item.title);
                router.push(item.route);
              }}
              styleLabel={styles.cardLabel}
            />
          )}
          horizontal={false}
          scrollEnabled={false}
          removeClippedSubviews
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={3}
        />

        {/* Sub Categories */}
        <Text style={styles.sectionTitle}>Other Services</Text>
        <FlatList
          data={cards2}
          keyExtractor={(item, index) => item.title + index}
          renderItem={({ item }) => (
            <CategoryCard
              item={item}
              onPress={() => {
                incrementCategoryClick(item.title);
                router.push(item.route);
              }}
              styleLabel={styles.cardLabel1}
            />
          )}
          horizontal={false}
          scrollEnabled={false}
          removeClippedSubviews
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
        />

        {/* Best Foods */}
        <Text style={styles.sectionTitle}>Top 5 Most Liked Foods</Text>
        <View style={styles.bestSellingContainer}>
          <FlatList
            data={bestSellingFoods}
            keyExtractor={(item, index) => item.name + index}
            renderItem={renderMenuItem}
            scrollEnabled={false}
            removeClippedSubviews
            initialNumToRender={3}
            maxToRenderPerBatch={5}
            windowSize={5}
            ListEmptyComponent={
              <Text style={{ marginLeft: 20, color: "#555" }}>
                No food data available
              </Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    width: "100%",
    height: 235,
    justifyContent: "flex-end",
    paddingBottom: 35,
  },
  headerBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 15,
    backgroundColor: Colors.secondary,
  },
  content: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 24,
    color: Colors.font1,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.font2,
    marginTop: 5,
  },
  locationButton: {
    position: "absolute",
    top: 35,
    right: 20,
    backgroundColor: Colors.primary,
    elevation: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  locationText: {
    color: Colors.font2,
    marginLeft: 10,
    fontWeight: "600",
  },

  content: {
    zIndex: 1,
    paddingLeft: 25,
  },
  title: {
    fontFamily: "poppins-bold",
    fontSize: 24,
    color: Colors.font2,
  },
  subtitle: {
    fontFamily: "poppins",
    fontSize: 12,
    color: Colors.font2,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 15,
    marginBottom: 10,
    color: "rgba(49, 49, 42, 1)",
  },
  carouselCard: {
    width: width * 0.85,
    marginHorizontal: width * 0.075 / 2,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 4,
    backgroundColor: "#fff",
  },
  carouselImage: {
    width: "100%",
    height: 160,
    borderRadius: 15,
  },
  carouselOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 10,
  },
  carouselText: {
    fontFamily: "poppins-bold",
    fontSize: 16,
    color: Colors.font2,
    // 👇 Add these three lines
    numberOfLines: 1, // (for Text prop, see below)
    ellipsizeMode: "tail",
    overflow: "hidden",
  },
  bestSellingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuCard: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    marginBottom: 5,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  voteText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
    color: "#444",
  },
  cardContainer: {
    marginBottom: 1,
  },
  card: {
    borderRadius: 15,
    overflow: "hidden",
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 5,
    backgroundColor: "#fff",
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardLabel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  cardLabel1: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  cardLabelText: {
    fontFamily: "poppins-medium",
    fontSize: 16,
    color: Colors.font2,
  },
centered: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: Colors.font2,
  paddingHorizontal: 20,
},
statusCard: {
  backgroundColor: "#fff",
  padding: 30,
  borderRadius: 15,
  elevation: 5,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
},
statusText: {
  marginTop: 10,
  fontSize: 16,
  color: "#333",
  textAlign: "center",
  fontFamily: "poppins-medium",
},
retryButton: {
  marginTop: 20,
  backgroundColor: Colors.primary,
  paddingHorizontal: 25,
  paddingVertical: 10,
  borderRadius: 10,
  elevation: 3,
},
});
