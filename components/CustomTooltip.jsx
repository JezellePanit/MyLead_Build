import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/Color";

export default function CustomTooltip({ isFirstStep, isLastStep, handleNext, handlePrev, handleStop, currentStep }) {
  return (
    <View style={styles.tooltipContainer}>
      <Text style={styles.tooltipText}>{currentStep?.text}</Text>
      <View style={styles.buttonRow}>
        {!isFirstStep && (
          <TouchableOpacity style={styles.button} onPress={handlePrev}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
        )}
        {!isLastStep ? (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleStop}>
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.skipButton} onPress={handleStop}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltipContainer: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    maxWidth: 280,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: { color: Colors.primary, fontWeight: "bold" },
  skipButton: {
    marginLeft: 10,
  },
  skipText: { color: "#fff", textDecorationLine: "underline" },
});
