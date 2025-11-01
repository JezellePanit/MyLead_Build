import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Tabs, useLocalSearchParams, useRouter  } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Color';

export default function TabLayout() {
  const params = useLocalSearchParams();
  const router = useRouter();

  return (
  <SafeAreaView style={{flex:1, backgroundColor: Colors.font2}} edges={['bottom']}>
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: Colors.primary,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 55,
        borderTopWidth: 0,
        elevation: 50,
        position: 'absolute',
        },
      tabBarItemStyle: {
        height: 70,
        width: 70,
        marginTop: 10,
        }
    }}
    >
        
    {/* Home Tab */}
    <Tabs.Screen
      name="homepage"
      initialParams={params}
      listeners={{
        tabPress: (e) => {
          e.preventDefault(); // prevent default behavior
          router.push("/tabs/homepage/home"); // ✅ force reset to home.jsx
        },
      }}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={{alignItems: 'center', width: 100}}>
            <Feather name="home" size={24} color={focused ? Colors.font1: Colors.font2} />
            <Text style={{fontSize: 12, color: focused ? Colors.font1: Colors.font2,}}> Home </Text>
          </View>
        ),
      }}
    />

    {/* Locate */}
    <Tabs.Screen
      name="locationpage"
      initialParams={params}
      listeners={{
        tabPress: (e) => {
          e.preventDefault();
          router.push("/tabs/locationpage/locate");
        },
      }}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={{alignItems: 'center', width: 100}}>
            <MaterialIcons name="travel-explore" size={24} color={focused ? Colors.font1 : Colors.font2} />
            <Text style={{fontSize: 12, color: focused ? Colors.font1: Colors.font2,}}> Explore </Text>
          </View>
        ),
      }}
    />

    {/* Menu */}
    <Tabs.Screen
      name="menupage"
      initialParams={params}
      listeners={{
        tabPress: (e) => {
          e.preventDefault(); 
          router.push("/tabs/menupage/menu"); 
        },
      }}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={{alignItems: 'center', width: 100}}>
            <Feather name="menu" size={24} color={focused ? Colors.font1: Colors.font2} />
            <Text style={{fontSize: 12, color: focused ? Colors.font1: Colors.font2,}}> Menu </Text>
          </View>
        ),
      }}
    />

    </Tabs>
  </SafeAreaView>
  );
}