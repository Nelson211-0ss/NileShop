<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'NileShop API',
    description: 'Multi-Vendor E-Commerce Marketplace API for South Sudan'
)]
#[OA\Server(url: '/api/v1', description: 'API v1')]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Laravel Sanctum Bearer Token'
)]
abstract class Controller
{
    //
}
