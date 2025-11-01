import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Color';

export default function PrivacyPolicy() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL('mailto:ncmf_mylead@gmail.com');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.header_text}>Privacy Policy</Text>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.replace('tabs/menupage/menu')}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.font2} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.effectiveDate}>Effective Date: November 2025</Text>

        <Text style={styles.paragraph}>
          This Privacy Policy explains how <Text style={{ fontWeight: 'bold' }}> MyLead </Text>
          collects, uses, and protects your personal information in compliance with the
          Data Privacy Act of 2012 (RA 10173).
          {'\n'}
        </Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          MYLEAD Development Team, STI College Baguio (“we,” “our,” or “us”) is the developer and
          data processor of the Admin Panel and Mobile Application (the “Services”) for National
          Commission on Muslim Filipinos - North Luzon, which acts as the data controller. We value
          and respect the privacy of all users.{'\n'}
          {'\n'}
          This Privacy Policy explains how data is collected, used, stored, and protected in
          compliance with the Data Privacy Act of 2012 (RA 10173), National Privacy Commission (NPC)
          guidelines, and applicable DICT regulations. {'\n'}
          {'\n'}
          This policy applies to all users of the Services, including:{'\n'}
          {'\n'}
          • Admin employees of client organizations (e.g., NCMF - North Luzon employees){'\n'}
          • Establishment owners or representatives (secondary users){'\n'}
          • Mobile app end-users
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information from three types of users:{'\n\n'}
          <Text style={{ fontWeight: 'bold' }}>A. Admin System Users (Client’s Employees / Administrators)</Text>{'\n'}
          Through the Admin Settings module, we collect information about employees assigned to
          manage the system, including:{'\n'}
          {'\n'}
          • Full name{'\n'}
          • Position / designation{'\n'}
          • Date of birth{'\n'}
          • Work email address{'\n'}
          • Phone number{'\n'}
          • Short biography or profile description{'\n'}
          • Office assignment or location (e.g., NCMF North Luzon branch){'\n'}
          • Profile images{'\n\n'}
          <Text style={{ fontWeight: 'bold' }}>B. Establishment Owners / Representatives</Text>{'\n'}
          Data about establishments is entered into the system by authorized employees only after
          obtaining the owners’ consent, including:{'\n'}
          {'\n'}
          We collect the following information to create and manage establishment listings:{'\n'}
          {'\n'}
          • Representative’s name, phone number, and email address{'\n'}
          • Establishment details (name, category, operating hours, location coordinates, and short
          history){'\n'}
          • Contact information such as social media links and website{'\n'}
          • Menu list (for establishments in the restaurant category){'\n'}
          • Images of the establishment (e.g., photos of the location or business premises){'\n'}
          • Images of restaurant menus (if applicable){'\n\n'}
          <Text style={{ fontWeight: 'bold' }}>C. Mobile Application Users (End-Users)</Text>{'\n'}
          For mobile app users, we collect limited information to enable app functionality,
          including:{'\n'}
          {'\n'}
          • Name and email address (for communication and report handling){'\n'}
          • Location data (with user permission, for map and locator features){'\n'}
          • Internet connectivity status (to ensure app functionality){'\n'}
          • System/Usage Data such as IP address, device information, operating system, and logs
          (automatically collected by our servers or service providers){'\n\n'}
          <Text style={{ fontWeight: 'bold' }}>Storage of Images</Text>{'\n'}
          All images collected (admin profile images, establishment photos, and restaurant menu
          images) are stored locally within our secure system folders. Access is restricted to
          authorized personnel only.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Collect Data</Text>
        <Text style={styles.paragraph}>
          We collect data in the following ways:{'\n\n'}
          <Text style={{ fontWeight: 'bold' }}>A. Directly from Users</Text>{'\n'}
          • Mobile App End-Users: When submitting reports or issues through the application, users
          provide basic information (e.g., name, email, and report details). This information is
          transmitted to the admin panel so that assigned employees can take appropriate action.{'\n'}
          • Establishment Owners / Representatives: Establishment-related data is entered into the
          system by authorized employees of NCMF, but only after obtaining the consent of the
          establishment owners or their representatives.{'\n\n'}
          <Text style={{ fontWeight: 'bold' }}>B. Automatically Through Devices and Systems</Text>{'\n'}
          When users interact with the mobile application, certain technical information is
          automatically collected to enable functionality and maintain security, including:{'\n'}
          {'\n'}
          • Location data (if permission is granted by the user){'\n'}
          • Internet connectivity status{'\n'}
          • Device and system information such as IP address, operating system, and activity
          logs{'\n\n'}
          <Text style={{ fontWeight: 'bold' }}>C. From Third-Party Services</Text>{'\n'}
          We use trusted third-party service providers to support our system:{'\n'}
          {'\n'}
          • Firebase for database hosting and authentication services to securely store and manage
          user and system data.{'\n'}
          • Google Maps API to provide mapping, geolocation, and locator functionalities within the
          application.
        </Text>

        <Text style={styles.sectionTitle}>4. Purpose of Processing</Text>
        <Text style={styles.paragraph}>
          We process data for legitimate purposes, including:{'\n'}
          {'\n'}
          • Admin account management and authentication{'\n'}
          • Directory listing and display of establishment details{'\n'}
          • Enabling map, locator, and reporting features{'\n'}
          • Communication with users regarding reports or issues{'\n'}
          • Enhancing app performance, features, and user experience{'\n'}
          • Ensuring system security and fraud prevention{'\n'}
          • Compliance with legal and regulatory obligations
        </Text>

        <Text style={styles.sectionTitle}>5. Data Sharing and Disclosure</Text>
        <Text style={styles.paragraph}>
          We do not sell or rent personal information. Data may only be shared:{'\n'}
          {'\n'}
          • With authorized government agencies, when required by law{'\n'}
          • With trusted third-party service providers supporting our system (e.g., Firebase, Google
          Maps), under data protection agreements{'\n'}
          • When necessary to protect security, rights, or comply with legal obligations
        </Text>

        <Text style={styles.sectionTitle}>6. Data Retention and Disposal</Text>
        <Text style={styles.paragraph}>
          • Data is retained only as long as necessary for the stated purposes or as required by
          law.{'\n'}
          • When no longer needed, data is securely deleted, anonymized, or disposed of in
          accordance with NPC guidelines
        </Text>

        <Text style={styles.sectionTitle}>7. Rights of Data Subjects</Text>
        <Text style={styles.paragraph}>
          Users have the right to:{'\n'}
          {'\n'}
          • Be informed about the collection and use of their data{'\n'}
          • Access and obtain a copy of their personal data{'\n'}
          • Request correction of inaccurate or outdated information{'\n'}
          • Withdraw consent and object to processing (subject to legal obligations){'\n'}
          • Request deletion of data when no longer needed{'\n'}
          • File a complaint with the National Privacy Commission (NPC)
        </Text>

        <Text style={styles.sectionTitle}>8. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement technical and organizational measures to protect data:{'\n'}
          {'\n'}
          • Encryption of sensitive information{'\n'}
          • Role-based access control and authentication{'\n'}
          • Regular monitoring, updates, and patches{'\n'}
          • Incident response protocols in case of data breaches{'\n'}
          • Security awareness training for authorized employees
        </Text>

        <Text style={styles.sectionTitle}>9. Data Protection Officer (DPO)</Text>
        <Text style={styles.paragraph}>
          We are in the process of appointing a Data Protection Officer (DPO) who will be
          responsible for overseeing compliance with this Privacy Policy and the Data Privacy Act of
          2012 (RA 10173). {'\n'}
          {'\n'}
          Once appointed, the DPO will serve as the primary point of contact for any questions or
          concerns regarding the collection, use, or protection of personal data.{'\n'}
          Contact Information:{'\n'}
          {'\n'}
          • Name/Designation: To be appointed{'\n'}
          • Email: To be updated{'\n'}
          • Phone: To be updated{'\n'}
          • Office Address: To be updated
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to this Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy to reflect regulatory changes, improvements in the
          system, or new features. Significant changes will be communicated via app notifications or
          announcements in the Admin Panel.
        </Text>

        <Text style={styles.sectionTitle}>11. Governing Laws and Regulations</Text>
        <Text style={styles.paragraph}>
          This Privacy Policy complies with:{'\n'}
          {'\n'}
          • Republic Act No. 10173 (Data Privacy Act of 2012){'\n'}
          • Implementing Rules and Regulations (IRR) of RA 10173{'\n'}
          • NPC Circulars and Advisories{'\n'}
          • DICT National Cybersecurity Plan (NCSP) 2023–2028 and related circulars
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.font2,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header_text: {
    fontFamily: 'poppins-bold',
    fontSize: 22,
    color: Colors.font2,
  },
  backIcon: {
    position: 'absolute',
    left: 20,
    top: 18,
  },
  effectiveDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 6,
    color: Colors.primary,
  },
  paragraph: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'justify',
  },
  link: {
    color: Colors.primary,
  },
});
