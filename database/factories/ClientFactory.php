<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Client>
 */
class ClientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'rut' => fake()->unique()->numberBetween(10000000, 99999999) . '-' . fake()->randomDigit(),
            'razon_social' => fake()->company(),
            'giro' => fake()->jobTitle(), 
            'direccion' => fake()->address(),
            'telefono' => fake()->phoneNumber(), 
            'contacto_nombre' => fake()->name(),
            'contacto_email' => fake()->safeEmail(),
        ];
    }
}
