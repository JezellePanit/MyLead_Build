import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LandingPage from './../../components/LandingPage';
// import Login from './../components/Login';

export default function Index() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <LandingPage />
        {/* <Login/> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // or transparent if needed
  },
  container: {
    flex: 1,
  },
});
