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
        <Card
          className="w-[350px]"
          data-title="Step-by-Step"
          data-intro="Each step shows you how to interact with your IP."
          data-step="2"
          data-position="left"
        >
          <CardHeader>
            <CardTitle>Step 1a. Register existing NFT</CardTitle>
            <CardDescription>
              Register an existing NFT in your wallet as an IP Asset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="nftId">NFT ID</Label>
                <Input
                  type="text"
                  id="nftId"
                  placeholder="12"
                  onChange={(e) => setNftId(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="nftContractAddress">NFT Contract Address</Label>
                <Input
                  type="text"
                  id="nftContractAddress"
                  placeholder="0xe8E8dd120b067ba86cf82B711cC4Ca9F22C89EDc"
                  onChange={(e) => setNftContractAddress(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              onClick={() =>
                registerExistingNFT(
                  nftId,
                  nftContractAddress as Address,
                  null,
                  null
                )
              }
            >
              Register
            </Button>
            <div
              data-title="View Code"
              data-intro="You can view the code associated with each step."
              data-step="3"
            >
              <ViewCode type="register-existing-nft" />
            </div>
          </CardFooter>
        </Card>
        <h3>OR</h3>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Step 1b. Mint & register new IP</CardTitle>
            <CardDescription>
              Mint a new NFT to represent your IP and register it as an IP
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
                  placeholder="Doge"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Input
                  type="text"
                  id="description"
                  placeholder="doge wif hat"
                  onChange={(e) => setDescription(e.target.value)}
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
