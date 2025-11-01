import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { 
  Image, 
  ImageBackground, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Modal, 
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Colors } from './../constants/Color';
import Checkbox from 'expo-checkbox';

export default function LandingPage() {
  const router = useRouter();
  const [showTerms, setShowTerms] = useState(false);
  const [isChecked, setIsChecked] = useState(false); 
  const [showPrivacy, setShowPrivacy] = useState(false);
  const scrollViewRef = useRef(null); 

  // Scroll to top whenever Privacy Policy opens
  useEffect(() => {
    if (showPrivacy && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [showPrivacy]);


  useEffect(() => {
    const checkTerms = async () => {
      const accepted = await AsyncStorage.getItem('termsAccepted');
      if (!accepted) {
        setShowTerms(false);
      }
    };
    checkTerms();
  }, []);

  // Request location permission and fetch user location
const requestLocationAndNavigate = async (retryCount = 0) => {
  try {
    // Check existing permission first
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    let status = existingStatus;

    // Request permission if not granted
    if (status !== 'granted') {
      const { status: requestedStatus } = await Location.requestForegroundPermissionsAsync();
      status = requestedStatus;
    }

    if (status !== 'granted') {
      Alert.alert(
        "Location Permission Needed",
        "Please allow location access to use the app."
      );
      return;
    }

    // Get user's current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    console.log('User location:', location.coords);

    // Navigate to homepage and pass location
    router.push('/tabs/homepage/home', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });

  } catch (error) {
    console.log("Error accessing location:", error);

    // Retry up to 3 times with a 1-second delay
    if (retryCount < 3) {
      setTimeout(() => {
        requestLocationAndNavigate(retryCount + 1);
      }, 1000);
    } else {
      Alert.alert(
        "Error",
        "Unable to access your location. Please check your device settings."
      );
    }
  }
};

  const handleLeadMe = async () => {
    const accepted = await AsyncStorage.getItem('termsAccepted');
    if (accepted) {
      // Already accepted, request location and navigate
      await requestLocationAndNavigate();
    } else {
      setShowTerms(true); // Show Terms modal
    }
  };

  const handleAgree = async () => {
    if (!isChecked) return;

    // Save that the user accepted terms
    await AsyncStorage.setItem('termsAccepted', 'true');
    setShowTerms(false);

    // Request permission and navigate
    await requestLocationAndNavigate();
  };

  return (
    <ImageBackground
      source={require('./../assets/images/Landing_Background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay */}
      <View style={styles.dim} />

      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require('./../assets/images/MyLead_Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Button */}
        <TouchableOpacity onPress={handleLeadMe} style={styles.button}>
          <Text style={styles.buttonText}>Lead Me &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={showTerms} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            {/* Title */}
            <Text style={styles.title}>
              {showPrivacy ? "MyLead – Privacy Policy" : "MyLead – Terms and Conditions"}
            </Text>

            {/* Scrollable content */}
            <ScrollView style={styles.scroll} ref={scrollViewRef}>
              {!showPrivacy ? (
                <>
                  <Text style={styles.section}>
                    Welcome to <Text style={{ fontWeight: "bold" }}>MyLead</Text>. By clicking
                    <Text style={{ fontWeight: "bold" }}> “I Agree”</Text> and using this application,
                    you acknowledge and accept the following Terms and Conditions.
                    {"\n"}
                  </Text>

                  <Text style={styles.header}>1. Use of the Application</Text>
                  <Text style={styles.section}>
                    • MyLead helps users locate Muslim- related facilities and establishments, and submit
                    reports or inquiries.{"\n"}
                    • You agree to use the app only for lawful purposes. Misuse (e.g., false reports,
                    harmful content) is strictly prohibited.
                  </Text>

                  <Text style={styles.header}>2. Privacy and Data Protection</Text>
                  <Text style={styles.section}>
                    • We value your privacy and follow the Data Privacy Act of 2012 (RA 10173).{"\n"}
                    • By using this app, you consent to the collection and use of your information as
                    described in our Privacy Policy.
                  </Text>

                  <Text style={styles.header}>3. Permissions</Text>
                  <Text style={styles.section}>
                    • The app may request access to your location, storage, or camera.{"\n"}
                    • You may deny permissions, but some features may not work properly.
                  </Text>

                  <Text style={styles.header}>4. User Responsibilities</Text>
                  <Text style={styles.section}>
                    • You are responsible for the accuracy of data or reports you submit.{"\n"}
                    • Do not share third-party personal data without consent.{"\n"}
                    • Do not attempt unauthorized access, reverse engineering, or any harmful actions.
                  </Text>

                  <Text style={styles.header}>5. Security</Text>
                  <Text style={styles.section}>
                    • We implement safeguards to protect your data.{"\n"}
                    • While we take precautions, absolute security cannot be guaranteed.
                  </Text>

                  <Text style={styles.header}>6. Updates and Changes</Text>
                  <Text style={styles.section}>
                    • Terms may be updated occasionally.{"\n"}
                    • Continued use after updates means you accept the revised Terms.
                  </Text>

                  <Text style={styles.header}>7. Limitation of Liability</Text>
                  <Text style={styles.section}>
                    • MyLead and its developers are not liable for indirect, incidental, or
                    consequential damages from use of the app.
                  </Text>

                  <Text style={styles.header}>8. Governing Laws</Text>
                  <Text style={styles.section}>
                    • These Terms are governed by the laws of the Republic of the Philippines,
                    including the Data Privacy Act of 2012 (RA 10173).
                  </Text>

                  <Text style={styles.section}>
                    {"\n"}
                    If you do not agree with these Terms, please discontinue use or uninstall the
                    application.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.section}>
                    This Privacy Policy explains how <Text style={{ fontWeight: "bold" }}> MyLead </Text> 
                    collects, uses, and protects your personal information in compliance with the 
                    Data Privacy Act of 2012 (RA 10173).
                    {"\n"}
                  </Text>

  <Text style={styles.header}>1. Introduction</Text>
  <Text style={styles.section}>
    MYLEAD Development Team, STI College Baguio (“we,” “our,” or “us”) is the developer and data processor of the Admin Panel and Mobile Application (the “Services”) for National Commission on Muslim Filipinos - North Luzon, which acts as the data controller. We value and respect the privacy of all users.{"\n"}
    {"\n"}
    This Privacy Policy explains how data is collected, used, stored, and protected in compliance with the Data Privacy Act of 2012 (RA 10173), National Privacy Commission (NPC) guidelines, and applicable DICT regulations. {"\n"}
    {"\n"}
    This policy applies to all users of the Services, including:{"\n"}
    {"\n"}
    • Admin employees of client organizations (e.g., NCMF - North Luzon employees){"\n"}
    • Establishment owners or representatives (secondary users){"\n"}
    • Mobile app end-users
  </Text>

  <Text style={styles.header}>2. Information We Collect</Text>
  <Text style={styles.section}>
    We collect information from three types of users:{"\n\n"}

    <Text style={{fontWeight: 'bold'}}>A. Admin System Users (Client’s Employees / Administrators)</Text>{"\n"}
    Through the Admin Settings module, we collect information about employees assigned to manage the system, including:{"\n"}
    {"\n"}
    • Full name{"\n"}
    • Position / designation{"\n"}
    • Date of birth{"\n"}
    • Work email address{"\n"}
    • Phone number{"\n"}
    • Short biography or profile description{"\n"}
    • Office assignment or location (e.g., NCMF North Luzon branch){"\n"}
    • Profile images{"\n\n"}

    <Text style={{fontWeight: 'bold'}}>B. Establishment Owners / Representatives</Text>{"\n"}
    Data about establishments is entered into the system by authorized employees only after obtaining the owners’ consent, including:{"\n"}
    {"\n"}
    We collect the following information to create and manage establishment listings:{"\n"}
    {"\n"}
    • Representative’s name, phone number, and email address{"\n"}
    • Establishment details (name, category, operating hours, location coordinates, and short history){"\n"}
    • Contact information such as social media links and website{"\n"}
    • Menu list (for establishments in the restaurant category){"\n"}
    • Images of the establishment (e.g., photos of the location or business premises){"\n"}
    • Images of restaurant menus (if applicable){"\n\n"}

    <Text style={{fontWeight: 'bold'}}>C. Mobile Application Users (End-Users)</Text>{"\n"}
    For mobile app users, we collect limited information to enable app functionality, including:{"\n"}
    {"\n"}
    • Name and email address (for communication and report handling){"\n"}
    • Location data (with user permission, for map and locator features){"\n"}
    • Internet connectivity status (to ensure app functionality){"\n"}
    • System/Usage Data such as IP address, device information, operating system, and logs (automatically collected by our servers or service providers){"\n\n"}

    <Text style={{fontWeight: 'bold'}}>Storage of Images</Text>{"\n"}
    All images collected (admin profile images, establishment photos, and restaurant menu images) are stored locally within our secure system folders. Access is restricted to authorized personnel only.
  </Text>

  <Text style={styles.header}>3. How We Collect Data</Text>
  <Text style={styles.section}>
    We collect data in the following ways:{"\n\n"}

    <Text style={{fontWeight: 'bold'}}>A. Directly from Users</Text>{"\n"}
    • Mobile App End-Users: When submitting reports or issues through the application, users provide basic information (e.g., name, email, and report details). This information is transmitted to the admin panel so that assigned employees can take appropriate action.{"\n"}
    • Establishment Owners / Representatives: Establishment-related data is entered into the system by authorized employees of NCMF, but only after obtaining the consent of the establishment owners or their representatives.{"\n\n"}

    <Text style={{fontWeight: 'bold'}}>B. Automatically Through Devices and Systems</Text>{"\n"}
    When users interact with the mobile application, certain technical information is automatically collected to enable functionality and maintain security, including:{"\n"}
    {"\n"}
    • Location data (if permission is granted by the user){"\n"}
    • Internet connectivity status{"\n"}
    • Device and system information such as IP address, operating system, and activity logs{"\n\n"}

    <Text style={{fontWeight: 'bold'}}>C. From Third-Party Services</Text>{"\n"}
    We use trusted third-party service providers to support our system:{"\n"}
    {"\n"}
    • Firebase for database hosting and authentication services to securely store and manage user and system data.{"\n"}
    • Google Maps API to provide mapping, geolocation, and locator functionalities within the application.
  </Text>

  <Text style={styles.header}>4. Purpose of Processing</Text>
  <Text style={styles.section}>
    We process data for legitimate purposes, including:{"\n"}
    {"\n"}
    • Admin account management and authentication{"\n"}
    • Directory listing and display of establishment details{"\n"}
    • Enabling map, locator, and reporting features{"\n"}
    • Communication with users regarding reports or issues{"\n"}
    • Enhancing app performance, features, and user experience{"\n"}
    • Ensuring system security and fraud prevention{"\n"}
    • Compliance with legal and regulatory obligations
  </Text>

    <Text style={styles.header}>5. Data Sharing and Disclosure</Text>
  <Text style={styles.section}>
    We do not sell or rent personal information. Data may only be shared:{"\n"}
    {"\n"}
    • With authorized government agencies, when required by law{"\n"}
    • With trusted third-party service providers supporting our system (e.g., Firebase, Google Maps), under data protection agreements{"\n"}
    • When necessary to protect security, rights, or comply with legal obligations
  </Text>

  <Text style={styles.header}>6. Data Retention and Disposal</Text>
  <Text style={styles.section}>
    • Data is retained only as long as necessary for the stated purposes or as required by law.{"\n"}
    • When no longer needed, data is securely deleted, anonymized, or disposed of in accordance with NPC guidelines
  </Text>

  <Text style={styles.header}>7. Rights of Data Subjects</Text>
  <Text style={styles.section}>
    Users have the right to:{"\n"}
    {"\n"}
    • Be informed about the collection and use of their data{"\n"}
    • Access and obtain a copy of their personal data{"\n"}
    • Request correction of inaccurate or outdated information{"\n"}
    • Withdraw consent and object to processing (subject to legal obligations){"\n"}
    • Request deletion of data when no longer needed{"\n"}
    • File a complaint with the National Privacy Commission (NPC)
  </Text>

  <Text style={styles.header}>8. Data Security</Text>
  <Text style={styles.section}>
    We implement technical and organizational measures to protect data:{"\n"}
    {"\n"}
    • Encryption of sensitive information{"\n"}
    • Role-based access control and authentication{"\n"}
    • Regular monitoring, updates, and patches{"\n"}
    • Incident response protocols in case of data breaches{"\n"}
    • Security awareness training for authorized employees
  </Text>

  <Text style={styles.header}>9. Data Protection Officer (DPO)</Text>
  <Text style={styles.section}>
    We are in the process of appointing a Data Protection Officer (DPO) who will be responsible for overseeing compliance with this Privacy Policy and the Data Privacy Act of 2012 (RA 10173). {"\n"}
    {"\n"}
    Once appointed, the DPO will serve as the primary point of contact for any questions or concerns regarding the collection, use, or protection of personal data.{"\n"}
    Contact Information:{"\n"}
    {"\n"}
    • Name/Designation: To be appointed{"\n"}
    • Email: To be updated{"\n"}
    • Phone: To be updated{"\n"}
    • Office Address: To be updated
  </Text>

  <Text style={styles.header}>10. Changes to this Privacy Policy</Text>
  <Text style={styles.section}>
    We may update this Privacy Policy to reflect regulatory changes, improvements in the system, or new features. Significant changes will be communicated via app notifications or announcements in the Admin Panel.
  </Text>

  <Text style={styles.header}>11. Governing Laws and Regulations</Text>
  <Text style={styles.section}>
    This Privacy Policy complies with:{"\n"}
    {"\n"}
    • Republic Act No. 10173 (Data Privacy Act of 2012){"\n"}
    • Implementing Rules and Regulations (IRR) of RA 10173{"\n"}
    • NPC Circulars and Advisories{"\n"}
    • DICT National Cybersecurity Plan (NCSP) 2023–2028 and related circulars
  </Text>
                </>
              )}
            </ScrollView>

            {/* Checkbox only shown in Terms view */}
            {!showPrivacy && (
              <View style={styles.checkboxContainer}>
                <Checkbox
                  value={isChecked}
                  onValueChange={setIsChecked}
                  color={isChecked ? Colors.primary : undefined}
                />
                <Text style={styles.checkboxText}>
                  I have read and agree to the{" "}
                  <Text 
                    style={styles.link} 
                    onPress={() => setShowPrivacy(true)} // swap content
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.modalButtons}>
              {showPrivacy ? (
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: Colors.primary }]}
                  onPress={() => setShowPrivacy(false)}
                >
                  <Text style={styles.modalButtonText}>Back to Terms</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.modalButton, 
                      { backgroundColor: isChecked ? Colors.primary : '#aaa' }
                    ]}
                    onPress={handleAgree}
                    disabled={!isChecked}
                  >
                    <Text style={styles.modalButtonText}>I Agree</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: 'gray' }]}
                    onPress={() => setShowTerms(false)}
                  >
                    <Text style={styles.modalButtonText}>Decline</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
  },
  container: {
    zIndex: 2,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 500,
    height: 140,
    marginBottom: 20,
    marginTop: 210,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: Colors.font2,
    textAlign: 'center',
    fontFamily: 'poppins-bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  scroll: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  header: {
    fontWeight: "bold",
    marginTop: 10,
  },
  section: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
    color: "#333",
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  link: {
    color: Colors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
