<?php

namespace App\Enums;

enum OlimpiadaModalidades: string
{
    case PRESENCIAL = 'Presencial';
    case VIRTUAL = 'Virtual';
    case HIBRIDA = 'Híbrida';

    /**
     * @return array
     */
    public static function values(): array
    {
        return [
            self::PRESENCIAL->value,
            self::VIRTUAL->value,
            self::HIBRIDA->value,
        ];
    }

    /**
     * @param string $value
     * @return bool
     */
    public static function isValid(string $value): bool
    {
        return in_array($value, self::values());
    }

    /**
     * @return array
     */
    public static function options(): array
    {
        return [
            self::PRESENCIAL->value => 'Presencial',
            self::VIRTUAL->value => 'Virtual',
            self::HIBRIDA->value => 'Híbrida',
        ];
    }
}
