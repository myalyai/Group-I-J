# n8n Guide

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

Note: When creating a new prompt, it will:
1. Update all existing prompts with the same `platform_id` and `category_id` to `is_active = false`
2. Increment the version number of the new prompt by +0.01
3. This version number serves as an indicator/flag for the active prompt for the platform
4. No database updates are performed - new prompts are created rather than updating existing ones

## Implementation Notes

1. All API calls should include Basic Authentication headers
2. Error handling should be implemented for all API calls
3. Rate limiting and caching strategies should be considered
4. API responses should be validated before processing

## Additional Endpoints

### Keywords Generation
**POST** `https://myalyai.app.n8n.cloud/webhook/keywords`

Required fields in request body:
- `prompt_id`: Prompt identifier
- `product_description`: Description of the product
- `session_id`: Unique key for LLM memory/conversation tracking

Example request body:
```json
{
  "prompt_id": 2,
  "product_description": "anime keychain",
  "session_id": "unique_key"
}
```

Sample Response:
```json
{
    "status": true,
    "output": "3D printed anime keychain, custom anime keychain, handmade anime accessory, personalized manga keychain....",
    "prompt": "You are an SEO expert specializing in Etsy marketplace optimization for 3D printed products. Generate a list of 15-20 highly relevant, SEO-optimized keywords for the following 3D printed product: anime keychain. Focus on keywords that Etsy shoppers would use to find this type of item. Include a mix of short-tail and long-tail keywords. Prioritize keywords that highlight the handmade, unique nature of the item, as Etsy shoppers value these qualities. Format your response as a comma-separated list with no numbering or bullets."
}
```

Note: The `session_id` is used for LLM memory to maintain conversation context, which is useful for future interactions.


