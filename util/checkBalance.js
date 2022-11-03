import { contractAddress } from '../const/yourDetails';

export default async function checkBalance(sdk, address) {
  const editionDrop = await sdk.getEditionDrop(
    contractAddress // replace this with your contract address
  );
  // console.log(
  //   'owner',
  //   editionDrop.owner.contractWrapper.readContract.name()
  // );
  //console.log('editionDrop', editionDrop.metadata);
  const balance = await editionDrop.balanceOf(address, 0);

  const data =
    await editionDrop.owner.contractWrapper.readContract.contractURI();

  const ipfs = data.replace('ipfs://', '');
  const url = `https://ipfs.io/ipfs/${ipfs}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const img = data.image.replace('ipfs://', '');
      const metadata = `https://ipfs.io/ipfs/${img}`;
      console.log(metadata);
    });

  // gt = greater than
  return balance.gt(0);
}
