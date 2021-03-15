# Example Electron License Manager

A minimal [Electron](https://electronjs.org) v12 + [React](https://reactjs.org) v17 app built
with [Parcel](https://github.com/parcel-bundler/parcel), showcasing how to implement
an in-app software licensing portal with the following functionality:

1. [License key validation](https://keygen.sh/docs/api/#licenses-actions-validate-key)
2. Device fingerprinting and [activation](https://keygen.sh/docs/api/#machines-create)
3. [Device management](https://keygen.sh/docs/api/#machines-list) and [deactivation](https://keygen.sh/docs/api/#machines-delete)
4. [Signature verification](https://keygen.sh/docs/api/#request-signatures)

![image](https://user-images.githubusercontent.com/6979737/110702255-ea031180-81b7-11eb-9e07-c92134b06410.png)

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

## Running the example

First up, configure a couple environment variables:

```bash
# Your Keygen account ID
export KEYGEN_ACCOUNT_ID="YOUR_KEYGEN_ACCOUNT_ID"

# Your Keygen account's public key (make sure it is *exact* - newlines and all)
export KEYGEN_PUBLIC_KEY=$(printf %b \
  '-----BEGIN PUBLIC KEY-----\n' \
  'zdL8BgMFM7p7+FGEGuH1I0KBaMcB/RZZSUu4yTBMu0pJw2EWzr3CrOOiXQI3+6bA\n' \
  # …
  'efK41Ml6OwZB3tchqGmpuAsCEwEAaQ==\n' \
  '-----END PUBLIC KEY-----')
```

These environment variables will be automatically inlined into the
application's source code during the build process. You can either run
each line above within your terminal session before building the app,
or you can add the above contents to your `~/.bashrc` file and then
run `source ~/.bashrc` after saving the file.

Next, install dependencies with [`yarn`](https://yarnpkg.comg):

```
yarn
```

Then start the app in dev mode:

```
yarn dev
```

## Building and packaging

To build the app:

```
yarn build
```

To run the latest build:

```
yarn start
```

To package the app:

```
yarn dist
```

## Questions?

Reach out at support@keygen.sh if you have any questions or concerns!
