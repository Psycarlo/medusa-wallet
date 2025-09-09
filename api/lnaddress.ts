import { WellKnownSchema } from '@/schemas/lnaddress'
import { type WellKnown } from '@/types/lnaddress'
import parse from '@/utils/parse'

const BASE_URL = 'https://'

const headers = { 'Content-Type': 'application/json' }

async function wellKnown(lnaddress: string, needsParse: boolean = true) {
  let url: string = lnaddress

  if (needsParse) {
    const parsedLNAddress = parse.lnaddress(lnaddress)
    if (!parsedLNAddress) return false

    url = `${BASE_URL}${parsedLNAddress.domain}/.well-known/lnurlp/${parsedLNAddress.username}`
  }

  try {
    const response = await fetch(url, {
      headers,
      method: 'GET'
    })
    const json = await response.json()

    const { data, error } = WellKnownSchema.safeParse(json)

    if (error || !data.callback || !data.minSendable || !data.maxSendable) {
      // TODO
      throw new Error() // TODO
    }

    const wellKnown: WellKnown = {
      callback: data.callback,
      minSendable: data.minSendable,
      maxSendable: data.maxSendable,
      commentAllowed: data.commentAllowed,
      metadata: data.metadata
    }

    return wellKnown
  } catch (_error) {
    //
    return false
  }
}

export default { wellKnown }
