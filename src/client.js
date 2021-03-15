import crypto from 'crypto'

let {
  // NOTE(ezekg) Demo values for example purposes only. Remove or replace
  //             then with your own account values for a real app.
  KEYGEN_PUBLIC_KEY = Buffer.from('LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF6UEFzZURZdXBLNzhaVWFTYkd3NwpZeVVDQ2VLby8xWHFUQUNPY21UVEhIR2dlSGFjTEsyajlVcmJUbGhXNWg4VnlvMGlVRUhyWTFLZ2Y0d3dpR2dGCmgwWWMrb0RXRGhxMWJJZXJ0STAzQUU0MjBMYnBVZjZPVGlvWCtuWTBFSW54WEYzSjdhQWR4L1IvbllnUkpyTFoKOUFUV2FRVlNnZjN2dHhDdEN3VWVLeEtaSTQxR0EvOUtIVGNDbWQzQnJ5QVExcGlZUHIrcXJFR2YyTkRKZ3IzVwp2VnJNdG5qZW9vcmRBYUNUeVlLdGZtNTZXR1hlWHI0M2RmZGVqQnVJa0k1a3FTendWeW94aG5qRS9SajZ4a3M4CmZmSCtka0FQTndtMElweFhKZXJ5YmptUFd5djdpeVhFVU44Q0tHKzY0MzBEN05vWUhwL2M5OTFaSFFCVXM1OWcKdndJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==', 'base64').toString(),
  KEYGEN_ACCOUNT_ID = '1fddcec8-8dd3-4d8d-9b16-215cac0f9b52',
} = process.env

// See: https://keygen.sh/docs/api/#request-signatures
async function verify(body, signature) {
  if (signature == null) {
    return
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
    const signature = res.headers.get('x-signature')
    body = await res.text()

    await verify(body, signature)
  } catch (e) {
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