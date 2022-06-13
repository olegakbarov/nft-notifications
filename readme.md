# NFT notifications service

- currently works with Telegram
- requires tiny backend for storage of subscribtion data
- designed to be configurable

### Design

- Server runs jobs according to `src/scheduler.ts`
- In-memory message queue used to orchestrate jobs, queue tasks are essentially updates about to be sent out to user
