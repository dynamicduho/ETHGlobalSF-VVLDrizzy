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

export default function RegisterIPA() {
  const {
    mintNFT,
    setTxHash,
    setTxLoading,
    setTxName,
    addTransaction,
    client,
  } = useStory();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [revShare, setRevShare] = useState(50);
  const [mintingFee, setMintingFee] = useState(0);
  const [pilType, setPilType] = useState(PIL_TYPE.COMMERCIAL_USE);
  const [isRegistering, setIsRegistering] = useState(false);

  const [image, setImage] = useState();
  const [nftId, setNftId] = useState("");
  const [nftContractAddress, setNftContractAddress] = useState("");
  const { data: wallet } = useWalletClient();

  const mintAndRegisterNFT = async () => {
    if (!client) return;
    setTxLoading(true);
    setTxName("Minting an NFT so it can be registered as an IP Asset...");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    //@ts-ignore
    formData.append("file", image);
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
    const response = await client.ipAsset.register({
      nftContract,
      tokenId,
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
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="e.g. 'Tesla on Fire'"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Input
                  type="text"
                  id="description"
                  placeholder="e.g. 'Battery fire of Tesla Model 3'"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="tag">Tag</Label>
                <Input
                  type="text"
                  id="tag"
                  placeholder="e.g. 'tesla'"
                  onChange={(e) => setTag(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="revShare">Revenue Share %</Label>
                <CardDescription>
                  Percentage of revenue you want back
                </CardDescription>
                <Input
                  type="text"
                  id="revShare"
                  placeholder="e.g. '50'"
                  onChange={(e) => setRevShare(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="mintingFee">Minting Fee</Label>
                <CardDescription>
                  Flat fee you want each time your video is licensed
                </CardDescription>
                <Input
                  type="text"
                  id="Tag"
                  placeholder="e.g. '2'"
                  onChange={(e) => setTag(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="image">Image</Label>
                <Input
                  type="file"
                  id="image"
                  // @ts-ignore
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button onClick={mintAndRegisterNFT}>Register</Button>
            <ViewCode type="register-new-nft" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
