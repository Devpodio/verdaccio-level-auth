# verdaccio-level-auth
A [Verdaccio](https://github.com/verdaccio/verdaccio) plugin that uses `level`(a NodeJs LevelDB wrapper) to store and authenticate user credentials.

This plugin hashes a user's password using sha256 and stores it on the specified file path.

## Install

As simple as running:

    $ npm install -g @devpodio/verdaccio-level-auth

## Configure
    auth:
        level-auth:
            file: ./userDb
            # Maximum amount of users allowed to register, defaults to "+infinity".
            # You can set this to -1 to disable registration.
            #max_users: 1000

## Logging In

To log in using NPM, run:

```
    npm adduser --registry  https://your.registry.local
```
