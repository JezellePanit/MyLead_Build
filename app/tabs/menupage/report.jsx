import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../../constants/Color";
import { Picker } from "@react-native-picker/picker";
import { addDoc, collection, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase-config";

export default function Report() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [reports, setReports] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [otherCategory, setOtherCategory] = useState("");
  const [lockedEmail, setLockedEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Problems / Issues",
    "Inquiries / Questions",
    "Feedback / Suggestions",
    "Complaints",
  ];

  // Load saved reports
  useEffect(() => {
    const loadReports = async () => {
      try {
        const savedReports = await AsyncStorage.getItem("userReports");
        if (savedReports) {
          const parsedReports = JSON.parse(savedReports);
          setReports(parsedReports);
          setSubmitted(parsedReports.length > 0);
        } else {
          setSubmitted(false);
        }
      } catch (error) {
        console.error("Error loading reports:", error);
        setSubmitted(false);
      }
    };
    loadReports();
  }, []);

  // Load locked email
  useEffect(() => {
    const loadLockedEmail = async () => {
      const savedEmail = await AsyncStorage.getItem("lockedEmail");
      if (savedEmail) {
        setLockedEmail(savedEmail);
        setEmail(savedEmail);
      }
    };
    loadLockedEmail();
  }, []);

  const handleSubmit = async () => {
    const finalCategory =
      category === "Others"
        ? otherCategory.trim()
          ? `Others: ${otherCategory.trim()}`
          : "Others"
        : category;

    const meaningfulDescription = description.replace(/\s/g, "");
    if (!name.trim() || !email.trim() || !finalCategory || meaningfulDescription.length === 0) {
      Alert.alert("Incomplete Fields", "Please fill out all fields before submitting.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!lockedEmail) {
      await AsyncStorage.setItem("lockedEmail", email);
      setLockedEmail(email);
    } else if (lockedEmail !== email) {
      Alert.alert("Email Locked", `You must use the email "${lockedEmail}" for all reports.`);
      setEmail(lockedEmail);
      return;
    }

    try {
      setLoading(true); // Show spinner immediately
      const now = new Date();

      const newReport = {
        name,
        email,
        category: finalCategory,
        description,
        createdAt: serverTimestamp(),
        localCreatedAt: now.toISOString(),
      };

      const docRef = await addDoc(collection(db, "report_db"), newReport);

      // ✅ No need for getDoc() — use our local data
      const localReport = { id: docRef.id, ...newReport };

      const updatedReports = [localReport, ...reports];
      await AsyncStorage.setItem("userReports", JSON.stringify(updatedReports));
      setReports(updatedReports);
      setSubmitted(true);
      resetForm();

      const hour = now.getHours();
      const minute = now.getMinutes().toString().padStart(2, "0");
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = dayNames[now.getDay()];
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      const formattedTime = `${displayHour}:${minute} ${ampm}`;

      const withinOfficeHours =
        hour >= 8 && hour < 17 && now.getDay() >= 1 && now.getDay() <= 5;

      let message = `Date and Time of Submission: ${dayName}, ${formattedTime}\n\n`;

      if (withinOfficeHours) {
        message +=
          "Your report has been successfully submitted.\n\nSubmissions received during official office hours (8:00 AM – 5:00 PM, Monday to Friday) are reviewed within the same day.";
      } else if (now.getDay() === 0 || now.getDay() === 6) {
        message +=
          "Your report has been successfully submitted.\n\nPlease note that the office is closed on weekends. Reports sent on Saturdays or Sundays will be reviewed on the next working day (Monday–Friday, 8:00 AM – 5:00 PM).";
      } else {
        message +=
          "Your report has been successfully submitted.\n\nSubmissions made outside of office hours (8:00 AM – 5:00 PM) will be reviewed on the next working day.";
      }

      Alert.alert("Report Submission Confirmation", message, [{ text: "OK" }]);
    } catch (error) {
      console.error("Error saving report:", error.message);
      Alert.alert("Submission Failed", "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail(lockedEmail || "");
    setCategory("");
    setOtherCategory("");
    setDescription("");
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Report", "Are you sure you want to delete this report?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const docRef = doc(db, "report_db", id);
            await deleteDoc(docRef);

            const updatedReports = reports.filter((r) => r.id !== id);
            setReports(updatedReports);
            await AsyncStorage.setItem("userReports", JSON.stringify(updatedReports));

            if (updatedReports.length === 0) {
              setSubmitted(false);
              resetForm();
              setLockedEmail(null);
              await AsyncStorage.removeItem("lockedEmail");
            }

            Alert.alert("Deleted", "Report has been deleted successfully.");
          } catch (error) {
            console.error("Error deleting report:", error.message);
            Alert.alert("Delete Failed", error.message);
          }
        },
      },
    ]);
  };

  const handleDescriptionChange = (text) => {
    const trimmedText = text.replace(/\s+/g, " ");
    let meaningfulCount = 0;
    let result = "";
    for (let char of trimmedText) {
      if (char !== " " && char !== "\n") meaningfulCount++;
      if (meaningfulCount > 200) break;
      result += char;
    }
    setDescription(result);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.header}>
          <Text style={styles.header_text}>Report</Text>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => router.replace("tabs/menupage/menu")}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.font2} />
          </TouchableOpacity>
        </View>

        {!submitted ? (
          <View style={styles.form}>
            <Text style={styles.label}>Select Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(v) => setCategory(v)}
                style={[styles.picker, { color: category ? Colors.primary : "#999" }]}
              >
                <Picker.Item label="--- Select a Category ---" value="" color="#999" />
                {categories.map((item, index) => (
                  <Picker.Item key={index} label={item} value={item} />
                ))}
                <Picker.Item label="Others" value="Others" />
              </Picker>
            </View>

            {category === "Others" && (
              <TextInput
                style={styles.input}
                placeholder="Type your category"
                value={otherCategory}
                onChangeText={setOtherCategory}
              />
            )}

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder="Describe your concern"
              value={description}
              onChangeText={handleDescriptionChange}
              multiline
            />
            <Text style={styles.charCount}>
              {description.replace(/\s/g, "").length} / 200
            </Text>

            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Your Email</Text>
            <TextInput
              style={[styles.input, lockedEmail ? { backgroundColor: "#dcdcdc" } : null]}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                if (lockedEmail) {
                  Alert.alert(
                    "Email Locked",
                    `You cannot change your email. All reports must use "${lockedEmail}".`
                  );
                  setEmail(lockedEmail);
                } else {
                  setEmail(text);
                }
              }}
              editable={!lockedEmail}
            />
            {!lockedEmail ? (
              <Text style={styles.emailNote}>
                ⚠️ The email you enter will be used for all future reports.
              </Text>
            ) : (
              <Text style={styles.emailNote}>✅ Using saved email: {lockedEmail}</Text>
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.preview}>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: Colors.primary }]}
              onPress={() => {
                const now = new Date();
                const hour = now.getHours();
                const minute = now.getMinutes().toString().padStart(2, "0");
                const dayNames = [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ];
                const dayName = dayNames[now.getDay()];
                const ampm = hour >= 12 ? "PM" : "AM";
                const displayHour = hour % 12 || 12;
                const formattedTime = `${displayHour}:${minute} ${ampm}`;
                const withinOfficeHours =
                  hour >= 8 && hour < 17 && now.getDay() >= 1 && now.getDay() <= 5;

                let message = `Date and Time: ${dayName}, ${formattedTime}\n\n`;

                if (withinOfficeHours) {
                  message +=
                    "You are about to submit another report.\n\nReports during office hours (8:00 AM–5:00 PM, Monday–Friday) are typically processed within the same day.";
                } else if (now.getDay() === 0 || now.getDay() === 6) {
                  message +=
                    "You are about to submit another report.\n\nThe office is closed on weekends. Reports sent now will be reviewed on the next working day.";
                } else {
                  message +=
                    "You are about to submit another report.\n\nReports sent after office hours (8:00 AM–5:00 PM, Monday–Friday) will be processed on the next working day.";
                }

                Alert.alert("Confirm New Report Submission", message, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Proceed",
                    onPress: () => {
                      setSubmitted(false);
                      resetForm();
                    },
                  },
                ]);
              }}
            >
              <Text style={styles.submitText}>Submit Another Report</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>My Report</Text>
            {reports.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#666" }}>No reports yet.</Text>
            ) : (
              reports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <Text style={styles.timestamp}>
                    {report.localCreatedAt
                      ? new Date(report.localCreatedAt).toLocaleString()
                      : "No timestamp"}
                  </Text>

                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>Name</Text>
                    <Text style={styles.reportValue}>{report.name}</Text>
                  </View>
                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>Email</Text>
                    <Text style={styles.reportValue}>{report.email}</Text>
                  </View>
                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>Category</Text>
                    <Text style={styles.reportValue}>{report.category}</Text>
                  </View>
                  <View
                    style={[
                      styles.reportRow,
                      { flexDirection: "column", alignItems: "flex-start" },
                    ]}
                  >
                    <Text style={styles.reportLabel}>Description</Text>
                    <Text style={[styles.reportValue, { marginTop: 5 }]}>
                      {report.description}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      { backgroundColor: "#e45555ff", marginTop: 10 },
                    ]}
                    onPress={() => handleDelete(report.id)}
                  >
                    <Text style={styles.submitText}>Delete Report</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.font2 },
  container: { flex: 1 },
  header: { backgroundColor: Colors.primary, paddingVertical: 10 },
  header_text: {
    fontFamily: "poppins-bold",
    textAlign: "center",
    fontSize: 22,
    color: Colors.font2,
  },
  backIcon: { position: "absolute", left: 20, top: 18 },
  form: { padding: 20 },
  label: { fontFamily: "poppins-medium", marginBottom: 5, fontSize: 14, color: "#333" },
  input: {
    backgroundColor: "#e9e9e9ff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: "#e9e9e9ff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: { height: 55, width: "100%" },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#fff", fontFamily: "poppins-bold" },
  preview: { padding: 20 },
  sectionTitle: {
    fontWeight: "bold",
    color: "#888",
    marginBottom: 15,
    marginTop: 25,
    fontSize: 15,
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  reportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reportLabel: { fontFamily: "poppins-medium", fontSize: 14, color: "#aaa6a6ff" },
  reportValue: { fontFamily: "poppins", fontSize: 14, color: "#111", flexShrink: 1 },
  timestamp: {
    fontFamily: "poppins-medium",
    fontSize: 12,
    color: "#777",
    marginBottom: 8,
    textAlign: "right",
  },
  emailNote: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
});
