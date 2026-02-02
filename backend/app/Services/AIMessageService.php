<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\Property;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * AIMessageService
 * 
 * Generates personalized messages for leads using OpenAI's API.
 * Supports different message types: outreach, follow-up, property pitch, closing.
 */
class AIMessageService
{
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key', env('OPENAI_API_KEY'));
        $this->model = config('services.openai.model', 'gpt-4o-mini');
    }

    /**
     * Generate a personalized outreach message for a lead.
     */
    public function generateOutreach(Lead $lead, array $options = []): array
    {
        $context = $this->buildLeadContext($lead);
        $language = $options['language'] ?? 'english';
        $tone = $options['tone'] ?? 'professional';
        $platform = $options['platform'] ?? 'whatsapp';

        $prompt = $this->buildOutreachPrompt($context, $language, $tone, $platform);

        return $this->callOpenAI($prompt, 'outreach');
    }

    /**
     * Generate a follow-up message for a lead.
     */
    public function generateFollowUp(Lead $lead, string $previousContext = '', array $options = []): array
    {
        $context = $this->buildLeadContext($lead);
        $language = $options['language'] ?? 'english';
        $tone = $options['tone'] ?? 'friendly';
        $daysSinceContact = $options['days_since_contact'] ?? 3;

        $prompt = $this->buildFollowUpPrompt($context, $previousContext, $language, $tone, $daysSinceContact);

        return $this->callOpenAI($prompt, 'follow_up');
    }

    /**
     * Generate a property pitch message for a specific property.
     */
    public function generatePropertyPitch(Lead $lead, Property $property, array $options = []): array
    {
        $leadContext = $this->buildLeadContext($lead);
        $propertyContext = $this->buildPropertyContext($property);
        $language = $options['language'] ?? 'english';
        $highlight = $options['highlight'] ?? 'investment'; // investment, lifestyle, location

        $prompt = $this->buildPropertyPitchPrompt($leadContext, $propertyContext, $language, $highlight);

        return $this->callOpenAI($prompt, 'property_pitch');
    }

    /**
     * Generate multiple message variations for A/B testing.
     */
    public function generateVariations(Lead $lead, string $messageType, int $count = 3): array
    {
        $variations = [];
        $tones = ['professional', 'friendly', 'enthusiastic'];

        for ($i = 0; $i < min($count, 3); $i++) {
            $options = ['tone' => $tones[$i] ?? 'professional'];

            switch ($messageType) {
                case 'outreach':
                    $variations[] = $this->generateOutreach($lead, $options);
                    break;
                case 'follow_up':
                    $variations[] = $this->generateFollowUp($lead, '', $options);
                    break;
                default:
                    $variations[] = $this->generateOutreach($lead, $options);
            }
        }

        return $variations;
    }

    /**
     * Build context object from lead data.
     */
    private function buildLeadContext(Lead $lead): array
    {
        return [
            'name' => $lead->name,
            'first_name' => explode(' ', $lead->name)[0],
            'intent' => $lead->intent ?? 'potential buyer',
            'budget_min' => $lead->budget_min,
            'budget_max' => $lead->budget_max,
            'source' => $lead->source,
            'preferences' => $lead->preferences ?? [],
            'tags' => $lead->tags ?? [],
            'status' => $lead->status,
        ];
    }

    /**
     * Build context from property data.
     */
    private function buildPropertyContext(Property $property): array
    {
        return [
            'title' => $property->title,
            'type' => $property->property_type,
            'listing_type' => $property->listing_type,
            'price' => $property->price,
            'city' => $property->city,
            'zone' => $property->zone,
            'bedrooms' => $property->bedrooms,
            'bathrooms' => $property->bathrooms,
            'sqm_built' => $property->sqm_built,
            'features' => $property->features ?? [],
            'expected_roi' => $property->expected_roi,
            'is_featured' => $property->is_featured,
        ];
    }

    /**
     * Build outreach prompt.
     */
    private function buildOutreachPrompt(array $context, string $language, string $tone, string $platform): string
    {
        $intentDescription = match ($context['intent']) {
            'investor' => 'interested in real estate investment opportunities with good ROI',
            'end_buyer' => 'looking to purchase a property for personal use',
            'renter' => 'looking to rent a property',
            'developer' => 'interested in development opportunities',
            default => 'interested in real estate in the Riviera Maya',
        };

        $budgetInfo = '';
        if ($context['budget_max']) {
            $budgetInfo = "They have a budget of up to $" . number_format($context['budget_max']) . " USD.";
        }

        $locationPrefs = '';
        if (!empty($context['preferences']['locations'])) {
            $locationPrefs = "Preferred locations: " . implode(', ', $context['preferences']['locations']) . ".";
        }

        return <<<PROMPT
You are a real estate agent at a luxury agency in the Riviera Maya, Mexico. Write a personalized first outreach message.

LEAD INFO:
- Name: {$context['name']} (use first name: {$context['first_name']})
- Intent: {$intentDescription}
{$budgetInfo}
{$locationPrefs}
- Source: They connected via {$context['source']}

REQUIREMENTS:
- Language: {$language}
- Tone: {$tone}
- Platform: {$platform} (keep it concise if WhatsApp)
- DO NOT include subject lines or email headers
- Be genuine, not salesy
- Mention the Riviera Maya appeal briefly
- Include a soft call to action
- Maximum 150 words

Write ONLY the message, no explanations:
PROMPT;
    }

    /**
     * Build follow-up prompt.
     */
    private function buildFollowUpPrompt(array $context, string $previousContext, string $language, string $tone, int $days): string
    {
        return <<<PROMPT
You are a real estate agent following up with a lead. Write a warm follow-up message.

LEAD INFO:
- Name: {$context['first_name']}
- Intent: {$context['intent']}
- Days since last contact: {$days}

PREVIOUS CONTEXT (if any):
{$previousContext}

REQUIREMENTS:
- Language: {$language}
- Tone: {$tone} but not pushy
- Acknowledge it's a follow-up
- Add value (market update, new listing, etc.)
- Soft call to action
- Maximum 100 words

Write ONLY the message:
PROMPT;
    }

    /**
     * Build property pitch prompt.
     */
    private function buildPropertyPitchPrompt(array $lead, array $property, string $language, string $highlight): string
    {
        $priceFormatted = '$' . number_format($property['price']);
        $features = implode(', ', array_slice($property['features'], 0, 3));

        $highlightFocus = match ($highlight) {
            'investment' => 'Focus on ROI, rental potential, and appreciation',
            'lifestyle' => 'Focus on lifestyle, amenities, and living experience',
            'location' => 'Focus on location benefits, accessibility, and neighborhood',
            default => 'Balance investment potential and lifestyle benefits',
        };

        return <<<PROMPT
Write a personalized property recommendation message.

LEAD: {$lead['first_name']} - {$lead['intent']}

PROPERTY:
- {$property['title']}
- {$property['type']} in {$property['city']}, {$property['zone']}
- {$priceFormatted} USD
- {$property['bedrooms']} beds, {$property['bathrooms']} baths, {$property['sqm_built']}m²
- Features: {$features}
- ROI: {$property['expected_roi']}%

FOCUS: {$highlightFocus}

REQUIREMENTS:
- Language: {$language}
- Personalize to lead's intent
- Make it compelling but honest
- Include asking price
- Call to action for viewing or more info
- Maximum 120 words

Write ONLY the message:
PROMPT;
    }

    /**
     * Call OpenAI API.
     */
    private function callOpenAI(string $prompt, string $type): array
    {
        if (empty($this->apiKey)) {
            Log::warning('OpenAI API key not configured');
            return [
                'success' => false,
                'error' => 'OpenAI API key not configured',
                'type' => $type,
                'message' => null,
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                        'model' => $this->model,
                        'messages' => [
                            ['role' => 'system', 'content' => 'You are a helpful real estate assistant. Write natural, personalized messages.'],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'max_tokens' => 300,
                        'temperature' => 0.7,
                    ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                return [
                    'success' => true,
                    'type' => $type,
                    'message' => trim($content),
                    'tokens_used' => $response->json('usage.total_tokens'),
                ];
            }

            Log::error('OpenAI API error', ['response' => $response->json()]);
            return [
                'success' => false,
                'error' => $response->json('error.message') ?? 'API request failed',
                'type' => $type,
                'message' => null,
            ];
        } catch (\Exception $e) {
            Log::error('OpenAI API exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'type' => $type,
                'message' => null,
            ];
        }
    }
}
