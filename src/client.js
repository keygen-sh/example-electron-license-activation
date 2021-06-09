import crypto from 'crypto'
import url from 'url'

// NOTE(ezekg) Using multiple assignments here due to this bug:
//             https://github.com/jordansexton/babel-plugin-transform-inline-environment-variables/issues/2
const { KEYGEN_PUBLIC_KEY } = process.env
const { KEYGEN_ACCOUNT_ID } = process.env
const KEYGEN_BASE_URL = 'https://api.keygen.sh'

// There is likely a third-party module for this, but we want to show
// how to parse the signature header without one.
function parseParameterizedHeader(header) {
  if (header == null) {
    return null
  }

  const params = header.split(/\s*,\s*/g)
  const keyvalues = params.map(param => {
    const [, key, value] = param.match(/([^=]+)="([^"]+)"/i)

    return [key, value]
  })

  return keyvalues.reduce(
    (o, [k, v]) => (o[k] = v, o),
    {}
  )
}

// See: https://keygen.sh/docs/api/#response-signatures
async function verify({ method, url, date, body, signature }) {
  if (signature == null) {
    throw new Error('Signature was expected but is missing')
  }

  const uri = url.pathname + url.search
  const verifier = crypto.createVerify('sha256')
  const hash = crypto.createHash('sha256').update(body)
  const digest = `sha-256=${hash.digest('base64')}`
  const data = [
    `(request-target): ${method.toLowerCase()} ${uri}`,
    `host: api.keygen.sh`,
    `date: ${date}`,
    `digest: ${digest}`,
  ].join('\n')

  verifier.write(data)
  verifier.end()

  const ok = verifier.verify(KEYGEN_PUBLIC_KEY, signature, 'base64')
  if (!ok) {
    throw new Error('Signature does not match')
  }
}

async function parse(req, res) {
  let body = null

  // Verify the response signature's authenticity
  try {
    const { signature } = parseParameterizedHeader(res.headers.get('keygen-signature'))
    const date = res.headers.get('date')

    body = await res.text()

    await verify({
      method: req.method,
      url: new url.URL(req.url),
      date,
      body,
      signature,
    })
  } catch (e) {
    console.error(e)

    return {
      errors: [{ title: 'Signature invalid', detail: 'Response signature was invalid', code: 'SIGNATURE_INVALID' }]
    }
  }

  // Parse the JSON response
  return body != null && body !== ''
    ? JSON.parse(body)
    : {}
}

export async function validateLicenseKeyWithFingerprint(key, fingerprint) {
  const req = new Request(`${KEYGEN_BASE_URL}/v1/accounts/${KEYGEN_ACCOUNT_ID ?? ''}/licenses/actions/validate-key`, {
    method: 'POST',
    headers: {
      'Keygen-Accept-Signature': 'algorithm="rsa-sha256"',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      meta: {
        scope: { fingerprint },
        key,
      },
    }),
  })

  const res = await fetch(req)
  const {
    meta,
    data,
    errors,
  } = await parse(req, res)

  return {
    meta,
    data,
    errors,
  }
}

export async function activateMachineForLicense(license, fingerprint, name, platform, version) {
  const req = new Request(`${KEYGEN_BASE_URL}/v1/accounts/${KEYGEN_ACCOUNT_ID ?? ''}/machines`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${license?.attributes?.metadata?.token ?? ''}`,
      'Keygen-Accept-Signature': 'algorithm="rsa-sha256"',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type: 'machine',
        attributes: {
          fingerprint,
          name,
          platform,
          metadata: {
            version,
          },
        },
        relationships: {
          license: { data: { type: 'license', id: license?.id } },
        },
      },
    }),
  })

  const res = await fetch(req)
  const {
    data,
    errors,
  } = await parse(req, res)

  return {
    data,
    errors,
  }
}

export async function deactivateMachineForLicense(license, id) {
  const req = new Request(`${KEYGEN_BASE_URL}/v1/accounts/${KEYGEN_ACCOUNT_ID ?? ''}/machines/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${license?.attributes?.metadata?.token ?? ''}`,
      'Keygen-Accept-Signature': 'algorithm="rsa-sha256"',
      'Accept': 'application/json',
    },
  })

  const res = await fetch(req)
  const { errors } = await parse(req, res)

  return {
    errors,
  }
}

export async function listMachinesForLicense(license) {
  const req = new Request(`${KEYGEN_BASE_URL}/v1/accounts/${KEYGEN_ACCOUNT_ID ?? ''}/machines`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${license?.attributes?.metadata?.token ?? ''}`,
      'Keygen-Accept-Signature': 'algorithm="rsa-sha256"',
      'Accept': 'application/json',
    },
  })

  const res = await fetch(req)
  const {
    data,
    errors,
  } = await parse(req, res)

  return {
    data,
    errors,
  }
}
