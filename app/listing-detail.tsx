// app/listing-detail.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import PrimaryButton from "@/components/PrimaryButton";

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<any>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) setListing(data);
  };

  const openBuyModal = () => {
    setBuyerName("");
    setBuyerPhone("");
    setBuyerAddress("");
    setQuantity("1");
    setModalVisible(true);
  };

  const handleConfirmBuy = async () => {
    if (!buyerName.trim() || !buyerPhone.trim() || !buyerAddress.trim() || !quantity.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (!listing) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from("guest_orders").insert({
        listing_id: listing.id,
        seller_id: listing.user_id,
        name: buyerName.trim(),
        phone: buyerPhone.trim(),
        address: buyerAddress.trim(),
        quantity: parseInt(quantity) || 1,
      });
      if (error) throw error;

      setModalVisible(false);
      Alert.alert("Success", "Purchase completed successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!listing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Detail", headerBackTitle: "Back" }} />

      <ScrollView style={{ flex: 1, backgroundColor: "#ecfdf5" }}>
        {listing.image_url ? (
          <Image
            source={{ uri: listing.image_url }}
            style={{ width: "100%", height: 300 }}
            resizeMode="cover"
          />
        ) : null}

        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#065f46", marginBottom: 8 }}>
            {listing.title}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#047857", marginBottom: 12 }}>
            ${listing.price}
          </Text>
          {listing.description ? (
            <Text style={{ fontSize: 16, color: "#374151", marginBottom: 20 }}>
              {listing.description}
            </Text>
          ) : null}

          <PrimaryButton title="Buy" onPress={openBuyModal} />
        </View>
      </ScrollView>

      {/* Modal nhập buyer info */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.3)",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#065f46",
                    marginBottom: 12,
                    textAlign: "center",
                  }}
                >
                  Buyer Information
                </Text>

                {/* Input Name */}
                <Text style={styles.label}>Name</Text>
                <TextInput value={buyerName} onChangeText={setBuyerName} style={styles.input} />

                {/* Input Phone */}
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  value={buyerPhone}
                  onChangeText={setBuyerPhone}
                  keyboardType="phone-pad"
                  style={styles.input}
                />

                {/* Input Address */}
                <Text style={styles.label}>Address</Text>
                <TextInput
                  value={buyerAddress}
                  onChangeText={setBuyerAddress}
                  multiline
                  style={[styles.input, { minHeight: 60, textAlignVertical: "top" }]}
                />

                {/* Input Quantity */}
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  style={styles.input}
                />

                {/* Buttons */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                    <Text style={{ color: "#111827", fontWeight: "600" }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleConfirmBuy}
                    disabled={submitting}
                    style={styles.confirmBtn}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      {submitting ? "Submitting…" : "Confirm"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = {
  label: { fontWeight: "600", color: "#000", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center" as const,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#047857",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center" as const,
  },
} as const;
