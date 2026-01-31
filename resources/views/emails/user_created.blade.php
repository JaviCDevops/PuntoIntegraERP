<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido al Sistema</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                
                <div style="margin-bottom: 20px;">
                    <img src="{{ asset('images/logo.png') }}" alt="Logo Punto Integra" style="max-width: 200px; height: auto; display: block;">
                </div>

                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
                    
                    <tr>
                        <td style="background-color: #2563EB; height: 6px;"></td>
                    </tr>

                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
                                ¡Bienvenido a la Plataforma!
                            </h1>
                            
                            <p style="margin: 0 0 20px 0; color: #4B5563; font-size: 16px; line-height: 1.6; text-align: center;">
                                Hola <strong>{{ $user->name }}</strong>, se ha creado exitosamente tu cuenta de acceso para el sistema de gestión de <strong>Punto Integra</strong>.
                            </p>

                            <div style="background-color: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
                                    TUS CREDENCIALES
                                </p>
                                
                                <div style="margin-bottom: 15px;">
                                    <span style="display: block; color: #9CA3AF; font-size: 14px;">Usuario / Email</span>
                                    <span style="display: block; color: #1F2937; font-size: 18px; font-weight: bold;">{{ $user->email }}</span>
                                </div>
                                
                                <div>
                                    <span style="display: block; color: #9CA3AF; font-size: 14px;">Contraseña Temporal</span>
                                    <span style="display: block; color: #2563EB; font-size: 20px; font-family: monospace; font-weight: bold; letter-spacing: 2px; background: #fff; display: inline-block; padding: 5px 15px; border-radius: 4px; margin-top: 5px;">
                                        {{ $password }}
                                    </span>
                                </div>
                            </div>

                            <div style="text-align: center; margin-bottom: 30px;">
                                <a href="{{ route('login') }}" style="background-color: #2563EB; color: #ffffff; padding: 14px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
                                    Ingresar al Sistema
                                </a>
                            </div>

                            <p style="margin: 0; color: #6B7280; font-size: 13px; text-align: center; line-height: 1.5;">
                                <span style="color: #EF4444; font-weight: bold;">Importante:</span> Por motivos de seguridad, el sistema te pedirá cambiar esta contraseña la primera vez que inicies sesión.
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
                            <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                © {{ date('Y') }} Punto Integra. Todos los derechos reservados.<br>
                                Este es un correo automático, por favor no responder.
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>

</body>
</html>