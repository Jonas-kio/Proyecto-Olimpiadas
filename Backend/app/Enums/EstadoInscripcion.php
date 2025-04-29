<?php

namespace App\Enums;

enum EstadoInscripcion: string
{
    case PENDIENTE = 'pending';
    case INSCRITO = 'approved';
    case RECHAZADO = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::PENDIENTE => 'Pendiente',
            self::INSCRITO => 'Inscrito',
            self::RECHAZADO => 'Rechazado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDIENTE => 'warning',
            self::INSCRITO => 'success',
            self::RECHAZADO => 'danger',
        };
    }

    public static function toArray(): array
    {
        return array_map(fn($case) => [
            'value' => $case->value,
            'label' => $case->label(),
            'color' => $case->color(),
        ], self::cases());
    }
}
