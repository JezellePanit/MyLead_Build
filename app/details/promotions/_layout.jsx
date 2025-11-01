import { MaterialIcons, Entypo, Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { Tabs, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Color';

export default function _layout() {
  const params = useLocalSearchParams();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.font2 }} edges={['bottom']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
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
          },
        }}
      >
        {/* Details */}
        <Tabs.Screen
          name="promotionsdetails"
          initialParams={params}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center', width: 100 }}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={focused ? Colors.font1 : Colors.font2}
                />
                <Text style={{ fontSize: 12, color: focused ? Colors.font1 : Colors.font2 }}>Info</Text>
              </View>
            ),
          }}
        />

        {/* Location */}
        <Tabs.Screen
          name="promotionslocation"
          initialParams={params}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center', width: 100 }}>
                <Ionicons
                  name="location-sharp"
                  size={24}
                  color={focused ? Colors.font1 : Colors.font2}
                />
                <Text style={{ fontSize: 12, color: focused ? Colors.font1 : Colors.font2 }}>Location</Text>
              </View>
            ),
          }}
        />

        {/* Contact */}
        <Tabs.Screen
          name="contact"
          initialParams={params}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center', width: 100 }}>
                <FontAwesome6
                  name="contact-book"
                  size={24}
                  color={focused ? Colors.font1 : Colors.font2}
                />
                <Text style={{ fontSize: 12, color: focused ? Colors.font1 : Colors.font2 }}>
                  Contact Us
                </Text>
              </View>
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
