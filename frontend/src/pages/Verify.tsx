import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CONTRACT_ADDRESS, EXPLORER_URL } from "../config/contracts";
import { findProduct } from "../services/fashionProduct";
import type { Product } from "../types/product";
import { Status } from "../components/Status";
const short = (x: string) => `${x.slice(0, 6)}…${x.slice(-4)}`;
export function Verify() { const { productId = "" } = useParams(); const [product, setProduct] = useState<Product>(); const [error, setError] = useState("");
 useEffect(() => { findProduct(productId).then(setProduct).catch(() => setError("This product does not exist in the FashionChain registry.")); }, [productId]);
 if (!product && !error) return <p>Checking the blockchain registry…</p>;
 if (error) return <section className="max-w-xl rounded-xl border border-red-200 bg-red-50 p-8"><h1 className="text-2xl font-black">PRODUCT NOT FOUND</h1><p className="mt-3 text-stone-700">{error}</p></section>;
 return <section className="max-w-2xl"><Status active={product!.active}/><h1 className="mt-5 text-4xl font-black">{product!.productName}</h1><p className="mt-2 text-stone-600">This digital record represents the physical product’s identity.</p><dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-y border-stone-200 py-7 text-sm"><dt>Product ID</dt><dd>{product!.productId}</dd><dt>Category</dt><dd>{product!.category}</dd><dt>Batch</dt><dd>{product!.batchNumber}</dd><dt>Token ID</dt><dd>{product!.tokenId.toString()}</dd><dt>Current owner</dt><dd title={product!.owner}>{short(product!.owner)}</dd><dt>Minted</dt><dd>{new Date(Number(product!.mintedAt) * 1000).toLocaleDateString()}</dd></dl><div className="mt-6 flex gap-4 text-sm"><Link className="font-semibold text-accent" to={`/products/${product!.productId}`}>View product details</Link>{CONTRACT_ADDRESS && <a className="font-semibold text-accent" target="_blank" href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}>View contract on Etherscan</a>}</div></section> }
