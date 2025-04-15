const storeUrl = "https://shop.microminimus.com";
const consumerKey = "ck_43bade0a78fbc968d22b4c504633cc8d1b8f36bf";
const consumerSecret = "cs_14408be220dbde46dfea4a70c5397fe2a7d64f29";

const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

export async function getProducts(limit = 5) {
  const res = await fetch(`${storeUrl}/wp-json/wc/v3/products?per_page=${limit}`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products from WooCommerce");
  }

  const data = await res.json();
  return data.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images?.[0]?.src || null,
    link: product.permalink,
    description: product.short_description?.replace(/<[^>]+>/g, '') || "",
    attributes: product.attributes || [],
  }));
}