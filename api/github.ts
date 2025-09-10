const headers = {
  Accept: 'application/vnd.github+json'
}

async function getMedusaLatestRelease() {
  const response = await fetch(
    'https://api.github.com/repos/Psycarlo/medusa-wallet/releases/latest',
    {
      headers
    }
  )

  const json = await response.json()

  if (response.ok) {
    if (!json.tag_name) throw new Error('Latest release not found')
    return json.tag_name as string
  } else {
    throw new Error('Latest release not found')
  }
}

export default { getMedusaLatestRelease }
