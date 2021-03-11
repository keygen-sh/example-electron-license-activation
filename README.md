# Example Electron License Manager

A minimal [Electron](https://electronjs.org) + [React](https://reactjs.org) app built
with [Parcel](https://github.com/parcel-bundler/parcel), showcasing how to implement
an in-app software licensing portal with the following functionality:

1. License key validation
2. Device fingerprinting and activation
3. Device management

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

First up, configure a couple environment variables.

```bash
# Your Keygen account ID
export KEYGEN_ACCOUNT_ID="YOUR_KEYGEN_ACCOUNT_ID"
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