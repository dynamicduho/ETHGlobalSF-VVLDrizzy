"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Address } from "viem";
import { useState } from "react";
import { ViewCode } from "../atoms/ViewCode";
import { uploadJSONToIPFS } from "@/lib/functions/uploadJSONToIpfs";
import { useWalletClient } from "wagmi";
import CryptoJS from "crypto-js";
import { useStory } from "@/lib/context/AppContext";
import { PIL_TYPE } from "@story-protocol/core-sdk";
import {revSharePercentToValue, CurrencyAddress} from "@/lib/utils"

export default function RegisterIPA() {
  const {
    mintNFT,
    setTxHash,
    setTxLoading,
    setTxName,
    addTransaction,
    client,
    blobId,
    setBlobId,
    ipa,
    setIpa
  } = useStory();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [revShare, setRevShare] = useState(50);
  const [mintingFee, setMintingFee] = useState(0);
  const [pilType, setPilType] = useState(PIL_TYPE.COMMERCIAL_REMIX);
  const [isRegistering, setIsRegistering] = useState(false);
  const [nftId, setNftId] = useState("");
  const [nftContractAddress, setNftContractAddress] = useState("");
  const { data: wallet } = useWalletClient();

  const mintAndRegisterNFT = async () => {
    if (!client) return;
    if (!name || !description || !blobId) {
      alert('Please fill in all the fields and upload the video to Walrus first.');
      return;
    }

    const AGGREGATOR = (process.env.VITE_AGGREGATOR_ADDRESS) || 'https://walrus-testnet-aggregator.nodes.guru';
    const videoURI = `${AGGREGATOR}/v1/${blobId}`

    setIsRegistering(true)
    setTxLoading(true);
    setTxName("Minting an NFT so it can be registered as an IP Asset...");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", `${description}. This NFT represents ownership of the original video represented by the Walrus blobId. BlobID: ${blobId}.`);
    //@ts-ignore
    formData.append("image", videoURI);
    const { ipfsUri, ipfsJson } = await uploadJSONToIPFS(formData);

    const tokenId = await mintNFT(wallet?.account.address as Address, ipfsUri);
    registerExistingNFT(
      tokenId,
      "0xd2a4a4Cb40357773b658BECc66A6c165FD9Fc485",
      ipfsUri,
      ipfsJson
    );
  };

  const registerExistingNFT = async (
    tokenId: string,
    nftContract: Address,
    ipfsUri: string | null,
    ipfsJson: any | null
  ) => {
    if (!client) return;
    setTxLoading(true);
    setTxName("Registering an NFT as an IP Asset...");

    // Hash the string using SHA-256 and convert the result to hex
    const metadataHash = CryptoJS.SHA256(
      JSON.stringify(ipfsJson || {})
    ).toString(CryptoJS.enc.Hex);

    const revShareValue = Math.ceil(revShare )
    console.log("Rev share: ", revShare, "Rev share value is :", revShareValue)
    const response = await client.ipAsset.registerIpAndAttachPilTerms({
      nftContract,
      commercialRevShare: revShareValue,
      tokenId,
      pilType: pilType,
      mintingFee: mintingFee, // user defined minting fee
      currency: CurrencyAddress, // default Story USD; expand later
      ipMetadata: {
        ipMetadataURI: ipfsUri || "test-ip-metadata-uri", // uri of IP metadata
        ipMetadataHash: `0x${metadataHash}`, // hash of IP metadata
        nftMetadataURI: ipfsUri || "test-nft-metadata-uri", // uri of NFT metadata
        nftMetadataHash: `0x${metadataHash}`, // hash of NFT metadata
      },
      txOptions: { waitForTransaction: true },
    });
    console.log(
      `Root IPA created at tx hash ${response.txHash}, IPA ID: ${response.ipId}`
    );
    setTxLoading(false);
    setTxHash(response.txHash as string);
    if (!response.ipId) {
      console.error("fatal error; no IPA was returned")
      return;
    }
    setIpa(response.ipId);
    addTransaction(response.txHash as string, "Register IPA", {
      ipId: response.ipId,
    });

  };

  return (
    <div>
      <div className="flex md:flex-row gap-3 justify-center items-center flex-col">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Mint & register new IP</CardTitle>
            <CardDescription>
              Mint a new NFT to represent your video's IP and register it as an IP
              Asset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="name">NFT Name*</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="e.g. 'Tesla on Fire'"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="description">Description*</Label>
                <Input
                  type="text"
                  id="description"
                  placeholder="e.g. 'Tesla Model 3 battery fire in SF'"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="tag">Tag</Label>
                <Input
                  type="text"
                  id="tag"
                  placeholder="e.g. 'tesla'"
                  value={tag ? tag : ''}
                  onChange={(e) => setTag(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="revShare">Revenue Share %</Label>
                <CardDescription>
                  Percentage of revenue you want back
                </CardDescription>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  id="revShare"
                  placeholder="e.g. '50'"
                  value={revShare}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 && value <= 100) {
                      setRevShare(value);
                    }
                  }} 
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="mintingFee">Minting Fee</Label>
                <CardDescription>
                  Flat fee in USDC you want each time your video is licensed (max. 1,000,000)
                </CardDescription>
                <Input
                  type="number"
                  id="mintingFee"
                  placeholder="e.g. '2'"
                  value={mintingFee}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 && value <= 1_000_000) {
                      setMintingFee(value);
                    }
                  }} 
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="videoBlobID">Video Walrus Blob ID*</Label>
                <Input
                  type="text"
                  id="videoBlobID"
                  value={blobId ? blobId : ''}
                  placeholder="upload video to fill or enter custom blobid"
                  // @ts-ignore
                  onChange={(e) => setBlobId(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button onClick={mintAndRegisterNFT} disabled={isRegistering || !blobId}>
              {isRegistering ? 'Registering...' : 'Register NFT and IP'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
