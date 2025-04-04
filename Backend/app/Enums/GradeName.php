<?php

namespace App\Enums;

enum GradeName: string
{
    case PRIMARY = 'Primaria';
    case HIGH_SCHOOL = 'Secundaria';


    /**
     * @return array
     */
    public static function values(): array
    {
        return [
            self::PRIMARY->value,
            self::HIGH_SCHOOL->value,
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
}
