<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Certificate extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'token_id', 'title', 'description', 'recipient_address',
        'recipient_name', 'issue_date', 'topic', 'score', 'image_url',
        'metadata_uri', 'transaction_hash', 'minted'
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($model) => $model->id = (string) Str::uuid());
    }

    public function credential()
    {
        return $this->belongsTo(Credential::class, 'transaction_hash', 'transaction_hash');
    }
}