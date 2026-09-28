import { useEffect, useState } from "react";
import { listProducts, type ProductDTO } from "../api/client.js";

function formatIDR(cents: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function ProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listProducts()
      .then((res) => setProducts(res.data))
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "failed to load"),
      );
  }, []);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "1.5rem" }}>
      <h1>Produk</h1>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
            <th style={{ padding: "0.5rem" }}>SKU</th>
            <th style={{ padding: "0.5rem" }}>Nama</th>
            <th style={{ padding: "0.5rem" }}>Harga</th>
            <th style={{ padding: "0.5rem" }}>Stok</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "0.5rem" }}>{p.sku}</td>
              <td style={{ padding: "0.5rem" }}>{p.name}</td>
              <td style={{ padding: "0.5rem" }}>{formatIDR(p.priceCents)}</td>
              <td style={{ padding: "0.5rem" }}>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
