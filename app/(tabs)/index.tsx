// app/(tabs)/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { supabase } from "@/lib/supabase";

const ITEM_MARGIN = 8;
// 2 cột: (screenWidth - 3 * margin) / 2  => chừa 2 mép + khoảng giữa
const ITEM_WIDTH = (Dimensions.get("window").width - ITEM_MARGIN * 3) / 2;
const PAGE_SIZE = 10;

export default function Market() {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Trạng thái tải tách bạch để tránh flicker
  const [initialLoading, setInitialLoading] = useState(true);   // chỉ lần đầu
  const [refreshing, setRefreshing] = useState(false);          // kéo xuống
  const [paginating, setPaginating] = useState(false);          // onEndReached

  // ---- API helpers ----
  const fetchPage = useCallback(async (from: number, to: number) => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data ?? [];
  }, []);

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);
    try {
      const data = await fetchPage(0, PAGE_SIZE - 1);
      setItems(data);
      setPage(1);
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      // Có thể log hoặc hiển thị thông báo nếu cần
    } finally {
      setInitialLoading(false);
    }
  }, [fetchPage]);

  const refreshSilently = useCallback(async () => {
    // Reload lại trang 1 nhưng KHÔNG làm trống dữ liệu → không flicker
    try {
      const data = await fetchPage(0, PAGE_SIZE - 1);
      setItems(data);
      setPage(1);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      // ignore
    }
  }, [fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchPage(0, PAGE_SIZE - 1);
      setItems(data);
      setPage(1);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (paginating || !hasMore || initialLoading || refreshing) return;
    setPaginating(true);
    try {
      const from = page * PAGE_SIZE;
      const to = (page + 1) * PAGE_SIZE - 1;
      const data = await fetchPage(from, to);
      setItems((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      // ignore
    } finally {
      setPaginating(false);
    }
  }, [page, hasMore, paginating, initialLoading, refreshing, fetchPage]);

  // ---- Effects ----
  // Lần đầu mở Market
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Khi quay lại tab Market: refresh âm thầm (không xóa items) → không nhấp nháy
  useFocusEffect(
    useCallback(() => {
      if (items.length === 0) {
        // Nếu chưa có data (mới mở app), chạy luồng initial để có spinner trung tâm
        loadInitial();
      } else {
        // Nếu đã có data, refresh âm thầm
        refreshSilently();
      }
    }, [items.length, loadInitial, refreshSilently])
  );

  // ---- Render ----
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        width: ITEM_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: ITEM_MARGIN,
      }}
      onPress={() => router.push({ pathname: "/listing-detail", params: { id: item.id } })}
      activeOpacity={0.85}
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
        <Text style={{ color: "#047857", fontWeight: "bold" }}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // Spinner lần đầu (thay vì hiện "No listings found." rồi biến mất → gây nhấp nháy)
  if (initialLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#ecfdf5", padding: ITEM_MARGIN }}>
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: ITEM_MARGIN }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          // Chỉ hiện khi ĐÃ tải xong lần đầu và thật sự không có dữ liệu
          items.length === 0 ? (
            <Text style={{ color: "#065f46", textAlign: "center", marginTop: 20 }}>
              No listings found.
            </Text>
          ) : null
        }
        ListFooterComponent={
          paginating ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
        initialNumToRender={10}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
}
