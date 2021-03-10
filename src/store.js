import { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'

const {
  KEYGEN_ACCOUNT_ID = '1fddcec8-8dd3-4d8d-9b16-215cac0f9b52',
  // TODO(ezekg) Add request signature verification to prevent MITM attacks
  // TODO(ezekg) Add offline support?
  // KEYGEN_PUBLIC_KEY,
} = process.env

const createEmitter = () => {
  const subscriptions = new Map()
  return {
    emit: v => subscriptions.forEach(fn => fn(v)),
    subscribe: fn => {
      const key = Symbol()
      const unsubscribe = () => subscriptions.delete(key)

      subscriptions.set(key, fn)

      return unsubscribe
    },
  }
}

// See: https://formidable.com/blog/2021/stores-no-context-api/
export const createStore = init => {
  const emitter = createEmitter()

  let store = null
  const get = () => store
  const set = op => (store = op(store), emitter.emit(store))
  store = init(set, get)

  const useStore = () => {
    const [localStore, setLocalStore] = useState(get())

    useEffect(() => emitter.subscribe(setLocalStore), [])

    return localStore
  }

  return useStore
}

// Store for licensing state
export const useLicensingStore = createStore((set, get) => ({

  // The fingerprint of the current device
  fingerprint: ipcRenderer.sendSync('GET_DEVICE_FINGERPRINT'),

  // The current license key
  key: '7ECED4-AAC314-2F0C99-D81643-4C66B9-V3',

  // The result of the most recent license validation
  validation: null,

  // The current license object
  license: null,

  // List of activated machine objects
  machines: [],

  // API errors
  errors: [],

  setKey: key => set(state => ({ ...state, key })),

  validateLicenseKey: async () => {
    const { key, fingerprint, listMachinesForLicense } = get()

    const res = await fetch(`https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}/licenses/actions/validate-key`, {
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

    const { meta, data, errors } = await res.json()
    if (errors) {
      return set(state => ({ ...state, errors }))
    }

    set(state => ({ ...state, validation: meta, license: data }))

    // List machines for the license if it exists (regardless of validity)
    if (data != null) {
      listMachinesForLicense()
    }
  },

  activateMachineForLicense: async ({ name, platform, version }) => {
    const { license, fingerprint, listMachinesForLicense, validateLicenseKey } = get()

    const res = await fetch(`https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}/machines`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${license?.attributes?.metadata?.token}`,
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

    const { errors } = await res.json()
    if (errors) {
      // List machines to give the user the option to free up activation slots
      listMachinesForLicense()

      return set(state => ({ ...state, errors }))
    }

    // Clear errors if activation was successful
    set(state => ({ ...state, errors: [] }))

    // List machines
    listMachinesForLicense()

    // Revalidate the current license
    validateLicenseKey()
  },

  deactivateMachineForLicense: async id => {
    const { license, validateLicenseKey, listMachinesForLicense } = get()

    const res = await fetch(`https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}/machines/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${license?.attributes?.metadata?.token}`,
        'Accept': 'application/json',
      },
    })

    if (res.status !== 204) {
      const { errors } = await res.json()
      if (errors) {
        return set(state => ({ ...state, errors }))
      }
    }

    // Clear errors if deactivation was successful
    set(state => ({ ...state, errors: [] }))

    // Relist machines
    listMachinesForLicense()

    // Revalidate the current license
    validateLicenseKey()
  },

  listMachinesForLicense: async () => {
    const { license } = get()

    const res = await fetch(`https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}/machines`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${license?.attributes?.metadata?.token}`,
        'Accept': 'application/json',
      },
    })

    const { data, errors } = await res.json()
    if (errors) {
      return set(state => ({ ...state, errors }))
    }

    set(state => ({
      ...state,
      machines: data,
    }))
  },

  clearError: error => {
    const { errors } = get()

    set(state => ({ ...state, errors: errors.filter(e => e !== error) }))
  },

  reset: () => {
    set(state => ({
      ...state,
      key: null,
      validation: null,
      license: null,
      machines: [],
      errors: [],
    }))
  }
}))