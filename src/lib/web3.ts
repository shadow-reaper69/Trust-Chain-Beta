import { ethers } from 'ethers';

// Amoy testnet RPC
const RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://rpc-amoy.polygon.technology/';

export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL);
};

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xSimulatedPolygonContractAddressForHackathon00';

export const CONTRACT_ABI = [
  "function issueCertificate(string documentHash) public",
  "function verifyCertificate(string documentHash) public view returns (bool isValid, address issuer, uint256 timestamp)",
  "function revokeCertificate(string documentHash) public"
];

// Provide either a provider (for read-only) or a wallet (for write)
export const getContract = (providerOrSigner: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
};
