//firebase
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase-config';

import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Color";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

export default function Contact() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = params.id; // Firestore document ID

  const [contact, setContact] = useState({
    name: '',
    phone: '',
    email: '',
    socialLinks: []
  });

  useEffect(() => {
    if (!eventId) return;

    const docRef = doc(db, 'campaigns_db', eventId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log("Firestore event contact data:", data);

        setContact({
          name: data.organizer?.organizer_name || '',
          phone: data.organizer?.phone || '',
          email: data.organizer?.email || '',
          socialLinks: data.organizer?.socialLinks || []
        });
      }
    });

    return () => unsubscribe();
  }, [eventId]);

  const handlePress = (url) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.header_text}>Contact Us</Text>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => router.replace('tabs/homepage/events')}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.font2} />
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>
          Feel free to reach out to us through the details below. 
          We’d be happy to answer your questions or provide assistance.
        </Text>

        {/* Organizer Name */}
        {contact.name ? (
          <View style={styles.card}>
            <Ionicons name="person" size={20} color={Colors.primary} />
            <Text style={styles.value}>{contact.name}</Text>
          </View>
        ) : null}

        {/* Phone */}
        {contact.phone ? (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress(`tel:${contact.phone}`)}
          >
            <Ionicons name="call" size={20} color={Colors.primary} />
            <Text style={styles.value}>{contact.phone}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Email */}
        {contact.email ? (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress(`mailto:${contact.email}`)}
          >
            <Ionicons name="mail" size={20} color={Colors.primary} />
            <Text style={styles.value}>{contact.email}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Social Links */}
        {contact.socialLinks.length > 0 && contact.socialLinks.map((link, index) => {
          let url = '';
          let icon = 'globe';

          if (typeof link === 'string') {
            url = link;
          } else if (typeof link === 'object' && link?.url) {
            url = link.url;
            icon =
              link.platform === 'facebook' ? 'logo-facebook' :
              link.platform === 'instagram' ? 'logo-instagram' :
              link.platform === 'twitter' ? 'logo-twitter' :
              'globe';
          } else {
            return null; // skip invalid link
          }

          return (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handlePress(url)}
            >
              <Ionicons name={icon} size={20} color={Colors.primary} />
              <Text style={styles.value}>{url.replace("https://", "")}</Text>
            </TouchableOpacity>
          );
        })}
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
  description: {
    fontSize: 16,
    color: "#555",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
    textAlign: "justify",
    lineHeight: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBFCF0",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  value: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 14,
    color: "#444",
  },
});
