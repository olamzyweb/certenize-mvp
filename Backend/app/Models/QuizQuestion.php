<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use App\Models\Quiz;

class QuizQuestion extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string'; // UUID

    protected $fillable = [
        'id', 'quiz_id', 'question', 'options', 'correct_answer'
    ];

    protected $casts = [
        'options' => 'array'
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($model) => $model->id = (string) Str::uuid());
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}