import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import styles from '../styles/Home.module.css';
import { DecodeTxResponse } from './api/decodeTx';


const Home: NextPage = () => {
  const [txValue, setTxValue] = useState("");
  const [abiValue, setAbiValue] = useState("");
  const { mutate } = useSWRConfig()
  
  const onChangeTxInput = (value?: string) => {
    setTxValue(value || "")
    mutate(`/api/decodeTx?rawTxHex=${value}&abi=${encodeURIComponent(abiValue)}`)
  }
  
  const onChangeAbiInput = (value?: string) => {
    setAbiValue(value || "")
    mutate(`/api/decodeTx?rawTxHex=${txValue}&abi=${encodeURIComponent(value || "")}`)
  }
  
  const apiUrl = `/api/decodeTx?rawTxHex=${txValue}&abi=${encodeURIComponent(abiValue)}`
  const { data, error } = useSWR<DecodeTxResponse, Error>(txValue ? apiUrl : null, fetcher)
  
  const displayedResult = data?.decodedWithAbi || data?.decoded
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Ethereum Transaction Decoder</title>
        <meta name="description" content="Decode Ethereum transactions with ABI support" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-h-fit	m-10">
        <h1 className={styles.title}>
          Welcome to <a href="https://github.com/sea-edge/eth-tx-decoder">Ethereum Transaction Decoder!</a>
        </h1>
        <p className="text-gray-600 mt-4 text-center">
          Decode raw Ethereum transactions. Optionally provide an ABI to decode function calls and parameters.
        </p>
      </div>
      <form className="flex flex-col h-screen space-y-4">
        <div className="w-4/5 mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Raw Transaction (Required)
          </label>
          <textarea 
            className='
            block
            field-sizing-content
            resize
            text-base
            font-normal
            text-gray-700
            bg-white bg-clip-padding
            border border-solid border-gray-300
            rounded
            transition
            ease-in-out
            p-3
            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
            w-full
            min-h-24
            '
            placeholder='Input Raw Transaction! ex.) 0x02ff...'
            value={txValue}
            onChange={(e) => onChangeTxInput(e.target.value)}
          />
        </div>
        
        <div className="w-4/5 mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contract ABI (Optional - for function call decoding)
          </label>
          <textarea 
            className='
            block
            field-sizing-content
            resize
            text-base
            font-normal
            text-gray-700
            bg-white bg-clip-padding
            border border-solid border-gray-300
            rounded
            transition
            ease-in-out
            p-3
            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
            w-full
            min-h-32
            '
            placeholder='Paste contract ABI JSON here (optional)...'
            value={abiValue}
            onChange={(e) => onChangeAbiInput(e.target.value)}
          />
        </div>
        
        <div className="w-4/5 mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Decoded Result {data?.decodedWithAbi ? "(with ABI)" : "(basic)"}
          </label>
          {
            !data && txValue
              ? <p className="text-gray-500">Loading...</p>
              : error
              ? <p className="text-red-500">Error: {error.message}</p>
              : data?.errorMessage
              ? <p className="text-red-500">Error: {data.errorMessage}</p>
              : <textarea 
                  className='
                  block
                  h-auto
                  resize
                  text-base
                  font-mono
                  text-gray-700
                  bg-gray-50
                  border border-solid border-gray-300
                  rounded
                  transition
                  ease-in-out
                  p-3
                  focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                  w-full
                  min-h-64
                  '
                  value={displayedResult ? JSON.stringify(JSON.parse(displayedResult), null, 2) : ""}
                  readOnly
                />
          }
        </div>
      </form>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
const fetcher = (url: string) => fetch(url).then((r) => r.json())
