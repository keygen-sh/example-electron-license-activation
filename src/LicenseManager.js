import { useLicensingStore } from './store'
import React from 'react'
import styles from './LicenseManager.scss'

const LicenseManager = () => {
  const { license, fingerprint, machines, deactivateMachineForLicense } = useLicensingStore()
  const isActivated = machines.some(m => m.attributes.fingerprint === fingerprint)

  return (
    <div className={styles.LicenseManager}>
      <h3>
        <small>Manage devices</small>
        Using {machines.length} of {license.attributes.maxMachines} seats
      </h3>
      <p className={styles.LicenseManagerInfo}>
        The current device {isActivated ? <em>is</em> : <em>is not</em>} activated. Deactivate devices to free up seats.
      </p>
      <div className={styles.LicenseManagerTable}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Device Name</th>
              <th>Activated On</th>
              <th>Platform</th>
              <th>Version</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {machines.map(machine =>
              <tr key={machine.id}>
                <td>
                  <code>{machine.id.slice(0, 8)}</code>
                </td>
                <td>
                  {machine.attributes.name}
                  {machine.attributes.fingerprint === fingerprint
                    ? <span className={styles.LicenseManagerTag}>Current</span>
                    : null}
                </td>
                <td>
                  <input type='date' value={machine.attributes.created.split('T')[0]} disabled={true} />
                </td>
                <td>
                  <code>{machine.attributes.platform}</code>
                </td>
                <td>
                  <code>{machine.attributes.metadata.version}</code>
                </td>
                <td>
                  <button type='button' onClick={e => deactivateMachineForLicense(machine.id)}>
                    Deactivate
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LicenseManager