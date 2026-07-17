<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasUuids;

    protected $fillable = [
        'youtube_url',
        'youtube_video_id',
        'title',
        'transcript_raw',
        'transcript_cleaned',
        'concepts_extracted',
        'status'
    ];

    protected $casts = [
        'concepts_extracted' => 'array',
    ];

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }
}
