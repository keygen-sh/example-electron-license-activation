import { useLicensingStore } from './store'
import React from 'react'
import styles from './LicenseErrors.scss'

const LicenseErrors = () => {
  const { errors, clearError } = useLicensingStore()

  return (
    <div className={styles.LicenseErrors}>
      <h3>
        <small>Licensing API</small>
        An error has occurred
      </h3>
      <div className={styles.LicenseErrorsTable}>
        <table>
          <thead>
            <tr>
              <th>Error Title</th>
              <th>Message</th>
              <th>Code</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {errors.map((error, i) =>
              <tr key={i}>
                <td>
                  {error.title}
                </td>
                <td>
                  {error.source != null
                    ? <><code>{error.source.pointer}</code> </>
                    : null}
                  {error.detail}
                </td>
                <td>
                  <code>{error.code ?? 'N/A'}</code>
                </td>
                <td>
                  <button type='button' onClick={e => clearError(error)}>
                    Clear
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

export default LicenseErrors