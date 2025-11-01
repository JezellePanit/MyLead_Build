import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="education" />
      <Stack.Screen name="masjid" />
      <Stack.Screen name="restaurant" />
    </Stack>
  );
}