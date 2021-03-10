import { useLicensingStore, createStore } from './store'
import { ipcRenderer } from 'electron'
import React from 'react'
import styles from './LicenseActivator.scss'
import os from 'os'

const useDeviceInfoStore = createStore(set => ({
  version: `v${ipcRenderer.sendSync('GET_APP_VERSION')}`,
  electron: `v${process.versions.electron}`,
  node: `v${process.versions.node}`,
  platform: process.platform,
  name: os.hostname(),

  setName: name => set(state => ({ ...state, name }))
}))

const DeviceActivationInput = ({ name, platform, version, fingerprint, onNameChange, onSubmit }) => {
  return (
    <form onSubmit={e => (e.preventDefault(), onSubmit({ name, platform, version }))}>
      <div className={styles.LicenseActivatorTable}>
        <table>
          <thead>
            <tr>
              <th>Device Name</th>
              <th>Fingerprint</th>
              <th>Platform</th>
              <th>Version</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input type='text' placeholder='Enter a name for your device' value={name || ''} onChange={e => onNameChange(e.target.value)} />
              </td>
              <td>
                <input type='text' value={fingerprint} disabled={true} readOnly={true} />
              </td>
              <td>
                <input type='text' value={platform} disabled={true} readOnly={true} />
              </td>
              <td>
                <input type='text' value={version} disabled={true} readOnly={true} />
              </td>
              <td>
                <button type='submit'>
                  Activate
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </form>
  )
}

const LicenseActivator = () => {
  const { fingerprint, activateMachineForLicense } = useLicensingStore()
  const { name, platform, version, setName } = useDeviceInfoStore()

  return (
    <div className={styles.LicenseActivator}>
      <h3>
        <small>Activate Device</small>
        Your device has not been activated
      </h3>
      <DeviceActivationInput
        fingerprint={fingerprint}
        version={version}
        platform={platform}
        name={name}
        onNameChange={setName}
        onSubmit={activateMachineForLicense}
      />
    </div>
  )
}

export default LicenseActivator