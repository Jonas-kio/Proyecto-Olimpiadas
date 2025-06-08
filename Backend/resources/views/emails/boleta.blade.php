<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Boleta de Pago - Olimpiadas Oh! SanSi</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Boleta de Pago</h1>
            <h2>Olimpiadas Oh! SanSi</h2>
        </div>

        <div class="content">
            <p>Estimado/a {{ $nombreEstudiante ?? 'Participante' }},</p>

            <p>Adjunto encontrará su boleta de pago con número {{ $numero }} para su participación en las Olimpiadas Oh! SanSi.</p>

            <p>Por favor, conserve esta boleta para sus registros y realice el pago correspondiente antes de la fecha límite indicada.</p>

            <p>Si tiene alguna consulta, no dude en contactarnos.</p>

            <p>Saludos cordiales,<br>
            Equipo Olimpiadas Oh! SanSi</p>
        </div>

        <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
        </div>
    </div>
</body>
</html> 