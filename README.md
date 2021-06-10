# Example Electron License Manager

A minimal [Electron](https://electronjs.org) v12 + [React](https://reactjs.org) v17 app built
with [Parcel](https://github.com/parcel-bundler/parcel), showcasing how to implement
an in-app software licensing portal with the following functionality:

1. [License key validation](https://keygen.sh/docs/api/#licenses-actions-validate-key)
2. Device fingerprinting and [activation](https://keygen.sh/docs/api/#machines-create)
3. [Device management](https://keygen.sh/docs/api/#machines-list) and [deactivation](https://keygen.sh/docs/api/#machines-delete)
4. [Signature verification](https://keygen.sh/docs/api/#response-signatures)

![image](https://user-images.githubusercontent.com/6979737/110702255-ea031180-81b7-11eb-9e07-c92134b06410.png)

## Running the example

First up, configure a couple environment variables. The values below
are for our `demo` account, which can be used in this example.

```bash
# Your Keygen account's public key (make sure it is *exact* - newlines and all)
export KEYGEN_PUBLIC_KEY=$(echo -n LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF6UEFzZURZdXBLNzhaVWFTYkd3NwpZeVVDQ2VLby8xWHFUQUNPY21UVEhIR2dlSGFjTEsyajlVcmJUbGhXNWg4VnlvMGlVRUhyWTFLZ2Y0d3dpR2dGCmgwWWMrb0RXRGhxMWJJZXJ0STAzQUU0MjBMYnBVZjZPVGlvWCtuWTBFSW54WEYzSjdhQWR4L1IvbllnUkpyTFoKOUFUV2FRVlNnZjN2dHhDdEN3VWVLeEtaSTQxR0EvOUtIVGNDbWQzQnJ5QVExcGlZUHIrcXJFR2YyTkRKZ3IzVwp2VnJNdG5qZW9vcmRBYUNUeVlLdGZtNTZXR1hlWHI0M2RmZGVqQnVJa0k1a3FTendWeW94aG5qRS9SajZ4a3M4CmZmSCtka0FQTndtMElweFhKZXJ5YmptUFd5djdpeVhFVU44Q0tHKzY0MzBEN05vWUhwL2M5OTFaSFFCVXM1OWcKdndJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg== | base64 --decode)

# Your Keygen account ID
export KEYGEN_ACCOUNT_ID="1fddcec8-8dd3-4d8d-9b16-215cac0f9b52"
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

To package the app:

```
yarn dist
```

## Questions?

Reach out at support@keygen.sh if you have any questions or concerns!
