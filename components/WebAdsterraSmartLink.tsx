import React from "react";
import { Platform, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";

const SMART_LINK =
  "https://www.profitablecpmratenetwork.com/gt4rsy3c5e?key=805445ad63b0dd24d450c75c44fc9dd6";

/** SmartLink (PPC) — web only; opens in new tab on web. */
export function WebAdsterraSmartLink() {
  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.wrap}
      onPress={() => Linking.openURL(SMART_LINK)}
      accessibilityRole="link"
    >
      <Text style={styles.text}>Partenaire</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 12,
    color: "#8B4513",
    textDecorationLine: "underline",
  },
});
