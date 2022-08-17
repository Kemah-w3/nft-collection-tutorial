// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const id = req.query.tokenId
  const name = `CrytoDevs #${id}`
  const description = "CryptoDevs is an NFT collection for web3 developers"
  const imageUrl = `https://github.com/Kemah-w3/nft-collection-tutorial/blob/main/my-app/public/cryptoDev%20svg/${Number(id) - 1}.svg`

  return res.json({
    name: name,
    description: description,
    image: imageUrl
  })
}
