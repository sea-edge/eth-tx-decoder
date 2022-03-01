// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from 'ethers'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
    decoded?: string
    errorMessage?: string

}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        const rawTxHex = req.query.rawTxHex as string
        const decoded = ethers.utils.parseTransaction(rawTxHex)
        res.status(200).json({ decoded: JSON.stringify(decoded) })

    } catch (e) {
        res.status(400).json({errorMessage: 'unknown error'})
    }
}
