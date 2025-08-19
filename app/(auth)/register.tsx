import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { router, Stack } from "expo-router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        Alert.alert("Error", "This email is already registered. Please log in.");
      } else if (error.message.includes("password")) {
        Alert.alert("Error", "Password is too weak. Please try a stronger one.");
      } else {
        Alert.alert("Error", error.message);
      }
    } else {
      await supabase.auth.signOut();
      Alert.alert("Success", "Account created successfully! Please log in.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#ecfdf5" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Stack.Screen options={{ title: "Register" }} />

          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#065f46" }}>
            Create Account
          </Text>

          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 12,
              backgroundColor: "#fff",
            }}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 20,
              backgroundColor: "#fff",
            }}
          />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{
              backgroundColor: "#047857",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              {loading ? "Registering..." : "Sign Up"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
