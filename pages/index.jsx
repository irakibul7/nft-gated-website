import React from 'react';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { useLogout } from '@thirdweb-dev/react';
import { getUser } from '../auth.config';
import checkBalance from '../util/checkBalance';
import styles from '../styles/Home.module.css';
import { contractAddress } from '../const/yourDetails';
import Image from 'next/image';
export default function Home(props) {
  const logout = useLogout();
  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>{props.name}</h1>
      <h3>{props.description}</h3>
      <p className={styles.explain}>
        Thanks for being a member of our NFT community!
      </p>
      <div className={styles.nftImg}>
        <Image
          src={props.img_url}
          alt={props.description}
          width={100}
          height={100}
          layout="fill"
        />
      </div>

      <button className={styles.mainButton} onClick={logout}>
        Logout
      </button>
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps(context) {
  const user = await getUser(context.req);

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Ensure we are able to generate an auth token using our private key instantiated SDK
  const PRIVATE_KEY = process.env.THIRDWEB_AUTH_PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    throw new Error(
      'You need to add an PRIVATE_KEY environment variable.'
    );
  }

  // Instantiate our SDK
  const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.THIRDWEB_AUTH_PRIVATE_KEY,
    'mumbai'
  );

  // Check to see if the user has an NFT
  const hasNft = await checkBalance(sdk, user.address);

  if (!hasNft) {
    // If they don't have an NFT, redirect them to the login page
    console.log(
      'User',
      user.address,
      "doesn't have an NFT! Redirecting..."
    );
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const editionDrop = await sdk.getEditionDrop(
    contractAddress // replace this with your contract address
  );

  const contractUri =
    await editionDrop.owner.contractWrapper.readContract.contractURI();

  const ipfs = contractUri.replace('ipfs://', '');
  const url = `https://ipfs.io/ipfs/${ipfs}`;

  const fetch_metadata = await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const obj = {
        name: data.name,
        img: data.image,
        description: data.description,
      };
      return obj;
    });

  const img = fetch_metadata.img.replace('ipfs://', '');
  const img_url = `https://ipfs.io/ipfs/${img}`;

  // Finally, return the props
  return {
    props: {
      img_url,
      description: fetch_metadata.description,
      name: fetch_metadata.name,
    },
  };
}
