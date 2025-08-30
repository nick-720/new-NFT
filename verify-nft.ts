import { createNft, fetchDigitalAsset, findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from '@metaplex-foundation/mpl-token-metadata';
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount, publicKey } from '@metaplex-foundation/umi';

const connection = new Connection(clusterApiUrl('devnet'));

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey("BmWUF3DFdKBpLSTtYhmGfMFdqieYrofDAq5LmekSAEAp");

const nftAddress = publicKey("GtEzMEjpob9cL4cchJUcVKc4cRC1HXNbUrEEmKXFy3VS");

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity,
});

transaction.sendAndConfirm(umi, { commitment: "finalized" });

console.log(`Verified NFT ${nftAddress} as member of collection ${collectionAddress}:) See Explorer at ${getExplorerLink("address", nftAddress, "devnet")}`);