<?php

namespace App\Observers;

use App\Models\Quote;

class QuoteObserver
{
    /**
     * Handle the Quote "created" event.
     */
    public function creating(Quote $quote): void
    {
        $year = now()->year;
        
        $lastQuote = Quote::where('code', 'LIKE', "{$year}_%")
                          ->orderBy('id', 'desc')
                          ->first();

        if ($lastQuote) {
            $parts = explode('_', $lastQuote->code);
            $sequence = intval($parts[1]) + 1;
        } else {
            $sequence = 1;
        }

        $quote->code = $year . '_' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Handle the Quote "updated" event.
     */
    public function updated(Quote $quote): void
    {
        //
    }

    /**
     * Handle the Quote "deleted" event.
     */
    public function deleted(Quote $quote): void
    {
        //
    }

    /**
     * Handle the Quote "restored" event.
     */
    public function restored(Quote $quote): void
    {
        //
    }

    /**
     * Handle the Quote "force deleted" event.
     */
    public function forceDeleted(Quote $quote): void
    {
        //
    }
}
