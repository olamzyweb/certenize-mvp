<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class QuizSession extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'wallet_address', 'topic', 'quiz_json', 'status', 'score', 'mint_token'
    ];

    protected $casts = [
        'quiz_json' => 'array'
    ];


    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($model) => $model->id = (string) Str::uuid());
    }

    public function credentials()
    {
        return $this->hasOne(Credential::class);
    }
}