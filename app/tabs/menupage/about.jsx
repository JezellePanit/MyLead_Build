import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Color';
import { useRef, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import ImageViewing from "react-native-image-viewing";

export default function About() {
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [selectedSection, setSelectedSection] = useState("");

  // 🔹 Image Viewer state
  // const [visible, setVisible] = useState(false);
  // const [currentIndex, setCurrentIndex] = useState(0);

  // const images = [
  //   require("../../../assets/images/vision.png"),
  // ];

  // Section refs
  const sectionsRef = {
    "System Information": useRef(null),
    "Application Developers (Data Processors)": useRef(null),
    "Client / Project Owner (Data Controller)": useRef(null),
    // NCMF: useRef(null),
    // "Vision & Mission": useRef(null),
    "Handover Statement": useRef(null),
    "Academic Acknowledgment": useRef(null),
  };

  // ✅ Accurate scroll using measureLayout
  const scrollToSection = (section) => {
    if (sectionsRef[section]?.current && scrollViewRef.current) {
      sectionsRef[section].current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          const OFFSET = 80;
          scrollViewRef.current.scrollTo({ y: y - OFFSET, animated: true });
        },
        () => {}
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>About</Text>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.replace('tabs/menupage/menu')}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.font2} />
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedSection}
          onValueChange={(itemValue) => {
            setSelectedSection(itemValue);
            if (itemValue) scrollToSection(itemValue);
          }}
        >
          <Picker.Item label="Jump to Section..." value="" />
          {Object.keys(sectionsRef).map((sec) => (
            <Picker.Item key={sec} label={sec} value={sec} />
          ))}
        </Picker>
      </View>

      {/* Scrollable Content */}
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>


        {/* System Information */}
        <View ref={sectionsRef["System Information"]} style={styles.section}>
          <Text style={styles.sectionTitle}>System Information</Text>
          <Text style={styles.paragraph}>
            This system was developed as part of the developers’ compliance with their 
            Capstone Project requirements at STI College Baguio. It was created in close 
            collaboration with the National Commission on Muslim Filipinos – North Luzon, 
            their official client. {'\n\n'}
            
            The project aims to provide Muslim constituents, 
            tourists, and the community with a reliable directory and map-based tool to 
            easily locate mosques, madrasas, muslim restaurants, and nearby areas. {'\n\n'}
          </Text>
        </View>


        {/* Application Developers (Data Processors) */}
        <View ref={sectionsRef["Application Developers (Data Processors)"]} style={styles.section}>
          <Text style={styles.sectionTitle}>Application Developers (Data Processors)</Text>
          <Text style={styles.paragraph}>
            This project was designed, built and implemented by our dedicated development team. 
            As developers, we serve as Data Processors, which means we handle and process data 
            only during the development stage of the application. {'\n\n'}


            Developer 1 – Arabelle Stacy C. Julian – Database Designer / Administrator
            and Backend Developer {'\n\n'}

            Developer 2 – Hyacent Shahanie T. Muripaga – Project Manager, UI/UX
            Designer, Frontend Developer {'\n\n'}

            Developer 3 – Jezelle Lois A. Panit – Mobile Developer, Front and Backend 
            Developer {'\n\n'}

            Our responsibility was to build the system and ensure that it works efficiently, 
            securely, and according to the requirements of the client. {'\n\n'}

          </Text>
        </View>

        {/* Client / Project Owner (Data Controller) */}
        <View ref={sectionsRef["Client / Project Owner (Data Controller)"]} style={styles.section}>
          <Text style={styles.sectionTitle}>Client / Project Owner (Data Controller)</Text>
          <Text style={styles.paragraph}>
            The National Commission on Muslim Filipinos – North Luzon serves as the Data Controller. 
            This means they are the main authority and decision-maker on how data collected and 
            stored within the system will be managed and used. {'\n\n'}
            
            Once the system is completed and turned over, the client will fully 
            take charge of operating, administering, and maintaining the entire system. 
            They hold ownership and responsibility for the data stored and processed within 
            the application. {'\n\n'}
          </Text>
        </View>
  
        {/* NCMF */}
        {/* <View ref={sectionsRef.NCMF} style={styles.section}>
          <Text style={styles.sectionTitle}>The National Commission on Muslim Filipinos (NCMF)</Text>
          <Text style={styles.paragraph}>
            With the signing of Republic Act 9997 (otherwise known as the Act Creating the National 
            Commission on Muslim Filipinos) on February 18, 2010, the government re-affirmed its belief 
            in the importance of the active participation of Muslim Filipinos in nation building, with 
            due regard for their beliefs, customs, traditions, institutions, and aspirations.
          </Text>

          <Text style={styles.paragraph}>
            In brief, the Commission shall serve the following functions:
            {'\n\n'}
            1. Advise the President in the formulation, coordination, implementation, and monitoring 
            of policies, plans, programs, and projects affecting Muslim Filipino communities.
            {'\n\n'}
            2. Act as the primary government agency through which Muslim Filipinos may seek assistance 
            and redress, and serve as a medium through which government aid can be extended.
            {'\n\n'}
            3. Monitor and evaluate the performance of existing policies and programs that aim to 
            strengthen and uplift the socio-economic conditions of Muslim Filipinos, identifying 
            areas needing intervention and support.
            {'\n\n'}
            4. Provide legal and technical services for the survey, adjudication, titling, and development 
            of ancestral lands and settlements, issuing certificates of ancestral land/domain titles.
            {'\n\n'}
            5. Undertake studies, establish and maintain ethnographic research centers and museums on 
            the culture and institutions of Muslim Filipinos to preserve their historical heritage.
          </Text>

          <Text style={styles.paragraph}>
            The NCMF is composed of nine commissioners including the Secretary/Chief Executive Officer, 
            who represents the Commission at cabinet-level meetings with the President. It addresses both 
            local and national concerns of Muslim Filipinos, including the implementation of economic, 
            educational, cultural, and infrastructure programs.
          </Text>

          <Text style={styles.paragraph}>
            Among its main programs are the coordination of the annual Hajj pilgrimage to Makkah, 
            participation in international Qur’an reading competitions, and support for Muslim 
            students studying abroad through authentication of academic documents.
          </Text>

          <Text style={styles.paragraph}>
            Senator Juan Miguel Zubiri, the principal sponsor of RA 9997, emphasized that the 
            creation of the Commission is in consonance with national unity and development. 
            Congressman Dimaporo also underscored its role in ensuring delivery of resources 
            for education, economic, and cultural development programs for Muslims.
          </Text> */}

          {/* Link */}
          {/* <TouchableOpacity
            onPress={() => Linking.openURL('https://ncmf.gov.ph/')}
            style={styles.linkContainer}
          >
            <Ionicons name="link-outline" size={16} color="#2eaf66" />
            <Text style={styles.linkText}>https://ncmf.gov.ph/</Text>
          </TouchableOpacity>
        </View> */}

        {/* Vision & Mission */}
        {/* <View ref={sectionsRef["Vision & Mission"]} style={styles.section}>
          <Text style={styles.sectionTitle}>Vision & Mission</Text>
          <TouchableOpacity onPress={() => { setVisible(true); setCurrentIndex(0); }}>
            <Image 
              source={images[0]}
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View> */}

         {/* Handover Statement */}
        <View ref={sectionsRef["Handover Statement"]} style={styles.section}>
          <Text style={styles.sectionTitle}>Handover Statement</Text>
          <Text style={styles.paragraph}>
            After the completion of this project, full ownership and control of the application 
            will be transferred to National Commission on Muslim Filipinos – North Luzon. From 
            that point forward, they will serve as the primary administrators and operators 
            of the system, while the developers will no longer be involved in day-to-day operations 
            or management of user data. {'\n\n'}
          </Text>
        </View>

        {/* Academic Acknowledgment */}
        <View ref={sectionsRef["Academic Acknowledgment"]} style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Acknowledgment</Text>
          <Text style={styles.paragraph}>
            This project is made possible through the guidance and academic support of STI
            College - Baguio, serving as part of the developers' capstone project requirements.
          </Text>
        </View>     
             
      </ScrollView>

      {/* 🔹 Fullscreen Image Viewer */}
      {/* <ImageViewing
        images={images.map((img) => ({ uri: Image.resolveAssetSource(img).uri }))}
        imageIndex={currentIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      /> */}
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
  dropdownContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginHorizontal: 10,
  },
  scrollContent: { padding: 15 },
  section: { 
    padding: 16, 
    backgroundColor: "#fff", 
    borderRadius: 10, 
    marginBottom: 2 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2eaf66",
    textAlign: "center",
  },
  paragraph: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
    textAlign: 'justify',
  },
  image: {
    width: "100%",
    height: 400,
    marginVertical: 10,
  },
  linkContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  linkText: { marginLeft: 5, fontSize: 14, color: '#2eaf66', textDecorationLine: 'underline' },
});
