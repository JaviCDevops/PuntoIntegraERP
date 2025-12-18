<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Cotización {{ $quote->code }}</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; color: #333; }
        .header { width: 100%; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
        .company-info { text-align: right; font-size: 12px; color: #666; }
        
        .details-table { width: 100%; margin-bottom: 30px; }
        .details-table td { vertical-align: top; }
        .client-box { background: #f3f4f6; padding: 15px; border-radius: 5px; }
        .client-title { font-weight: bold; margin-bottom: 5px; color: #111; text-transform: uppercase; font-size: 11px; }
        
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #4f46e5; color: white; text-align: left; padding: 10px; font-size: 12px; }
        .items-table td { border-bottom: 1px solid #ddd; padding: 10px; }
        
        .totals-table { width: 40%; float: right; }
        .totals-table td { padding: 5px; text-align: right; }
        .total-row { font-weight: bold; font-size: 16px; color: #4f46e5; border-top: 2px solid #4f46e5; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
    </style>
</head>
<body>

    <table class="header">
        <tr>
            <td class="logo">Punto Integra S.P.A.</td> <td class="company-info">
                RUT: 76.764.668-2<br>
                MERCED 838 A OF 117. SANTIAGO<br>
                rtapia@puntointegra.cl<br>
                www.puntointegra.cl
            </td>
        </tr>
    </table>

    <table class="details-table">
        <tr>
            <td width="55%">
                <div class="client-box">
                    <div class="client-title">Cliente</div>
                    <strong>{{ $quote->client_snapshot['razon_social'] ?? 'Sin Razón Social' }}</strong><br>

                    RUT: {{ $quote->client_snapshot['rut'] ?? 'S/N' }}<br>

                    Giro: {{ $quote->client_snapshot['giro'] ?? 'N/A' }}<br>

                    Dirección: {{ $quote->client_snapshot['direccion'] ?? 'Dirección no registrada' }}<br>

                    Att: {{ $quote->client_snapshot['contacto_nombre'] ?? 'Sin Contacto' }}
                </div>
            </td>
            <td width="5%"></td>
            <td width="40%">
                <div class="client-box" style="background: #fff; border: 1px solid #ddd;">
                    <div class="client-title">Detalles Cotización</div>
                    <strong>N° Folio: {{ $quote->code }}</strong><br>
                    Fecha: {{ $quote->created_at->format('d/m/Y') }}<br>
                    Válido hasta: {{ \Carbon\Carbon::parse($quote->valid_until)->format('d/m/Y') }}<br>
                    Área: {{ $quote->area }}
                </div>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th width="70%">Descripción del Servicio</th>
                <th width="30%" style="text-align: right;">Valor (UF)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>{{ $quote->description }}</strong>
                    <br><br>
                    <span style="font-size: 12px; color: #666;">
                        Se adjunta detalle técnico en anexo si corresponde.
                    </span>
                </td>
                <td style="text-align: right;">
                    {{ number_format($quote->net_value, 2, ',', '.') }} UF
                </td>
            </tr>
        </tbody>
    </table>

    <table class="totals-table">
        <tr>
            <td>Neto:</td>
            <td>{{ number_format($quote->net_value, 2, ',', '.') }} UF</td>
        </tr>
        <tr>
            <td>IVA (19%):</td>
            <td>{{ number_format($quote->tax_value, 2, ',', '.') }} UF</td>
        </tr>
        <tr>
            <td class="total-row">TOTAL:</td>
            <td class="total-row">{{ number_format($quote->total_value, 2, ',', '.') }} UF</td>
        </tr>
    </table>

    <div class="footer">
        Esta cotización es válida por 15 días hábiles. Los precios están expresados en Unidades de Fomento (UF).
        <br>Generado automáticamente por Sistema de Gestión.
    </div>

</body>
</html>