// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const Id = req.query.tokenId
  const name = `CrytoDevs #${Id}`
  const description = "CryptoDevs is an NFT collection for web3 developers"
  const imageUrl = `https://github.com/LearnWeb3DAO/NFT-Collection/blob/main/my-app/public/cryptodevs/${Number(tokenId) - 1}.svg`

  return res.json({
    name: name,
    description: description,
    image: imageUrl
  })
}
