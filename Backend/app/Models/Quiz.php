<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use App\Models\QuizQuestion;
use App\Models\QuizSession;
use App\Models\QuizResult;

class Quiz extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string'; // UUID

    protected $fillable = [
        'id', 'title', 'topic', 'description', 'time_limit', 'passing_score'
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
        });
    }

    public function questions()
    {
        return $this->hasMany(QuizQuestion::class);
    }

    public function sessions()
    {
        return $this->hasMany(QuizSession::class);
    }

    // public function results()
    // {
    //     return $this->hasMany(QuizResult::class);
    // }
}