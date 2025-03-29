<?php

namespace App\Enums;

enum UserRoles: string
{
    case USER = 'user';
    case ADMIN = 'admin';


    /**
     * @return array
     */
    public static function values(): array
    {
        return [
            self::USER->value,
            self::ADMIN->value,
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
