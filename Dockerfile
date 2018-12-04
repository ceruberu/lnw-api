FROM mhart/alpine-node:10

WORKDIR /app
COPY . .

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python

RUN yarn install

RUN yarn build

ENV PORT 4000
EXPOSE 4000
CMD ["node", "./build/index.js"]