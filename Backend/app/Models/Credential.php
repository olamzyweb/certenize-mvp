<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use App\Models\QuizSession;
use App\Models\Certificate;

class Credential extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'wallet_address', 'quiz_session_id', 'token_id',
        'transaction_hash', 'skill', 'score', 'minted_at'
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($model) => $model->id = (string) Str::uuid());
    }

    public function session()
    {
        return $this->belongsTo(QuizSession::class, 'quiz_session_id');
    }

    public function certificate()
    {
        return $this->hasOne(Certificate::class, 'transaction_hash', 'transaction_hash');
    }
}