<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Boleta de Pago</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .content {
            margin-bottom: 30px;
        }
        .info-section {
            margin-bottom: 20px;
        }
        .info-section h3 {
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            color: #666;
        }
        .amount-section {
            text-align: right;
            margin-top: 30px;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Boleta de Pago</h1>
        <p>Número: {{ $bill_number }}</p>
    </div>

    <div class="content">
        <div class="info-section">
            <h3>Información del Estudiante</h3>
            <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span>{{ $registration->competitor->nombre }} {{ $registration->competitor->apellido }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">DNI:</span>
                <span>{{ $registration->competitor->dni }}</span>
            </div>
        </div>

        <div class="info-section">
            <h3>Información del Tutor</h3>
            <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span>{{ $registration->tutor->nombre }} {{ $registration->tutor->apellido }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span>{{ $registration->tutor->email }}</span>
            </div>
        </div>

        <div class="info-section">
            <h3>Detalles del Pago</h3>
            <div class="info-row">
                <span class="info-label">Fecha de Emisión:</span>
                <span>{{ now()->format('d/m/Y') }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Fecha de Vencimiento:</span>
                <span>{{ \Carbon\Carbon::parse($due_date)->format('d/m/Y') }}</span>
            </div>
        </div>

        <div class="amount-section">
            <div class="info-label">Monto a Pagar:</div>
            <div class="amount">S/ {{ number_format($amount, 2) }}</div>
        </div>
    </div>

    <div class="footer">
        <p>Esta boleta es un documento oficial. Por favor, manténgala para sus registros.</p>
        <p>Para cualquier consulta, contacte a nuestro servicio de atención al cliente.</p>
    </div>
</body>
</html> 