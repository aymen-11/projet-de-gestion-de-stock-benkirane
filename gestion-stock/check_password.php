<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::where('email', 'admin@stock.ma')->first();
if (!$user) {
    echo "No user found\n";
    exit(1);
}

echo "Email: " . $user->email . "\n";
echo "Password hash: " . $user->password . "\n";
if (Hash::check('password', $user->password)) {
    echo "Hash check: OK\n";
} else {
    echo "Hash check: FAIL\n";
}

// Also check using Auth::attempt
$credentials = ['email' => 'admin@stock.ma', 'password' => 'password'];
$attempt = Illuminate\Support\Facades\Auth::attempt($credentials);
echo "Auth::attempt: " . ($attempt ? "OK" : "FAIL") . "\n";
