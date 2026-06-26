<?php

namespace App\Enums;

enum OtpPurpose: string
{
    case Login = 'login';
    case PhoneVerification = 'phone_verification';
    case PasswordReset = 'password_reset';
    case TwoFactor = 'two_factor';
}
