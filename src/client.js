import crypto from 'crypto'

// NOTE(ezekg) Using multiple assignments here due to this bug:
//             https://github.com/jordansexton/babel-plugin-transform-inline-environment-variables/issues/2
const { KEYGEN_PUBLIC_KEY } = process.env
const { KEYGEN_ACCOUNT_ID } = process.env

// See: https://keygen.sh/docs/api/#request-signatures
async function verify(status, body, signature) {
  if (signature == null) {
    if (status >= 400 && status <= 599) {
      return // Some error payloads are not signed (e.g. authentication)
    }

    throw new Error('Signature was expected but is missing')
  }

  const verifier = crypto.createVerify('sha256')
  verifier.write(body)
  verifier.end()

  const ok = verifier.verify(KEYGEN_PUBLIC_KEY, signature, 'base64')
  if (!ok) {
    throw new Error('Signature does not match')
  }
}

async function parse(res) {
  let body = null

  // Verify the response signature's authenticity
  try {
    const { status, headers } = res
    const signature = headers.get('x-signature')
    body = await res.text()

    await verify(status, body, signature)
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
  const res = await fetch(`https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID ?? ''}/licenses/actions/validate-key`, {
    method: 'POST',
    headers: {
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

  const { meta, data, errors } = await parse(res)

  return {
    meta,
    data,
    errors,
  }
}

export async function activateMachineForLicense(license, fingerprint, name, platform, version) {
  const res = await fetch(`https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID ?? ''}/machines`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${license?.attributes?.metadata?.token ?? ''}`,
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

  const { data, errors } = await parse(res)

  return {
    data,
    errors,
  }
}

export async function deactivateMachineForLicense(license, id) {
  const res = await fetch(`https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID ?? ''}/machines/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${license?.attributes?.metadata?.token ?? ''}`,
      'Accept': 'application/json',
    },
  })

  const { errors } = await parse(res)

  return {
    errors,
  }
}

export async function listMachinesForLicense(license) {
  const res = await fetch(`https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID ?? ''}/machines`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${license?.attributes?.metadata?.token ?? ''}`,
      'Accept': 'application/json',
    },
  })

  const { data, errors } = await parse(res)

  return {
    data,
    errors,
  }
}