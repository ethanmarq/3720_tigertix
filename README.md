# Steps to run and use
## Start in different terminals
In: ./backend/client-service
`npm start`

In: ./backend/admin-service
`npm start`

In: ./backend/llm-service
`npm start`

In ./frontend
`npm start`

## Post Request / Add event to database
```
curl -X POST http://localhost:10000/api/admin/events \
-H "Content-Type: application/json" \
-d '{"name": "TigerTix Launch Party", "date": "2025-10-20", "tickets": 150}'
```

## Get Endpoint and Post Request
http://localhost:6001/api/events

`curl -X POST http://localhost:6001/api/events/1/purchase`

## Install Ollama and llama3.1:8b
1. https://ollama.com/download
2. In a terminal `ollama pull llama3.1:8b`

## Requirements for playwrite testing
`npm install --save-dev @axe-core/playwright`
