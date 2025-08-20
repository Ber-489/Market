import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

const ITEM_MARGIN = 8;
const ITEM_WIDTH = (Dimensions.get("window").width - ITEM_MARGIN * 3) / 2;

const CATEGORIES = ["All", "Chicken", "Beef", "Pork", "Fish", "Drinks", "Fast Foods"];

const CATEGORY_MAP: Record<string, string | null> = {
  All: null,
  Chicken: "chicken",
  Beef: "beef",
  Pork: "pork",
  Fish: "fish",
  Drinks: "drinks",
  "Fast Foods": "fast_foods",
};

export default function MarketScreen() {
  const [listings, setListings] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  async function fetchListings() {
    let query = supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false }); 

    const dbCategory = CATEGORY_MAP[selectedCategory];
    if (dbCategory) {
      query = query.eq("category", dbCategory);
    }

    const { data, error } = await query;
    if (error) {
      console.log("Error fetching listings:", error);
      setListings([]);
    } else {
      setListings(data || []);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={{
        width: ITEM_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: ITEM_MARGIN,
      }}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/listing-detail",
          params: { id: item.id },
        })
      }
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={{ width: "100%", height: ITEM_WIDTH }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: ITEM_WIDTH,
            backgroundColor: "#e5e7eb",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#6b7280" }}>No image</Text>
        </View>
      )}

      <View style={{ padding: 8 }}>
        <Text style={{ fontWeight: "600", color: "#065f46" }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: "#047857", fontWeight: "bold" }}>
          ${Number(item.price).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#ecfdf5" }}>
      {/* Filter Bar */}
      <View
        style={{
          height: 40,
          justifyContent: "center",
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: ITEM_MARGIN }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 18,
                marginRight: 8,
                backgroundColor:
                  selectedCategory === cat ? "#047857" : "#d1fae5",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={{
                  color: selectedCategory === cat ? "#fff" : "#065f46",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Listings */}
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: ITEM_MARGIN,
        }}
        contentContainerStyle={{
          paddingHorizontal: ITEM_MARGIN,
          flexGrow: 1,
        }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#065f46" }}>No listings found.</Text>
          </View>
        }
      />
    </View>
  );
}