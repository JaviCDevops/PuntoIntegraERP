<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'permissions',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // UNIFICAMOS LOS CASTS AQUÍ (Estilo moderno Laravel 10/11)
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'permissions' => 'array', // Esto es vital para tus permisos
        ];
    }

    public function hasPermission($permission)
    {
        return in_array($permission, $this->permissions ?? []);
    }

    public function items() 
    { 
        return $this->hasMany(BoardTaskItem::class); 
    }

    public function employee() 
    { 
        // Relación 1 a 1: Un usuario TIENE UN perfil de empleado
        return $this->hasOne(Employee::class); 
    }
}