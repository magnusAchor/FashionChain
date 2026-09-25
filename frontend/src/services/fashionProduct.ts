import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import { CONTRACT_ADDRESS, FASHION_PRODUCT_ABI, RPC_URL } from "../config/contracts";
import type { Product } from "../types/product";

export const readProvider = new JsonRpcProvider(RPC_URL);
export function configured() { return CONTRACT_ADDRESS.length === 42; }
export function readContract() { if (!configured()) throw new Error("Contract address is not configured. Add VITE_CONTRACT_ADDRESS to frontend/.env."); return new Contract(CONTRACT_ADDRESS, FASHION_PRODUCT_ABI, readProvider); }
export async function findProduct(productId: string): Promise<Product> {
  const contract = readContract();
  const tokenId = await contract.tokenIdForProductId(productId);
  const [raw, owner] = await contract.verifyProduct(tokenId);
  return { ...raw, tokenId, owner } as Product;
}
export async function walletContract() {
  if (!window.ethereum) throw new Error("No browser wallet found. Install MetaMask to continue.");
  const provider = new BrowserProvider(window.ethereum);
  return new Contract(CONTRACT_ADDRESS, FASHION_PRODUCT_ABI, await provider.getSigner());
}
