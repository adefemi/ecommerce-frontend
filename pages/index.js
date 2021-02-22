import Head from "next/head";
import Layout from "../components/layout";
import ProductComponent from "../components/productComponent";
import ProductCategories from "../components/productCategories";

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Ecommerce Home</title>
      </Head>
      <ProductComponent title="LATEST ADDITION" tag="latest" />
      {/* <ProductComponent title="POPULAR PRODUCT" tag="popular" /> */}
      <ProductCategories />
    </Layout>
  );
}
