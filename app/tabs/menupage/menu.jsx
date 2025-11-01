import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Color';

export default function Menu() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
          </View>

          {/* General Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>

            <TouchableOpacity style={styles.option} onPress={() => router.push('tabs/menupage/report')}>
              <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
              <Text style={styles.optionText}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => router.push('tabs/menupage/privacypolicy')}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
              <Text style={styles.optionText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => router.push('tabs/menupage/about')}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.optionText}>About</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
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
  section: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});
