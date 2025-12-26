import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function InviteRedirect() {
  const { code } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (code) {
      console.log(
        `[INVITE] Received referral code: ${code}, redirecting to registration...`
      );
      // Redirect to auth page with sponsor code pre-filled
      router.replace({
        pathname: "/auth",
        params: { sponsor: code, mode: "register" },
      });
    } else {
      router.replace("/auth");
    }
  }, [code, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
