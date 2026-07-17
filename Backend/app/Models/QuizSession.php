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
        'id', 
        'assessment_id',
        'wallet_address', 
        'topic', 
        'quiz_json', 
        'answers',
        'ai_scores',
        'status', 
        'score', 
        'tab_switches',
        'copy_paste_events',
        'window_blur_events',
        'suspicious_flag',
        'mint_token'
    ];

    protected $casts = [
        'quiz_json' => 'array',
        'answers' => 'array',
        'ai_scores' => 'array',
    ];


    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($model) => $model->id = (string) Str::uuid());
    }

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }

    public function credentials()
    {
        return $this->hasOne(Credential::class);
    }
}