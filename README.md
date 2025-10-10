# Steps to run and use
## Start in three different terminals
In: ./backend/client-service
`npm start`

In: ./backend/admin-service
`npm start`

In ./frontend
`npm start`

## Post Request
```
curl -X POST http://localhost:5001/api/admin/events \
-H "Content-Type: application/json" \
-d '{"name": "TigerTix Launch Party", "date": "2025-10-20", "tickets": 150}'
```

## Get Endpoint and Post Request
http://localhost:6001/api/events

`curl -X POST http://localhost:6001/api/events/1/purchase`


