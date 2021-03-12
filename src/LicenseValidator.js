import { useLicensingStore } from './store'
import React from 'react'
import styles from './LicenseValidator.scss'

const LicenseKeyInput = ({ value, onChange, onSubmit }) => {
  return (
    <form onSubmit={e => (e.preventDefault(), onSubmit())}>
      <input type='text' placeholder='XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-V3' value={value ?? ''} onChange={e => onChange(e.target.value)} required={true} />
      <button type='submit'>
        Continue
      </button>
    </form>
  )
}

const LicenseValidator = () => {
  const { key, validation, validateLicenseKey, setKey } = useLicensingStore()

  return (
    <div className={styles.LicenseValidator}>
      <h2>
        <small>Login</small>
        Please enter a license key
      </h2>
      <LicenseKeyInput value={key} onChange={setKey} onSubmit={validateLicenseKey} />
    </div>
  )
}

export default LicenseValidator