import { Stack } from "expo-router";
import { CopilotProvider } from "react-native-copilot";

export default function MainLayout() {
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
        <Stack.Screen name="index" />
      </Stack>
    </CopilotProvider>
  );
}
