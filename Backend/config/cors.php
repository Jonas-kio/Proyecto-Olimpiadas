<?php
return [

'paths' => [
    'api/*',
    'sanctum/csrf-cookie',
    'api/documentation',
    'docs/*',
    'oauth2-callback',
    'api-docs/*'
],

'allowed_methods' => ['*'],

'allowed_origins' => ['*'],

'allowed_origins_patterns' => [],

'allowed_headers' => ['*'],

'exposed_headers' => [],

'max_age' => 0,

'supports_credentials' => true,

];
