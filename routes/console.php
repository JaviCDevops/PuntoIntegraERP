<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Sincronizar feriados chilenos automáticamente cada 1 de enero
Schedule::command('holidays:sync')->yearlyOn(1, 1, '03:00');
