import { Stack } from "expo-router";

export default function LocateLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="locate" />
    </Stack>
  );
}