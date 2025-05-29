<?php

namespace App\Enums;

enum BoletaEstado: string
{
    case PENDIENTE = 'pendiente';
    case PAGADO = 'Pagado';


    public function label(): string
    {
        return match ($this) {
            self::PENDIENTE => 'pendiente',
            self::PAGADO => 'Pagado'
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDIENTE => 'warning',
            self::PAGADO => 'success',
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
