import { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import * as client from './client'

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
  key: '07953E-6E90C6-22BAD2-A66EFD-62923B-V3',

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
    const { key, fingerprint, listMachinesForLicense, checkForUpdates } = get()

    const { meta, data, errors } = await client.validateLicenseKeyWithFingerprint(key, fingerprint)
    if (errors) {
      return set(state => ({ ...state, errors }))
    }

    set(state => ({ ...state, validation: meta, license: data }))

    // List machines for the license if it exists (regardless of validity)
    if (data != null) {
      listMachinesForLicense()
    }

    // Check for updates if license is valid
    if (meta.valid) {
      checkForUpdates()
    }
  },

  activateMachineForLicense: async ({ name, platform, version }) => {
    const { license, fingerprint, listMachinesForLicense, validateLicenseKey } = get()

    const { errors } = await client.activateMachineForLicense(license, fingerprint, name, platform, version)
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

    const { errors } = await client.deactivateMachineForLicense(license, id)
    if (errors) {
      return set(state => ({ ...state, errors }))
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

    const { data, errors } = await client.listMachinesForLicense(license)
    if (errors) {
      return set(state => ({ ...state, errors }))
    }

    set(state => ({
      ...state,
      machines: data,
    }))
  },

  checkForUpdates: async () => {
    const { license } = get()

    return ipcRenderer.send('CHECK_FOR_UPDATES', license)
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
