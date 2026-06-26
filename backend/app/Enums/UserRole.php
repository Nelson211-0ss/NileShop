<?php

namespace App\Enums;

enum UserRole: string
{
    case Customer = 'customer';
    case Vendor = 'vendor';
    case DeliveryRider = 'delivery_rider';
    case Administrator = 'administrator';

  public function label(): string
    {
        return match ($this) {
            self::Customer => 'Customer',
            self::Vendor => 'Vendor',
            self::DeliveryRider => 'Delivery Rider',
            self::Administrator => 'Administrator',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
