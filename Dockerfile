# Dockerfile
FROM public.ecr.aws/smartlog/node:16.13.0-alpine3.14
WORKDIR /usr/src/app

COPY ./package.json ./yarn.lock  ./

# RUN yarn
RUN yarn
# Bundle app source
COPY ./ .
RUN mkdir log
RUN yarn build
EXPOSE 3000
CMD [ "node", "--max-old-space-size=9216", "dist/src/main.js" ]