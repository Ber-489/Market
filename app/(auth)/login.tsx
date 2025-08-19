// app/(auth)/login.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";
import { router, Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import PrimaryButton from "@/components/PrimaryButton";
import FormField from "@/components/FormField";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      router.replace("/(tabs)");
    }
  }, [session]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      Alert.alert("Success", "Logged in successfully.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{headerBackTitle: 'Back', headerShown: true }} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#ecfdf5" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: "700",
                textAlign: "center",
                color: "#065f46",
                marginBottom: 8,
              }}
            >
              Food & Beverages
            </Text>
            <Text
              style={{
                fontSize: 15,
                textAlign: "center",
                color: "#246037ff",
                marginBottom: 24,
              }}
            >
              Sign in to continue
            </Text>

            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

            <PrimaryButton title="Login" onPress={handleLogin} loading={loading} />
            <View style={{ height: 12 }} />
            <PrimaryButton title="Create account" onPress={() => router.push("/(auth)/register")} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}
