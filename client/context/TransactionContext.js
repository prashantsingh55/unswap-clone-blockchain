import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { contractABI, contractAddress } from '../lib/constants'
import { ethers } from 'ethers'
import { client } from '../lib/sanityClient'

export const TransactionContext = React.createContext()

let eth

if (typeof window !== 'undefined') {
    eth = window.ethereum
}

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(eth)
    const signer = provider.getSigner()
    const transactionContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
    )
    return transactionContract
}


export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState()
    const [isLoading, setIsLoading] = useState(false)
    // const router = useRouter()
    const [formData, setFormData] = useState({
        addressTo: '',
        amount: '',
    })

    const router = useRouter()

    useEffect(() => {
        checkIfWalletIsConnected()
    }, [])

    /**
     * Create user profile in Sanity  if it doesn't exist
     */
    useEffect(() => {
        if (!currentAccount) return
            ; (async () => {
                const userDoc = {
                    _type: 'users',
                    _id: currentAccount,
                    userName: 'Unnamed',
                    address: currentAccount,
                }

                await client.createIfNotExists(userDoc)
            })()
    }, [currentAccount])

    const connectWallet = async (metamask = eth) => {
        try {
            if (!metamask) return alert("Please Install metamask")
            const accounts = await metamask.request({ method: 'eth_requestAccounts' })
            setCurrentAccount(accounts[0])
        } catch (error) {
            console.error(error)
            throw new Error("No Ethereum object")
        }
    }


    const checkIfWalletIsConnected = async (metamask = eth) => {
        try {
            if (!metamask) return alert("Please install metamask")
            const accounts = await metamask.request({ method: 'eth_accounts' })

            if (accounts.length) {
                setCurrentAccount(accounts[0])
                console.log("Wallet is Connected")
            }
        } catch (error) {
            console.error(error)
            throw new Error('No Ethereum Object..')
        }
    }

    const sendTransaction = async (
        metamask = eth,
        connectedAccount = currentAccount
    ) => {
        try {
            if (!metamask) return alert("Please install metamask")
            const { addressTo, amount } = formData
            const transactionContract = getEthereumContract()

            const parsedAmount = ethers.utils.parseEther(amount)

            await metamask.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: connectedAccount,
                        to: addressTo,
                        gas: '0x7EF40',  // 520000 Gwei
                        value: parsedAmount._hex,
                    }
                ]
            })

            const transactionHash = await transactionContract.publishTransaction(
                addressTo,
                parsedAmount,
                `Transferring ETH ${parsedAmount} to ${addressTo}`,
                'TRANSFER'
            )

            setIsLoading(true)

            await transactionHash.wait()

            //  DB    
            await saveTransaction(
                transactionHash.hash,
                amount,
                connectedAccount,
                addressTo
            )

            setIsLoading(false)

        } catch (error) {
            console.log(error)
        }
    }
    const handleChange = (e, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value })
        )
    }
    /**
     * Saves transaction to Sanity DB
     * @param {string} txHash Transaction hash
     * @param {number} amount Amount of ETH that was sent
     * @param {string} fromAddress Sender address
     * @param {string} toAddress Recipient address
     * @returns null
     */
    const saveTransaction = async (
        txHash,
        amount,
        fromAddress = currentAccount,
        toAddress
    ) => {
        const txDoc = {
            _type: 'transactions',
            _id: txHash,
            fromAddress: fromAddress,
            toAddress: toAddress,
            timestamp: new Date(Date.now()).toISOString(),
            txHash: txHash,
            amount: parseFloat(amount),
        }

        await client.createIfNotExists(txDoc)

        await client
            .patch(currentAccount)
            .setIfMissing({ transactions: [] })
            .insert('after', 'transactions[-1]', [
                {
                    _key: txHash,
                    _ref: txHash,
                    _type: 'reference',
                }
            ])
            .commit()
        return

    }
    /***
     * Trigger loading modal
     */

    useEffect(() => {
        if (isLoading) {
            router.push(`/?loading=${currentAccount}`)
        } else {
            router.push('/')
        }
    }, [isLoading])



    return (
        <TransactionContext.Provider
            value={{
                connectWallet,
                currentAccount,
                sendTransaction,
                handleChange,
                formData,
                isLoading,


            }}
        >
            {children}
        </TransactionContext.Provider>
    )
}

