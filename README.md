# verdaccio-level-auth
A [Verdaccio](https://github.com/verdaccio/verdaccio) plugin that uses `level`(a NodeJs LevelDB wrapper) to store and authenticate user credentials.

This plugin hashes a user's password using sha256 and stores it on the specified file path.

## Install

As simple as running:

    $ npm install -g verdaccio-level-auth

## Configure
    auth:
        level-auth:
            file: ./userDb
            # Maximum amount of users allowed to register, defaults to "+infinity".
            # You can set this to -1 to disable registration.
            #max_users: 1000

## Docker-compose usage

- Install [Docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/)

- Create directory `mkdir -p verdaccio-docker` and open it `cd verdaccio-docker`

- Create `config.yaml` with the following contents:

```yaml
storage: /home/nodeuser/storage
plugins: /home/nodeuser/plugins
auth:
  level-auth:
    file: /home/nodeuser/conf/userdb

security:
  api:
    jwt:
      sign:
        expiresIn: 60d
        notBefore: 1
  web:
    sign:
      expiresIn: 7d

uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  '@*/*':
    access: $authenticated
    publish: $authenticated
    proxy: npmjs
  '**':
    access: $authenticated
    publish: $authenticated
    proxy: npmjs

middlewares:
  audit:
    enabled: true

web:
  enable: true
  title: Your Registry Title

logs:
  - {type: stdout, format: pretty, level: trace}

url_prefix: https://your.hostname.com/ # or http://localhost:4873/
```

- Create a `Dockerfile` with the following contents

```
FROM devpodio/base:bionic-10

USER nodeuser

WORKDIR /home/nodeuser

RUN npm i verdaccio@next verdaccio-level-auth -g

RUN mkdir -p conf plugins storage

ADD ./config.yaml /home/nodeuser/conf/config.yaml

EXPOSE 4873

CMD [ "verdaccio", "--config", "/home/nodeuser/conf/config.yaml", "--listen", "http://0.0.0.0:4873" ]
```

- Create a `docker-compose.yaml` file with the following contents:

```yaml
version: '2.1'
services:
  verdaccio:
    build: .
    container_name: verdaccio
    ports:
      - "4873:4873"
    volumes:
        - "verdaccio:/home/nodeuser"
volumes:
  verdaccio:
    driver: local

```

- Then run `docker-compose up -d`

## Logging In

To log in using NPM, run:

```
    npm adduser --registry  https://your.hostname.com/
```
