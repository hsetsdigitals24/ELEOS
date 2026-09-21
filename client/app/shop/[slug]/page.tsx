// app/shop/[slug]/page.tsx — the full details page for one Marvela product,
// routed from the shop shelf's cards. The product data itself comes from the
// shop API in the browser (same pattern as the shelf), so this page is a thin
// shell around ProductDetail.
//
// It is a server component only so it can render the site Footer, which reads
// the recent-content API on the server; ProductDetail stays the client half.

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ProductDetail from "@/components/shop/ProductDetail";

interface ShopProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShopProductPage({ params }: ShopProductPageProps) {
  const { slug } = await params;

  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main id="shop-product" className="w-full grow">
        <ProductDetail slug={slug} />
      </main>
      <Footer />
    </div>
  );
}
