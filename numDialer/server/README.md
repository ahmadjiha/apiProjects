# Back-end specification

## Requirements
1. Dial three numbers simultaneously at all times (unless less than three numbers left).
  - When a phone call finishes, dial the next number in the list (in order).
2. Dial by the order they are given.
3. This logic must be in the back-end.
  - Client cannot initiate more than 3 calls at a time.
  - Client cannot dial numbers outside of list.
  - Client cannot dial numbers out of order.
4. No database. Maintain state of calls in memory.
5. One user and the user only dials down the list a single time.

## Different Stages in Phone Call
1. idle
2. ringing
3. answered
4. completed

## Endpoints
API Endpoint:
  - request type: `POST`
  - path: `localhost:4830/call`
  - payload: `{ phone: $phone(string), webhookURL: $url(string)}`
  - responseType: application/json
  - payload: `{ id: $(numberUniquelyIdentifyingCall) }`

Server Endpoint:
  - request type: `POST`
  - path: `webhookURL`
  - requestType: application/json
  - payload: `{ id: $id(integer), status: $status(string)}`

Front-End Endpoint:
  - request type: `POST`
  - path: `/calls`


## Style
- None required