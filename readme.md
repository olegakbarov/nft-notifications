# NFT notifications service

- currently works with Telegram
- requires tiny backend for storage of subscribtion data
- designed to be configurable

### Design

- Server runs jobs according to `src/scheduler.ts`
- In-memory message queue used to orchestrate jobs, queue tasks are essentially updates about to be sent out to user

### Running locally

[TODO] Spin up a hasura db with following metadata files

Populate `.env`

`yarn start` will result with:

```
Worker for job "fetchLatestSalesForCollection" online undefined
Worker for job "fetchLatestCollections" online undefined
Worker for job "fetchLatestSalesForCollection" sent a message {
  message: 'subscribedUsersList: {"subs_latest_sales":[{"collectionAddress":"0x5180db8F5c931aaE63c74266b211F580155ecac8","chatId":121762741}]}'
}
No sale found for 0x5180db8F5c931aaE63c74266b211F580155ecac8
Worker for job "fetchLatestSalesForCollection" exited with code 0 undefined
Worker for job "fetchLatestCollections" signaled completion { message: 'done' }
```
