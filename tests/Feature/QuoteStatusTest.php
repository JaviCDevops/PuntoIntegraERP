<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Quote;
use App\Models\Client;
use App\Models\User;

class QuoteStatusTest extends TestCase
{
    use RefreshDatabase;

    /**
     * When a quote is marked as adjudicada, a project should be created
     * and its start_date must never be null (previously we inserted null
     * and the migration wasn't always applied in production).
     */
    public function test_updating_status_to_adjudicada_creates_project_with_start_date()
    {
        $user = User::factory()->create();
        $client = Client::factory()->create();

        $quote = Quote::create([
            'code' => 'TEST_0001',
            'client_id' => $client->id,
            'client_snapshot' => $client->toArray(),
            'area' => 'MANTENIMIENTO',
            'description' => 'Prueba',
            'net_value' => 100,
            'tax_value' => 19,
            'total_value' => 119,
            'valid_until' => now()->addWeek(),
            'reminder_date' => now()->addDays(2),
            'status' => 'pendiente',
        ]);

        $response = $this->actingAs($user)
            ->patch(route('quotes.update-status', $quote), ['status' => 'adjudicada']);

        $response->assertRedirect();

        $this->assertDatabaseHas('projects', [
            'quote_id' => $quote->id,
            'start_date' => now()->toDateString(),
        ]);
    }
}
