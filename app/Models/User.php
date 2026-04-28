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
            // 'permissions' => 'array', // Removemos el cast automático
        ];
    }

    // Mutator personalizado para permissions
    public function setPermissionsAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['permissions'] = json_encode($value);
        } elseif (is_string($value)) {
            // Si ya es string, asumimos que es JSON válido
            $this->attributes['permissions'] = $value;
        } else {
            // Para cualquier otro caso, guardamos array vacío
            $this->attributes['permissions'] = json_encode([]);
        }
    }

    // Accessor personalizado para permissions
    public function getPermissionsAttribute($value)
    {
        if (is_null($value)) {
            return [];
        }
        
        if (is_array($value)) {
            return $value;
        }
        
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }
        
        return [];
    }

    public function hasPermission($permission)
    {
        $permissions = $this->permissions;
        
        // Ensure permissions is an array
        if (!is_array($permissions)) {
            $permissions = [];
        }
        
        return in_array($permission, $permissions);
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