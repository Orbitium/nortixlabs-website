# Akademiz Backend API Documentation

## Base URL
```
http://localhost:3000
```
In production, replace with your actual domain served through Cloudflare Tunnel.

---

## Authentication

Endpoints are protected with Firebase authentication:
- **Admin endpoints** (create, delete, upload) require a Firebase ID token with `admin: true` custom claim
- **View/Like endpoints** require any authenticated Firebase user (including anonymous users)

### Headers
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

---

## Endpoints

### 🏥 Health Check

#### `GET /health`
Check if the API is running.

**Authentication:** Not required

**Response:**
```json
{
  "status": "ok",
  "time": "2026-02-05T12:34:53.000Z"
}
```

---

## 📌 Master Widgets

### Get Master News Widgets

#### `GET /master/news-widgets`
Returns the precomputed widget payload for the `Bugun` and `Bu Hafta` cards shown at the top of the master news tab.

**Authentication:** Required

**Headers:**
```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
Accept: application/json
```

**Optional Query Parameters:**
- `scheduleId` (integer) - Override schedule selection if the client already knows the exact schedule record
- `classKey` (string) - Override inferred class key such as `grade1`
- `classIndex` (integer) - Select a class by ordered index; if omitted and multiple classes exist, backend defaults to index `0`
- `programName` (string) - Hint used when matching the user to a schedule by program

**Response:**
```json
{
  "sections": [
    {
      "id": "today",
      "title": "Bugün",
      "cards": [
        {
          "id": "today-classes",
          "kind": "lesson",
          "subtitle": "Bugünkü dersler",
          "value": "3 ders var",
          "trailingText": "İlk 08:30",
          "action": {
            "type": "openSchedule"
          }
        },
        {
          "id": "today-event",
          "kind": "event",
          "subtitle": "En yakın etkinlik",
          "value": "Yapay Zeka Atolyesi",
          "trailingText": "17:30",
          "action": {
            "type": "open_tab",
            "targetTabIndex": 1
          }
        },
        {
          "id": "today-news",
          "kind": "news",
          "subtitle": "Bugün yayımlanan haber",
          "value": "4 haber",
          "action": {
            "type": "scroll_news_list"
          }
        },
        {
          "id": "today-community",
          "kind": "community",
          "subtitle": "Bugün topluluk gönderileri",
          "value": "2 gönderi",
          "action": {
            "type": "open_tab",
            "targetTabIndex": 2
          }
        }
      ]
    },
    {
      "id": "week",
      "title": "Bu Hafta",
      "cards": [
        {
          "id": "week-event",
          "kind": "event",
          "subtitle": "Bu hafta öne çıkan etkinlik",
          "value": "Kariyer Günleri",
          "trailingText": "Per",
          "action": {
            "type": "open_tab",
            "targetTabIndex": 1
          }
        },
        {
          "id": "week-news",
          "kind": "news",
          "subtitle": "Bu hafta yayımlanan haber",
          "value": "9 haber",
          "action": {
            "type": "scroll_news_list"
          }
        },
        {
          "id": "week-community",
          "kind": "community",
          "subtitle": "Bu hafta topluluk gönderileri",
          "value": "6 gönderi",
          "action": {
            "type": "open_tab",
            "targetTabIndex": 2
          }
        }
      ]
    }
  ],
  "academicContext": {
    "seed": 183741092,
    "scheduleId": 12,
    "programName": "Bilisim Guvenligi Teknolojisi",
    "classKey": "carsamba-ticaret-borsasi-myo-bilisim-guvenligi-tekn-grade1",
    "selectedClassIndex": 0,
    "availableClassKeys": [
      "carsamba-ticaret-borsasi-myo-bilisim-guvenligi-tekn-grade1",
      "carsamba-ticaret-borsasi-myo-bilisim-guvenligi-tekn-grade2"
    ],
    "inferredGrade": 1,
    "matchedBy": "seeded",
    "faculty": {
      "key": "carsamba-ticaret-borsasi-myo",
      "name": "Carsamba Ticaret Borsasi MYO"
    },
    "department": {
      "key": "carsamba-ticaret-borsasi-myo-bilisim-guvenligi-tekn",
      "name": "Bilisim Guvenligi Teknolojisi"
    },
    "grade": {
      "key": "carsamba-ticaret-borsasi-myo-bilisim-guvenligi-tekn-grade1",
      "name": "1. Grade",
      "level": 1
    },
    "isSeededFallback": true
  }
}
```

**Notes:**
- The backend owns section order, card order, labels, counts, featured event selection, and action payloads.
- Empty states are still returned as cards when possible, for example `0 haber`, `0 gonderi`, or `Etkinlik yok`.
- The `today` section now also includes a compact `lesson` card for today's classes, using the resolved student schedule and selected faculty/department/grade context.
- The backend now filters today/week content against the resolved user context using current time, matched schedule/program, and selected class lessons.
- `academicContext` describes the schedule/class selection used for lesson cards and content filtering, including the resolved faculty, department, and grade when available.
- When the authenticated user's `facultyKey`, `departmentKey`, and `gradeKey` are all empty and no schedule/class/program query hints are sent, the backend picks a deterministic seeded faculty/department/grade fallback from the registered academic tree and returns it with `matchedBy: "seeded"` and `isSeededFallback: true`.
- The seeded fallback is derived from the Firebase `uid`, so the same user receives the same fallback academic context across requests while different users are spread across the available grades.
- If the client does not send a selected class and multiple class keys exist, the backend assumes class index `0`.
- If profile data is not enough to identify the correct schedule, the optional query hints above can make the response deterministic without changing the response shape.

---

## 📰 News Endpoints

### Get All News

#### `GET /news`
Retrieve all news articles, ordered by publish date (newest first).

**Authentication:** Not required

**Response:**
```json
[
  {
    "id": 1,
    "title": "News Title",
    "summary": "News summary content...",
    "authorName": "Author Name",
    "heroImage": "https://example.com/image.jpg",
    "detailUrl": "https://carsambamyo.omu.edu.tr/tr/haberler/detail",
    "publishedAt": "2026-02-05T10:00:00.000Z",
    "publishedAtText": "5 Şubat 2026",
    "tags": "[]",
    "imageUrls": "[]",
    "fullText": "Full article content...",
    "excelAttachments": [
      {
        "url": "https://example.com/file.xlsx",
        "content": [/* parsed excel data */]
      }
    ],
    "views": 150,
    "likes": 23,
    "createdAt": "2026-02-05T09:00:00.000Z"
  }
]
```

**Fields:**
- `excelAttachments`: Array of objects containing URL and parsed Excel data
- `tags`, `imageUrls`: JSON arrays stored as strings (parse with `JSON.parse()`)

---

### Increment News Views

#### `POST /news/view`
Increment the view count for a specific news article once per user (idempotent per Firebase `uid`).

Legacy endpoint still supported: `POST /news/:id/view`

**Authentication:** Required (Anonymous or Authenticated user)

**Request Body:**
```json
{
  "id": 123
}
```

- `id` (integer, required) - News article ID (`newsId` is not used)

**Response:**
```json
{
  "views": 151,
  "likes": 23,
  "counted": true
}
```

- `counted: true` means this request increased the counter.
- `counted: false` means user already viewed this item before (no duplicate increment).

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `401 Unauthorized` - No token provided or invalid token
- `404 Not Found` - News article not found

---

### Increment News Likes

#### `POST /news/like`
Increment the like count for a specific news article once per user (idempotent per Firebase `uid`).

Legacy endpoint still supported: `POST /news/:id/like`

**Authentication:** Required (Anonymous or Authenticated user)

**Request Body:**
```json
{
  "id": 123
}
```

- `id` (integer, required) - News article ID (`newsId` is not used)

**Response:**
```json
{
  "views": 151,
  "likes": 24,
  "counted": true
}
```

- `counted: true` means this request increased the counter.
- `counted: false` means user already liked this item before (no duplicate increment).

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `401 Unauthorized` - No token provided or invalid token
- `404 Not Found` - News article not found
 
 ---
 
### Submit Feedback

#### `POST /feedback`
Submit user feedback from the mobile app.

**Authentication:** Not required

**Request Body:**
```json
{
  "subject": "App Crash",
  "message": "The app crashes when I open the news tab.",
  "email": "user@example.com",
  "userId": "firebase_uid_123",
  "platform": "android",
  "timestamp": "2026-02-12T01:47:45Z"
}
```

**Required Fields:**
- `subject` (string)
- `message` (string)

**Optional Fields:**
- `email` (string)
- `userId` (string)
- `platform` (string) - 'android' or 'ios'
- `timestamp` (string) - ISO8601 string

**Response:**
```json
{
  "success": true,
  "message": "Feedback received successfully!",
  "id": 1
}
```

**Error Responses:**
- `400 Bad Request` - Missing subject or message
- `500 Internal Server Error` - Database failure

---

## 🎉 Events Endpoints

### Get All Events

#### `GET /events`
Retrieve active events, ordered by creation date (newest first). Draft/inactive events are hidden from this public endpoint.

**Authentication:** Not required

**Response:**
```json
[
  {
    "id": 1,
    "title": "University Festival",
    "description": "Annual spring festival with concerts and activities",
    "eventLength": 3.5,
    "location": "Main Campus",
    "date": "2026-03-15T14:00:00.000Z",
    "thumbnailUrl": "/uploads/events/event-1234567890.webp",
    "thumbnailFullUrl": "https://your-domain.com/uploads/events/event-1234567890.webp",
    "carouselImages": "[\"image1.jpg\", \"image2.jpg\"]",
    "carouselImageFullUrls": [
      "https://your-domain.com/image1.jpg",
      "https://your-domain.com/image2.jpg"
    ],
    "tags": "[\"festival\", \"music\"]",
    "maxJoiners": 500,
    "joiners": "[\"user1@example.com\", \"user2@example.com\"]",
    "views": 320,
    "likes": 45,
    "isActive": true,
    "createdAt": "2026-02-01T10:00:00.000Z"
  }
]
```

**Fields:**
- `eventLength`: Duration in hours
- `carouselImages`, `tags`, `joiners`: JSON arrays stored as strings
- `thumbnailFullUrl`, `carouselImageFullUrls`: Ready-to-use absolute image URLs for clients
- `isActive`: Public event responses only include `true` events.
- Parse with `JSON.parse()` to use

---

### Get Admin Events

#### `GET /admin/events`
Retrieve all events for the admin panel, including active, inactive, and draft events.

**Authentication:** Required (Admin)

**Response notes:**
- Same event shape as create/edit admin responses.
- Includes `isActive`.
- Includes `status`, returned as `"active"` when `isActive=true` and `"draft"` when `isActive=false`.

---

### Create Event

#### `POST /events/create`
Create a new event.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "University Festival",
  "date": "2026-03-15T14:00:00.000Z",
  "description": "Annual spring festival",
  "publisher": "Akademiz",
  "eventLength": 3.5,
  "location": "Main Campus",
  "thumbnailUrl": "/uploads/events/event-1234567890.webp",
  "carouselImages": "[\"image1.jpg\", \"image2.jpg\"]",
  "tags": "[\"festival\", \"music\"]",
  "maxJoiners": 500,
  "isActive": true
}
```

**Required Fields:**
- `title` (string)
- `date` (ISO 8601 datetime string)
- `description` (string)
- `publisher` or `creatorName` (string)

No fields are required when creating a draft/inactive event with `isActive: false`, `status: "draft"`, `status: "inactive"`, or `saveAsDraft: true`.

**Optional Fields:**
- `publisher` (string) - Event publisher/creator name
- `creatorName` (string) - Alias for `publisher`
- `eventLength` (number) - Duration in hours
- `location` (string)
- `thumbnailUrl` (string)
- `carouselImages` (JSON string)
- `tags` (JSON string)
- `maxJoiners` (integer)
- `isActive` (boolean) - `true` shows the event to users; `false` hides it from public event endpoints
- `status` (string) - Alternative to `isActive`; accepts `"active"`, `"inactive"`, or `"draft"`
- `saveAsDraft` (boolean) - If `true`, saves the new event as inactive/draft

**Response:**
```json
{
  "id": 2,
  "title": "University Festival",
  "date": "2026-03-15T14:00:00.000Z",
  "description": "Annual spring festival",
  "eventLength": null,
  "location": null,
  "thumbnailUrl": null,
  "thumbnailFullUrl": null,
  "carouselImages": "[]",
  "carouselImageFullUrls": [],
  "tags": "[]",
  "maxJoiners": null,
  "joiners": "[]",
  "views": 0,
  "likes": 0,
  "isActive": false,
  "status": "draft",
  "createdAt": "2026-02-05T12:34:53.000Z"
}
```

**Draft behavior:**
- Omit all status fields, or send `isActive: true` / `status: "active"`, to publish the event immediately.
- Send `isActive: false`, `status: "draft"`, `status: "inactive"`, or `saveAsDraft: true` to save without showing it to users.
- Draft/inactive creation requires no event content fields. Missing `title` and `description` are saved as empty strings, missing `publisher`/`creatorName` is saved as `"Akademiz"`, and missing `date` is saved as the current server time.
- New event notifications are only sent for active events.

**Error Responses:**
- `400 Bad Request` - Missing/invalid required fields
- `401 Unauthorized` - No token provided
- `403 Forbidden` - Not an admin

---

### Delete Event

#### `POST /events/delete`
Delete an event by ID.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "id": 2
}
```

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**
- `400 Bad Request` - Missing ID
- `401 Unauthorized` - No token provided
- `403 Forbidden` - Not an admin
- `404 Not Found` - Event not found

---

### Edit Event

#### `POST /events/edit`
Edit an existing event.

Alternative endpoint (same behavior): `PATCH /events/:id`

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "id": 2,
  "title": "Updated University Festival",
  "date": "2026-03-16T14:00:00.000Z",
  "description": "Updated details",
  "tags": ["festival", "updated"],
  "status": "active"
}
```

**Notes:**
- `id` is required for `POST /events/edit` and can also be provided in URL for `PATCH /events/:id`.
- All editable fields are optional, but at least one must be provided.
- Arrays can be sent as JSON arrays or JSON-stringified arrays.
- Nullable fields can be cleared with `null` (for example `thumbnailUrl`, `registrationEndDate`, `maxJoiners`).
- Toggle visibility with `isActive`, `status`, or `saveAsDraft`.
- `status: "active"` publishes the event; `status: "inactive"` or `status: "draft"` hides it from users.
- `saveAsDraft: true` hides the event from users.

**Response:** Updated event object (same shape as `GET /admin/events` item).

**Error Responses:**
- `400 Bad Request` - Invalid/missing id or invalid field values
- `401 Unauthorized` - No token provided
- `403 Forbidden` - Not an admin
- `404 Not Found` - Event not found

---

### Trigger Event Notification

#### `POST /admin/events/:id/notify`
Manually send a Firebase notification for an active event.

**Authentication:** Required (Admin)

**Rate limit:** Only one notification can be sent per event per Istanbul calendar day. This limit is persisted in the database and also applies to the automatic notification sent when an active event is created.

**Bypass:** Requests authenticated as `24630483@stu.omu.edu.tr` bypass this manual endpoint's daily rate limit.

**URL Parameters:**
- `id` (integer) - Event ID

**Optional Request Body:**
```json
{
  "title": "Yeni Etkinlik!",
  "body": "University Festival"
}
```

**Notes:**
- `title` defaults to `Yeni Etkinlik!`.
- `body` defaults to the event title.
- Draft/inactive events cannot be notified.

**Success Response:**
```json
{
  "success": true,
  "sent": true,
  "eventId": 2,
  "notificationDate": "2026-04-11",
  "rateLimitBypassed": false,
  "response": "projects/example/messages/123"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid event ID or event is inactive/draft
- `401 Unauthorized` - No token provided
- `403 Forbidden` - Not an admin
- `404 Not Found` - Event not found
- `429 Too Many Requests` - Event notification already sent today

**429 Response:**
```json
{
  "error": "Event notification already sent today",
  "eventId": 2,
  "notificationDate": "2026-04-11",
  "sent": false
}
```

---

### Increment Event Views

#### `POST /events/view`
Increment the view count for a specific event once per user (idempotent per Firebase `uid`).

Legacy endpoint still supported: `POST /events/:id/view`

**Authentication:** Required (Anonymous or Authenticated user)

**Request Body:**
```json
{
  "id": 456
}
```

- `id` (integer, required) - Event ID (numeric strings are accepted, e.g. `"456"`)

**Response:**
```json
{
  "views": 321,
  "likes": 45,
  "counted": true
}
```

- `counted: true` means this request increased the counter.
- `counted: false` means user already viewed this event before (no duplicate increment).

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `401 Unauthorized` - No token provided or invalid token
- `404 Not Found` - Event not found

---

### Increment Event Likes

#### `POST /events/like`
Increment the like count for a specific event once per user (idempotent per Firebase `uid`).

Legacy endpoint still supported: `POST /events/:id/like`

**Authentication:** Required (Anonymous or Authenticated user)

**Request Body:**
```json
{
  "id": 456
}
```

- `id` (integer, required) - Event ID (numeric strings are accepted, e.g. `"456"`)

**Response:**
```json
{
  "views": 321,
  "likes": 46,
  "counted": true
}
```

- `counted: true` means this request increased the counter.
- `counted: false` means user already liked this event before (no duplicate increment).

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `401 Unauthorized` - No token provided or invalid token
- `404 Not Found` - Event not found

---

### Join Event

#### `POST /events/:id/join`
Add a user's email to the event joiners list.

**Authentication:** Not required

**URL Parameters:**
- `id` (integer) - Event ID

**Request Body:**
```json
{
  "email": "student@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "count": 3
}
```

**Fields:**
- `count`: Total number of joiners after adding this one

**Error Responses:**
- `400 Bad Request` - Invalid ID or missing/invalid email
- `400 Bad Request` - Event is full (reached `maxJoiners` limit)
- `404 Not Found` - Event not found

**Notes:**
- Duplicate emails are ignored (won't be added twice)
- If `maxJoiners` is set and reached, new joiners are rejected

---

## 👥 Community Endpoints

### Get Community Posts

#### `GET /community/posts`
Returns paginated community posts (newest first).

**Authentication:** Not required (send Firebase token to receive personalized `isLiked` and `poll.userVotedOptionId`)

**Query Parameters:**
- `limit` (optional, integer, default `20`, max `50`)
- `cursor` (optional, integer) - fetch items with `id < cursor`

**Pagination:**
- Response body is an array of posts.
- If more results exist, response header `x-next-cursor` contains the next cursor id.

**Response (array item):**
```json
{
  "id": 123,
  "authorName": "User Name",
  "authorImage": "https://example.com/avatar.jpg",
  "content": "Post content",
  "imageUrl": "/uploads/community/community-123.webp",
  "createdAt": "2026-02-11T18:15:00.000Z",
  "likes": 12,
  "comments": 4,
  "isLiked": true,
  "poll": {
    "id": 8,
    "question": "Which topic first?",
    "closesAt": "2026-02-20T12:00:00.000Z",
    "isClosed": false,
    "options": [
      { "id": 31, "text": "AI", "votes": 10 },
      { "id": 32, "text": "Cybersecurity", "votes": 7 }
    ],
    "userVotedOptionId": 31
  }
}
```

---

### Create Community Post

#### `POST /community/posts`
Create a community post.

**Authentication:** Required (`Bearer <Firebase ID token>`)

**Request Body:**
```json
{
  "authorName": "Samet Demiral",
  "content": "Post text",
  "imageUrl": "/uploads/community/community-123.webp",
  "poll": {
    "question": "Which topic first?",
    "options": ["AI", "Cybersecurity"],
    "closesAt": "2026-02-20T12:00:00.000Z"
  }
}
```

**Required Fields:**
- `content` (string)

**Optional Fields:**
- `authorName` (string) - if omitted or blank, falls back to authenticated user name
- `imageUrl` (string or `null`)
- `poll` (object or `null`)
- `poll.question` (string, required when `poll` is provided)
- `poll.options` (array of strings, minimum 2, required when `poll` is provided)
- `poll.closesAt` (ISO 8601 datetime string or `null`) - poll vote deadline

Accepted examples:

```json
{
  "authorName": "Samet Demiral",
  "content": "Test"
}
```

```json
{
  "authorName": "Samet Demiral",
  "content": "Test",
  "imageUrl": null,
  "poll": null
}
```

```json
{
  "authorName": "Samet Demiral",
  "content": "Test",
  "imageUrl": "/uploads/community/community-123.webp",
  "poll": {
    "question": "Which topic first?",
    "options": ["AI", "Cybersecurity"],
    "closesAt": null
  }
}
```

**Response:** Created post object (same shape as `GET /community/posts` item).

---

### Edit Community Post

#### `POST /community/posts/:id/edit`
Edit an existing community post.

Alternative endpoint (same behavior): `PATCH /community/posts/:id`

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "content": "Updated post text",
  "imageUrl": "/uploads/community/community-456.webp",
  "poll": {
    "question": "Updated question?",
    "options": ["Option A", "Option B", "Option C"],
    "closesAt": "2026-02-21T18:00:00.000Z"
  }
}
```

**Notes:**
- All fields are optional, but at least one of `content`, `imageUrl`, or `poll` must be provided.
- Set `imageUrl` to `null` to remove the image.
- Set `poll` to `null` to remove the poll.
- If creating a new poll or replacing poll options, provide at least 2 options.
- Sending new `poll.options` replaces existing options and clears previous votes for that poll.
- Set `poll.closesAt` to an ISO datetime to close voting at that time, or `null` to remove the limit.

**Response:** Updated post object (same shape as `GET /community/posts` item).

**Error Responses:**
- `400 Bad Request` - Invalid post id or invalid payload
- `401 Unauthorized` - No token provided
- `403 Forbidden` - Not an admin
- `404 Not Found` - Post not found

---

### Like Community Post

#### `POST /community/posts/:id/like`
Like a post once per user (`uid`) with idempotent behavior.

**Authentication:** Required (any Firebase user, including anonymous)

**Response:**
```json
{
  "likes": 13,
  "isLiked": true,
  "counted": true
}
```

- `counted: false` means user already liked before (no duplicate increment).

---

### Get Post Comments

#### `GET /community/posts/:id/comments`
Returns comments for a post (oldest first).

**Authentication:** Not required

**Response (array item):**
```json
{
  "id": 901,
  "postId": 123,
  "authorName": "User Name",
  "authorImage": "https://example.com/avatar.jpg",
  "content": "Great post!",
  "createdAt": "2026-02-11T18:30:00.000Z"
}
```

---

### Create Post Comment

#### `POST /community/posts/:id/comments`
Create a comment and increment post comment count.

**Authentication:** Required (any Firebase user, including anonymous)

**Request Body:**
```json
{
  "content": "Great post!"
}
```

**Response:**
```json
{
  "id": 901,
  "postId": 123,
  "authorName": "User Name",
  "authorImage": "https://example.com/avatar.jpg",
  "content": "Great post!",
  "createdAt": "2026-02-11T18:30:00.000Z",
  "comments": 5
}
```

---

### Vote Poll

#### `POST /community/posts/:id/poll/vote`
Vote once per user (`uid`) on a post poll (idempotent).

**Authentication:** Required (any Firebase user, including anonymous)

**Request Body:**
```json
{
  "optionId": 31
}
```

**Response:**
```json
{
  "id": 8,
  "question": "Which topic first?",
  "closesAt": "2026-02-20T12:00:00.000Z",
  "isClosed": false,
  "options": [
    { "id": 31, "text": "AI", "votes": 11 },
    { "id": 32, "text": "Cybersecurity", "votes": 7 }
  ],
  "userVotedOptionId": 31,
  "counted": true
}
```

**Closed Poll Response (`403`):**
```json
{
  "error": "Poll is closed",
  "closesAt": "2026-02-20T12:00:00.000Z",
  "isClosed": true
}
```

---

### Upload Community Image

#### `POST /community/upload/image`
Upload a single image for community posts.

**Authentication:** Required (any Firebase user, including anonymous)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `image` (file, max 10MB)

**Response:**
```json
{
  "url": "/uploads/community/community-1738756493999-987654321.webp"
}
```

---

## 🖼️ Upload Endpoints

### Upload Image

#### `POST /upload/image`
Upload and process an image for events. Images are automatically:
- Resized to max 1200x1200px (maintains aspect ratio)
- Converted to WebP format (80% quality)
- Saved to persistent storage

**Authentication:** Required (Admin)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `image` (file) - Image file (max 10MB)

**Example using FormData:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${firebaseToken}`
  },
  body: formData
})
```

**Response:**
```json
{
  "url": "/uploads/events/event-1738756493123-456789012.webp"
}
```

**Error Responses:**
- `400 Bad Request` - No image file provided
- `401 Unauthorized` - No token provided
- `403 Forbidden` - Not an admin
- `500 Internal Server Error` - Image processing failed

**Notes:**
- Images are served via `/uploads/events/` route
- Full URL in production: `https://your-domain.com/uploads/events/filename.webp`
- Cloudflare automatically caches these static assets

---


## 👤 User Profile Endpoints

To support anonymous account customization and profile migration.

### Get My Profile

#### `GET /users/me`
Returns the profile of the current authenticated user (including guests).

**Authentication:** Required

**Response:**
```json
{
  "uid": "firebase_uid_123",
  "name": "John Doe",
  "age": 21,
  "department": "Computer Programming",
  "facultyKey": "engineering",
  "departmentKey": "computer-programming",
  "gradeKey": "grade1",
  "gender": "Male",
  "campus": "Çarşamba",
  "isPrivate": false,
  "studentId": "23...01",
  "badges": ["EARLY_TESTER"],
  "createdAt": "2026-02-16T15:00:00.000Z",
  "updatedAt": "2026-02-16T15:30:00.000Z"
}
```

---

### Get Public Profile

#### `GET /users/:uid`
Returns a specific user's public profile.

**Authentication:** Optional

**URL Parameters:**
- `uid` (string) - Firebase UID

**Privacy Logic:**
- If `isPrivate` is `false`: Returns the full profile.
- If `isPrivate` is `true`: Only returns `uid`, `name`, `badges`, and `isPrivate: true` (unless requested by the profile owner).

**Response:**
```json
{
  "uid": "firebase_uid_123",
  "name": "John Doe",
  "badges": ["EARLY_TESTER"],
  "isPrivate": false,
  "department": "Computer Programming",
  "facultyKey": "engineering",
  "departmentKey": "computer-programming",
  "gradeKey": "grade1",
  "campus": "Çarşamba"
}
```

---

### Update Profile

#### `PATCH /users/profile`
Updates the current user's profile fields.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Jane Doe",
  "age": 20,
  "facultyKey": "law",
  "departmentKey": "law",
  "gradeKey": "grade2",
  "gender": "Female",
  "campus": "Çarşamba",
  "isPrivate": true,
  "studentId": "23...05"
}
```

**Constraints:**
- `name`: max 32 characters
- `age`: integer between 14 and 69
- `facultyKey`: optional registered faculty key
- `departmentKey`: optional registered department key, but only valid when mapped to the selected faculty
- `gradeKey`: optional registered grade key, but only valid when mapped to the selected department
- `department` in the response is the selected department name
- `isPrivate`: boolean (defaults to `false`)
- `studentId`: unique string

**Response:** Updated profile object.

---

### Search Students

#### `GET /users/search?studentId=...`
Allows searching for other students by their student ID. Only returns public profiles.

**Authentication:** Not required

**Query Parameters:**
- `studentId` (string, required) - Search term (supports partial matches)

**Response:** Array of public profile objects.

---

### Get User Badges

#### `GET /users/:userId/badges`
Retrieve badges for a specific user.

**Authentication:** Not required

**Response:**
```json
{
  "badges": ["EARLY_TESTER", "CONTRIBUTOR"]
}
```

**Badge Types:**
- `EARLY_TESTER`: Erken Test Kullanıcısı
- `BETA_TESTER`: Beta Test Kullanıcısı
- `CONTRIBUTOR`: Katkı Sağlayan
- `VIP`: VIP Üye
- `MODERATOR`: Moderatör
- `DEVELOPER`: Geliştirici

---

### Admin: Manage Badges

#### `POST /admin/users/:userId/badges`
Award a badge to a user. Requires Admin role.

#### `DELETE /admin/users/:userId/badges/:badge`
Remove a badge from a user. Requires Admin role.

---

## 🔧 Utility Endpoints

### Upload Multiple Images

#### `POST /upload/images`
Upload and process multiple event images in one request. Each image is automatically:
- Resized to max 1200x1200px (maintains aspect ratio)
- Converted to WebP format (80% quality)
- Saved to persistent storage

**Authentication:** Required (Admin)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `images` (files[]) - Multiple image files (max 20 files, each max 10MB)

**Example using FormData:**
```javascript
const formData = new FormData();
for (const file of selectedFiles) {
  formData.append('images', file);
}

fetch('/upload/images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${firebaseToken}`
  },
  body: formData
})
```

**Response:**
```json
{
  "urls": [
    "/uploads/events/event-1738756493123-456789012.webp",
    "/uploads/events/event-1738756493999-987654321.webp"
  ]
}
```

**Error Responses:**
- `400 Bad Request` - No image files provided
- `401 Unauthorized` - No token provided
- `403 Forbidden` - Not an admin
- `500 Internal Server Error` - Image processing failed

---
### Manual News Scrape

#### `GET /scrape`
Manually trigger the news scraping process.

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "count": 7,
  "data": [/* array of scraped news articles */]
}
```

**Notes:**
- News scraping runs automatically with **smart scheduling**:
  - **Active hours:** 6 AM - 11 PM
  - **Quiet hours:** 11 PM - 6 AM (no scraping to reduce server load)
  - **Random intervals:** 15-45 minutes between scrapes (appears more natural)
- This endpoint allows manual triggering for testing/debugging
- New articles trigger Firebase notifications to the "news" topic
- **Schedule Detection:** Schedule-like Excel attachments may still be detected during scraping, but they are no longer imported into the `schedules` table automatically. Schedule records are now managed through the schedule admin API.

---

## Class Endpoints

### Get Classes

#### `GET /classes`
Retrieve the registered class list used by the schedule viewer and editor.

**Authentication:** Not required

**Query Parameters:**
- `facultyKey` (string, optional) - When provided, only returns the grades mapped to that academic faculty.
- `departmentKey` (string, optional) - When provided, only returns the grades mapped to that department.

**Response:**
```json
[
  {
    "id": 1,
    "key": "engineering-computer-science-grade1",
    "name": "1. Grade",
    "level": 1,
    "departmentKey": "engineering-computer-science",
    "facultyKey": "engineering",
    "sortOrder": 0,
    "createdAt": "2026-04-11T09:00:00.000Z",
    "updatedAt": "2026-04-11T09:00:00.000Z"
  }
]
```

**Notes:**
- `key` must match the class key used inside schedule JSON, for example `engineering-computer-science-grade1`.
- When `departmentKey` is provided, the response is limited to that department's mapped grades.
- When only `facultyKey` is provided, the response is the union of grades mapped across that faculty's departments.
- When at least one class is registered, schedule responses use this list for `availableClassKeys` and only expose those class keys in `schedule`.
- When no classes are registered yet, schedules fall back to the auto/manual class keys already stored in schedule data.

---

### Get Classes as Admin

#### `GET /admin/classes`
Retrieve the same registered class list for admin panels.

**Authentication:** Required (Admin)

---

### Create Class

#### `POST /admin/classes`
Register a class for schedule filtering and lesson schedule management.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "departmentKey": "engineering-computer-science",
  "minLevel": 1,
  "maxLevel": 4,
  "sortOrder": 0
}
```

**Notes:**
- `departmentKey` is required.
- `minLevel` and `maxLevel` are required and must each be between `1` and `6`.
- The backend creates every level in the inclusive range from `minLevel` to `maxLevel`.
- `minLevel` must be less than or equal to `maxLevel`.
- The backend fully manages each grade `key` and `name`.
- Generated values use this pattern:
  - `key`: `<departmentKey>-grade<level>`
  - `name`: `<level>. Grade`
- `sortOrder` is optional and defaults to `level - 1` for each generated class.
- The response returns the created classes as an array.

**Error Responses:**
- `400 Bad Request` - Invalid class payload
- `409 Conflict` - One or more grade levels already exist for that department

---

### Delete Class

#### `DELETE /admin/classes/:idOrKey`
Delete a registered class by numeric ID or class key.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "class": {
    "id": 1,
    "key": "engineering-computer-science-grade1",
    "name": "1. Grade",
    "level": 1,
    "departmentKey": "engineering-computer-science",
    "facultyKey": "engineering",
    "sortOrder": 0,
    "createdAt": "2026-04-11T09:00:00.000Z",
    "updatedAt": "2026-04-11T09:00:00.000Z"
  },
  "removedManualScheduleCount": 2,
  "clearedProfileCount": 3
}
```

**Notes:**
- Deleting a class removes its manual schedule block from all schedules.
- Deleting a class also clears `gradeKey` from student profiles that were using it.
- Auto-parsed schedule data is left untouched, but hidden from schedule responses while a registered class list exists.

**Error Responses:**
- `404 Not Found` - Class not found

---

## Academic Faculty Endpoints

### List Academic Faculties

#### `GET /academic-faculties`
Returns the registered academic faculties with their departments and each department's mapped grades.

**Authentication:** Not required

**Response:**
```json
[
  {
    "id": 1,
    "key": "engineering",
    "name": "Engineering Faculty",
    "sortOrder": 0,
    "departments": [
      {
        "id": 10,
        "key": "computer-programming",
        "name": "Computer Programming",
        "sortOrder": 0,
        "grades": [
          {
            "id": 1,
            "key": "grade1",
            "name": "1. Sinif",
            "sortOrder": 0,
            "createdAt": "2026-04-14T09:00:00.000Z",
            "updatedAt": "2026-04-14T09:00:00.000Z"
          }
        ],
        "createdAt": "2026-04-14T09:00:00.000Z",
        "updatedAt": "2026-04-14T09:00:00.000Z"
      }
    ],
    "createdAt": "2026-04-14T09:00:00.000Z",
    "updatedAt": "2026-04-14T09:00:00.000Z"
  }
]
```

### Create Academic Faculty

#### `POST /academic-faculties`
Registers a faculty and optionally creates departments with mapped grades under it.

**Authentication:** Required (Firebase auth)

**Request Body:**
```json
{
  "key": "engineering",
  "name": "Engineering Faculty",
  "sortOrder": 0,
  "departments": [
    {
      "key": "computer-programming",
      "name": "Computer Programming",
      "sortOrder": 0,
      "gradeKeys": ["grade1", "grade2"]
    }
  ]
}
```

**Notes:**
- `name` is required.
- `key` is optional; when omitted, it is generated from `name`.
- `departments` is optional.
- Every provided department key must be unique.
- Every provided grade key must already exist in the class registry.

### Update Academic Faculty

#### `PATCH /academic-faculties/:idOrKey`
Replaces an existing faculty tree, including its metadata, departments, and each department's grade mappings.

**Authentication:** Required (Firebase auth)

**Request Body:**
```json
{
  "key": "engineering",
  "name": "Engineering Faculty",
  "sortOrder": 0,
  "departments": [
    {
      "key": "computer-programming",
      "name": "Computer Programming",
      "sortOrder": 0,
      "gradeKeys": ["grade1", "grade2"]
    },
    {
      "key": "software-engineering",
      "name": "Software Engineering",
      "sortOrder": 1,
      "gradeKeys": ["grade1", "grade2", "grade3", "grade4"]
    }
  ]
}
```

**Notes:**
- This endpoint replaces the full department tree for that faculty.
- Departments omitted from the request are removed.
- If a department remains with the same key, student profiles using it are preserved.
- If a department is removed or a grade is no longer mapped to it, affected student profiles are cleared accordingly.
- If the faculty key changes, affected student profiles are moved to the new `facultyKey`.

### Delete Academic Faculty

#### `DELETE /academic-faculties/:idOrKey`
Deletes a faculty by numeric ID or faculty key.

**Authentication:** Required (Firebase auth)

**Response:**
```json
{
  "success": true,
  "faculty": {
    "id": 1,
    "key": "engineering",
    "name": "Engineering Faculty",
    "sortOrder": 0,
    "departments": [],
    "createdAt": "2026-04-14T09:00:00.000Z",
    "updatedAt": "2026-04-14T09:00:00.000Z"
  },
  "clearedProfileCount": 5
}
```

**Notes:**
- Deleting a faculty clears `facultyKey`, `departmentKey`, `gradeKey`, and the cached `department` name from student profiles that were using it.

---

## 📅 Schedule Endpoints

### Get All Schedules

#### `GET /schedules`
Retrieve all course schedules (Ders Programları).

**Authentication:** Not required  
If you send an **admin Firebase token**, the response also includes editor fields such as `autoSchedule`, `manualSchedule`, `effectiveSchedule`, and `autoScheduleRaw`.
If you send any valid Firebase token, the response includes `academicContext` on each schedule item. When the authenticated user has no selected `facultyKey`, `departmentKey`, or `gradeKey`, the backend uses the same deterministic seeded fallback as `GET /master/news-widgets` and places the matched schedule first when one is found.

**Response:**
```json
[
  {
    "id": 1,
    "programName": "BİLİŞİM GÜVENLİĞİ PROGRAMI",
    "academicYear": "2025-2026",
    "semester": "Bahar",
    "schedule": {
      "grade1": {
        "PAZARTESI": [
          {
            "time": "13:00",
            "courseCode": "BGP112",
            "courseName": "Bilgisayar Donanimi",
            "instructor": "Ogr. Gor. Serkan VARAN",
            "classroom": "A201"
          }
        ],
        "SALI": [],
        "CARSAMBA": [],
        "PERSEMBE": [],
        "CUMA": [],
        "CUMARTESI": [],
        "PAZAR": []
      },
      "grade2": {
        "PAZARTESI": [],
        "SALI": [],
        "CARSAMBA": [],
        "PERSEMBE": [],
        "CUMA": [],
        "CUMARTESI": [],
        "PAZAR": []
      }
    },
    "manualOverrideEnabled": false,
    "hasManualSchedule": true,
    "manualClassKeys": ["grade1"],
    "availableClassKeys": ["grade1", "grade2"],
    "registeredClassKeys": ["grade1", "grade2"],
    "effectiveSource": "auto",
    "updatedAt": "2026-02-05T11:08:47.000Z",
    "academicContext": {
      "seed": 183741092,
      "scheduleId": 1,
      "programName": "BÄ°LÄ°ÅÄ°M GÃœVENLÄ°ÄÄ° PROGRAMI",
      "classKey": "carsamba-ticaret-borsasi-myo-bilisim-guvenligi-tekn-grade1",
      "selectedClassIndex": 0,
      "availableClassKeys": [
        "carsamba-ticaret-borsasi-myo-bilisim-guvenligi-tekn-grade1",
        "carsamba-ticaret-borsasi-myo-bilisim-guvenligi-tekn-grade2"
      ],
      "inferredGrade": 1,
      "matchedBy": "seeded",
      "faculty": {
        "key": "carsamba-ticaret-borsasi-myo",
        "name": "Carsamba Ticaret Borsasi MYO"
      },
      "department": {
        "key": "carsamba-ticaret-borsasi-myo-bilisim-guvenligi-tekn",
        "name": "Bilisim Guvenligi Teknolojisi"
      },
      "grade": {
        "key": "carsamba-ticaret-borsasi-myo-bilisim-guvenligi-tekn-grade1",
        "name": "1. Grade",
        "level": 1
      },
      "isSeededFallback": true
    }
  }
]
```

**Response notes:**
- `schedule` is always the **effective** schedule that the client should render.
- `manualOverrideEnabled=false`: `schedule` contains the normalized auto schedule only.
- `manualOverrideEnabled=true`: manual data overrides auto data per class and per day where manual values exist.
- Known Turkish weekday keys are normalized to uppercase ASCII names (`PAZARTESI`, `CARSAMBA`, etc.); custom day labels are preserved.
- `availableClassKeys` follows the registered class list when classes exist; otherwise it is the union of detected auto classes and manually entered classes.
- `registeredClassKeys` is the class registry used for filtering. It is an empty array until classes are created with `POST /admin/classes`.
- `academicContext` is only included when a valid Firebase token is provided. It describes the user-specific faculty/department/grade/class selection for the schedule item.
- If `academicContext.scheduleId` is non-null, that schedule item is the user-matched schedule. Other schedule items can still include the user's faculty/department/grade context, but their `scheduleId`, `programName`, and `classKey` are null.
- Non-admin clients do not receive `autoSchedule`, `manualSchedule`, `effectiveSchedule`, or `autoScheduleRaw`.

**Schedule Structure:**
- The top-level keys inside `schedule` are classes/years such as `grade1`, `grade2`, or any custom class key you use in the admin UI.
- Each day contains an array of course sessions with:
  - `time`: Start time in `HH:mm`
  - `courseCode`: Course code (e.g., "BGP112")
  - `courseName`: Full course name
  - `instructor`: Instructor name with title
  - `classroom`: Classroom/lab designation

---

### Create Schedule

#### `POST /schedules`
Create a new top-level schedule/program record.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "programName": "BİLİŞİM GÜVENLİĞİ PROGRAMI",
  "academicYear": "2025-2026",
  "semester": "Bahar",
  "manualOverrideEnabled": true,
  "manualSchedule": {
    "grade1": {
      "PAZARTESI": [],
      "SALI": []
    }
  }
}
```

**Notes:**
- `programName`, `academicYear`, and `semester` are required.
- `manualOverrideEnabled` is optional and defaults to `true`.
- `manualSchedule` is optional. You may also send the class map under `schedule`.
- If registered classes exist, every class key in `manualSchedule` must already be registered.
- New schedules start with empty auto-parsed data; manual schedule data is what the frontend manages.

**Response:**
- Returns the full admin schedule payload, same shape as `GET /schedules/:id/manual`.

**Error Responses:**
- `400 Bad Request` - Missing or invalid required fields

---

### Get Schedule by ID

#### `GET /schedules/:id`
Retrieve a specific course schedule by ID.

**Authentication:** Not required  
If you send an **admin Firebase token**, the response includes additional editor fields:
- `autoSchedule`
- `manualSchedule`
- `effectiveSchedule`
- `autoScheduleRaw`

**URL Parameters:**
- `id` (integer) - Schedule ID

**Response:**
```json
{
  "id": 1,
  "programName": "BİLİŞİM GÜVENLİĞİ PROGRAMI",
  "academicYear": "2025-2026",
  "semester": "Bahar",
  "schedule": {
    "grade1": { /* effective class schedule */ },
    "grade2": { /* effective class schedule */ }
  },
  "manualOverrideEnabled": true,
  "hasManualSchedule": true,
  "manualClassKeys": ["grade1"],
  "availableClassKeys": ["grade1", "grade2"],
  "registeredClassKeys": ["grade1", "grade2"],
  "effectiveSource": "manual",
  "updatedAt": "2026-02-05T11:08:47.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `404 Not Found` - Schedule not found

---

### Update Schedule Metadata

#### `PATCH /schedules/:id`
Update top-level schedule metadata without replacing the full record.

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (integer) - Schedule ID

**Request Body:**
```json
{
  "programName": "BİLİŞİM GÜVENLİĞİ PROGRAMI",
  "academicYear": "2026-2027",
  "semester": "Güz",
  "manualOverrideEnabled": true
}
```

**Notes:**
- You may update any subset of `programName`, `academicYear`, `semester`, `manualOverrideEnabled`, and `manualSchedule`.
- If `manualSchedule` is included, it replaces the entire stored manual schedule map.
- `schedule` is also accepted as an alias for `manualSchedule`.
- If registered classes exist, every class key in the replacement manual schedule must already be registered.
- At least one valid field must be provided.

**Response:**
- Returns the full admin schedule payload, same shape as `GET /schedules/:id/manual`.

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `400 Bad Request` - No valid schedule fields provided
- `400 Bad Request` - Invalid field types
- `404 Not Found` - Schedule not found

---

### Delete Schedule

#### `DELETE /schedules/:id`
Delete a top-level schedule/program record.

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (integer) - Schedule ID

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `404 Not Found` - Schedule not found

---

### Get Manual Schedule Editor Data

#### `GET /schedules/:id/manual`
Returns the full editor payload for one schedule, including auto, manual, and effective data.

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (integer) - Schedule ID

**Response:**
```json
{
  "id": 1,
  "programName": "BİLİŞİM GÜVENLİĞİ PROGRAMI",
  "academicYear": "2025-2026",
  "semester": "Bahar",
  "schedule": { /* effective schedule */ },
  "autoSchedule": {
    "grade1": { /* normalized auto schedule */ },
    "grade2": { /* normalized auto schedule */ }
  },
  "manualSchedule": {
    "grade1": { /* normalized manual schedule */ },
    "grade2": { /* empty days if no manual data yet */ }
  },
  "effectiveSchedule": { /* same as schedule */ },
  "autoScheduleRaw": { /* parsed JSON value from stored scheduleData */ },
  "manualOverrideEnabled": false,
  "hasManualSchedule": true,
  "manualClassKeys": ["grade1"],
  "availableClassKeys": ["grade1", "grade2"],
  "registeredClassKeys": ["grade1", "grade2"],
  "effectiveSource": "auto",
  "updatedAt": "2026-02-05T11:08:47.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `404 Not Found` - Schedule not found

---

### Replace Full Manual Schedule

#### `PUT /schedules/:id/manual`
Replace the entire manual schedule payload for a schedule.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "manualSchedule": {
    "grade1": {
      "PAZARTESI": [
        {
          "time": "08:30",
          "courseCode": "BGP101",
          "courseName": "Ag Temelleri",
          "instructor": "Ogr. Gor. A",
          "classroom": "Lab 1"
        },
        {
          "time": "09:30-10:20",
          "courseCode": "",
          "courseName": "",
          "instructor": "",
          "classroom": "",
          "isEmpty": true
        }
      ],
      "SALI": []
    },
    "grade2": {
      "PAZARTESI": [],
      "SALI": []
    }
  }
}
```

**Notes:**
- You may also send the class map directly as the request body.
- If registered classes exist, every class key in the manual schedule must already be registered.
- Missing days fall back to the auto schedule only when override is enabled and no manual value exists for that day.
- To explicitly clear a day in manual mode, send that day with an empty array.

**Response:**
- Returns the full admin schedule payload, same shape as `GET /schedules/:id/manual`.

---

### Upsert Manual Schedule For One Class

#### `PUT /schedules/:id/manual/:classKey`
Create or replace the manual schedule for a single class key such as `grade1` or `grade2`.

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (integer) - Schedule ID
- `classKey` (string) - Class/year key

**Request Body:**
```json
{
  "schedule": {
    "PAZARTESI": [
      {
        "time": "08:30",
        "courseCode": "BGP101",
        "courseName": "Ag Temelleri",
        "instructor": "Ogr. Gor. A",
        "classroom": "Lab 1"
      }
    ],
    "SALI": []
  }
}
```

**Notes:**
- You may also send the day map directly as the request body.
- If registered classes exist, `classKey` must already be registered.
- `time`, `startTime`, or `hour` can be sent for the lesson time; responses always return `time`.
- Admins can send any lesson time. `09.30`, `930`, `9:30 to 10:20`, `09:30-10:20`, and Excel-style numeric times are normalized when possible; other non-empty time labels are preserved.
- Time ranges normalize to `HH:mm-HH:mm`, for example `9:30 to 10:20` becomes `09:30-10:20`.
- Empty editor rows are persistent. Send a row with `time` and no `courseName`, or send `isEmpty: true`; responses return that row with `isEmpty: true`.
- Empty rows are included in schedule/editor responses but ignored by current/next lesson and news filtering logic.
- Known Turkish weekday names are normalized to uppercase ASCII keys, such as `PAZARTESI`.
- Custom day labels/keys are accepted and preserved, for example `Hafta Sonu`, `2026-04-13`, or `Makeup Day`.

**Response:**
- Returns the full admin schedule payload, same shape as `GET /schedules/:id/manual`.

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `400 Bad Request` - Class key is required
- `400 Bad Request` - Class schedule payload must be an object keyed by day
- `400 Bad Request` - Class key is not registered
- `404 Not Found` - Schedule not found

---

### Delete Manual Schedule For One Class

#### `DELETE /schedules/:id/manual/:classKey`
Remove the manual schedule for a single class key.

**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (integer) - Schedule ID
- `classKey` (string) - Class/year key

**Response:**
- Returns the full admin schedule payload, same shape as `GET /schedules/:id/manual`.

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `400 Bad Request` - Class key is required
- `404 Not Found` - Schedule not found
- `404 Not Found` - Manual schedule class not found

---

### Toggle Manual Override

#### `PATCH /schedules/:id/manual-override`
Enable or disable using manual schedule data over the auto-generated schedule.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "enabled": true
}
```

**Behavior:**
- `enabled=false`: clients receive the normalized auto schedule in `schedule`
- `enabled=true`: clients receive a merged effective schedule where manual class/day data overrides auto data
- String values `"true"` and `"false"` are also accepted

**Response:**
- Returns the full admin schedule payload, same shape as `GET /schedules/:id/manual`.

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `400 Bad Request` - `"enabled" must be a boolean`
- `404 Not Found` - Schedule not found


---

## 📋 Data Models

### News Model
```typescript
{
  id: number;
  title: string;
  summary: string;
  authorName: string;
  heroImage: string;
  detailUrl: string | null;
  publishedAt: Date | null;
  publishedAtText: string | null;
  tags: string; // JSON array
  imageUrls: string; // JSON array
  fullText: string | null;
  excelAttachments: string; // JSON array of {url, content}
  views: number;
  likes: number;
  createdAt: Date;
}
```

### Event Model
```typescript
{
  id: number;
  title: string;
  description: string;
  eventLength: number | null; // hours
  location: string | null;
  date: Date;
  thumbnailUrl: string | null;
  carouselImages: string; // JSON array
  tags: string; // JSON array
  maxJoiners: number | null;
  joiners: string; // JSON array of email strings
  views: number;
  likes: number;
  isActive: boolean; // false means draft/inactive and hidden from public event endpoints
  createdAt: Date;
}
```

### AcademicClass Model
```typescript
{
  id: number;
  key: string; // e.g., "grade1"; must match schedule class keys
  name: string; // Display label for the frontend
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### EventNotificationLog Model
```typescript
{
  id: number;
  eventId: number;
  notificationDate: string; // YYYY-MM-DD in Europe/Istanbul
  createdAt: Date;
}
```

### Schedule Model
```typescript
{
  id: number;
  programName: string; // e.g., "BİLİŞİM GÜVENLİĞİ PROGRAMI"
  academicYear: string; // e.g., "2025-2026"
  semester: string; // e.g., "Bahar" or "Güz"
  sourceUrl: string | null; // Original Excel file URL
  scheduleData: string; // JSON string containing auto-parsed schedule data
  manualScheduleData: string | null; // JSON string containing manual schedule data keyed by class
  manualOverrideEnabled: boolean; // Whether manual data should override auto schedule data
  createdAt: Date;
  updatedAt: Date;
}

// Normalized Manual / Effective Schedule Structure
{
  [classKey: string]: {
    [day: string]: CourseSession[]; // e.g., "PAZARTESI", "SALI", etc.
  };
}

// CourseSession
{
  time: string; // e.g., "09:15", "13:00"
  courseCode: string; // e.g., "BGP112"
  courseName: string;
  instructor: string;
  classroom: string;
  isEmpty?: boolean; // true for persistent editor-only empty rows
}
```

---

## 🔐 Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Valid token but insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 💡 Usage Tips

### Working with JSON Strings

Many fields are stored as JSON strings. Always parse them before use:

```javascript
const event = await fetch('/events').then(r => r.json());
const tags = JSON.parse(event[0].tags);
const joiners = JSON.parse(event[0].joiners);
const carouselImages = JSON.parse(event[0].carouselImages);
```

### Image URLs

Image URLs returned from `/upload/image` are relative paths. Construct full URLs:

```javascript
const imageUrl = response.url; // "/uploads/events/event-123.webp"
const fullUrl = `${window.location.origin}${imageUrl}`;
// or in production:
const cdnUrl = `https://your-domain.com${imageUrl}`;
```

### Firebase Authentication

**For Anonymous Users (Views/Likes):**

```javascript
// Sign in anonymously
await firebase.auth().signInAnonymously();

// Get token for authenticated requests
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

// Use in view/like requests
fetch('/events/view', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: eventId })
});
```

**For Admin Users (Create/Delete/Upload):**

```javascript
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

fetch('/events/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New Event',
    date: new Date().toISOString()
  })
});
```

### Incrementing Views/Likes

Best practice: Call view increment when user opens detail page, call like increment only once per user (track in localStorage):

```javascript
// Ensure user is authenticated (anonymous is fine)
if (!firebase.auth().currentUser) {
  await firebase.auth().signInAnonymously();
}

const token = await firebase.auth().currentUser.getIdToken();

// On detail page load
fetch('/events/view', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: eventId })
});

// On like button click
const likedKey = `event_${eventId}_liked`;
if (!localStorage.getItem(likedKey)) {
  fetch('/events/like', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: eventId })
  }).then(() => localStorage.setItem(likedKey, 'true'));
}
```

---

## 🚀 CDN Integration

The backend is configured with Cloudflare Tunnel. All static assets served through `/uploads` are automatically:
- Cached at Cloudflare's edge network
- Delivered with optimal compression
- Served with HTTPS
- Protected with DDoS mitigation

No additional CDN configuration needed on the frontend!

---

## 📞 Support

For questions or issues, contact the backend development team.

---
## 🍱 Food Menu Endpoints

### Get Food Menu

#### `GET /food-menu`
Retrieve upcoming food menus (starting from today).

**Authentication:** Not required

**Response:**
```json
[
  {
    "id": 1,
    "date": "2026-02-12T12:00:00.000Z",
    "items": ["MERCİMEK ÇORBA", "GARNİTÜRLÜ TAVUK SHINITZEL", "ZYT.YAĞLI YOĞ.KARNABAHAR", "SÜTLAÇ"],
    "updatedAt": "2026-02-12T01:15:00.000Z"
  }
]
```

---

### Manual Food Scrape

#### `GET /scrape/food`
Manually trigger the food menu scraper.

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "count": 20
}
```
