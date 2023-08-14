# Nextg Inventory API

## Installation

```bash
# install packages
$ npm install
```

## Running the app on Local

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running the app on Docker

```bash
# development watch mode
$ docker-compose up -d
```

## Deploy to server

```bash
# development watch mode
$ docker-compose up -d
```

### Setup nginx

install nginx
create file /etc/nginx/conf.d/api.conf

```text
server {
        server_name api-dev.salonready.io;
        client_max_body_size 100M;
        location / {
                proxy_pass http://localhost:5000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}
```

### Setup certbot to certificate

install certbot

```bash
# add certificate for domain 
$ certbot --nginx -d api-dev.salonready.io
```
