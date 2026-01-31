<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $password; // Guardamos la contraseña plana para mostrarla en el correo

    public function __construct(User $user, $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Bienvenido! Tu cuenta ha sido creada',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user_created', // Crearemos esta vista en el paso 3
        );
    }
}