// /lib/productPromptBuilder.js

import { getProducts } from "./getProducts";

export async function buildProductPrompt(limit = 5) {
  try {
    const products = await getProducts(limit);

    const formatted = products.map((p, index) => {
      return `${index + 1}. ${p.name} — $${p.price}
` +
        (p.attributes?.map(attr => `   - ${attr.name}: ${attr.options.join(", ")}`).join("\n") || "") +
        (p.description ? `\n   - Description: ${p.description}` : "") +
        (p.link ? `\n   - Link: ${p.link}` : "");
    });

    return `You are a sales assistant for Microminimus. Recommend products based on user input. Here are some current products:\n\n${formatted.join("\n\n")}`;
  } catch (err) {
    console.error("Error building product prompt:", err);
    return "You are a sales assistant for Microminimus.";
  }
}
