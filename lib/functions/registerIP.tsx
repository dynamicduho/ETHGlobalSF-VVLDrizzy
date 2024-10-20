import { IpMetadata, PIL_TYPE, RegisterIpAndAttachPilTermsResponse, StoryClient, StoryConfig } from '@story-protocol/core-sdk'
import { http } from 'viem'
import { mintNFT } from './mintNFT'
import { CurrencyAddress, NFTContractAddress, RPCProviderUrl, account, revSharePercentToValue } from "./utils"
import { uploadJSONToIPFS } from './uploadToIpfs'
import { createHash } from 'crypto'

// boilerplate taken from story typescript tutorial github repo
// BEFORE YOU RUN THIS FUNCTION: Make sure to read the README which contains
// instructions for running this "Simple Mint and Register" example.

const RegisterIP = async function (title: string, description: string, hashtag: string, pilType: PIL_TYPE, mintingFee: number | bigint, revSharePercentage: number, blobId: string) {
    if (revSharePercentage < 0 || revSharePercentage > 100) {
        console.error("revshare percentage cannot be outside of 0-100")
        return;
    }
    // Config story client Docs: https://docs.story.foundation/docs/typescript-sdk-setup
    const config: StoryConfig = {
        account: account,
        transport: http(RPCProviderUrl),
        chainId: 'iliad',
    }
    const client = StoryClient.newClient(config)

    // 2. Setup ip metadata https://docs.story.foundation/docs/ipa-metadata-standard
    const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        title: `${title}`,
        description: `${description}`,
        attributes: [
            ...(hashtag ? [{ key: 'Hashtag', value: hashtag }] : []), // Conditionally add hashtag
        ],    
    })

    // 3. Set up your NFT Metadata
    //
    // Docs: https://eips.ethereum.org/EIPS/eip-721
    const AGGREGATOR = (process.env.VITE_AGGREGATOR_ADDRESS) || 'https://walrus-testnet-aggregator.nodes.guru';
    const videoURI = `${AGGREGATOR}/v1/${blobId}`
    const nftMetadata = {
        name: `NFT representing ownership of video with Walrus blobId: ${blobId}`,
        description: `This NFT represents ownership of the original video represented by Walrus blobId: ${blobId}`,
        image: `${videoURI}`,
    }
    try {
        // 4. Upload your IP and NFT Metadata to IPFS
        const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
        const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
        const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
        const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')

        // 5. Mint an NFT
        const tokenId = await mintNFT(account.address, `https://ipfs.io/ipfs/${nftIpfsHash}`)
        console.log(`NFT minted with tokenId ${tokenId}`)

        // 6. Register an IP Asset
        //
        // Docs: https://docs.story.foundation/docs/register-an-nft-as-an-ip-asset
        const revShareValue = Math.ceil(revSharePercentage * revSharePercentToValue)
        const response: RegisterIpAndAttachPilTermsResponse = await client.ipAsset.registerIpAndAttachPilTerms({
            nftContract: NFTContractAddress,
            commercialRevShare: revShareValue,
            tokenId: tokenId!,
            pilType: pilType,
            mintingFee: mintingFee, // user defined minting fee
            currency: CurrencyAddress, // default Story USD; expand later
            ipMetadata: {
                ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
                ipMetadataHash: `0x${ipHash}`,
                nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
                nftMetadataHash: `0x${nftHash}`,
            },
            txOptions: { waitForTransaction: true },
        })
        console.log(`Root IPA created at transaction hash ${response.txHash}, IPA ID: ${response.ipId}`)
        console.log(`View on the explorer: https://explorer.story.foundation/ipa/${response.ipId}`)
        return response;
    } catch (error) {
        console.log("An error occurred while trying to register IP: ", error);
    }
}

export default RegisterIP;