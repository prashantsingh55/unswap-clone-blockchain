import { useEffect, useState } from 'react'
import { client } from '../lib/sanityClient'
import { useContext } from 'react'
import { TransactionContext } from '../context/TransactionContext'
import Image from 'next/image'
import ethLogo from '../assets/ethCurrency.png'
import { FiArrowUpRight } from 'react-icons/fi'


const style = {
    wrapper: `h-full text-white select-none h-full w-screen flex-1 pt-14 flex items-end justify-end pub-12 overflow-scroll px-8`,
    txHistoryItem: `bg-[#191a1e] rounded-lg px-4 py-2 my-2 flex items-center justify-end`,
    txDetails: `flex items-center`,
    toAddress: `text-[#f48706]`,
    txTimeStamp: `mx-2`,
    etherscanLink: `flex items-center text-[#2172e5]`,
}

const TransactionHistory = () => {
    const { isLoading, currentAccount } = useContext(TransactionContext)
    const [transactionHistory, setTransactionHistory] = useState([])

    useEffect(() => {
        ; (async () => {
            if (!isLoading && currentAccount) {

                //Query for fetching userInfo from database and store in clinetRes
                const query = `
                *[_type=="users" && _id == "${currentAccount}"]{
                    "transactionList": transactions[] ->{amount, toAddress, timestamp, txHash}|order(timestamp desc)[0..4]
                }
                `
                const clientRes = await client.fetch(query)

                setTransactionHistory(clientRes[0].transactionList)

            }
        })()

    }, [isLoading, currentAccount]) // whenever this changes the above query fires up

    return (
        <div className={style.wrapper}>
            <div>
                {transactionHistory &&
                    transactionHistory?.map((transaction, index) => (
                        <div className={style.txHistoryItem} key={index}>
                            <div className={style.txDetails}>
                                <Image src={ethLogo} height={20} width={15} alt='eth' />
                                {transaction.amount} Ξ sent to{''}
                                <span className={style.toAddress}>
                                    {transaction.toAddress.substring(0, 6)}...
                                </span>
                            </div>{' '}
                            on{' '}
                            <div className={style.txTimeStamp}>
                                {new Date(transaction.timestamp).toLocaleString('en-US', {
                                    timeZone: 'PST',
                                    hour12: true,
                                    timeStyle: 'short',
                                    dateStyle: 'long',
                                })}
                            </div>
                            <div className={style.etherscanLink}>
                                <a
                                    href={`https://rinkeby.etherscan.io/tx/${transaction.txHash}`}
                                    target='_blank'
                                    rel='noreferrer'
                                    className={style.etherscanLink}
                                >
                                    View on etherscan
                                    <FiArrowUpRight />
                                </a>
                            </div>
                        </div>
                    ))
                }

            </div>
        </div>
    )



}

export default TransactionHistory