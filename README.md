# Example Electron License Manager

A minimal [Electron](https://electronjs.org) v12 + [React](https://reactjs.org) v17 app built
with [Parcel](https://github.com/parcel-bundler/parcel), showcasing how to implement
an in-app software licensing portal with the following functionality:

1. [License key validation](https://keygen.sh/docs/api/#licenses-actions-validate-key)
1. Device fingerprinting and [activation](https://keygen.sh/docs/api/#machines-create)
1. [Device management](https://keygen.sh/docs/api/#machines-list) and [deactivation](https://keygen.sh/docs/api/#machines-delete)
1. [Signature verification](https://keygen.sh/docs/api/#response-signatures)
1. [Auto-updates with electron-builder](https://keygen.sh/docs/api/#releases)

![image](https://user-images.githubusercontent.com/6979737/110702255-ea031180-81b7-11eb-9e07-c92134b06410.png)

## Running the example

First up, configure a couple application variables. The values below, embedded
within the app, are for our `demo` account. Feel free to find/replace to your
own account's values.

```bash
# Your Keygen account's DER encoded Ed25519 verify key
KEYGEN_VERIFY_KEY="MCowBQYDK2VwAyEA6GAeSLaTg7pSAkX9B5cemD0G0ixCV8/YIwRgFHnO54g="

# Your Keygen account ID
KEYGEN_ACCOUNT_ID="1fddcec8-8dd3-4d8d-9b16-215cac0f9b52"

# Your Keygen product ID
KEYGEN_PRODUCT_ID="7071feff-b5f3-434a-83c1-3ab3f3592325"
```

Next, install dependencies with [`yarn`](https://yarnpkg.comg):

```
yarn
```

Then start the app in dev mode:

```
yarn dev
```

## Configuring a license policy

Visit [your dashboard](https://app.keygen.sh/policies) and create a new
policy with the following attributes:

```json
{
  "requireFingerprintScope": true,
  "maxMachines": 5,
  "concurrent": false,
  "floating": true,
  "strict": true
}
```

The `maxMachines` value can be whatever you prefer. The example should
also work for a non-floating policy.

## Creating an activation token

In order to allow a license to perform machine activations and deactivations,
you will need to create a new [activation token](https://keygen.sh/docs/api/#licenses-relationships-activation-tokens).
Activation tokens allow a limited number of machine activations for a
single license, which make them ideal for performing activations from
a client-side environment.

**⚠️ This example assumes that, once created, the activation token be added
into the license's `metadata` attribute under the `token` key: ⚠️**

```json
{
  "metadata": {
    "token": "activ-abc8f8323c680b93082fc5fdb3abcb31v3"
  }
}
```

We're doing this so that the end-user does not need to worry about
entering the activation token, or that it even exists. Alternatively,
you could adjust the code to prompt the user for this value, similary
to how we're already prompting for their license key.

## Building and packaging

To build the app:

```
yarn build
```

To run the latest build:

```
yarn start
```

To package and publish the app:

```
yarn dist
```

## Questions?

Reach out at support@keygen.sh if you have any questions or concerns!
