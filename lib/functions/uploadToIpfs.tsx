"use server";
const pinataSDK = require("@pinata/sdk");

export async function uploadJSONToIPFS(jsonMetadata: any) {
    const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT })
    const { IpfsHash } = await pinata.pinJSONToIPFS(jsonMetadata)
    return IpfsHash;
}
