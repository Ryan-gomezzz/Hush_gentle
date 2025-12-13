"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUserOrRedirect } from "@/lib/auth";
import { trackEventServer } from "@/lib/analytics";
import { getPaymentsProvider } from "@/lib/payments";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function ensurePublicUser(userId: string, email?: string | null) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("users").upsert({ id: userId, email: email ?? null });
  await supabase.from("profiles").upsert({ user_id: userId });
}

async function getOrCreateActiveCart(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: existing, error: existingErr } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (existingErr) throw existingErr;
  if (existing?.id) return existing.id as string;

  const { data: created, error: createdErr } = await supabase
    .from("carts")
    .insert({ user_id: userId, status: "active" })
    .select("id")
    .single();
  if (createdErr) throw createdErr;
  return created.id as string;
}

export async function addToCart(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  const user = await getUserOrRedirect("/login");

  await ensurePublicUser(user.id, user.email);
  const cartId = await getOrCreateActiveCart(user.id);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("cart_items").upsert(
    {
      cart_id: cartId,
      product_id: productId,
      quantity: Math.max(1, quantity),
    },
    { onConflict: "cart_id,product_id" },
  );
  if (error) throw error;

  await trackEventServer({
    event_name: "add_to_cart",
    path: "/cart",
    meta: { productId, quantity: Math.max(1, quantity) },
  });

  revalidatePath("/cart");
  revalidatePath("/products");
  redirect("/cart");
}

export async function updateCartItemQuantity(formData: FormData) {
  const cartItemId = String(formData.get("cartItemId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  const user = await getUserOrRedirect("/login");
  await ensurePublicUser(user.id, user.email);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: Math.max(1, quantity) })
    .eq("id", cartItemId);
  if (error) throw error;

  revalidatePath("/cart");
}

export async function removeCartItem(formData: FormData) {
  const cartItemId = String(formData.get("cartItemId") ?? "");
  const user = await getUserOrRedirect("/login");
  await ensurePublicUser(user.id, user.email);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
  if (error) throw error;

  revalidatePath("/cart");
}

async function getOrCreateWishlist(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: existing, error: existingErr } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existingErr) throw existingErr;
  if (existing?.id) return existing.id as string;

  const { data: created, error: createdErr } = await supabase
    .from("wishlists")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (createdErr) throw createdErr;
  return created.id as string;
}

export async function toggleWishlist(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const user = await getUserOrRedirect("/login");
  await ensurePublicUser(user.id, user.email);

  const supabase = await createSupabaseServerClient();
  const wishlistId = await getOrCreateWishlist(user.id);

  const { data: existing, error: existingErr } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId)
    .maybeSingle();
  if (existingErr) throw existingErr;

  if (existing?.id) {
    const { error } = await supabase.from("wishlist_items").delete().eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("wishlist_items")
      .insert({ wishlist_id: wishlistId, product_id: productId });
    if (error) throw error;
  }

  revalidatePath("/wishlist");
  revalidatePath("/products");
}

export async function placeOrder(formData: FormData) {
  const user = await getUserOrRedirect("/login");
  await ensurePublicUser(user.id, user.email);

  const shipping_address = {
    full_name: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address_line1: String(formData.get("addressLine1") ?? ""),
    address_line2: String(formData.get("addressLine2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    pincode: String(formData.get("pincode") ?? ""),
  };

  const supabase = await createSupabaseServerClient();
  const { data: cart, error: cartErr } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (cartErr) throw cartErr;
  if (!cart?.id) redirect("/cart");

  const { data: items, error: itemsErr } = await supabase
    .from("cart_items")
    .select("id,quantity, products(id,name,slug,price_inr)")
    .eq("cart_id", cart.id);
  if (itemsErr) throw itemsErr;
  if (!items?.length) redirect("/cart");

  type CartItemRow = {
    id: string;
    quantity: number;
    products:
      | Array<{ id: string; name: string; slug: string; price_inr: number }>
      | { id: string; name: string; slug: string; price_inr: number };
  };
  const typedItems = (items as unknown as CartItemRow[]).map((it) => ({
    ...it,
    products: Array.isArray(it.products) ? it.products[0] : it.products,
  }));

  const subtotal = typedItems.reduce(
    (sum, it) => sum + it.quantity * (it.products?.price_inr ?? 0),
    0,
  );
  const shipping = 0;
  const total = subtotal + shipping;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "created",
      currency: "INR",
      subtotal_inr: subtotal,
      shipping_inr: shipping,
      total_inr: total,
      shipping_address,
    })
    .select("id")
    .single();
  if (orderErr) throw orderErr;

  const orderItemsPayload = typedItems.map((it) => ({
    order_id: order.id,
    product_id: it.products.id,
    quantity: it.quantity,
    price_inr: it.products.price_inr,
  }));

  const { error: orderItemsErr } = await supabase.from("order_items").insert(orderItemsPayload);
  if (orderItemsErr) throw orderItemsErr;

  const provider = getPaymentsProvider();
  const { data: paymentRow, error: paymentErr } = await supabase
    .from("payments")
    .insert({
    order_id: order.id,
    user_id: user.id,
      provider: provider.providerName,
      status: "created",
      amount_inr: total,
    })
    .select("id")
    .single();
  if (paymentErr) throw paymentErr;

  const paymentResult = await provider.createPaymentIntent({
    orderId: order.id,
    userId: user.id,
    amountInr: total,
    currency: "INR",
  });

  await supabase
    .from("payments")
    .update({
      status: paymentResult.status,
      provider_reference: paymentResult.providerReference ?? null,
      meta: paymentResult.meta ?? {},
    })
    .eq("id", paymentRow.id);

  if (paymentResult.status === "succeeded") {
    await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);
    await trackEventServer({
      event_name: "payment_success",
      path: `/order-confirmation/${order.id}`,
      meta: { orderId: order.id, paymentId: paymentRow.id, provider: provider.providerName },
    });
  } else if (paymentResult.status === "failed") {
    await trackEventServer({
      event_name: "payment_failure",
      path: `/checkout`,
      meta: { orderId: order.id, paymentId: paymentRow.id, provider: provider.providerName },
    });
  }

  // Mark cart converted and clear items (MVP)
  await supabase.from("carts").update({ status: "converted" }).eq("id", cart.id);

  await trackEventServer({
    event_name: "checkout_completed",
    path: `/order-confirmation/${order.id}`,
    meta: { orderId: order.id, total_inr: total },
  });

  revalidatePath("/cart");
  redirect(`/order-confirmation/${order.id}`);
}


