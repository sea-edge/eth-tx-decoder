// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from 'ethers'
import type { NextApiRequest, NextApiResponse } from 'next'

export type DecodeTxResponse = {
    decoded?: string
    decodedWithAbi?: string
    errorMessage?: string
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<DecodeTxResponse>
) {
    try {
        const rawTxHex = req.query.rawTxHex as string
        const abi = req.query.abi as string

        if (!rawTxHex) {
            return res.status(400).json({ errorMessage: 'rawTxHex parameter is required' })
        }

        const decoded = ethers.Transaction.from(rawTxHex)
        let result: DecodeTxResponse = { decoded: JSON.stringify(decoded) }

        // If ABI is provided and transaction has data, try to decode with ABI
        if (abi && decoded.data && decoded.data !== '0x') {
            try {
                const parsedAbi = JSON.parse(abi)
                const iface = new ethers.Interface(parsedAbi)
                const decodedData = iface.parseTransaction({ data: decoded.data, value: decoded.value })
                
                if (decodedData) {
                    const abiDecodedResult = {
                        ...JSON.parse(JSON.stringify(decoded)),
                        functionName: decodedData.name,
                        functionSignature: decodedData.signature,
                        args: decodedData.args.map((arg, index) => ({
                            name: decodedData.fragment.inputs[index]?.name || `param${index}`,
                            type: decodedData.fragment.inputs[index]?.type || 'unknown',
                            value: arg.toString()
                        }))
                    }
                    result.decodedWithAbi = JSON.stringify(abiDecodedResult)
                }
            } catch (abiError) {
                // If ABI decoding fails, just return the basic decoded transaction
                // Don't throw error to maintain backward compatibility
                console.warn('ABI decoding failed:', abiError)
            }
        }

        res.status(200).json(result)

    } catch (e) {
        res.status(400).json({ errorMessage: 'Failed to decode transaction: ' + (e instanceof Error ? e.message : 'unknown error') })
    }
}
