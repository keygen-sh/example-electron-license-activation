import { useLicensingStore } from './store'
import React from 'react'
import styles from './LicensePortal.scss'
import LicenseValidator from './LicenseValidator'
import LicenseActivator from './LicenseActivator'
import LicenseManager from './LicenseManager'
import LicenseErrors from './LicenseErrors'
import LicenseInfo from './LicenseInfo'

const LicensePortal = () => {
  const { license, validation, errors } = useLicensingStore()

  if (errors?.length) {
    return (
      <>
        <LicenseErrors />
        <LicenseInfo />
        {errors.some(e => e.code === 'MACHINE_LIMIT_EXCEEDED')
          ? <LicenseManager />
          : null}
      </>
    )
  }

  if (license == null && validation == null) {
    return <LicenseValidator />
  }

  if (validation?.valid) {
    return (
      <>
        <LicenseInfo />
        <LicenseManager />
      </>
    )
  }

  switch (validation?.code) {
    case 'FINGERPRINT_SCOPE_MISMATCH':
    case 'NO_MACHINES':
    case 'NO_MACHINE':
      return (
        <>
          <LicenseInfo />
          <LicenseActivator />
        </>
      )
    default:
      return (
        <>
          <LicenseInfo />
        </>
      )
  }
}

export default LicensePortal
