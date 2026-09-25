export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 11155111);
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
export const RPC_URL = import.meta.env.VITE_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
export const EXPLORER_URL = "https://sepolia.etherscan.io";
export const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

export const FASHION_PRODUCT_ABI = [
  "function tokenIdForProductId(string) view returns (uint256)",
  "function verifyProduct(uint256) view returns ((string productId,string productName,string brand,string category,string batchNumber,uint256 mintedAt,bool active),address)",
  "function ownerOf(uint256) view returns (address)",
  "function hasRole(bytes32,address) view returns (bool)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function MINTER_ROLE() view returns (bytes32)",
  "function mintProduct(address,string,string,string,string,string,string) returns (uint256)",
  "function transferFrom(address,address,uint256)",
  "event ProductMinted(uint256 indexed tokenId,string indexed productId,address indexed owner)"
] as const;
