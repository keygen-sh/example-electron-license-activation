import { useLicensingStore } from './store'
import React from 'react'
import styles from './LicenseInfo.scss'

const LicenseInfo = () => {
  const { license, machines, validation, reset } = useLicensingStore()
  const created = license?.attributes?.created?.split('T')?.[0]
  const expiry = license?.attributes?.expiry?.split('T')?.[0]

  return (
    <div className={styles.LicenseInfo}>
      <h2>
        <small>{license?.attributes?.name ?? 'License key'}</small>
        {license?.attributes?.key ?? 'N/A'}
        {validation?.valid
          ? <span className={styles.LicenseInfoValidTag}>Valid</span>
          : <span className={styles.LicenseInfoInvalidTag}>Invalid</span>}
      </h2>
      <div className={styles.LicenseInfoTable}>
        <table>
          <thead>
            <tr>
              <th>Issued On</th>
              <th>Valid Until</th>
              <th># Seats</th>
              <th>Validation Code</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {created != null
                  ? <input type='date' value={created} disabled={true} readOnly={true} />
                  : <input type='text' value='N/A' disabled={true} readOnly={true} />}
              </td>
              <td>
                {expiry != null
                  ? <input type='date' value={expiry} disabled={true} readOnly={true} />
                  : <input type='text' value='N/A' disabled={true} readOnly={true} />}
              </td>
              <td>
                <strong>{machines.length}/{license?.attributes?.maxMachines || 0}</strong>
              </td>
              <td>
                <code>{validation?.code}</code>
              </td>
              <td>
                <button type='button' onClick={e => reset()}>
                  Logout
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LicenseInfo
