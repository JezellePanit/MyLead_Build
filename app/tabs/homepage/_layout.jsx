import { Stack } from "expo-router";
import { CopilotProvider } from "react-native-copilot";

export default function HomeLayout() {
  return (
    <CopilotProvider
      labels={{
        finish: "Got it",
        next: "Next",
        previous: "Back",
        skip: "Skip",
      }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="education" />
        <Stack.Screen name="masjid" />
        <Stack.Screen name="restaurant" />
      </Stack>
    </CopilotProvider>
  );
}
