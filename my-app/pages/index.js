import {providers, Contract, utils} from 'ethers'
import { useRef, useState, useEffect } from 'react'
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from '../constants'
import Head from 'next/head'
import Web3Modal from 'web3modal'
import styles from '../styles/Home.module.css'

export default function Home() {
  const web3ModalRef = useRef()
  const [walletConnected, setWalletConnected] = useState(false)
  const [presaleStarted, setPresaleStarted] = useState(false)
  const [presaleEnded, setPresaleEnded] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [numTokenMinted, setNumTokensMinted] = useState("")
  const [loading, setLoading] = useState(false)

  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true)

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )
      const owner = await nftContract.owner()
      const userAddress = await signer.getAddress()

      if(owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true)
      } 
    } catch (error) {
      console.error(error)
    }
    
  }

  const getNumMintedTokens = async () => {
    try {
      const provider = await getProviderOrSigner()

      const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
      )
      const tokensMinted = await nftContract.tokenId()
      setNumTokensMinted(tokensMinted.toString())
    } catch (error) {
      console.error(error)
    }
  }

  const presaleMint = async () => {
    setLoading(true)
    try {
      const signer = await getProviderOrSigner(true)

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )

      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.01")
      })

      await txn.wait()
      window.alert("You have successfully minted a CryptoDevs NFT!!!🚀")
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const publicMint = async () => {
    setLoading(true)
    try {
      const signer = await getProviderOrSigner(true)

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )

      const txn = await nftContract.publicMint({
        value: utils.parseEther("0.01")
      })
      await txn.wait()

      window.alert("You have successfully minted a CryptoDevs NFT!!!🚀")
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const checkIfPresaleEnded = async () => {
   try {
      const provider = await getProviderOrSigner()
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )

      const presaleEndTime = await nftContract.presaleEnded()
      const currentTimeInSeconds = (Date.now() / 1000)
      const hasPresaleEnded = presaleEndTime.lt(Math.floor(currentTimeInSeconds))
      setPresaleEnded(hasPresaleEnded)
      return hasPresaleEnded
   } catch (error) {
    console.error(error)
    return false
   }
  }

  const startPresale = async () => {
    setLoading(true)
    try {
      const signer = await getProviderOrSigner(true)

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )
      const txn = await nftContract.startPresale()
      await txn.wait()

      setPresaleStarted(true)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner()

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )

      const isPresaleStarted = await nftContract.presaleStarted()
      setPresaleStarted(isPresaleStarted)

      return isPresaleStarted

    } catch (error) {
      console.error(error)
      return false
    }
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)
      
    } catch (error) {
      console.error(error)
    }
  }

  const getProviderOrSigner = async (needSigner = false) => {
    //This will cause metamask to pop open on the user's device for the user to connect
    const provider = await web3ModalRef.current.connect()
    //Here we pass in the provider to ethers to allos us access other cool functions 
    const web3Provider = new providers.Web3Provider(provider)
    //Check if the provider e.g metamask is connected to the right network
    const { chainId } = await web3Provider.getNetwork()
    if(chainId !== 4) {
      window.alert("Please connect to the rinkeby network!")
      throw new Error("Incorrect Network!")
    }

    if(needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }

    return web3Provider

  }

  const onPageLoad = async () => {
    await connectWallet()
    await getOwner()

    const isPresaleStarted = await checkIfPresaleStarted()
    if(isPresaleStarted) {
      await checkIfPresaleEnded()
    }

    await getNumMintedTokens()

    setInterval(async () => {
      await getNumMintedTokens()
    }, 5 * 1000)

    setInterval(async () => {
      const isPresaleStarted = await checkIfPresaleStarted()
      if(isPresaleStarted) {
        await checkIfPresaleEnded()
      }
    }, 5 * 1000)
  }

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false
      })
      onPageLoad()
    }
  }, [])

  function renderBody() {
    if(!walletConnected) {
      return(
        <button className={styles.button} onClick={connectWallet}>
          Connect Your Wallet
        </button>
      )
    }

    if(loading) {
      return(
      <button className={styles.button}>Loading...</button>
      )
    }

    if(isOwner && !presaleStarted) {
      return(
        <button className={styles.button} onClick={startPresale}>
          Start Presale
        </button>
      )
    }

    if(!presaleStarted) {
      return(
        <div className={styles.description}>
          Presale has not started, please come back later!
        </div>
      )
    }

    if(presaleStarted && !presaleEnded) {
      return(
        <div>
          <span className={styles.description}>
            Presale is on, your wallet must be on the whitelist for you to mint!
          </span>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      )
    }

    if(presaleEnded) {
      return(
        <div>
          <span className={styles.description}>
            The public mint is live, click the button to mint
          </span>
          <button className={styles.button} onClick={publicMint}>
            Public Mint 🚀
          </button>
        </div>
      )
    }
  }

  return(
    <div>
      <Head>
        <title>CryptoDevs NFTs</title>
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDevs NFT</h1>
          <span className={styles.description}>CryptoDevs is an NFT collection for web3 developers</span>
          <div className={styles.description}>
            {numTokenMinted}/20 has been minted!
          </div>
          {renderBody()}
        </div>
        <div>
          <img src="/crypto-devs.svg" className={styles.image}/>
        </div>
      </div>

      <footer className={styles.footer}>
        Made with ❤ for Crypto Devs
      </footer>
    </div>
  )
}