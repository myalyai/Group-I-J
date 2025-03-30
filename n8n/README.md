# Backend Guide

## Overview
This guide provides information about the backend implementation, including n8n API integrations and authentication.

## Authentication
Basic Auth
Check discord group for the authentication

## API Endpoints

### Categories Endpoint
**GET** `https://myalyai.app.n8n.cloud/webhook/categories`

Returns a list of available categories.

Sample Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Etsy",
      "created_at": "2025-03-30T01:58:31.176254+00:00"
    },
    {
      "id": 2,
      "name": "Amazon",
      "created_at": "2025-03-30T01:58:31.176254+00:00"
    }
  ]
}
```

### Keywords Endpoint
**GET** `https://myalyai.app.n8n.cloud/webhook/keywords`

Returns a list of available keywords.

Sample Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Keywords",
      "created_at": "2025-03-30T01:59:10.162626+00:00"
    },
    {
      "id": 2,
      "name": "Listing",
      "created_at": "2025-03-30T01:59:10.162626+00:00"
    }
  ]
}
```

### Prompts Endpoint
**GET** `https://myalyai.app.n8n.cloud/webhook/prompts`

Returns prompts based on query parameters. Supports the following query parameters:
- `id`: Get a single prompt
- `categoryId`: Filter prompts by category
- `platformId`: Filter prompts by platform

Query Parameter Priority:
1. `id`
2. `categoryId` + `platformId`
3. `categoryId`
4. `platformId`

Sample Response:
```json
{
  "data": [
    {
      "id": 2,
      "platform_id": 1,
      "category_id": 2,
      "version": "1.0",
      "prompt_text": "You are a professional Etsy seller ...",
      "temperature": 0.7,
      "max_tokens": 1000,
      "is_active": true
    }
  ]
}
```

**POST** `https://myalyai.app.n8n.cloud/webhook/prompts`

Required fields in request body:
- `platform_id`: Platform identifier
- `category_id`: Category identifier
- `prompt_text`: The prompt text content
- `max_tokens`: Maximum number of tokens
- `temperature`: Temperature value for the prompt

Example request body:
```json
{
  "platform_id": 1,
  "category_id": 2,
  "prompt_text": "Your prompt text here",
  "max_tokens": 1000,
  "temperature": 0.7
}
```

## Implementation Notes

1. All API calls should include Basic Authentication headers
2. Error handling should be implemented for all API calls
3. Rate limiting and caching strategies should be considered
4. API responses should be validated before processing

## Security Considerations

1. Never expose API credentials in client-side code
2. Implement proper error handling for authentication failures
3. Consider implementing request rate limiting
4. Validate all API responses before processing

## Error Handling

The backend should handle the following common error scenarios:
- Authentication failures
- Network timeouts
- Invalid query parameters
- Rate limiting
- Server errors

## Best Practices

1. Use environment variables for API credentials
2. Implement proper logging for debugging
3. Cache responses when appropriate
4. Implement retry mechanisms for failed requests
5. Validate all input parameters 